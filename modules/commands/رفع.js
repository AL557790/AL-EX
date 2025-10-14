const axios = require("axios");
const fs = require("fs");
const path = require("path");
const FormData = require("form-data");

module.exports.config = {
  name: "رفع",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "Mustafa + GPT-5",
  description: "رفع الصور إلى catbox بأسلوب سكربنغ (مثل المتصفح)",
  commandCategory: "〘 الأدوات 〙",
  usages: "[بالرد على صورة]",
  cooldowns: 3,
};

module.exports.run = async function ({ api, event }) {
  try {
    // التحقق من وجود صورة في الرد
    if (!event.messageReply || !event.messageReply.attachments || event.messageReply.attachments.length === 0) {
      return api.sendMessage("📸 | أرسل الأمر بالرد على صورة.", event.threadID, event.messageID);
    }

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

    // سكربنغ يشبه تمامًا طلبك في Python
    const headers = {
      "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36",
      "Referer": "https://catbox.moe/",
      "Origin": "https://catbox.moe",
      "X-Requested-With": "XMLHttpRequest",
      "Accept": "application/json, text/plain, */*",
      "Accept-Language": "ar-DZ,ar;q=0.9,en-US;q=0.8,en;q=0.7"
    };

    const form = new FormData();
    form.append("reqtype", "fileupload");
    form.append("fileToUpload", fs.createReadStream(filePath));

    // رفع الصورة إلى Catbox
    const uploadRes = await axios.post("https://catbox.moe/user/api.php", form, {
      headers: {
        ...form.getHeaders(),
        ...headers,
      },
      timeout: 120000,
    });

    const link = uploadRes.data.trim();
    fs.unlinkSync(filePath);

    if (!link.startsWith("https://")) {
      return api.sendMessage("⚠️ | فشل رفع الصورة.\nالرد من الموقع:\n" + link, event.threadID, event.messageID);
    }

    return api.sendMessage(`✅ | تم رفع الصورة بنجاح:\n${link}`, event.threadID, event.messageID);
  } catch (err) {
    console.error(err);
    return api.sendMessage("⚠️ | حدث خطأ أثناء عملية الرفع.", event.threadID, event.messageID);
  }
};