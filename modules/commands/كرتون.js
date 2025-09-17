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

ensureDependencies(["axios", "fs", "path", "jimp"]);

const fs = require("fs");
const axios = require("axios");
const path = require("path");
const Jimp = require("jimp");

module.exports.config = {
  name: "كرتون",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "Mostafa",
  description: "Apply cartoon effect to image",
  commandCategory: "Images",
  usages: ".كرتون (reply to an image)",
  usePrefix: true,
};

module.exports.run = async function ({ api, event }) {
  try {
    if (
      !event.messageReply ||
      !event.messageReply.attachments ||
      event.messageReply.attachments[0].type !== "photo"
    ) {
      return api.sendMessage(
        "⚠️ Please reply to an image with the command .كرتون",
        event.threadID,
        event.messageID
      );
    }

    const imageUrl = event.messageReply.attachments[0].url;
    const inputPath = path.join(__dirname, "input.jpg");
    const outputPath = path.join(__dirname, "cartoon.jpg");

    const response = await axios.get(imageUrl, { responseType: "arraybuffer" });
    fs.writeFileSync(inputPath, response.data);

    const image = await Jimp.read(inputPath);
    image
      .posterize(6)
      .contrast(0.3)
      .brightness(0.05)
      .write(outputPath);

    api.sendMessage(
      {
        body: "🎨 Cartoonized image:",
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
    api.sendMessage(
      "❌ An error occurred while cartoonizing the image.",
      event.threadID,
      event.messageID
    );
  }
};