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

ensureDependencies(["fb-video-downloader", "axios", "fs", "path"]);

const FbDownloader = require("fb-video-downloader");
const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports.config = {
  name: "فيديو",
  version: "1.0.1",
  hasPermssion: 0,
  credits: "Mostafa",
  description: "Download Facebook video via link",
  commandCategory: "Video",
  usages: ".فيديو [link]",
  usePrefix: true,
};

module.exports.run = async function ({ api, event, args }) {
  try {
    const url = args.join(" ");
    if (!url) {
      return api.sendMessage("⚠️ Please provide a Facebook video link.", event.threadID, event.messageID);
    }

    const downloader = new FbDownloader(url);
    const videoInfo = await downloader.getInfo();

    if (!videoInfo.video || videoInfo.video.length === 0) {
      return api.sendMessage("❌ Could not fetch the video.", event.threadID, event.messageID);
    }

    const videoUrl = videoInfo.video[0].url;
    const outputPath = path.join(__dirname, "video.mp4");

    const response = await axios.get(videoUrl, { responseType: "stream" });
    const writer = fs.createWriteStream(outputPath);
    response.data.pipe(writer);

    writer.on("finish", () => {
      api.sendMessage(
        { body: "✅ Video downloaded:", attachment: fs.createReadStream(outputPath) },
        event.threadID,
        () => fs.unlinkSync(outputPath),
        event.messageID
      );
    });

    writer.on("error", (err) => {
      console.error(err);
      api.sendMessage("❌ Error while downloading the video.", event.threadID, event.messageID);
    });

  } catch (err) {
    console.error(err);
    api.sendMessage("❌ An error occurred.", event.threadID, event.messageID);
  }
};