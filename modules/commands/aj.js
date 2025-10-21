module.exports.config = {
  name: "هكر",
  version: "1.0.2",
  hasPermssion: 0,
  credits: "ANAS",
  description: "تهكير حساب أي شخص",
  commandCategory: "صور",
  usages: "@تاك",
  dependencies: {
    "axios": "",
    "fs-extra": "",
    "canvas": ""
  },
  cooldowns: 120
};

module.exports.wrapText = (ctx, text, maxWidth) => {
  return new Promise(resolve => {
    if(ctx.measureText(text).width < maxWidth) return resolve([text]);
    const words = text.split(' ');
    const lines = [];
    let line = '';
    while(words.length > 0) {
      let split = false;
      while(ctx.measureText(words[0]).width >= maxWidth) {
        const temp = words[0];
        words[0] = temp.slice(0, -1);
        if(split) words[1] = `${temp.slice(-1)}${words[1]}`;
        else {
          split = true;
          words.splice(1, 0, temp.slice(-1));
        }
      }
      if(ctx.measureText(`${line}${words[0]}`).width < maxWidth) line += `${words.shift()} `;
      else {
        lines.push(line.trim());
        line = '';
      }
      if(words.length === 0) lines.push(line.trim());
    }
    return resolve(lines);
  });
}

module.exports.run = async function ({ args, Users, api, event }) {
  const { loadImage, createCanvas } = require("canvas");
  const fs = global.nodemodule["fs-extra"];
  const axios = global.nodemodule["axios"];
  
  const pathImg = __dirname + "/cache/background.png";
  const pathAvt = __dirname + "/cache/Avtmot.png";

  const id = Object.keys(event.mentions)[0] || event.senderID;
  const name = await Users.getNameUser(id);

  const backgrounds = ["https://i.imgur.com/VQXViKI.png"];
  const bgUrl = backgrounds[Math.floor(Math.random() * backgrounds.length)];

  const bgResp = await axios.get(bgUrl, { responseType: "arraybuffer" });
  fs.writeFileSync(pathImg, Buffer.from(bgResp.data));

  try {
    const profileResp = await axios.get(`https://graph.facebook.com/${id}/picture?width=512&height=512&access_token=6628568379|c1e620fa708a1d5696fb991c1bde5662`, { responseType: "arraybuffer" });
    fs.writeFileSync(pathAvt, Buffer.from(profileResp.data));
  } catch (e) {
    return api.sendMessage("تعذر تحميل صورة البروفايل. ربما الحساب خاص.", event.threadID);
  }

  const baseImage = await loadImage(pathImg);
  const baseAvt = await loadImage(pathAvt);
  const canvas = createCanvas(baseImage.width, baseImage.height);
  const ctx = canvas.getContext("2d");

  ctx.drawImage(baseImage, 0, 0, canvas.width, canvas.height);
  ctx.font = "400 23px Arial";
  ctx.fillStyle = "#1878F3";
  ctx.textAlign = "start";

  const lines = await this.wrapText(ctx, name, 1160);
  ctx.fillText(lines.join('\n'), 200, 497);

  ctx.drawImage(baseAvt, 83, 437, 100, 101);

  const imageBuffer = canvas.toBuffer();
  fs.writeFileSync(pathImg, imageBuffer);
  fs.removeSync(pathAvt);

  return api.sendMessage(
    { body: " ", attachment: fs.createReadStream(pathImg) },
    event.threadID,
    () => fs.unlinkSync(pathImg),
    event.messageID
  );
}