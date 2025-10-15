const axios = require("axios");
const qs = require("qs");
const fs = require("fs");
const path = require("path");
const os = require("os");

module.exports.config = {
  name: "تحميل",
  version: "1.3.0",
  hasPermssion: 0,
  credits: "مصطفى + GPT-5",
  description: "Download Facebook video and send file",
  commandCategory: "〘 download 〙",
  usages: "miri <facebook_url>",
  cooldowns: 5
};

module.exports.run = async function({ api, event, args }) {
  try {
    const send = (msg) => api.sendMessage(typeof msg === "string" ? { body: msg } : msg, event.threadID);

    if (!args || args.length === 0) return send("❌ | استخدم: miri <رابط فيسبوك>");
    const fbUrl = args[0].trim();
    if (!/^https?:\/\/(www\.)?facebook\.com|fb\.watch|m\.facebook\.com/i.test(fbUrl)) return send("❌ | رابط غير صالح");

    send("⏳ | جاري معالجة الفيديو...");

    // إرسال الطلب للموقع للحصول على رابط الفيديو
    const payload = qs.stringify({ url: fbUrl });
    const res = await axios.post("https://v3.fdownloader.net/api/ajaxSearch", payload, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        "User-Agent": "Mozilla/5.0",
        "X-Requested-With": "XMLHttpRequest"
      },
      timeout: 30000
    });

    const data = res.data;
    if (!data) return send("⚠️ | لم أتمكن من الحصول على روابط الفيديو.");

    // البحث عن رابط الفيديو (HD أولاً)
    let videoLink = null;
    if (data.links && data.links.length) {
      videoLink = data.links.find(l => l.quality && l.quality.toLowerCase().includes("hd"))?.url || data.links[0].url;
    }
    if (!videoLink) return send("⚠️ | لم أجد رابط الفيديو.");

    // تنزيل الفيديو مؤقتًا
    const tmpName = `miri_${Date.now()}.mp4`;
    const filePath = path.join(os.tmpdir(), tmpName);
    const writer = fs.createWriteStream(filePath);

    const streamRes = await axios({
      url: videoLink,
      method: "GET",
      responseType: "stream",
      headers: { "User-Agent": "Mozilla/5.0" },
      timeout: 60000
    });

    streamRes.data.pipe(writer);

    await new Promise((resolve, reject) => {
      writer.on("finish", resolve);
      writer.on("error", reject);
    });

    // إرسال الفيديو للبوت
    await api.sendMessage({ attachment: fs.createReadStream(filePath) }, event.threadID);

    // حذف الملف المؤقت
    try { fs.unlinkSync(filePath); } catch {}

  } catch (err) {
    console.error(err);
    try { api.sendMessage("⚠️ | حدث خطأ أثناء تنزيل الفيديو.", event.threadID); } catch {}
  }
};