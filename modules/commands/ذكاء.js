const axios = require('axios');

module.exports.config = {
    name: "ذكاء",
    version: "4.3.7",
    hasPermssion: 0,
    credits: "𝐘-𝐀𝐍𝐁𝐔",
    description: "تكلم مع GPT | نيرو",
    commandCategory: "دردشة مع نيرو",
    usages: "[نص]",
    cooldowns: 5
};

async function sendRequest(prompt) {
    const data = {
        prompt: prompt,
        userId: "#/chat/1735674979151",
        network: true,
        system: "",
        withoutContext: false,
        stream: false
    };

    const headers = {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "User-Agent": "Mozilla/5.0 (Linux; Android 8.1.0; VOX Alpha Build/O11019) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/126.0.6478.123 Mobile Safari/537.36",
            "Origin": "https://cht18.aichatosclx.com",
            "X-Requested-With": "pure.lite.browser"
  };

    try {
        const response = await axios.post('https://api.binjie.fun/api/generateStream?refer__1360=n4jxnDBDciit0QNDQD%2FfG7Dyl7OplbgomSbD', data, { headers });
        return response.data;
    } catch (error) {
        console.error("Error:", error);
        throw new Error("حدث خطأ أثناء التواصل مع API.");
    }
}

module.exports.run = async ({ api, event, args }) => {
    const { threadID: tid, messageID: mid } = event;
    const promptText = args.join(" ");

    if (!promptText) {
        return api.sendMessage("اكتب السؤال أو النص الذي تريد إرساله إلى GPT-4.", tid, mid);
    }

    try {
        const response = await sendRequest(promptText);
        if (response.error) {
            return api.sendMessage(`خطأ: ${response.error}`, tid, mid);
        } else {
            return api.sendMessage(`رد GPT-4: ${response.data}`, tid, mid);
        }
    } catch (error) {
        return api.sendMessage(`خطأ: ${error.message}`, tid, mid);
    }
};