const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const axios = require("axios");
const Jimp = require("jimp");

function ensureDependencies(modules) {
  const installedFlag = path.join(__dirname, "cache", ".deps_installed");
  if (fs.existsSync(installedFlag)) return;

  console.log("🔍 Checking required modules...");
  let installedSomething = false;
  for (const mod of modules) {
    try { require.resolve(mod); } 
    catch {
      console.log(`📦 Installing missing module: ${mod}`);
      execSync(`npm install ${mod}`, { stdio: "inherit" });
      installedSomething = true;
    }
  }

  if (installedSomething) {
    const cacheDir = path.join(__dirname, "cache");
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);
    fs.writeFileSync(installedFlag, "installed");
    console.log("✅ Dependencies installed successfully!");
  }
}

ensureDependencies(["axios", "jimp"]);

module.exports.config = {
  name: "كرتون",
  version: "1.2.1",
  hasPermssion: 0,
  credits: "Mostafa",
  description: "تحويل الصورة إلى كرتون 🎨",
  commandCategory: "صور",
  usages: "كرتون (رد على صورة)",
  cooldowns: 5
};

module.exports.run = async function ({ api, event }) {
  try {
    const attachment = event.messageReply?.attachments?.[0];
    if (!attachment || !["photo", "image"].includes(attachment.type)) {
      return api.sendMessage(
        "⚠️ استخدم الأمر بالرد على صورة، مثل: كرتون (رد على الصورة)",
        event.threadID,
        event.messageID
      );
    }

    const imageUrl = attachment.url;
    const cacheDir = path.join(__dirname, "cache");
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

    const inputPath = path.join(cacheDir, "input.jpg");
    const outputPath = path.join(cacheDir, "cartoon.jpg");

    const response = await axios.get(imageUrl, { responseType: "arraybuffer" });
    fs.writeFileSync(inputPath, response.data);

    const image = await Jimp.read(inputPath);
    await image
      .posterize(6)
      .contrast(0.4)
      .brightness(0.05)
      .color([{ apply: "saturate", params: [20] }])
      .blur(1)
      .writeAsync(outputPath);

    api.sendMessage(
      {
        body: "🎨 تم تحويل الصورة إلى نمط كرتوني!",
        attachment: fs.createReadStream(outputPath)
      },
      event.threadID,
      () => {
        if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
        if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
      },
      event.messageID
    );
  } catch (err) {
    console.error("❌ خطأ:", err);
    api.sendMessage(
      "حدث خطأ أثناء معالجة الصورة. تأكد أن الصورة صالحة وحاول مجددًا.",
      event.threadID,
      event.messageID
    );
  }
};