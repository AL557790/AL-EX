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

ensureDependencies(["axios", "fs", "path", "@imgly/background-removal"]);

const fs = require("fs");
const axios = require("axios");
const path = require("path");
const { removeBackground } = require("@imgly/background-removal");

module.exports.config = {
  name: "قص",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "Mostafa",
  description: "Remove background from image",
  commandCategory: "Images",
  usages: ".قص (reply to an image)",
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
        "⚠️ Please reply to an image with the command .قص",
        event.threadID,
        event.messageID
      );
    }

    const imageUrl = event.messageReply.attachments[0].url;
    const inputPath = path.join(__dirname, "input.png");
    const outputPath = path.join(__dirname, "output.png");

    const response = await axios.get(imageUrl, { responseType: "arraybuffer" });
    fs.writeFileSync(inputPath, response.data);

    const buffer = await removeBackground(fs.readFileSync(inputPath));
    fs.writeFileSync(outputPath, buffer);

    api.sendMessage(
      {
        body: "✅ Background removed:",
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
      "❌ An error occurred while removing the background.",
      event.threadID,
      event.messageID
    );
  }
};