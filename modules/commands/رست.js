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

module.exports.run = async function({ api, event, args }) {
    const { threadID, messageID, senderID } = event;

    const OWNER_ID = "100005186738399"; // ضع IDك هنا

    if (senderID != OWNER_ID)
        return api.sendMessage("❗ هذا الأمر مخصص للمطور فقط.", threadID, messageID);

    const timeNow = moment.tz("Asia/Riyadh").format("HH:mm:ss");
    const time = parseInt(args[0]) || 10;

    api.sendMessage(
        `[💟]➜ مرحبًا أيها الزعيم\n[🕐]➜ الوقت الحالي: ${timeNow}\n[🔁]➜ سيتم إعادة التشغيل بعد ${time} ثانية.`,
        threadID
    );

    setTimeout(() => {
        api.sendMessage("♻️ جاري إعادة تشغيل النظام الآن...", threadID, () => {
            process.exit(0);
        });
    }, time * 1000);
};