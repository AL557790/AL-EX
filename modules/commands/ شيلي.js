const axios = require('axios');

module.exports.config = {
    name: "شيلي",
    version: "2025.11.27-NERO-AHMAED",
    hasPermission: 0,
    credits: "Ayoub + 𝐘-𝐀𝐍𝐁𝐔 + ahmaedinfo",
    description: "AI - نيرو",
    commandCategory: "خدمات",
    usages: "[سؤالك]",
    cooldowns: 3
};

module.exports.run = async function({ api, event, args }) {
    const { threadID, messageID, messageReply } = event;

    let prompt = args.join(" ").trim();
    if (messageReply) prompt = `${messageReply.body} ${prompt}`.trim();

    if (!prompt) {
        return api.sendMessage("📌 اكتب سؤالك يلا!", threadID, messageID);
    }

    api.sendTypingIndicator(threadID);

    try {
        const url = "https://ahmaedinfo.serv00.net/api/api.php";

        const response = await axios.get(url, {
            params: {
                message: prompt,
                api_key: "ahmaedinfo"
            },
            timeout: 30000
        });

        let answer = "";

        if (response.data?.reply) {
            answer = response.data.reply;
        } else if (typeof response.data === "string") {
            answer = response.data;
        } else {
            answer = JSON.stringify(response.data);
        }

        return api.sendMessage(
            `➪ 𝐍𝐢𝐫𝐨 🪽\n━━━━━━━━━━━━━━\n${answer}\n━━━━━━━━━━━━━━\n✨ اتمنى يفيدك هذا الجواب`,
            threadID,
            messageID
        );

    } catch (error) {
        console.error("NERO API Error:", error.message);
        return api.sendMessage("❌ حدث خطأ في الـ API، حاول لاحقًا.", threadID, messageID);
    }
};