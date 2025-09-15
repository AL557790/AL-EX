const fs = require("fs");
const path = require("path");

const dataFile = path.join(__dirname, "ai.json");

// تحميل البيانات
let dataset = [];
if (fs.existsSync(dataFile)) {
  dataset = JSON.parse(fs.readFileSync(dataFile, "utf8"));
}

// حفظ الملف
function saveData() {
  fs.writeFileSync(dataFile, JSON.stringify(dataset, null, 2), "utf8");
}

module.exports.config = {
  name: "تعلم",
  description: "تدريب البوت على ردود جديدة",
  commandCategory: "ذكاء اصطناعي",
  usages: "تعلم [كلمة] - [رد]",
  cooldowns: 2,
};

// أمر التدريب
module.exports.run = async function ({ api, event, args }) {
  const content = args.join(" ").split("-");
  if (content.length < 2) {
    return api.sendMessage("❌ الصيغة: تعلم [كلمة] - [رد]", event.threadID, event.messageID);
  }

  const input = content[0].trim();
  const output = content[1].trim();

  dataset.push({ input, output });
  saveData();

  api.sendMessage(`✅ تعلمت: "${input}" → "${output}"`, event.threadID, event.messageID);
};