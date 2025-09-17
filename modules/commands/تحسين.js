const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const path = require("path");

module.exports.config = {
  name: "تحسين",
  version: "1.2.0",
  hasPermssion: 0,
  credits: "مصطفى",
  description: "تحسين جودة الصور (بالرد على صورة فقط)",
  commandCategory: "صور",
  usages: "رد على صورة بـ .تحسين",
  cooldowns: 5,
};

module.exports.run = async function({ api, event }) {
  try {
    // لازم يكون رد على رسالة فيها صورة
    if (!event.messageReply || event.messageReply.attachments.length === 0 || event.messageReply.attachments[0].type !== "photo") {
      return api.sendMessage("⚠️ لازم ترد على صورة بالأمر .تحسين", event.threadID, event.messageID);
    }

    const attachment = event.messageReply.attachments[0];
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

        // إرسال الصورة لسيرفرك
        const response = await axios.post("https://zoro-ap89.onrender.com/enhance", form, {
          headers: {
            ...form.getHeaders(),
          },
        });

        fs.unlinkSync(filePath); // نحذف الصورة المؤقتة

        // إرسال الرابط الناتج
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