const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports.config = {
    name: "فلوكس",
    version: "1.0.1",
    hasPermssion: 0,
    credits: "Mod by You",
    description: "إنشاء صور باستخدام DALL-E 3",
    commandCategory: "صور",
    usages: "فلوكس [نص]",
    cooldowns: 5
};

module.exports.run = async ({ api, event, args }) => {
    try {
        if (!args[0]) return api.sendMessage("يرجى إدخال نص لإنشاء الصورة!", event.threadID);

        const prompt = args.join(" ");
        const url = "http://flux-nobro9735-9yayti5m.leapcell.dev/api/dalle/generate";

        // إرسال الطلب للـ API
        const response = await axios({
            method: 'POST',
            url: url,
            data: {
                prompt: prompt,
                count: 1
            },
            headers: { "Content-Type": "application/json" },
            responseType: 'arraybuffer' // نطلب استلام البيانات كـ arraybuffer
        });

        const imagePath = path.join(__dirname, "flux_result.jpg");
        fs.writeFileSync(imagePath, Buffer.from(response.data, 'binary'));

        api.sendMessage({ body: "تم إنشاء الصورة:", attachment: fs.createReadStream(imagePath) }, event.threadID, () => {
            fs.unlinkSync(imagePath);
        });

    } catch (error) {
        console.error(error.response?.data || error);
        api.sendMessage("حدث خطأ أثناء إنشاء الصورة عبر فلوكس. تحقق من الـ API.", event.threadID);
    }
};