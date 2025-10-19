const axios = require("axios");
const fs = require("fs");
const path = require("path");
const FormData = require("form-data");

module.exports.config = {
  name: "قص",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "Mustafa + GPT-5",
  description: "قص خلفية الصورة عبر remove.photos بأسلوب سكربنغ احترافي",
  commandCategory: "〘 الأدوات 〙",
  usages: "[بالرد على صورة]",
  cooldowns: 5,
};

module.exports.run = async function ({ api, event }) {
  try {
    // تحقق من وجود صورة في الرد
    if (!event.messageReply || !event.messageReply.attachments || event.messageReply.attachments.length === 0)
      return api.sendMessage("📸 | أرسل الأمر بالرد على صورة.", event.threadID, event.messageID);

    const attach = event.messageReply.attachments[0];
    if (!attach.url) return api.sendMessage("❌ | لم أجد رابط الصورة.", event.threadID, event.messageID);

    // تنزيل الصورة مؤقتًا
    const imageUrl = attach.url;
    const fileName = path.basename(imageUrl.split("?")[0]);
    const cacheDir = path.join(__dirname, "cache");
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);
    const filePath = path.join(cacheDir, fileName);

    const res = await axios.get(imageUrl, { responseType: "arraybuffer" });
    fs.writeFileSync(filePath, res.data);

    // تهيئة البيانات للإرسال إلى remove.photos
    const form = new FormData();
    form.append("file", fs.createReadStream(filePath));

    const headers = {
      ...form.getHeaders(),
      "Accept": "application/json",
      "Origin": "https://remove.photos",
      "Referer": "https://remove.photos/ar/",
      "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0 Mobile Safari/537.36",
    };

    api.sendMessage("⏳ | جاري إزالة الخلفية من الصورة...", event.threadID, event.messageID);

    // إرسال الصورة للموقع
    const response = await axios.post("https://remove.photos/api/images/matting", form, {
      headers,
      responseType: "arraybuffer",
      timeout: 60000,
    });

    // حفظ الصورة الناتجة
    const outPath = path.join(cacheDir, `no_bg_${Date.now()}.png`);
    fs.writeFileSync(outPath, response.data);

    // إرسال النتيجة
    api.sendMessage(
      {
        body: "✅ | تم قص الخلفية بنجاح!",
        attachment: fs.createReadStream(outPath),
      },
      event.threadID,
      () => {
        fs.unlinkSync(filePath);
        fs.unlinkSync(outPath);
      },
      event.messageID
    );
  } catch (err) {
    console.error(err);
    return api.sendMessage("⚠️ | فشل في معالجة الصورة. الموقع ربما غيّر الحماية أو الجلسة انتهت.", event.threadID, event.messageID);
  }
};