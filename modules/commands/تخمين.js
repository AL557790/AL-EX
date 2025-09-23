module.exports.config = {
    name: "تخمين",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "ZINO",
    description: "لعبة تخمين الرقم",
    commandCategory: "〘 الالعاب 〙",
    usages: "[start/stop]",
    cooldowns: 5
};

const gameData = new Map();

module.exports.run = async function({ api, event, args }) {
    const { threadID, senderID } = event;
    
    if (!args[0] || args[0] === "مساعدة") {
        return api.sendMessage(
            "╭──────────────╮\n" +
            "│  🎮 لعبة تخمين الرقم  │\n" +
            "╰──────────────╯\n\n" +
            "📝 الأوامر:\n" +
            "• تخمين ابدأ - لبدء لعبة جديدة\n" +
            "• تخمين توقف - لإيقاف اللعبة الحالية\n\n" +
            "ℹ️ عليك تخمين رقم بين 1 و 100",
            threadID
        );
    }

    if (args[0] === "ابدأ") {
        if (gameData.has(threadID)) {
            return api.sendMessage("⚠️ هناك لعبة جارية بالفعل!", threadID);
        }

        const targetNumber = Math.floor(Math.random() * 100) + 1;
        gameData.set(threadID, {
            number: targetNumber,
            attempts: 0,
            maxAttempts: 10
        });

        return api.sendMessage(
            "🎮 لعبة تخمين الرقم بدأت!\n\n" +
            "💭 خمن رقماً بين 1 و 100\n" +
            "📍 لديك 10 محاولات\n" +
            "🎯 اكتب الرقم مباشرة للتخمين",
            threadID
        );
    }

    if (args[0] === "توقف") {
        if (!gameData.has(threadID)) {
            return api.sendMessage("❌ لا توجد لعبة جارية حالياً!", threadID);
        }
        const game = gameData.get(threadID);
        gameData.delete(threadID);
        return api.sendMessage(
            "🛑 تم إيقاف اللعبة!\n" +
            `🎯 الرقم الصحيح كان: ${game.number}`,
            threadID
        );
    }

    // Handle guesses
    if (gameData.has(threadID)) {
        const guess = parseInt(event.body);
        if (isNaN(guess)) return; // Not a number, ignore

        const game = gameData.get(threadID);
        game.attempts++;

        if (guess === game.number) {
            gameData.delete(threadID);
            return api.sendMessage(
                "🎉 مبروك! لقد فزت!\n" +
                `✨ الرقم الصحيح هو: ${game.number}\n` +
                `📝 عدد المحاولات: ${game.attempts}`,
                threadID
            );
        }

        if (game.attempts >= game.maxAttempts) {
            gameData.delete(threadID);
            return api.sendMessage(
                "💔 انتهت المحاولات!\n" +
                `🎯 الرقم الصحيح كان: ${game.number}`,
                threadID
            );
        }

        const hint = guess > game.number ? "أصغر" : "أكبر";
        return api.sendMessage(
            `❌ خطأ! جرب رقماً ${hint}\n` +
            `📍 المحاولات المتبقية: ${game.maxAttempts - game.attempts}`,
            threadID
        );
    }
};