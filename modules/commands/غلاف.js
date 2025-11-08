const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// ✅ مجلد التخزين المؤقت
const cacheDir = path.join(__dirname, "cache");
if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

// ✅ تثبيت المكتبات تلقائيًا إذا لم تكن موجودة
function ensureDependencies(modules) {
  for (const mod of modules) {
    try {
      require.resolve(mod);
    } catch {
      console.log(`📦 Installing ${mod}...`);
      execSync(`npm install ${mod}`, { stdio: "inherit" });
    }
  }
}

ensureDependencies(["canvas", "axios", "fs-extra", "jimp"]);

const axios = require("axios");
const Jimp = require("jimp");
const fse = require("fs-extra");
const { createCanvas, loadImage, registerFont } = require("canvas");

// ✅ تسجيل خط مدمج لتجنب مشاكل Linux
const fontPath = path.join(__dirname, "fonts");
if (!fs.existsSync(fontPath)) fs.mkdirSync(fontPath, { recursive: true });
// ضع خط Arial.ttf أو أي خط مناسب في مجلد fonts
registerFont(path.join(fontPath, "Arial.ttf"), { family: "Arial" });

module.exports.config = {
  name: "غلاف",
  version: "2.2.0",
  hasPermssion: 0,
  credits: "مصطفى ✨",
  description: "إنشاء غلاف احترافي مع صورتك ونصوصك",
  commandCategory: "🎨 التصميم",
  usages: "غلاف [نص1 - نص2]",
  usePrefix: true,
  cooldowns: 10
};

// 🧠 تحويل الصورة إلى دائرة
async function makeCircle(image) {
  const img = await Jimp.read(image);
  img.circle();
  return await img.getBufferAsync("image/png");
}

module.exports.run = async function ({ api, event, args }) {
  try {
    const { senderID, threadID, messageID } = event;

    let text = args.join(" ");
    if (!text)
      return api.sendMessage("💢 استخدم: غلاف [نص1 - نص2]", threadID, messageID);

    const parts = text.split(" - ");
    if (parts.length < 2)
      return api.sendMessage("⚠️ الرجاء إدخال التنسيق الصحيح [نص1 - نص2]", threadID, messageID);

    const [text1, text2] = parts;

    // مسارات الملفات المؤقتة
    const pathImg = path.join(cacheDir, `${senderID}_cover.png`);
    const pathAva = path.join(cacheDir, `${senderID}_avt.png`);

    // 🧩 جلب الصورة الشخصية من Graph API
    const avatarData = (
      await axios.get(
        `https://graph.facebook.com/${senderID}/picture?width=512&height=512`,
        { responseType: "arraybuffer" }
      )
    ).data;
    fs.writeFileSync(pathAva, avatarData);

    const avatarCircle = await makeCircle(pathAva);

    // 🧩 جلب الخلفية (رابط ثابت)
    const bgData = (
      await axios.get("https://i.ibb.co/3Wg3T6f/cover-template.jpg", {
        responseType: "arraybuffer"
      })
    ).data;
    fs.writeFileSync(pathImg, bgData);

    const baseImg = await loadImage(pathImg);
    const avatarImg = await loadImage(avatarCircle);

    // 🖼️ إنشاء التصميم
    const canvas = createCanvas(1920, 1080);
    const ctx = canvas.getContext("2d");

    ctx.drawImage(baseImg, 0, 0, 1920, 1080);
    ctx.save();
    ctx.beginPath();
    ctx.arc(960, 380, 160, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(avatarImg, 800, 220, 320, 320);
    ctx.restore();

    // إطار الصورة
    ctx.lineWidth = 8;
    ctx.strokeStyle = "#fff";
    ctx.beginPath();
    ctx.arc(960, 380, 160, 0, Math.PI * 2, true);
    ctx.stroke();

    // النص الأول
    ctx.font = "bold 80px Arial";
    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";
    ctx.shadowColor = "rgba(0,0,0,0.6)";
    ctx.shadowOffsetX = 4;
    ctx.shadowOffsetY = 4;
    ctx.shadowBlur = 10;
    ctx.fillText(text1, 960, 700);

    // النص الثاني ملون
    const gradient = ctx.createLinearGradient(760, 0, 1160, 0);
    gradient.addColorStop(0, "#00c6ff");
    gradient.addColorStop(1, "#0072ff");
    ctx.font = "55px Arial";
    ctx.fillStyle = gradient;
    ctx.shadowColor = "rgba(0,0,0,0.3)";
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    ctx.shadowBlur = 6;
    ctx.fillText(text2, 960, 780);

    const buffer = canvas.toBuffer("image/png");
    fs.writeFileSync(pathImg, buffer);

    api.sendMessage(
      { body: "✨ غلافك جاهز!", attachment: fs.createReadStream(pathImg) },
      threadID,
      () => {
        fse.removeSync(pathAva);
        fse.removeSync(pathImg);
      },
      messageID
    );
  } catch (error) {
    console.error(error);
    return api.sendMessage("❌ حدث خطأ أثناء إنشاء الغلاف.", event.threadID, messageID);
  }
};