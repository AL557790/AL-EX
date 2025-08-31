const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports.config = {
    name: "فلوكس",
    version: "1.0.0",
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
        const response = await axios.post(url, {
            prompt: prompt,
            count: 1
        }, {
            headers: { "Content-Type": "application/json" },
            responseType: 'arraybuffer'
        });

        // حفظ الصورة مؤقتًا
        const imagePath = path.join(__dirname, "flux_result.jpg");
        fs.writeFileSync(imagePath, Buffer.from(response.data, 'binary'));

        // إرسال الصورة
        api.sendMessage({ body: "تم إنشاء الصورة:", attachment: fs.createReadStream(imagePath) }, event.threadID, () => {
            fs.unlinkSync(imagePath); // حذف الصورة بعد الإرسال
        });

    } catch (error) {
        console.error(error);
        api.sendMessage("حدث خطأ أثناء إنشاء الصورة عبر فلوكس.", event.threadID);
    }
};