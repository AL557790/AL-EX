const os = require("os");
const process = require("process");
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// ✅ تثبيت تلقائي للمكتبة إذا كانت ناقصة
function ensureModule(name) {
  try {
    require.resolve(name);
  } catch {
    execSync(`npm install ${name} -s`, { stdio: "inherit" });
  }
}
ensureModule("canvas");

const { createCanvas } = require("canvas");

module.exports.config = {
  name: "ابتايم",
  version: "5.0.0",
  hasPermssion: 0,
  credits: "مصطفى",
  description: "لوحة معلومات البوت بتصميم احترافي بخلفية متدرجة ولمعان",
  commandCategory: "معلومات",
  usages: "ابتايم",
  cooldowns: 5
};

// تنسيق الوقت
function formatTime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return `${h}h ${m}m ${s}s`;
}

module.exports.run = async function ({ api, event }) {
  const uptime = formatTime(process.uptime());
  const totalMem = (os.totalmem() / (1024 ** 3)).toFixed(2);
  const freeMem = (os.freemem() / (1024 ** 3)).toFixed(2);
  const usedMem = (totalMem - freeMem).toFixed(2);
  const cpu = os.cpus()[0].model;
  const platform = os.platform();
  const time = new Date().toLocaleString("ar-EG");

  // 🖼️ إنشاء الصورة
  const canvas = createCanvas(800, 450);
  const ctx = canvas.getContext("2d");

  // 🎨 خلفية متدرجة (أزرق → بنفسجي)
  const gradient = ctx.createLinearGradient(0, 0, 800, 450);
  gradient.addColorStop(0, "#3B82F6"); // أزرق
  gradient.addColorStop(1, "#9333EA"); // بنفسجي
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 800, 450);

  // 🩶 طبقة شفافة ناعمة فوق الخلفية
  ctx.fillStyle = "rgba(0,0,0,0.35)";
  ctx.fillRect(0, 0, 800, 450);

  // ✨ إعداد تأثيرات الظل للنصوص
  ctx.shadowColor = "rgba(255,255,255,0.6)";
  ctx.shadowBlur = 20;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;

  // 🧠 العنوان الرئيسي
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "bold 38px Sans";
  ctx.fillText("📊 لوحة معلومات البوت", 210, 70);

  // 🔹 إزالة الظل القوي للنصوص الباقية
  ctx.shadowColor = "rgba(0,0,0,0.3)";
  ctx.shadowBlur = 8;

  // 📋 معلومات النظام
  ctx.font = "24px Sans";
  ctx.fillStyle = "#E0E7FF";
  ctx.fillText(`⏱️ وقت التشغيل: ${uptime}`, 100, 150);
  ctx.fillText(`💾 الذاكرة المستخدمة: ${usedMem} GB / ${totalMem} GB`, 100, 200);
  ctx.fillText(`💻 المعالج: ${cpu}`, 100, 250);
  ctx.fillText(`🪟 النظام: ${platform}`, 100, 300);
  ctx.fillText(`🕐 الوقت الحالي: ${time}`, 100, 350);

  // 👑 توقيع المصمم
  ctx.font = "bold 26px Sans";
  ctx.fillStyle = "#FFD700";
  ctx.shadowColor = "#FACC15";
  ctx.shadowBlur = 15;
  ctx.fillText("👑 المطور: مصطفى", 100, 400);

  // 🖼️ حفظ وإرسال
  const filePath = path.join(__dirname, "uptime_glow.png");
  fs.writeFileSync(filePath, canvas.toBuffer());
  api.sendMessage(
    {
      body: "⚙️ لوحة معلومات البوت ✨",
      attachment: fs.createReadStream(filePath)
    },
    event.threadID,
    () => fs.unlinkSync(filePath)
  );
};