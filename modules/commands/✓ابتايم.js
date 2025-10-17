// ✅ مكتبات تلقائية
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

function ensureDependencies(modules) {
  const cacheDir = path.join(__dirname, "cache");
  const flag = path.join(cacheDir, ".deps_installed_botinfo");
  if (fs.existsSync(flag)) return;

  if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);
  for (const mod of modules) {
    try {
      require.resolve(mod);
    } catch {
      console.log(`📦 تثبيت ${mod}...`);
      execSync(`npm install ${mod} -s`, { stdio: "inherit" });
    }
  }
  fs.writeFileSync(flag, "ok");
}

ensureDependencies(["canvas", "moment", "os"]);

const { createCanvas, loadImage } = require("canvas");
const os = require("os");
const process = require("process");
const moment = require("moment");

// إعداد معلومات الأمر
module.exports.config = {
  name: "ابتايم",
  version: "3.0.0",
  hasPermssion: 0,
  credits: "مصطفى",
  description: "يرسم لوحة معلومات كاملة للبوت والنظام بصورة",
  commandCategory: "معلومات",
  usages: "ابتايم",
  cooldowns: 5
};

function formatTime(seconds) {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  return `${hrs}h ${mins}m ${secs}s`;
}

module.exports.run = async function ({ api, event }) {
  try {
    const uptimeBot = formatTime(process.uptime());
    const memoryUsage = process.memoryUsage();
    const totalMem = (os.totalmem() / (1024 ** 3)).toFixed(2);
    const freeMem = (os.freemem() / (1024 ** 3)).toFixed(2);
    const usedMem = (totalMem - freeMem).toFixed(2);
    const cpu = os.cpus()[0];
    const loadAvg = os.loadavg()[0].toFixed(2);
    const now = moment().format("YYYY-MM-DD HH:mm:ss");

    // 🖼️ Canvas إعداد
    const width = 900;
    const height = 600;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext("2d");

    // خلفية متدرجة
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, "#0f172a");
    gradient.addColorStop(1, "#1e293b");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // عنوان
    ctx.fillStyle = "#00ff99";
    ctx.font = "bold 38px sans-serif";
    ctx.fillText("🟢 لوحة معلومات البوت", 240, 70);

    // خط فاصل
    ctx.strokeStyle = "#00ff99";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(60, 90);
    ctx.lineTo(840, 90);
    ctx.stroke();

    // مربعات المعلومات
    const boxes = [
      { title: "🤖 Bot Uptime", value: uptimeBot },
      { title: "🖥️ System Uptime", value: formatTime(os.uptime()) },
      { title: "💾 RSS", value: `${(memoryUsage.rss / (1024 ** 2)).toFixed(2)} MB` },
      { title: "💾 Heap Used", value: `${(memoryUsage.heapUsed / (1024 ** 2)).toFixed(2)} MB` },
      { title: "💻 Total Memory", value: `${totalMem} GB` },
      { title: "💻 Used Memory", value: `${usedMem} GB` },
      { title: "💻 Free Memory", value: `${freeMem} GB` },
      { title: "⚙️ CPU Model", value: cpu.model.slice(0, 40) },
      { title: "🧩 Cores", value: os.cpus().length },
      { title: "📊 Load Avg", value: loadAvg },
      { title: "🖥️ Platform", value: os.platform() },
      { title: "🕒 Updated", value: now }
    ];

    let startY = 140;
    const boxHeight = 35;

    boxes.forEach((b, i) => {
      ctx.fillStyle = "#1e293b";
      ctx.roundRect(70, startY + i * (boxHeight + 10), 760, boxHeight, 8);
      ctx.fill();
      ctx.fillStyle = "#00ffcc";
      ctx.font = "20px monospace";
      ctx.fillText(`${b.title}:`, 90, startY + i * (boxHeight + 10) + 25);
      ctx.fillStyle = "#fff";
      ctx.fillText(`${b.value}`, 350, startY + i * (boxHeight + 10) + 25);
    });

    // تذييل بسيط
    ctx.fillStyle = "#94a3b8";
    ctx.font = "16px sans-serif";
    ctx.fillText("© 2025 | Bot Info Panel by Mustafa", 300, 570);

    // حفظ الصورة مؤقتًا
    const filePath = path.join(__dirname, "bot_info.png");
    const buffer = canvas.toBuffer("image/png");
    fs.writeFileSync(filePath, buffer);

    // إرسال الصورة
    api.sendMessage(
      { body: "📊 تم إنشاء لوحة معلومات البوت:", attachment: fs.createReadStream(filePath) },
      event.threadID,
      () => fs.unlinkSync(filePath)
    );
  } catch (err) {
    api.sendMessage("❌ خطأ أثناء إنشاء الصورة:\n" + err, event.threadID);
  }
};