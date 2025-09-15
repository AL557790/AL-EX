const fs = require("fs");
const path = require("path");

const dataFile = path.join(__dirname, "ai.json");

// إذا الملف مش موجود، ننشئه
if (!fs.existsSync(dataFile)) {
  fs.writeFileSync(dataFile, "[]", "utf8");
}

// تحميل البيانات
let dataset = JSON.parse(fs.readFileSync(dataFile, "utf8"));

// دالة لحفظ البيانات
function saveData() {
  fs.writeFileSync(dataFile, JSON.stringify(dataset, null, 2), "utf8");
}

module.exports.config = {
  name: "ندرب",
  description: "تدريب البوت على ردود جديدة باستخدام JSON Array",
  commandCategory: "ذكاء اصطناعي",
  usages: "ندرب [JSON Array]",
  cooldowns: 2,
};

module.exports.run = async function ({ api, event, args }) {
  const text = args.join(" ").trim();

  try {
    // محاولة قراءة الـ JSON
    const arr = JSON.parse(text);

    if (!Array.isArray(arr)) {
      return api.sendMessage("❌ البيانات يجب أن تكون على شكل Array", event.threadID, event.messageID);
    }

    let count = 0;
    arr.forEach(item => {
      if (item.input && item.output) {
        dataset.push({ input: item.input, output: item.output });
        count++;
      }
    });

    saveData();
    api.sendMessage(`✅ تم تدريب ${count} جملة جديدة`, event.threadID, event.messageID);

  } catch (err) {
    api.sendMessage("❌ صيغة JSON غير صحيحة", event.threadID, event.messageID);
  }
};