const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports.config = {
    name: "انشاء",
    version: "1.0.1",
    hasPermssion: 0,
    credits: "Mod by You",
    description: "انشاء صور بدون مفتاح API",
    commandCategory: "صور",
    usages: "انشاء [نص]",
    cooldowns: 5
};

module.exports.run = async ({ api, event, args }) => {
    try {
        if (!args[0]) return api.sendMessage("⚠️ يرجى إدخال نص لإنشاء الصورة!", event.threadID);

        const prompt = encodeURIComponent(args.join(" "));
        const url = `https://image.pollinations.ai/prompt/${prompt}`;

        const response = await axios.get(url, { responseType: 'arraybuffer' });
        const imagePath = path.join(__dirname, "pollinations_result.jpg");
        fs.writeFileSync(imagePath, Buffer.from(response.data, 'binary'));

        api.sendMessage(
            { body: `✅ تم إنشاء الصورة:\n"${args.join(" ")}"`, attachment: fs.createReadStream(imagePath) },
            event.threadID,
            () => fs.unlinkSync(imagePath)
        );

    } catch (error) {
        console.error(error);
        api.sendMessage("❌ حدث خطأ أثناء إنشاء الصورة.", event.threadID);
    }
};