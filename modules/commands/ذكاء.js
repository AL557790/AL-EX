const axios = require('axios');

module.exports.config = {
    name: "نيرو",
    version: "2025.2",
    hasPermssion: 0,
    credits: "Yanbu - Updated Nov 2025",
    description: "نيرو AI ",
    commandCategory: "ai",
    usages: "[سؤالك بالعربي أو الإنجليزي]",
    cooldowns: 3
};

module.exports.run = async function({ api, event, args }) {
    const { threadID, messageID } = event;
    const question = args.join(" ").trim();

    if (!question || question === "شو") {  // تجنب الأسئلة القصيرة جدًا
        return api.sendMessage("⚠️ اكتب سؤال أو نص واضح شوية يرجى! مثال: نيرو من هو أفضل لاعب كرة قدم في 2025؟", threadID, messageID);
    }

    api.sendMessage("🟡 نيرو يفكر في إجابتك... (ثواني بس)", threadID, messageID);

    try {
        const response = await axios.post(
            "https://api.binjie.fun/api/generateStream?refer__1360=7qXDQRYvnDBtmKNIeOXDGupD",
            {
                prompt: question,
                userId: "#/chat/1764298496",  // الـ userId الجديد
                network: true,
                system: "",
                withoutContext: false,
                stream: false  // false عشان رد كامل مرة واحدة
            },
            {
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json, text/plain, */*",
                    "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Mobile Safari/537.36",
                    "Origin": "https://cht18.aichatosclx.com",
                    "Referer": "https://cht18.aichatosclx.com/",
                    "Accept-Encoding": "gzip, deflate, br",
                    "Accept-Language": "ar-DZ,ar;q=0.9,en-US;q=0.8,en;q=0.7",
                    "Sec-Ch-Ua": '"Not/A)Brand";v="8", "Chromium";v="132"',
                    "Sec-Ch-Ua-Mobile": "?1",
                    "Sec-Ch-Ua-Platform": '"Android"',
                    "Sec-Fetch-Dest": "empty",
                    "Sec-Fetch-Mode": "cors",
                    "Sec-Fetch-Site": "cross-site"
                }
            }
        );

        // معالجة الـ response عشان نطلع الـ text بس (مش الـ JSON كله)
        let answer = "";
        if (response.data && response.data.text) {
            answer = response.data.text;
        } else if (response.data && typeof response.data === 'string') {
            // لو رجع string، ابحث عن الـ text داخلها
            const match = response.data.match(/"text":"([^"]+)"/);
            if (match) answer = match[1];
        } else {
            answer = "الرد غير واضح، جرب سؤال تاني.";
        }

        if (!answer || answer.trim() === "") {
            answer = "ما قدرت أفهم الرد، حاول سؤال أوضح شوية.";
        }

        api.sendMessage(`🤖 نيرو يقول: \n\n${answer}`, threadID, messageID);

    } catch (error) {
        console.error("Error details:", error.response?.data || error.message);
        api.sendMessage("❌ مشكلة في الاتصال بنيرو – ممكن الـ API مشغول أو حاول بعد دقيقة. (Error: " + (error.response?.status || error.message) + ")", threadID, messageID);
    }
};