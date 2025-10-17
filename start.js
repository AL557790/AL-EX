const { spawn } = require("child_process");

function startBot() {
  const bot = spawn("node", ["bot.js"], {
    stdio: "inherit",
    shell: true
  });

  bot.on("close", (code) => {
    if (code === 0) {
      console.log("♻️ إعادة تشغيل البوت...");
      startBot();
    } else {
      console.log("❌ حدث خطأ — كود الخروج:", code);
    }
  });
}

startBot();