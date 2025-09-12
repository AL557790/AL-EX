const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports.config = {
    name: "انشاء",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "Mod by You",
    description: "انشاء صور عبر API",
    commandCategory: "صور",
    usages: "انشاء [نص]",
    cooldowns: 5
};

module.exports.run = async ({ api, event, args }) => {
    try {
        if (!args[0]) return api.sendMessage("يرجى إدخال نص لإنشاء الصورة!", event.threadID);

        // دمج النص مع رابط الـ API
        const prompt = encodeURIComponent(args.join(" "));
        const url = `https://api.oculux.xyz/api/synthwave?prompt=${prompt}`;

        // جلب الصورة من الـ API
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        const imagePath = path.join(__dirname, "result.jpg");
        fs.writeFileSync(imagePath, Buffer.from(response.data, 'binary'));

        // إرسال الصورة
        api.sendMessage({ body: "تم إنشاء الصورة:", attachment: fs.createReadStream(imagePath) }, event.threadID, () => {
            fs.unlinkSync(imagePath); // حذف الصورة بعد الإرسال
        });

    } catch (error) {
        console.error(error);
        api.sendMessage("حدث خطأ أثناء إنشاء الصورة.", event.threadID);
    }
};
