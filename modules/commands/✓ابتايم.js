const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// ✅ تثبيت تلقائي للمكتبات في أول مرة فقط
function ensureDependencies(modules) {
  const cacheDir = path.join(__dirname, "cache");
  const flag = path.join(cacheDir, ".deps_installed_uptime");
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

ensureDependencies(["canvas", "moment"]);

const os = require("os");
const moment = require("moment");
const { createCanvas } = require("canvas");

module.exports.config = {
  name: "ابتايم",
  version: "3.5.0",
  hasPermssion: 0,
  credits: "مصطفى",
  description: "يرسل لوحة معلومات البوت بالصورة",
  commandCategory: "معلومات",
  usages: "ابتايم",
  cooldowns: 5
};

function formatTime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return `${h}h ${m}m ${s}s`;
}

module.exports.run = async function ({ api, event }) {
  try {
    const uptimeBot = formatTime(process.uptime());
    const sysUptime = formatTime(os.uptime());
    const totalMem = (os.totalmem() / (1024 ** 3)).toFixed(2);
    const freeMem = (os.freemem() / (1024 ** 3)).toFixed(2);
    const usedMem = (totalMem - freeMem).toFixed(2);
    const memoryUsage = process.memoryUsage();
    const cpu = os.cpus()[0];
    const load = os.loadavg()[0].toFixed(2);
    const now = moment().format("YYYY-MM-DD HH:mm:ss");

    // 🖼️ إنشاء الصورة
    const width = 900, height = 600;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext("2d");

    // خلفية
    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, "#0f172a");
    grad.addColorStop(1, "#1e293b");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // عنوان
    ctx.fillStyle = "#00ff99";
    ctx.font = "bold 40px sans-serif";
    ctx.fillText("🟢 لوحة معلومات البوت", 230, 70);

    // خط فاصل
    ctx.strokeStyle = "#00ff99";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(70, 90);
    ctx.lineTo(830, 90);
    ctx.stroke();

    const info = [
      ["🤖 Bot Uptime", uptimeBot],
      ["🖥️ System Uptime", sysUptime],
      ["💾 RSS", `${(memoryUsage.rss / 1048576).toFixed(2)} MB`],
      ["💾 Heap Used", `${(memoryUsage.heapUsed / 1048576).toFixed(2)} MB`],
      ["💻 Total Memory", `${totalMem} GB`],
      ["💻 Used Memory", `${usedMem} GB`],
      ["💻 Free Memory", `${freeMem} GB`],
      ["⚙️ CPU Model", cpu.model.slice(0, 40)],
      ["🧩 Cores", os.cpus().length],
      ["📊 Load Avg", load],
      ["🖥️ Platform", os.platform()],
      ["🕒 Updated", now]
    ];

    ctx.font = "20px monospace";
    let y = 140;
    for (const [label, value] of info) {
      ctx.fillStyle = "#1e293b";
      ctx.beginPath();
      ctx.roundRect(80, y - 25, 740, 35, 8);
      ctx.fill();
      ctx.fillStyle = "#00ffff";
      ctx.fillText(`${label}:`, 100, y);
      ctx.fillStyle = "#ffffff";
      ctx.fillText(value, 360, y);
      y += 45;
    }

    ctx.fillStyle = "#94a3b8";
    ctx.font = "16px sans-serif";
    ctx.fillText("© 2025 | Bot Info Panel by Mustafa", 320, 570);

    const imagePath = path.join(__dirname, "uptime_info.png");
    fs.writeFileSync(imagePath, canvas.toBuffer("image/png"));

    api.sendMessage(
      { body: "📊 لوحة معلومات البوت:", attachment: fs.createReadStream(imagePath) },
      event.threadID,
      () => fs.unlinkSync(imagePath)
    );
  } catch (err) {
    api.sendMessage("❌ خطأ أثناء إنشاء الصورة:\n" + err, event.threadID);
  }
};