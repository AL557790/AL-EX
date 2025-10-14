const https = require("https");
const fs = require("fs");
const path = require("path");
const { URL } = require("url");

module.exports.config = {
  name: "رفع",
  version: "1.2.0",
  hasPermssion: 0,
  credits: "Mustafa + GPT-5",
  description: "رفع الصور إلى catbox بدون مكتبات خارجية",
  commandCategory: "〘 الأدوات 〙",
  usages: "[بالرد على صورة]",
  cooldowns: 3,
};

function downloadFile(fileUrl, dest) {
  return new Promise((resolve, reject) => {
    const url = new URL(fileUrl);
    const file = fs.createWriteStream(dest);
    https.get(url, (res) => {
      res.pipe(file);
      file.on("finish", () => {
        file.close(resolve);
      });
    }).on("error", (err) => {
      fs.unlinkSync(dest);
      reject(err);
    });
  });
}

function uploadToCatbox(filePath) {
  return new Promise((resolve, reject) => {
    const boundary = "----WebKitFormBoundary7MA4YWxkTrZu0gW";
    const data = fs.readFileSync(filePath);
    const fileName = path.basename(filePath);

    const postData = Buffer.concat([
      Buffer.from(`--${boundary}\r\n` +
        `Content-Disposition: form-data; name="reqtype"\r\n\r\nfileupload\r\n` +
        `--${boundary}\r\n` +
        `Content-Disposition: form-data; name="fileToUpload"; filename="${fileName}"\r\n` +
        `Content-Type: application/octet-stream\r\n\r\n`),
      data,
      Buffer.from(`\r\n--${boundary}--\r\n`)
    ]);

    const options = {
      method: "POST",
      hostname: "catbox.moe",
      path: "/user/api.php",
      headers: {
        "Content-Type": `multipart/form-data; boundary=${boundary}`,
        "Content-Length": postData.length
      }
    };

    const req = https.request(options, (res) => {
      let body = "";
      res.on("data", chunk => body += chunk);
      res.on("end", () => resolve(body.trim()));
    });

    req.on("error", (err) => reject(err));
    req.write(postData);
    req.end();
  });
}

module.exports.run = async function ({ api, event }) {
  try {
    if (!event.messageReply || !event.messageReply.attachments || event.messageReply.attachments.length === 0) {
      return api.sendMessage("📸 | أرسل الأمر بالرد على صورة.", event.threadID, event.messageID);
    }

    const attach = event.messageReply.attachments[0];
    if (!attach.url) return api.sendMessage("❌ | لم أجد رابط الصورة.", event.threadID, event.messageID);

    const cacheDir = path.join(__dirname, "cache");
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

    const fileName = path.basename(attach.url.split("?")[0]);
    const filePath = path.join(cacheDir, fileName);

    await downloadFile(attach.url, filePath);
    const link = await uploadToCatbox(filePath);
    fs.unlinkSync(filePath);

    if (!link.startsWith("https://")) {
      return api.sendMessage("⚠️ | فشل رفع الصورة.\nالرد من الموقع:\n" + link, event.threadID, event.messageID);
    }

    const message = `✦ ━━━𝕌𝙋𝙇𝙊𝘼𝘿 𝙇𝙊𝙂 ━━━ ✦\n\n│⏳ استجابة الخادم 200 OK →\n\n│ 📤 تم رفع الصورة بنجاح [✅]\n\n│ ⚙️ ربط صورة 👇: ${link}\n  ❂━━━━━━━━━━━━━━━━❂`;
    return api.sendMessage(message, event.threadID, event.messageID);

  } catch (err) {
    console.error(err);
    return api.sendMessage("⚠️ | حدث خطأ أثناء عملية الرفع.", event.threadID, event.messageID);
  }
};