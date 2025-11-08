const fs = global.nodemodule["fs-extra"];
const axios = global.nodemodule["axios"];
const path = require('path');
const { createCanvas, loadImage, registerFont } = require('@napi-rs/canvas');

module.exports.config = {
  name: "هكر",
  version: "1.1.0",
  hasPermssion: 0,
  credits: "عمر",
  description: "تهكير حسساب اي شخص ",
  commandCategory: "صور",
  usages: "@تاك",
  dependencies: {
        "axios": "",
        "fs-extra": "",
        "@napi-rs/canvas": ""
  },
  cooldowns: 120
};

module.exports.wrapText = (ctx, name, maxWidth) => {
  return new Promise(resolve => {
    if (ctx.measureText(name).width < maxWidth) return resolve([name]);
    if (ctx.measureText('W').width > maxWidth) return resolve(null);
    const words = name.split(' ');
    const lines = [];
    let line = '';
    while (words.length > 0) {
      let split = false;
      while (ctx.measureText(words[0]).width >= maxWidth) {
        const temp = words[0];
        words[0] = temp.slice(0, -1);
        if (split) words[1] = `${temp.slice(-1)}${words[1]}`;
        else {
          split = true;
          words.splice(1, 0, temp.slice(-1));
        }
      }
      if (ctx.measureText(`${line}${words[0]}`).width < maxWidth) line += `${words.shift()} `;
      else {
        lines.push(line.trim());
        line = '';
      }
      if (words.length === 0) lines.push(line.trim());
    }
    return resolve(lines);
  });
}

module.exports.run = async function ({ args, Users, api, event }) {
  try {
    const tmpDir = path.join(__dirname, 'cache');
    await fs.ensureDir(tmpDir);

    const pathImg = path.join(tmpDir, `hack_${Date.now()}.png`);
    const pathAvt = path.join(tmpDir, `Avt_${Date.now()}.png`);

    // استخدام آيدي المستخدم الذي يشغل الأمر (أنت) بدلاً من الشخص المذكور
    const id = event.senderID; // هذا سيأخذ آيديك أنت
    const name = "Mquiro Ston'dr"; // اسمك الثابت

    // تحميل الخلفية
    const backgroundUrl = "https://scontent.xx.fbcdn.net/v/t1.15752-9/575752057_1100487991984290_4943061121323864432_n.jpg?stp=dst-jpg_p480x480_tt6&_nc_cat=108&ccb=1-7&_nc_sid=9f807c&_nc_eui2=AeFgiEFooBwMOygoSKcp0jmH2qPteszDIL7ao-16zMMgvk2HZquJRf0OATIzBNaQBhQegvKkg6MY12wGlL0shzVU&_nc_ohc=jRNOgJB-C-0Q7kNvwEsNe12&_nc_oc=AdkXJMCkGS6cOrwa7XNq-kgCpEuDoQo5plaQbVI6I-TkLNitSL6AvJ-G5iAcYh4dvRw&_nc_ad=z-m&_nc_cid=0&_nc_zt=23&_nc_ht=scontent.xx&oh=03_Q7cD3wHziktRhBX61pP7UrRAYN2wxrbISfVhmpc1SPc06cVS4A&oe=6935E9FB";
    const bgBuffer = (await axios.get(backgroundUrl, { responseType: "arraybuffer" })).data;
    fs.writeFileSync(pathImg, Buffer.from(bgBuffer));

    // تحميل صورة البروفايل الخاصة بك
    const avatarUrl = `https://graph.facebook.com/${id}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
    const avatarBuffer = (await axios.get(avatarUrl, { responseType: "arraybuffer" })).data;
    fs.writeFileSync(pathAvt, Buffer.from(avatarBuffer));

    // تحميل الصور في canvas
    const baseImage = await loadImage(pathImg);
    const avatarImage = await loadImage(pathAvt);

    const canvas = createCanvas(baseImage.width, baseImage.height);
    const ctx = canvas.getContext('2d');

    // رسم الخلفية
    ctx.drawImage(baseImage, 0, 0, canvas.width, canvas.height);

    // رسم صورة البروفايل المصغرة
    const avatarSize = 120;
    ctx.beginPath();
    ctx.arc(83 + avatarSize / 2, 437 + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(avatarImage, 83, 437, avatarSize, avatarSize);
    ctx.resetTransform(); // إعادة الكليب

    // كتابة اسمك الثابت أعلى الصورة
    ctx.font = "bold 28px Arial";
    ctx.fillStyle = "#FF0000";
    ctx.textAlign = "left";
    const lines = await this.wrapText(ctx, name, 500);
    const startX = 220;
    const startY = 150;
    for (let i = 0; i < lines.length; i++) {
      ctx.fillText(lines[i], startX, startY + i * 32);
    }

    // حفظ الصورة النهائية
    fs.writeFileSync(pathImg, canvas.toBuffer('image/png'));

    // إرسال الصورة
    await api.sendMessage(
      { body: "", attachment: fs.createReadStream(pathImg) },
      event.threadID,
      async () => {
        try { fs.unlinkSync(pathImg); } catch(e){}
        try { fs.unlinkSync(pathAvt); } catch(e){}
      },
      event.messageID
    );

  } catch (err) {
    console.error(err);
    return api.sendMessage('❌ حدث خطأ أثناء معالجة الصورة.', event.threadID, event.messageID);
  }
}