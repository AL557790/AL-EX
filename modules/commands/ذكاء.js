const axios = require('axios');

module.exports.config = {
    name: "مريم",
    version: "2025.11.26-FINAL",
    hasPermssion: 0,
    credits: "ChatGPT",
    description: "مريم - دردشة مستمرة بدون إعادة الاسم",
    commandCategory: "دردشة",
    usages: "[رسالتك]",
    cooldowns: 1
};

// تخزين آخر رسالة حتى يعرف يكمل المحادثة
let lastPrompt = {};

module.exports.run = async function({ api, event, args }) {
    let userID = event.senderID;
    let prompt = args.join(" ").trim();

    // لو مفيش نص → اعتبرها رد في المحادثة
    if (!prompt) prompt = "";

    // أول رسالة فقط لازم يكتب كلمة "مريم"
    if (!lastPrompt[userID]) {
        if (!prompt.includes("مريم")) {
            return api.sendMessage("اكتب: مريم كيف حالك؟", event.threadID, event.messageID);
        } else {
            prompt = prompt.replace("مريم", "").trim();
            if (prompt === "") prompt = "كيف حالك؟";
        }
    }

    // بعد أول رسالة → عادي مهما كتبت، يعتبره جزء من المحادثة
    lastPrompt[userID] = prompt;

    api.sendTypingIndicator(event.threadID);

    try {
        const payload = {
            prompt: prompt,
            system: "أنت مريم، فتاة لطيفة ترد بالعربية فقط. كوني طبيعية وتابعي المحادثة حسب كلام المستخدم.",
            withoutContext: false, // يسمح بالمتابعة
            stream: false
        };

        const response = await axios.post(
            "https://api.binjie.fun/api/generateStream?refer__1360=n4jxRDcDy13ewqxBqDwn2DnBDBADuDr121oD",
            payload,
            { headers: { "Content-Type": "application/json" }, timeout: 35000 }
        );

        let answer = response.data?.text || "ما فهمتش، قولها بوضوح ♥";

        return api.sendMessage(`مريم: ${answer}`, event.threadID, event.messageID);

    } catch (err) {
        console.error(err);
        return api.sendMessage("الـ API واقف شوية، جرب بعد شوية 🌸", event.threadID, event.messageID);
    }
};