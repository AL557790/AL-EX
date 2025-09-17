const { execSync } = require("child_process");

function ensureDependencies(modules) {
  modules.forEach((mod) => {
    try {
      require.resolve(mod);
    } catch (e) {
      console.log(`Installing missing module: ${mod} ...`);
      execSync(`npm install ${mod}`, { stdio: "inherit" });
    }
  });
}

ensureDependencies(["sharp", "axios", "fs", "path"]);

const sharp = require("sharp");
const fs = require("fs");
const axios = require("axios");
const path = require("path");

module.exports.config = {
  name: "تحسين",
  version: "1.0.1",
  hasPermssion: 0,
  credits: "Mostafa",
  description: "Enhance image clarity and colors",
  commandCategory: "Images",
  usages: ".تحسين (reply to an image)",
  usePrefix: true,
};

module.exports.run = async function ({ api, event }) {
  try {
    if (!event.messageReply || !event.messageReply.attachments || event.messageReply.attachments[0].type !== "photo") {
      return api.sendMessage("⚠️ Please reply to an image with the command .تحسين", event.threadID, event.messageID);
    }

    const imageUrl = event.messageReply.attachments[0].url;
    const inputPath = path.join(__dirname, "input.jpg");
    const outputPath = path.join(__dirname, "output.jpg");

    const response = await axios.get(imageUrl, { responseType: "arraybuffer" });
    fs.writeFileSync(inputPath, response.data);

    await sharp(inputPath).normalize().sharpen().toFile(outputPath);

    api.sendMessage(
      {
        body: "✅ Enhanced image:",
        attachment: fs.createReadStream(outputPath),
      },
      event.threadID,
      () => {
        fs.unlinkSync(inputPath);
        fs.unlinkSync(outputPath);
      },
      event.messageID
    );
  } catch (err) {
    console.error("Error:", err);
    api.sendMessage("❌ An error occurred while enhancing the image.", event.threadID, event.messageID);
  }
};