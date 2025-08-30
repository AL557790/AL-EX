const axios = require('axios');

module.exports.config = {
    name: "لونا",
    version: "2.3.4",
    hasPermission: 0,
    credits: "AYOUB",
    description: "إجابة على الأسئلة باستخدام ",
    commandCategory: "ذكاء اصطناعي",
    cooldowns: 1
};

module.exports.run = async function ({ api, event, args }) {
    const { threadID } = event;
    const userQuery = args.join(" ");

    if (!userQuery) {
        return api.sendMessage("❌ يرجى كتابة سؤال.", threadID);
    }

    const apiURL = `https://gpt-3-nf8n.onrender.com/chat?text=${encodeURIComponent(userQuery)}`;

    try {
        const response = await axios.get(apiURL);

        if (response.data) {
            const reply = response.data.reply || response.data;

            const formattedReply = `
┌───────────┐
│ 🤖 لونا AI │
└───────────┘

📌 | سؤالك:
「 ${userQuery} 」

💡 | إجابتي:
「 ${reply} 」

┌───────────┐
│ ✅ تمت الإجابة │
└───────────┘
`;

            return api.sendMessage(formattedReply, threadID);
        } else {
            return api.sendMessage("⚠️ لم يتم العثور على إجابة.", threadID);
        }
    } catch (error) {
        console.error("Error fetching data from API:", error);
        return api.sendMessage("❌ حدث خطأ أثناء جلب الرد. حاول مرة أخرى لاحقًا.", threadID);
    }
};