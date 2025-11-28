const os = require("os");
const process = require("process");

module.exports.config = {
  name: "ابتايم",
  version: "5.0.1",
  hasPermssion: 0,
  credits: "مصطفى",
  description: "عرض مدة تشغيل البوت ومعلومات النظام بشكل نصي",
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

module.exports.run = async function({ api, event }) {
  const uptime = formatTime(process.uptime());
  const totalMem = (os.totalmem() / (1024 ** 3)).toFixed(2);
  const freeMem = (os.freemem() / (1024 ** 3)).toFixed(2);
  const usedMem = (totalMem - freeMem).toFixed(2);
  const cpu = os.cpus()[0].model;
  const platform = os.platform();
  const time = new Date().toLocaleString("ar-EG");

  const msg = `
⚙️ لوحة معلومات البوت ⚙️
━━━━━━━━━━━━━━━
⏱️ وقت التشغيل: ${uptime}
💾 الذاكرة: ${usedMem} GB / ${totalMem} GB
💻 المعالج: ${cpu}
🪟 النظام: ${platform}
🕐 الوقت: ${time}

━━━━━━━━━━━━━━━`;

  api.sendMessage(msg, event.threadID, event.messageID);
};