const axios = require('axios');

module.exports.config = {
    name: "مريم",
    version: "2025.11.26-CONTEXT",
    hasPermssion: 0,
    credits: "𝐘-𝐀𝐍𝐁𝐔 + ChatGPT",
    description: "مريم - دردشة مستمرة بدون الحاجة لكتابة اسمها كل مرة",
    commandCategory: "دردشة",
    usages: "[رسالتك]",
    cooldowns: 1
};

// تخزين سياق كل مستخدم
const conversationHistory = {};

module.exports.run = async function({ api, event, args }) {
    let userID = event.senderID;
    let prompt = args.join(" ").trim();

    if (!prompt) return api.sendMessage("تكلم مع مريم 🌸", event.threadID, event.messageID);

    api.sendTypingIndicator(event.threadID);

    // أول رسالة لازم تذكر فيها اسم مريم
    if (!conversationHistory[userID]) {
        if (!prompt.includes("مريم")) {
            return api.sendMessage("أول رسالة لازم تبدأ بـ (مريم ...)", event.threadID, event.messageID);
        }
        prompt = prompt.replace("مريم", "").trim();
        conversationHistory[userID] = [];
    }

    // حفظ الرسالة في سياق الدردشة
    conversationHistory[userID].push({ role: "user", content: prompt });

    // تجهيز المحادثة لإرسالها لـ API
    const messages = [
        { role: "system", content: "أنت مريم، بنت لطيفة تتكلم بالعربية فقط، وترد بشكل طبيعي وفق سياق المحادثة." },
        ...conversationHistory[userID]
    ];

    try {
        const response = await axios.post(
            "https://api.binjie.fun/api/generateStream?refer__1360=n4jxRDcDy13ewqxBqDwn2DnBDBADuDr121oD",
            {
                messages: messages,
                stream: false
            },
            {
                headers: { "Content-Type": "application/json" },
                timeout: 35000
            }
        );

        let answer = response.data?.text || "ما فهمتش، عاود؟";

        // حفظ رد مريم في السياق
        conversationHistory[userID].push({ role: "assistant", content: answer });

        return api.sendMessage(`مريم: ${answer}`, event.threadID, event.messageID);

    } catch (err) {
        console.error(err);
        return api.sendMessage("الـ API واقف شوية، جرب بعد لحظات 🌸", event.threadID, event.messageID);
    }
};