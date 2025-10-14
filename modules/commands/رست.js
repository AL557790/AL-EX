const fs = require("fs");
const moment = require("moment-timezone");

module.exports.config = {
    name: "ريست",
    version: "2.0.3",
    hasPermssion: 3,
    credits: "Jukie + تعديل مصطفى",
    description: "إعادة تشغيل البوت",
    commandCategory: "النظام",
    usages: "[عدد الثواني]",
    cooldowns: 5
};

module.exports.run = async function({ api, event, args, Users }) {
    const { threadID, messageID, senderID } = event;

    // ✋ غيّر هذا الـ ID إلى الـ ID الخاص بك
    const OWNER_ID = "100013384479798";

    // تحقق من صلاحية المطور
    if (senderID != OWNER_ID)
        return api.sendMessage("❗ هذا الأمر مخصص للمطور فقط.", threadID, messageID);

    const name = await Users.getNameUser(senderID);
    const timeNow = moment.tz("Asia/Riyadh").format("HH:mm:ss");

    // الوقت المحدد قبل إعادة التشغيل
    const time = parseInt(args[0]) || 10;

    api.sendMessage(
        `[💟]➜ مرحبًا يا زعيم ${name}\n[🕐]➜ الوقت الحالي: ${timeNow}\n[🔁]➜ سيتم إعادة تشغيل البوت بعد ${time} ثانية.`,
        threadID
    );

    setTimeout(() => {
        api.sendMessage("♻️ جاري إعادة تشغيل النظام الآن...", threadID, () => {
            process.exit(0); // خروج نظيف، سيُعاد التشغيل إذا شغلت البوت بـ pm2 أو npm start
        });
    }, time * 1000);
};