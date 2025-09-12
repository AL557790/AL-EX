const os = require('os');
const process = require('process');

module.exports.config = {
    name: "ابتايم",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "مطور",
    description: "يعرض معلومات عن البوت والنظام",
    commandCategory: "معلومات",
    usages: "ابتايم",
    cooldowns: 2
};

function formatTime(seconds) {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hrs}h ${mins}m ${secs}s`;
}

module.exports.run = async function({ api, event }) {
    const uptimeBot = formatTime(process.uptime());
    const memoryUsage = process.memoryUsage();
    const totalMem = (os.totalmem() / (1024 ** 3)).toFixed(2);
    const freeMem = (os.freemem() / (1024 ** 3)).toFixed(2);
    const usedMem = (totalMem - freeMem).toFixed(2);
    const cpu = os.cpus()[0];
    const loadAvg = os.loadavg()[0].toFixed(2);

    const message = `
🟢 BOT & SYSTEM INFO

🤖 Bot Uptime: ${uptimeBot}
🖥️ System Uptime: ${formatTime(os.uptime())}

💾 Memory Usage
- RSS: ${(memoryUsage.rss / (1024 ** 2)).toFixed(2)} MB
- Heap Total: ${(memoryUsage.heapTotal / (1024 ** 2)).toFixed(2)} MB
- Heap Used: ${(memoryUsage.heapUsed / (1024 ** 2)).toFixed(2)} MB

💻 System Memory
- Total: ${totalMem} GB
- Used: ${usedMem} GB
- Free: ${freeMem} GB

⚙️ CPU
- Model: ${cpu.model}
- Cores: ${os.cpus().length}
- Load Avg: ${loadAvg}

🖥️ Platform: ${os.platform()}
`;

    api.sendMessage(message, event.threadID);
};
