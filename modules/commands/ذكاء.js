const axios = require('axios');

module.exports.config = {
    name: "auto_gpt",
    version: "1.0.4",
    hasPermission: 0,
    credits: "🥷🏻",
    description: "[؟]",
    commandCategory: "AI",
    cooldowns: 3
};

module.exports.handleEvent = async function ({ api, event }) {
    const { threadID, messageID, body, messageReply } = event;
    
    if (!body) return;

    let userQuery = body.trim();

    if (messageReply && messageReply.senderID === api.getCurrentUserID()) {
        // Direct reply to bot message
    } else if (!/^[\p{L}\p{N}\s]+؟$/u.test(userQuery)) {
        return;
    }

    const API_URL = "https://api.binjie.fun/api/generateStream?refer__1360=n4jxRDcDy13ewqxBqDwn2DnBDBADuDr121oD";

    const userId = "#/chat/17" + Date.now().toString().slice(-10);

    const payload = {
        prompt: userQuery,
        userId: userId,
        network: true,
        system: "رد بالعربية الفصحى دائمًا، ولا تستخدم أي لغة أخرى أو فارسي أبدًا. كن ودودًا ومفيدًا.",
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

        answer = answer.trim();

        if (answer) {
            return api.sendMessage(`🥷🏻 𝗚𝗣𝗧-𝟰 Ⓝⓔⓡⓞ 🗨️\n\n${answer}\n\nاتـمـنـى ان يـفـيـدك هـذا الـجـواب ✨`, threadID, messageID);
        } else {
            return api.sendMessage("⚠️ لم يتم العثور على إجابة واضحة.", threadID, messageID);
        }

    } catch (error) {
        console.error("Nero API Error:", error.response?.status || error.message);
        return api.sendMessage("❌ حدث خطأ أثناء الاتصال بالـ AI. جرب مرة أخرى لاحقًا.", threadID, messageID);
    }
};

module.exports.run = function () {
    return;
};