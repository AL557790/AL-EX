const fs = require("fs");
const path = require("path");

const dataFile = path.join(__dirname, "ai.json");
console.log("📂 ملف البيانات:", dataFile);

// إنشاء الملف إذا مش موجود
if (!fs.existsSync(dataFile)) {
  fs.writeFileSync(dataFile, "[]", "utf8");
}

let dataset;
try {
  dataset = JSON.parse(fs.readFileSync(dataFile, "utf8"));
  console.log("📥 البيانات عند البداية:", dataset);
} catch (err) {
  console.error("❌ خطأ في قراءة ai.json:", err);
  dataset = [];
}

// حفظ الملف
function saveData() {
  fs.writeFileSync(dataFile, JSON.stringify(dataset, null, 2), "utf8");
  console.log("💾 تم حفظ البيانات:", dataset);
}

module.exports.config = {
  name: "تعلم",
  description: "تدريب البوت على ردود جديدة",
  commandCategory: "ذكاء اصطناعي",
  usages: "تعلم [كلمة] - [رد]",
  cooldowns: 2,
};

module.exports.run = async function ({ api, event, args }) {
  const content = args.join(" ").split("-");
  if (content.length < 2) {
    return api.sendMessage("❌ الصيغة: تعلم [كلمة] - [رد]", event.threadID, event.messageID);
  }

  const input = content[0].trim();
  const output = content[1].trim();

  console.log("📝 تدريب جديد:", { input, output });

  dataset.push({ input, output });
  saveData();

  api.sendMessage(`✅ تعلمت: "${input}" → "${output}"`, event.threadID, event.messageID);
};