const axios = require('axios');

module.exports.config = {
    name: "نيرو",
    version: "2025.11.27-NERO-FIX",
    hasPermission: 0,
    credits: "Ayoub + 𝐘-𝐀𝐍𝐁𝐔",
    description: "AI - نيرو",
    commandCategory: "خدمات",
    usages: "[سؤالك]",
    cooldowns: 3
};

module.exports.run = async function({ api, event, args }) {
    const { threadID, messageID, messageReply } = event;

    // دمج رسالة الرد إذا وجدت
    let prompt = args.join(" ").trim();
    if (messageReply) prompt = `${messageReply.body} ${prompt}`.trim();

    if (!prompt) {
        return api.sendMessage("📌 اكتب سؤالك يلا!", threadID, messageID);
    }

    api.sendTypingIndicator(threadID);

    const API_URL = "https://api.binjie.fun/api/generateStream?refer__1360=n4jxRDcDy13ewqxBqDwn2DnBDBADuDr121oD";
    const userId = "#/chat/17" + Date.now().toString().slice(-10);

    const payload = {
        prompt: prompt,
        userId: userId,
        network: true,
        system: "رد بالعربية الفصحى دائمًا، ولا تستخدم أي لغة أخرى.",
        withoutContext: true,
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

        return api.sendMessage(`➪ 𝐍𝐢𝐫𝐨 🪽\n━━━━━━━━━━━━━━\n${answer.trim()}\n━━━━━━━━━━━━━━\n✨ اتمنى يفيدك هذا الجواب`, threadID, messageID);

    } catch (error) {
        console.error("لونا Error:", error.response?.status || error.message);
        return api.sendMessage("❌ الـ API وقف، جرب بعد شوية أو قول 'حدثني' للتحديث.", threadID, messageID);
    }
};