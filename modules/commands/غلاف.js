module.exports.config = {
  name: "غلاف",
  version: "2.0.0",
  hasPermssion: 0,
  credits: "تعديل مصطفى ✨",
  description: "إنشاء غلاف احترافي مع صورتك ونصوصك",
  commandCategory: "🎨 التصميم",
  usages: "غلاف [النص1 - النص2]",
  usePrefix: true,
  cooldowns: 10,
  dependencies: {
    canvas: "",
    axios: "",
    "fs-extra": "",
    jimp: ""
  },
};

module.exports.circle = async (image) => {
  const jimp = global.nodemodule["jimp"];
  image = await jimp.read(image);
  image.circle();
  return await image.getBufferAsync("image/png");
};

module.exports.run = async function ({ api, event, args }) {
  let { senderID, threadID, messageID } = event;
  const { loadImage, createCanvas } = require("canvas");
  const fs = global.nodemodule["fs-extra"];
  const axios = global.nodemodule["axios"];

  let pathImg = __dirname + `/cache/${senderID}.png`;
  let pathAva = __dirname + `/cache/avtuser.png`;

  let text = args.join(" ");
  if (!text) return api.sendMessage("💢 استعمل: غلاف [نص1 - نص2]", threadID, messageID);

  const text1 = text.substr(0, text.indexOf(" - "));
  const text2 = text.split(" - ").pop();

  if (!text1 || !text2) 
    return api.sendMessage("⚠️ الرجاء إدخال التنسيق الصحيح [نص1 - نص2]", threadID, messageID);

  // جلب صورة البروفايل
  let Avatar = (
    await axios.get(
      `https://graph.facebook.com/${senderID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`,
      { responseType: "arraybuffer" }
    )
  ).data;

  // جلب خلفية (تقدر تغير الرابط)
  let background = (
    await axios.get(encodeURI("https://i.ibb.co/3Wg3T6f/cover-template.jpg"), {
      responseType: "arraybuffer",
    })
  ).data;

  fs.writeFileSync(pathAva, Buffer.from(Avatar, "utf-8"));
  let avatar = await this.circle(pathAva);

  fs.writeFileSync(pathImg, Buffer.from(background, "utf-8"));
  let baseImage = await loadImage(pathImg);
  let baseAva = await loadImage(avatar);

  let canvas = createCanvas(baseImage.width, baseImage.height);
  let ctx = canvas.getContext("2d");

  // رسم الخلفية
  ctx.drawImage(baseImage, 0, 0, 1920, 1080);

  // رسم الصورة الشخصية بدائرة + إطار
  ctx.save();
  ctx.beginPath();
  ctx.arc(960, 380, 160, 0, Math.PI * 2, true);
  ctx.closePath();
  ctx.clip();
  ctx.drawImage(baseAva, 800, 220, 320, 320);
  ctx.restore();

  ctx.lineWidth = 8;
  ctx.strokeStyle = "#fff";
  ctx.beginPath();
  ctx.arc(960, 380, 160, 0, Math.PI * 2, true);
  ctx.stroke();

  // نص أول (بخط كبير وظل)
  ctx.font = "bold 80px Arial";
  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";
  ctx.shadowColor = "rgba(0,0,0,0.6)";
  ctx.shadowOffsetX = 4;
  ctx.shadowOffsetY = 4;
  ctx.shadowBlur = 10;
  ctx.fillText(text1, 960, 700);

  // نص ثاني (أصغر بلون متدرج)
  let gradient = ctx.createLinearGradient(760, 0, 1160, 0);
  gradient.addColorStop(0, "#00c6ff");
  gradient.addColorStop(1, "#0072ff");
  ctx.font = "55px Arial";
  ctx.fillStyle = gradient;
  ctx.shadowColor = "rgba(0,0,0,0.3)";
  ctx.shadowOffsetX = 2;
  ctx.shadowOffsetY = 2;
  ctx.shadowBlur = 6;
  ctx.fillText(text2, 960, 780);

  const imageBuffer = canvas.toBuffer();
  fs.writeFileSync(pathImg, imageBuffer);
  fs.removeSync(pathAva);

  return api.sendMessage(
    { attachment: fs.createReadStream(pathImg) },
    threadID,
    () => fs.unlinkSync(pathImg),
    messageID
  );
};