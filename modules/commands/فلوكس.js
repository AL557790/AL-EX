const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports.config = {
    name: "فلوكس",
    version: "1.0.3",
    hasPermssion: 0,
    credits: "Mod by You",
    description: "إنشاء صور باستخدام Flux API",
    commandCategory: "صور",
    usages: "فلوكس [عدد الصور] [نص]",
    cooldowns: 5
};

module.exports.run = async ({ api, event, args }) => {
    try {
        if (args.length < 2) return api.sendMessage("الاستعمال: فلوكس [عدد الصور] [النص]", event.threadID);

        const count = parseInt(args[0]);
        if (isNaN(count) || count < 1 || count > 10) return api.sendMessage("يرجى إدخال عدد صحيح بين 1 و 10", event.threadID);

        const prompt = args.slice(1).join(" ");
        const url = "http://flux-nobro9735-9yayti5m.leapcell.dev/api/flux/generate";

        // إرسال الطلب للـ API
        const response = await axios.post(url, {
            prompt: prompt,
            count: count
        }, { headers: { "Content-Type": "application/json" } });

        // استلام الصور على شكل روابط
        const images = response.data.images; // غالبًا الـ API يرجع { images: [url1, url2, ...] }
        if (!images || images.length === 0) return api.sendMessage("لم يتم إنشاء أي صور.", event.threadID);

        for (let i = 0; i < images.length; i++) {
            api.sendMessage({ body: `صورة رقم ${i+1}`, attachment: images[i] }, event.threadID);
        }

    } catch (error) {
        console.error(error.response?.data || error);
        api.sendMessage("حدث خطأ أثناء إنشاء الصورة عبر فلوكس. تحقق من الـ API.", event.threadID);
    }
};