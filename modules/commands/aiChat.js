const fs = require("fs");
const path = require("path");

const dataFile = path.join(__dirname, "ai.json");

module.exports.config = {
  name: "ذكاء",
  description: "التحدث مع الذكاء الاصطناعي البسيط",
  commandCategory: "ذكاء اصطناعي",
  usages: "[رسالتك]",
  cooldowns: 2,
};

module.exports.run = async function ({ api, event, args }) {
  if (args.length === 0) {
    return api.sendMessage("❌ اكتب رسالة للتحدث مع الذكاء", event.threadID, event.messageID);
  }

  // تحميل البيانات في كل مرة
  let dataset = [];
  if (fs.existsSync(dataFile)) {
    dataset = JSON.parse(fs.readFileSync(dataFile, "utf8"));
  }

  const msg = args.join(" ").trim();
  const found = dataset.find(item => item.input === msg);

  if (found) {
    api.sendMessage(found.output, event.threadID, event.messageID);
  } else {
    api.sendMessage("🤔 ما فهمت قصدك، جرب تدربني عليها باستخدام: تعلم [كلمة] - [رد]", event.threadID, event.messageID);
  }
};