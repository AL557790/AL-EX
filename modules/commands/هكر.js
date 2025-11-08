const { execSync } = require("child_process");
const path = require("path");

// --- تثبيت تلقائي للمكتبات الناقصة ---
function ensureDependencies(mods) {
  for (const mod of mods) {
    try {
      require.resolve(mod);
    } catch (err) {
      console.log(`📦 ${mod} غير مثبت - يتم تثبيته الآن...`);
      try {
        execSync(`npm install ${mod} --no-audit --no-fund`, { stdio: "inherit" });
      } catch (e) {
        console.error(`فشل تثبيت ${mod}. حاول تثبيته يدوياً: npm install ${mod}`);
        throw e;
      }
    }
  }
}

// أسماء الحزم التي نحتاجها
ensureDependencies(["axios", "fs-extra", "canvas", "@napi-rs/canvas"]);

// الآن نستدعي المكتبات بعد التأكد
const fsExtra = require("fs-extra");
const fs = require("fs");
const axios = require("axios");

// نحاول استخدام canvas الرسمي أولاً، وإن لم يوجد نستخدم @napi-rs/canvas
let createCanvas, loadImage, registerFont;
try {
  ({ createCanvas, loadImage, registerFont } = require("canvas"));
  console.log("استخدمنا مكتبة canvas (node-canvas).");
} catch (e) {
  try {
    ({ createCanvas, loadImage, registerFont } = require("@napi-rs/canvas"));
    console.log("استخدمنا مكتبة @napi-rs/canvas كبديل.");
  } catch (err) {
    console.error("لم نستطع تحميل مكتبة canvas أو @napi-rs/canvas. تأكد من تثبيتها يدوياً.");
    throw err;
  }
}

// تأكد من وجود مجلد cache
const tmpDir = path.join(__dirname, "cache");
fsExtra.ensureDirSync(tmpDir);

// مثال كامل لوحدة أمر (قالب عام يمكنك تعديله)
module.exports.config = {
  name: "هكر",
  version: "1.1.1",
  hasPermssion: 0,
  credits: "عمر",
  description: "تهكير حساب (مثال صورة)",
  commandCategory: "صور",
  usages: "@تاك",
  cooldowns: 120
};

module.exports.wrapText = (ctx, text, maxWidth) => {
  return new Promise(resolve => {
    if (ctx.measureText(text).width < maxWidth) return resolve([text]);
    const words = text.split(' ');
    const lines = [];
    let line = '';
    while (words.length > 0) {
      const testLine = line + words[0] + ' ';
      if (ctx.measureText(testLine).width <= maxWidth) {
        line = testLine;
        words.shift();
      } else {
        lines.push(line.trim());
        line = '';
      }
    }
    if (line) lines.push(line.trim());
    return resolve(lines);
  });
};

module.exports.run = async function ({ args, Users, api, event }) {
  try {
    // تأكد مجدداً من وجود المجلد المؤقت
    fsExtra.ensureDirSync(tmpDir);

    const pathImg = path.join(tmpDir, `hack_${Date.now()}.png`);
    const pathAvt = path.join(tmpDir, `Avt_${Date.now()}.png`);

    const id = event.senderID;
    const name = "Mquiro Ston'dr";

    // خلفية ثابتة (يمكن تغييره)
    const backgroundUrl = "https://i.ibb.co/3Wg3T6f/cover-template.jpg";
    const bgBuffer = (await axios.get(backgroundUrl, { responseType: "arraybuffer" })).data;
    fs.writeFileSync(pathImg, Buffer.from(bgBuffer));

    // صورة البروفايل
    const avatarUrl = `https://graph.facebook.com/${id}/picture?width=512&height=512`;
    const avatarBuffer = (await axios.get(avatarUrl, { responseType: "arraybuffer" })).data;
    fs.writeFileSync(pathAvt, Buffer.from(avatarBuffer));

    // تحميل الصور في canvas
    const baseImage = await loadImage(pathImg);
    const avatarImage = await loadImage(pathAvt);

    const canvas = createCanvas(baseImage.width, baseImage.height);
    const ctx = canvas.getContext('2d');

    // رسم الخلفية
    ctx.drawImage(baseImage, 0, 0, canvas.width, canvas.height);

    // رسم دائرة للصورة الشخصية
    const avatarSize = 120;
    ctx.save();
    ctx.beginPath();
    ctx.arc(83 + avatarSize / 2, 437 + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(avatarImage, 83, 437, avatarSize, avatarSize);
    ctx.restore();

    // كتابة النص
    ctx.font = "bold 28px Sans";
    ctx.fillStyle = "#FF0000";
    ctx.textAlign = "left";
    const lines = await this.wrapText(ctx, name, 500);
    const startX = 220;
    const startY = 150;
    for (let i = 0; i < lines.length; i++) {
      ctx.fillText(lines[i], startX, startY + i * 32);
    }

    // حفظ الصورة النهائية
    fs.writeFileSync(pathImg, canvas.toBuffer('image/png'));

    // إرسال الصورة واللازمة التنظيف
    await api.sendMessage(
      { body: "", attachment: fs.createReadStream(pathImg) },
      event.threadID,
      async () => {
        try { fs.unlinkSync(pathImg); } catch (e) {}
        try { fs.unlinkSync(pathAvt); } catch (e) {}
      },
      event.messageID
    );
  } catch (err) {
    console.error(err);
    return api.sendMessage('❌ حدث خطأ أثناء معالجة الصورة.', event.threadID, event.messageID);
  }
};