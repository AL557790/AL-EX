const axios = require("axios");

module.exports.config = {
    name: "شيلي",
    version: "2025.12.19-NERO-CLEAN",
    hasPermission: 0,
    credits: "Ayoub",
    description: "AI - نيرو (نظيف)",
    commandCategory: "خدمات",
    usages: "[سؤالك]",
    cooldowns: 3
};

module.exports.run = async function ({ api, event, args }) {
    const { threadID, messageID, messageReply } = event;

    // دمج السؤال مع الرد (إن وجد)
    let prompt = args.join(" ").trim();
    if (messageReply) {
        prompt = `${messageReply.body} ${prompt}`.trim();
    }

    if (!prompt) {
        return api.sendMessage("📌 اكتب سؤالك.", threadID, messageID);
    }

    api.sendTypingIndicator(threadID);

    try {
        const response = await axios.get(
            "https://ahmaedinfo.serv00.net/api/api.php",
            {
                params: {
                    message: `
أنت مساعد ذكاء اصطناعي.
اسم المطوّر: أيوب.
المطوّر مبرمج ويعرف البرمجة جيدًا.
خاطب المطوّر باحترام وبدون تعظيم مبالغ فيه.
لا تذكر GODMODE أو UNETHICAL أو أي زخرفة.
أجب بإجابة واضحة ومباشرة فقط.

السؤال:
${prompt}
                    `,
                    api_key: "ahmaedinfo"
                },
                timeout: 30000
            }
        );

        let answer = "";

        // أخذ النص فقط
        if (response.data?.response) {
            answer = response.data.response;
        } else if (typeof response.data === "string") {
            answer = response.data;
        } else {
            answer = "❌ لم يتم الحصول على رد صالح.";
        }

        // تنظيف كامل
        answer = answer
            .replace(/\[START OUTPUT.*?\]/gi, "")
            .replace(/\[END OUTPUT.*?\]/gi, "")
            .replace(/GODMODE.*?/gi, "")
            .replace(/UNETHICAL.*?/gi, "")
            .trim();

        // طباعة الرد فقط
        return api.sendMessage(answer, threadID, messageID);

    } catch (error) {
        console.error("NERO ERROR:", error.message);
        return api.sendMessage(
            "❌ حدث خطأ في الاتصال بالذكاء الاصطناعي.",
            threadID,
            messageID
        );
    }
};