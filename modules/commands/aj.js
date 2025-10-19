
// ✅ Auto-install required modules if missing
const { execSync } = require("child_process");
const modules = ["axios", "fs", "path", "form-data", "puppeteer"];
for (const pkg of modules) {
  try {
    require.resolve(pkg);
  } catch {
    console.log(`📦 تثبيت المكتبة المفقودة: ${pkg} ...`);
    execSync(`npm install ${pkg}`, { stdio: "inherit" });
  }
}

// استدعاء المكتبات بعد التثبيت
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const FormData = require("form-data");
const puppeteer = require("puppeteer");

module.exports.config = {
  name: "قص",
  version: "2.1.0",
  hasPermssion: 0,
  credits: "Mustafa + GPT-5",
  description: "قص خلفية الصورة تلقائياً وتجديد الجلسة عند انتهائها",
  commandCategory: "〘 الأدوات 〙",
  usages: "[بالرد على صورة]",
  cooldowns: 5,
};

let sessionCookies = "";
let userAgent = "";

async function getNewSession() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();
  await page.goto("https://remove.photos/ar/", { waitUntil: "networkidle2" });
  const cookies = await page.cookies();
  sessionCookies = cookies.map(c => `${c.name}=${c.value}`).join("; ");
  userAgent = await page.evaluate(() => navigator.userAgent);
  await browser.close();
  console.log("✅ تم إنشاء جلسة جديدة بنجاح!");
}

module.exports.run = async function ({ api, event }) {
  try {
    if (!event.messageReply || !event.messageReply.attachments || event.messageReply.attachments.length === 0)
      return api.sendMessage("📸 | أرسل الأمر بالرد على صورة.", event.threadID, event.messageID);

    const attach = event.messageReply.attachments[0];
    if (!attach.url) return api.sendMessage("❌ | لم أجد رابط الصورة.", event.threadID, event.messageID);

    const imageUrl = attach.url;
    const cacheDir = path.join(__dirname, "cache");
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);
    const filePath = path.join(cacheDir, "input_" + Date.now() + ".jpg");
    const res = await axios.get(imageUrl, { responseType: "arraybuffer" });
    fs.writeFileSync(filePath, res.data);

    if (!sessionCookies) await getNewSession();

    api.sendMessage("⏳ | جاري إزالة الخلفية...", event.threadID, event.messageID);

    const form = new FormData();
    form.append("file", fs.createReadStream(filePath));

    const headers = {
      ...form.getHeaders(),
      "Accept": "application/json",
      "Origin": "https://remove.photos",
      "Referer": "https://remove.photos/ar/",
      "User-Agent": userAgent,
      "Cookie": sessionCookies,
    };

    let response = await axios.post("https://remove.photos/api/images/matting", form, {
      headers,
      responseType: "arraybuffer",
      timeout: 60000,
      validateStatus: () => true,
    });

    if (response.status === 401 || response.status === 403) {
      console.log("⚠️ الجلسة انتهت، يتم تجديدها...");
      await getNewSession();
      headers["Cookie"] = sessionCookies;
      response = await axios.post("https://remove.photos/api/images/matting", form, {
        headers,
        responseType: "arraybuffer",
      });
    }

    if (response.status !== 200) throw new Error(`HTTP ${response.status}`);

    const outPath = path.join(cacheDir, `no_bg_${Date.now()}.png`);
    fs.writeFileSync(outPath, response.data);

    api.sendMessage(
      {
        body: "✅ | تم قص الخلفية بنجاح!",
        attachment: fs.createReadStream(outPath),
      },
      event.threadID,
      () => {
        fs.unlinkSync(filePath);
        fs.unlinkSync(outPath);
      },
      event.messageID
    );
  } catch (err) {
    console.error("❌ Error:", err.message);
    api.sendMessage("⚠️ | فشل في معالجة الصورة. الموقع ربما غيّر الحماية أو الجلسة انتهت.", event.threadID, event.messageID);
  }
};