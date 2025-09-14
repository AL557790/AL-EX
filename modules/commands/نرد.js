const fs = require("fs");
const path = require("path");

module.exports.config = {
    name: "نرد",
    version: "1.1.0",
    hasPermssion: 0,
    credits: "Mod by You",
    description: "لعبة نرد احترافية مع مراهنة وتصنيف اللاعبين",
    commandCategory: "ألعاب",
    usages: ".نرد | .انضمام <مبلغ> | .بوت انضمام <مبلغ> | .رصيدي",
    cooldowns: 5
};

const prefix = ".";
const dataFile = path.join(__dirname, "players.json");
let players = {};

// إنشاء ملف البيانات إذا لم يكن موجود
if (fs.existsSync(dataFile)) {
    players = JSON.parse(fs.readFileSync(dataFile, "utf8"));
} else {
    fs.writeFileSync(dataFile, JSON.stringify(players, null, 2));
}

// اللعبة الحالية
let currentGame = { active: false, members: [], maxPlayers: 3, againstBot: false };

// ======= RUN COMMAND =======
module.exports.run = async ({ api, event }) => {
    const userID = event.senderID;
    const name = event.senderName;
    const body = event.body.trim();

    // تعريف اللعبة
    if (body === `${prefix}نرد`) {
        return api.sendMessage(
`🎲 مرحبًا بك في لعبة النرد الاحترافية!

💰 كل لاعب يحصل على 1000 دولار عند الانضمام لأول مرة.

👥 الحد الأقصى لكل لعبة: 3 لاعبين أو لاعب ضد البوت.

📝 أوامر اللعبة:
- الانضمام: ".انضمام <المبلغ>"
- اللعب ضد البوت: ".بوت انضمام <المبلغ>"
- عرض الرصيد: ".رصيدي"

⭐ التصنيفات:
- 10+ انتصارات: محترف
- 5-9 انتصارات: قوي
- 1-4 انتصارات: مبتدئ
- 0 انتصارات: ضيف

📌 كل شيء يتم حفظه في ملف players.json.
استمتع باللعبة ونافس أصدقائك أو البوت! 🎲`, event.threadID
        );
    }

    // إنشاء حساب افتراضي
    if (!players[userID]) {
        players[userID] = { id: userID, name, balance: 1000, wins: 0, losses: 0, moneyWon: 0, moneyLost: 0 };
    }

    // الانضمام للعبة
    if (body.startsWith(`${prefix}انضمام`)) {
        const args = body.slice(prefix.length).trim().split(/\s+/);
        const bet = parseInt(args[1]);
        if (!bet || isNaN(bet)) return api.sendMessage("⚠️ حدد مبلغ الرهان!", event.threadID);
        if (bet > players[userID].balance) return api.sendMessage(`⚠️ رصيدك غير كافي! رصيدك: ${players[userID].balance}`, event.threadID);

        if (!currentGame.active) {
            currentGame = { active: true, members: [], maxPlayers: 3, againstBot: false };
            api.sendMessage("🎲 تم بدء لعبة جديدة! حتى 3 لاعبين يمكنهم الانضمام.", event.threadID);
        }

        if (currentGame.members.find(p => p.id === userID)) return api.sendMessage("⚠️ لقد انضممت بالفعل.", event.threadID);

        currentGame.members.push({ id: userID, name, bet, roll: 0 });
        api.sendMessage(`✅ ${name} انضم للعبة بمراهنة ${bet} دولار.`, event.threadID);

        const memberNames = currentGame.members.map(p => p.name).join(", ");
        api.sendMessage(`👥 اللاعبون الحاليون: ${memberNames}`, event.threadID);

        if (currentGame.members.length === currentGame.maxPlayers) runGame(api);
        return;
    }

    // اللعب ضد البوت
    if (body.startsWith(`${prefix}بوت انضمام`)) {
        const args = body.slice(prefix.length).trim().split(/\s+/);
        const bet = parseInt(args[2]) || 100;
        if (bet > players[userID].balance) return api.sendMessage(`⚠️ رصيدك غير كافي! رصيدك: ${players[userID].balance}`, event.threadID);
        if (currentGame.active) return api.sendMessage("⚠️ هناك لعبة جارية.", event.threadID);

        currentGame = { active: true, members: [{ id: userID, name, bet, roll: 0 }], maxPlayers: 1, againstBot: true, botBet: bet };
        api.sendMessage(`🎲 ${name} بدأ لعبة ضد البوت بمراهنة ${bet} دولار!`, event.threadID);

        setTimeout(() => runGame(api, true), 1000);
        return;
    }

    // عرض الرصيد
    if (body === `${prefix}رصيدي`) {
        const player = players[userID];
        if (!player) return api.sendMessage("⚠️ لم يتم العثور على بياناتك.", event.threadID);

        let rank = "ضيف";
        if (player.wins >= 10) rank = "محترف";
        else if (player.wins >= 5) rank = "قوي";
        else if (player.wins >= 1) rank = "مبتدئ";

        return api.sendMessage(
`💰 اسم اللاعب: ${player.name}
🏆 انتصارات: ${player.wins}
❌ خسائر: ${player.losses}
💵 رصيد: ${player.balance}
💸 الأموال المكتسبة: ${player.moneyWon}
💸 الأموال المفقودة: ${player.moneyLost}
⭐ تصنيف: ${rank}`, event.threadID
        );
    }
};

