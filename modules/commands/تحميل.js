const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const path = require("path");

module.exports = {
  name: "fbdl",
  description: "تحميل فيديو فيسبوك",
  version: "1.0.0",
  nashPrefix: false,
  cooldowns: 10,

  async execute(api, event) {
    const { threadID, messageID, senderID, body } = event;
    const regex = /https?:\/\/(?:www\.)?facebook\.com\/[^\s]+/;
    const fbUrl = body.match(regex)?.[0];

    if (!fbUrl) return;

    api.sendMessage(
      `🔍 تم رصد فيديو جديد!\nاضغط على "تحميل" لتنزيل الفيديو الآن! ⬇️`,
      threadID,
      (err, info) => {
        global.handleReply.push({
          name: module.exports.name,
          messageID: info.messageID,
          author: senderID,
          fbUrl,
        });
      }
    );
  },

  async handleReply({ api, event, handleReply }) {
    const { threadID, messageID, senderID, body } = event;
    if (senderID !== handleReply.author || body.toLowerCase() !== "تحميل") return;

    api.sendMessage("⏳ جاري تحميل الفيديو، انتظر لحظة...", threadID);

    try {
      const form = new FormData();
      form.append("k_exp", "1749611486");
      form.append("k_token", "aa26d4a3b2bf844c8af6757179b85c10ab6975dacd30b55ef79d0d695f7ea764");
      form.append("q", handleReply.fbUrl);
      form.append("lang", "en");
      form.append("web", "fdownloader.net");
      form.append("v", "v2");

      const headers = {
        ...form.getHeaders(),
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept": "*/*",
      };

      const res = await axios.post("https://v3.fdownloader.net/api/ajaxSearch", form, { headers });
      const html = res.data.data;
      const link = html.match(/href="(https:\/\/[^"]+snapcdn[^"]+)"/)?.[1];

      if (!link) throw new Error("لم يتم العثور على رابط التنزيل");

      const tempPath = path.join(__dirname, "temp");
      if (!fs.existsSync(tempPath)) fs.mkdirSync(tempPath);

      const filePath = path.join(tempPath, `fb_${Date.now()}.mp4`);
      const writer = fs.createWriteStream(filePath);

      const videoStream = await axios({ method: "GET", url: link, responseType: "stream" });
      videoStream.data.pipe(writer);

      await new Promise((resolve, reject) => {
        writer.on("finish", resolve);
        writer.on("error", reject);
      });

      api.sendMessage(
        { body: "📥 إليك الفيديو المطلوب:", attachment: fs.createReadStream(filePath) },
        threadID,
        () => fs.unlinkSync(filePath)
      );
    } catch (err) {
      console.error("Download error:", err.message);
      api.sendMessage("❌ فشل في تحميل الفيديو، حاول مجددًا.", threadID, messageID);
    }
  },
};