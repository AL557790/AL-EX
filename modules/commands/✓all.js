module.exports.config = {
  name: "autoMessage",
  version: "1.0.0",
  credits: "مصطفى",
  description: "يرسل رسالة كل ثانية لجميع المجموعات"
};

module.exports.onLoad = function({ api }) {
  setInterval(() => {
    const message = "⚡ رسالة أوتوماتيكية كل ثانية من البوت!";

    for (const threadID of global.data.allThreadID) {
      api.sendMessage(message, threadID, (err) => {
        if (err) console.error(`فشل إرسال الرسالة للمجموعة ${threadID}:`, err);
      });
    }

  }, 1000); // كل ثانية (1000 ms)
};