// ======= GAME LOGIC =======
function runGame(api, againstBot = false) {
    let resultMsg = "🎲 نتائج لعبة النرد:\n\n";

    currentGame.members.forEach(p => p.roll = Math.floor(Math.random() * 6) + 1);

    if (againstBot) {
        const player = currentGame.members[0];
        const botRoll = Math.floor(Math.random() * 6) + 1;
        resultMsg += `${player.name} رمى: ${player.roll}\n🤖 البوت رمى: ${botRoll}\n`;

        if (player.roll > botRoll) {
            player.wins++; player.moneyWon += currentGame.botBet; player.balance += currentGame.botBet;
            players[player.id].wins++; players[player.id].moneyWon += currentGame.botBet; players[player.id].balance += currentGame.botBet;
            resultMsg += `🏆 الفائز: ${player.name}`;
        } else if (player.roll < botRoll) {
            player.losses++; player.moneyLost += currentGame.botBet; player.balance -= currentGame.botBet;
            players[player.id].losses++; players[player.id].moneyLost += currentGame.botBet; players[player.id].balance -= currentGame.botBet;
            resultMsg += `🏆 الفائز: البوت`;
        } else resultMsg += `⚖️ تعادل!`;

        api.sendMessage(resultMsg, player.id);
    } else {
        let highestRoll = 0;
        let winner = null;
        currentGame.members.forEach(p => {
            resultMsg += `${p.name} رمى: ${p.roll}\n`;
            if (p.roll > highestRoll) winner = p, highestRoll = p.roll;
            else if (p.roll === highestRoll) winner = null;
        });

        if (winner) {
            currentGame.members.forEach(p => {
                const player = players[p.id];
                if (p.id === winner.id) {
                    player.balance += player.bet; player.wins++; player.moneyWon += player.bet;
                } else {
                    player.balance -= player.bet; player.losses++; player.moneyLost += player.bet;
                }
            });
            resultMsg += `\n🏆 الفائز: ${winner.name}`;
        } else resultMsg += `\n⚖️ تعادل!`;

        currentGame.members.forEach(p => {
            const player = players[p.id];
            api.sendMessage(resultMsg + `\nرصيدك الحالي: ${player.balance}`, p.id);
        });
    }

    fs.writeFileSync(dataFile, JSON.stringify(players, null, 2));
    currentGame = { active: false, members: [], maxPlayers: 3, againstBot: false };
}