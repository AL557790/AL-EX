const axios = require("axios");
const tough = require("tough-cookie");
const { wrapper } = require("axios-cookiejar-support");
const qs = require("qs");
const fs = require("fs");
const path = require("path");

module.exports.config = {
  name: "miri",
  version: "1.1.0",
  hasPermssion: 0,
  credits: "مصطفى + GPT-5",
  description: "Download Facebook video and send directly",
  commandCategory: "download",
  usages: "miri <facebook_url>",
  cooldowns: 5
};

module.exports.run = async function({ api, event, args }) {
  try {
    const send = (msg) => api.sendMessage(typeof msg === "string" ? { body: msg } : msg, event.threadID);
    if (!args || args.length === 0) return send("Use: miri <facebook_url>");
    const fbUrl = args[0].trim();
    if (!/^https?:\/\/(www\.)?facebook\.com|fb\.watch|m\.facebook\.com/i.test(fbUrl)) return send("Invalid Facebook URL");

    send("Processing...");

    const jar = new tough.CookieJar();
    const client = wrapper(axios.create({
      jar,
      withCredentials: true,
      headers: {
        "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0 Mobile Safari/537.36",
        "Accept": "*/*",
        "Accept-Language": "ar-DZ,ar;q=0.9,en-US;q=0.8,en;q=0.7",
        "Origin": "https://v3.fdownloader.net",
        "Referer": "https://v3.fdownloader.net/",
        "X-Requested-With": "XMLHttpRequest"
      },
      timeout: 25000
    }));

    await client.get("https://v3.fdownloader.net/").catch(()=>{});

    const possibleFields = ["url", "link", "q", "video", "video_url", "facebook_url"];
    let jsonResponse = null;

    for (const field of possibleFields) {
      const payload = qs.stringify({ [field]: fbUrl });
      try {
        const res = await client.post("https://v3.fdownloader.net/api/ajaxSearch", payload, {
          headers: { "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8" }
        });
        const ct = (res.headers["content-type"] || "").toLowerCase();
        if (ct.includes("application/json") && res.data) {
          jsonResponse = res.data;
          break;
        } else {
          const text = typeof res.data === "string" ? res.data : JSON.stringify(res.data);
          const maybe = extractJsonFromString(text);
          if (maybe) {
            jsonResponse = maybe;
            break;
          }
        }
      } catch {}
    }

    if (!jsonResponse) return send("Failed to get valid response from server.");

    const links = parseDownloadLinks(jsonResponse);
    if (!links || links.length === 0) return send("No download links found.");

    // نختار أفضل رابط (عادة HD أولاً)
    const videoUrl = links.find(l => l.quality && l.quality.toLowerCase().includes("hd"))?.url || links[0].url;
    if (!videoUrl) return send("Failed to determine video URL.");

    // تحميل الفيديو مؤقتاً
    const fileName = `video_${Date.now()}.mp4`;
    const filePath = path.join(__dirname, fileName);
    const writer = fs.createWriteStream(filePath);

    const response = await axios({
      url: videoUrl,
      method: "GET",
      responseType: "stream"
    });

    response.data.pipe(writer);

    writer.on("finish", async () => {
      await api.sendMessage({ attachment: fs.createReadStream(filePath) }, event.threadID, () => {
        fs.unlinkSync(filePath);
      });
    });

    writer.on("error", (err) => {
      console.error(err);
      send("Failed to download video.");
    });

  } catch (error) {
    console.error(error);
    api.sendMessage({ body: "Unexpected error occurred." }, event.threadID);
  }
};

function extractJsonFromString(text) {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;
  const candidate = text.slice(start, end+1);
  try { return JSON.parse(candidate); } catch { return null; }
}

function parseDownloadLinks(json) {
  const out = [];
  if (Array.isArray(json.links) && json.links.length) {
    json.links.forEach(item => { if (typeof item === "string") out.push({ url: item }); else if (item && item.url) out.push({ url: item.url, quality: item.quality || item.label }); });
    return out;
  }
  const candidates = ["data", "result", "download", "downloads"];
  for (const k of candidates) {
    if (!json[k]) continue;
    const v = json[k];
    if (Array.isArray(v)) {
      v.forEach(item => { if (typeof item === "string") out.push({ url: item }); else if (item && (item.url || item.src)) out.push({ url: item.url || item.src, quality: item.quality || item.label }); });
      if (out.length) return out;
    } else if (typeof v === "object") {
      for (const sub of ["url","src","hd","sd","download_url","link"]) if (v[sub]) out.push({ url: v[sub], quality: sub });
      for (const key in v) if (Array.isArray(v[key])) v[key].forEach(item => { if (typeof item === "string") out.push({ url: item }); else if (item && (item.url || item.src)) out.push({ url: item.url || item.src, quality: item.quality || item.label || key }); });
      if (out.length) return out;
    }
  }
  if (Array.isArray(json)) json.forEach(item => { if (typeof item === "string") out.push({ url: item }); else if (item && (item.url || item.src)) out.push({ url: item.url || item.src, quality: item.quality || item.label }); });
  try { const text = JSON.stringify(json); const urlRegex = /https?:\/\/[^\s"']{20,300}/g; const found = text.match(urlRegex) || []; found.forEach(u => out.push({ url: u })); } catch {}
  const unique = [], seen = new Set();
  for (const o of out) { if (!o.url) continue; const u = o.url.split("?")[0]; if (seen.has(u)) continue; seen.add(u); unique.push(o); }
  return unique;
}