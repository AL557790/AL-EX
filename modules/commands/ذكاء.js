const axios = require('axios');

module.exports.config = {
    name: "ذكاء",
    version: "5.0.0",
    hasPermssion: 0,
    credits: "𝐘-𝐀𝐍𝐁𝐔 + Update 2025",
    description: "tasty",
    commandCategory: "الذكاء الاصطناعي",
    usages: "[سؤالك]",
    cooldowns: 3
};

async function neroAI(prompt) {
    const url = "https://api.binjie.fun/api/generateStream?refer__1360=eqjhY5lKBIC7DsD7GwPxiuDQwW400Q2fbd";

    const data = {
        prompt: prompt,
        userId: "#/chat/1735674979151",
        network: true,
        system: "",
        withoutContext: false,
        stream: true   // مهم تكون true عشان يشتغل
    };

    const headers = {
        "Content-Type": "application/json",
        "Accept": "application/json, text/plain, */*",
        "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Mobile Safari/537.36",
        "Origin": "https://cht18.aichatosclx.com",
        "Referer": "https://cht18.aichatosclx.com/",
        "Accept-Encoding": "gzip, deflate, br",
        "Accept-Language": "ar-DZ,ar;q=0.9,en-US;q=0.8,en;q=0.7",
        "Sec-Ch-Ua": `"Not/A)Brand";v="8", "Chromium";v="132"`,
        "Sec-Ch-Ua-Mobile": "?1",
        "Sec-Ch-Ua-Platform": `"Android"`,
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "cross-site"
    };

    try {
        const response = await axios({
            method: 'POST',
            url: url,
            data: data,
            headers: headers,
            responseType: 'stream'  // مهم جدًا عشان الـ stream
        });

        return response.data;
    } catch (error) {
        throw new Error("فشل الاتصال بـ Bing AI، جاري المحاولة...");
    }
}

module.exports.run = async function ({ api, event, args }) {
    const { threadID, messageID } = event;
    const question = args.join(" ").trim();

    if (!question) {
        return api.sendMessage("⚠️ اكتب سؤالك بعد الأمر!\nمثال: نيرو من هو أقوى لاعب في العالم؟", threadID, messageID);
    }

    api.sendMessage("🟡 نيرو يفكر... انتظر قليلاً", threadID, messageID);

    try {
        const stream = await neroAI(question);
        let reply = "";

        stream.on('data', (chunk) => {
            const lines = chunk.toString().split('\n');
            for (let line of lines) {
                if (line.startsWith('data: ')) {
                    try {
                        const jsonData = JSON.parse(line.slice(6));
                        if (jsonData.text) {
                            reply += jsonData.text;
                        }
                    } catch (e) {}
                }
            }
        });

        stream.on('end', () => {
            if (reply.trim() === "") reply = "ما فهمت عليك، كرر السؤال بطريقة أوضح.";
            api.sendMessage(reply.trim(), threadID, messageID);
        });

    } catch (err) {
        api.sendMessage("❌ حدث خطأ في الاتصال بـ Bing AI\nحاول مرة أخرى بعد قليل.", threadID, messageID);
    }
};