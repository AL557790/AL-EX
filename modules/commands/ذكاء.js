const axios = require('axios');

module.exports.config = {
    name: "نيرو",
    version: "2025.11.26-FIX-LANG",
    hasPermssion: 0,
    credits: "𝐘-𝐀𝐍𝐁𝐔 + Language Fix",
    description: "نيرو AI - يرد بالعربي دائمًا بدون فارسي",
    commandCategory: "دردشة مع نيرو",
    usages: "[سؤالك]",
    cooldowns: 3
};

module.exports.run = async function({ api, event, args }) {
    const prompt = args.join(" ").trim();
    if (!prompt) return api.sendMessage("اكتب سؤالك يلا!", event.threadID, event.messageID);

    api.sendTypingIndicator(event.threadID);

    const API_URL = "https://api.binjie.fun/api/generateStream?refer__1360=n4jxRDcDy13ewqxBqDwn2DnBDBADuDr121oD";

    const userId = "#/chat/17" + Date.now().toString().slice(-10);

    const payload = {
        prompt: prompt,
        userId: userId,
        network: true,
        system: "رد بالعربية الفصحى دائمًا، ولا تستخدم أي لغة أخرى.",  // ← السر: يحدد اللغة
        withoutContext: true,  // ← هذا يمنع السياق السابق (مش false)
        stream: false
    };

    const headers = {
        "Content-Type": "application/json",
        "Accept": "application/json, text/plain, */*",
        "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Mobile Safari/537.36",
        "Origin": "https://cht18.aichatosclx.com",
        "Referer": "https://cht18.aichatosclx.com/",
        "Accept-Encoding": "gzip, deflate, br",
        "Accept-Language": "ar-DZ,ar;q=0.9,en-US;q=0.8,en;q=0.7",
        "sec-ch-ua": `"Not/A)Brand";v="8", "Chromium";v="132"`,
        "sec-ch-ua-mobile": "?1",
        "sec-ch-ua-platform": `"Android"`
    };

    try {
        const response = await axios.post(API_URL, payload, { headers, timeout: 35000 });

        let answer = "";
        if (response.data?.text) {
            answer = response.data.text;
        } else if (typeof response.data === "string") {
            answer = response.data;
        } else if (response.data?.choices?.[0]) {
            answer = response.data.choices[0].text || response.data.choices[0].message?.content || "";
        } else {
            answer = JSON.stringify(response.data);
        }

        return api.sendMessage(`نيرو:\n\n${answer.trim()}`, event.threadID, event.messageID);

    } catch (error) {
        console.error("Nero Error:", error.response?.status || error.message);
        return api.sendMessage("الـ API وقف، جرب بعد شوية أو قول 'حدثني' للتحديث.", event.threadID, event.messageID);
    }
};