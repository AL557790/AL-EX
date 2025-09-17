const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const path = require("path");

module.exports.config = {
  name: "تحسين",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "مصطفى",
  description: "تحسين جودة الصور باستخدام API",
  commandCategory: "صور",
  usages: ".تحسين + صورة",
  cooldowns: 5,
};

module.exports.run = async function({ api, event }) {
  try {
    // تأكد أن فيه صورة مرفقة
    if (!event.attachments || event.attachments.length === 0 || event.attachments[0].type !== "photo") {
      return api.sendMessage("⚠️ من فضلك أرسل صورة مع الأمر .تحسين", event.threadID, event.messageID);
    }

    const attachment = event.attachments[0];
    const filePath = path.join(__dirname, "temp.jpg");

    // تحميل الصورة من رابط فيسبوك
    const imgResponse = await axios.get(attachment.url, { responseType: "stream" });
    const writer = fs.createWriteStream(filePath);
    imgResponse.data.pipe(writer);

    writer.on("finish", async () => {
      try {
        // تجهيز الـ FormData
        const form = new FormData();
        form.append("image", fs.createReadStream(filePath));

        // إرسال الصورة لسيرفر Render
        const response = await axios.post("https://zoro-ap89.onrender.com/enhance", form, {
          headers: {
            ...form.getHeaders(),
          },
        });

        // حذف الملف المؤقت
        fs.unlinkSync(filePath);

        // إرسال الرابط الناتج للمستخدم
        api.sendMessage("✅ تم تحسين الصورة:\n" + response.data.enhanced, event.threadID, event.messageID);
      } catch (error) {
        console.error(error.message);
        api.sendMessage("❌ حصل خطأ أثناء تحسين الصورة", event.threadID, event.messageID);
      }
    });
  } catch (err) {
    console.error(err);
    api.sendMessage("❌ خطأ غير متوقع", event.threadID, event.messageID);
  }
};