// تثبيت المكتبة تلقائياً إن لم تكن موجودة
let Jimp;
try {
    Jimp = require("jimp");
} catch (e) {
    const { execSync } = require("child_process");
    console.log("📦 جاري تثبيت مكتبة Jimp…");
    execSync("npm install jimp", { stdio: "inherit" });
    Jimp = require("jimp");
}

module.exports.config = {
    name: "دائرة",
    version: "1.0.1",
    hasPermssion: 0,
    credits: "مصطفى",
    description: "تحويل صورة إلى شكل دائري",
    commandCategory: "التعديل على الصور",
    usages: "ارسل صورة ورد بكلمة دائرة",
    cooldowns: 3
};

module.exports.run = async function ({ api, event }) {
    const fs = require("fs");
    const out = (msg) => api.sendMessage(msg, event.threadID, event.messageID);

    // لازم يرد على صورة
    if (!event.messageReply || !event.messageReply.attachments || event.messageReply.attachments.length === 0) {
        return out("❌ الرجاء الرد على صورة واكتب: دائرة");
    }

    const att = event.messageReply.attachments[0];
    if (att.type !== "photo") return out("❌ الرجاء الرد على صورة فقط!");

    const url = att.url;
    out("⏳ جاري معالجة الصورة...");

    try {
        const img = await Jimp.read(url);

        const size = Math.min(img.bitmap.width, img.bitmap.height);
        img.resize(size, size);

        // إنشاء قناع دائري
        const mask = new Jimp(size, size, 0x00000000);
        mask.scan(0, 0, size, size, function (x, y, idx) {
            const radius = size / 2;
            const dx = x - radius;
            const dy = y - radius;
            if (dx * dx + dy * dy <= radius * radius) {
                this.bitmap.data[idx + 3] = 255; // شفافية كاملة
            }
        });

        img.mask(mask);

        const filePath = __dirname + `/circle_${Date.now()}.png`;
        await img.writeAsync(filePath);

        api.sendMessage(
            {
                body: "✅ تم تحويل الصورة إلى دائرة!",
                attachment: fs.createReadStream(filePath)
            },
            event.threadID,
            () => fs.unlinkSync(filePath),
            event.messageID
        );

    } catch (err) {
        console.log(err);
        out("❌ حدث خطأ أثناء معالجة الصورة.");
    }
};