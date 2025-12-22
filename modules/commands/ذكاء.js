const axios = require('axios');

module.exports.config = {
    name: "نيرو",
    version: "2025.11.27-NERO-AUTO-QUESTION-ONLY",
    hasPermission: 0,
    credits: "Ayoub + 𝐘-𝐀𝐍𝐁𝐔",
    description: "نيرو – يرد تلقائي على السؤال أو الرد فقط",
    commandCategory: "خدمات",
    cooldowns: 0
};

module.exports.handleEvent = async function({ api, event }) {
    const { threadID, messageID, body, messageReply, senderID } = event;

    if (!body) return;
    if (senderID === api.getCurrentUserID()) return; // تجاهل رسائل البوت نفسه

    const text = body.trim();

    // ✅ شرط 1: الرسالة تنتهي بـ ؟ أو ? مع أو بدون فراغ
    const isQuestion = /[؟?]\s*$/.test(text);

    // ✅ شرط 2: رد على رسالة البوت
    const isReplyToBot =
        messageReply &&
        messageReply.senderID === api.getCurrentUserID();

    // ❌ إذا لا سؤال ولا رد → تجاهل الرسالة
    if (!isQuestion && !isReplyToBot) return;

    // 🧠 تجهيز النص للرد
    let prompt = text;
    if (isReplyToBot && messageReply?.body) {
        prompt = `${messageReply.body}\n${text}`.trim();
    }

    api.sendTypingIndicator(threadID);

    const API_URL =
        "https://api.binjie.fun/api/generateStream?refer__1360=n4jxRDcDy13ewqxBqDwn2DnBDBADuDr121oD";
    const userId = "#/chat/17" + Date.now().toString().slice(-10);

    const payload = {
        prompt: prompt,
        userId: userId,
        network: true,
        system:
            "أنت مساعد ذكي، واصل الحوار بشكل طبيعي وواضح وبالعربية فقط.",
        withoutContext: false,
        stream: false
    };

    try {
        const response = await axios.post(
            API_URL,
            payload,
            { headers: { "Content-Type": "application/json" }, timeout: 35000 }
        );

        let answer =
            response.data?.text ||
            response.data?.choices?.[0]?.message?.content ||
            "لم أفهم، هل توضح أكثر؟";

        return api.sendMessage(
            `➪ 🪽\n━━━━━━━━━━━━━━\n${answer.trim()}`,
            threadID,
            messageID
        );

    } catch (error) {
        console.error("ERROR:", error.message);
        return api.sendMessage(
            "❌ حدث خطأ مؤقت، حاول بعد قليل.",
            threadID,
            messageID
        );
    }
};