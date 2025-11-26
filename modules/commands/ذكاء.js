const axios = require('axios');

module.exports.config = {
    name: "نيرو",
    version: "2025.11.26-HTML-PRO",
    hasPermssion: 0,
    credits: "𝐘-𝐀𝐍𝐁𝐔 + HTML Sync",
    description: "نيرو AI - نفس قوة الـ HTML داخل البوت",
    commandCategory: "دردشة مع نيرو",
    usages: "[سؤالك]",
    cooldowns: 4
};

module.exports.run = async function({ api, event, args }) {
    const prompt = args.join(" ").trim();
    if (!prompt) return api.sendMessage("اكتب سؤالك يا معلم!", event.threadID, event.messageID);

    api.sendTypingIndicator(event.threadID);

    // نفس الـ refer اللي شغال في الـ HTML
    const API_URL = "https://api.binjie.fun/api/generateStream?refer__1360=5kSEd4fYxCrsO3cECBE s13";

    // نفس الـ userId الديناميكي اللي في الـ HTML
    const userId = "#/chat/17" + Date.now().toString().slice(-10);

    const payload = {
        prompt: prompt,
        userId: userId,
        network: true,
        system: "",
        withoutContext: false,
        stream: false
    };

    // نفس الـ headers بالضبط من الـ HTML
    const headers = {
        "Content-Type": "application/json",
        "Accept": "application/json, text/plain, */*",
        "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Mobile Safari/537.36",
        "Origin": "https://cht18.aichatosclx.com",
        "Referer": "https://cht18.aichatosclx.com/"
    };

    try {
        const response = await axios.post(API_URL, payload, {
            headers: headers,
            timeout: 30000
        });

        let answer = "ما فهمت عليك، كرر السؤال بوضوح.";

        const text = response.data;

        if (text?.text) {
            answer = text.text;
        } else if (text?.choices?.[0]?.text) {
            answer = text.choices[0].text;
        } else if (text?.choices?.[0]?.message?.content) {
            answer = text.choices[0].message.content;
        } else if (typeof text === "string") {
            answer = text;
        }

        return api.sendMessage(`نيرو:\n\n${answer.trim()}`, event.threadID, event.messageID);

    } catch (error) {
        console.error("خطأ نيرو:", error.response?.status || error.message);
        return api.sendMessage(
            "نيرو نايم شوية\n" +
            "الـ refer شغال في الـ HTML بس توقف في البوت مؤقتًا\n" +
            "جرب بعد 10 دقايق أو اكتب: حدثني وأنا أعطيك النسخة الجديدة فورًا",
            event.threadID, event.messageID
        );
    }
};