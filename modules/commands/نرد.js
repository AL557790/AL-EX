const fs = require("fs");
const path = require("path");

module.exports.config = {
    name: "نرد",
    version: "1.1.0",
    hasPermssion: 0,
    credits: "Mod by You",
    description: "لعبة نرد احترافية مع مراهنة وتصنيف اللاعبين",
    commandCategory: "ألعاب",
    usages: ".نرد | .انضمام <المبلغ> | .بوت انضمام <المبلغ> | .رصيدي",
    cooldowns: 5
};

// ملف حفظ بيانات اللاعبين
const dataFile = path.join(__dirname, "players.json");
let players = {};

// تحميل البيانات عند بدء التشغيل
try {
    if (fs.existsSync(dataFile)) {
        players = JSON.parse(fs.readFileSync(dataFile, "utf8"));
    }
} catch (error) {
    console.error("خطأ في تحميل بيانات اللاعبين:", error);
}

// اللعبة الحالية
let currentGame = { active: false, members: [], maxPlayers: 3, againstBot: false };

module.exports.run = async function({ api, event, args }) {
    const userID = event.senderID;
    const name = event.senderName;
    const body = event.body.trim().toLowerCase();
    const command = body.split(" ")[0];

    // تعريف اللعبة
    if (command === ".نرد") {
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
استمتع باللعبة ونافس أصدقائك أو البوت! 🎲`, event.threadID, event.messageID
        );
    }

    // إنشاء حساب افتراضي
    if (!players[userID]) {
        players[userID] = {
            id: userID,
            name,
            balance: 1000,
            wins: 0,
            losses: 0,
            moneyWon: 0,
            moneyLost: 0
        };
        savePlayersData();
    }

    // الانضمام للعبة
    if (command === ".انضمام") {
        const bet = parseInt(body.split(" ")[1]);
        if (!bet || isNaN(bet) || bet <= 0) return api.sendMessage("⚠️ يرجى تحديد مبلغ الرهان صحيح!", event.threadID, event.messageID);
        if (bet > players[userID].balance) return api.sendMessage(`⚠️ رصيدك غير كافي! رصيدك الحالي: ${players[userID].balance}`, event.threadID, event.messageID);

        if (!currentGame.active) {
            currentGame = { active: true, members: [], maxPlayers: 3, againstBot: false };
        }

        if (currentGame.members.find(p => p.id === userID)) return api.sendMessage("⚠️ لقد انضممت بالفعل للعبة.", event.threadID, event.messageID);

        currentGame.members.push({ id: userID, name, bet, roll: 0 });
        api.sendMessage(`✅ ${name} انضم للعبة بمراهنة ${bet} دولار.`, event.threadID, event.messageID);

        // عرض اللاعبين الحاليين
        const memberNames = currentGame.members.map(p => p.name).join(", ");
        api.sendMessage(`👥 اللاعبون الحاليون: ${memberNames}`, event.threadID, event.messageID);

        if (currentGame.members.length === currentGame.maxPlayers) {
            runGame(api, event);
        }
        return;
    }

    // اللعب ضد البوت
    if (body.startsWith(".بوت انضمام")) {
        const bet = parseInt(body.split(" ")[2]) || 100;

        if (bet > players[userID].balance) return api.sendMessage(`⚠️ رصيدك غير كافي! رصيدك: ${players[userID].balance}`, event.threadID, event.messageID);
        if (currentGame.active) return api.sendMessage("⚠️ هناك لعبة جارية حاليًا.", event.threadID, event.messageID);

        currentGame = { 
            active: true, 
            members: [{ id: userID, name, bet, roll: 0 }], 
            maxPlayers: 1, 
            againstBot: true, 
            botBet: bet 
        };
        
        api.sendMessage(`🎲 ${name} بدأ لعبة ضد البوت بمراهنة ${bet} دولار!`, event.threadID, event.messageID);
        setTimeout(() => runGame(api, event, true), 2000);
        return;
    }

    // عرض الرصيد
    if (command === ".رصيدي") {
        const player = players[userID];
        if (!player) return api.sendMessage("⚠️ لم يتم العثور على بياناتك.", event.threadID, event.messageID);

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
⭐ تصنيف: ${rank}`, event.threadID, event.messageID
        );
    }

    // أمر غير معروف
    if (body.startsWith(".")) {
        api.sendMessage("❌ الأمر غير معروف. اكتب '.نرد' لرؤية الأوامر المتاحة", event.threadID, event.messageID);
    }
};

// تشغيل اللعبة
function runGame(api, event, againstBot = false) {
    let resultMsg = "🎲 نتائج لعبة النرد:\n\n";

    currentGame.members.forEach(p => p.roll = Math.floor(Math.random() * 6) + 1);

    if (againstBot) {
        const player = currentGame.members[0];
        const botRoll = Math.floor(Math.random() * 6) + 1;
        resultMsg += `${player.name} رمى: ${player.roll}\n🤖 البوت رمى: ${botRoll}\n\n`;

        if (player.roll > botRoll) {
            players[player.id].wins++; 
            players[player.id].balance += currentGame.botBet; 
            players[player.id].moneyWon += currentGame.botBet;
            resultMsg += `🏆 الفائز: ${player.name} - ربح ${currentGame.botBet} دولار`;
        } else if (player.roll < botRoll) {
            players[player.id].losses++; 
            players[player.id].balance -= currentGame.botBet; 
            players[player.id].moneyLost += currentGame.botBet;
            resultMsg += `🏆 الفائز: البوت - خسرت ${currentGame.botBet} دولار`;
        } else {
            resultMsg += "⚖️ تعادل! لا رابح ولا خاسر";
        }

        api.sendMessage(resultMsg, event.threadID, event.messageID);
    } else {
        // ضد لاعبين حقيقيين
        let highestRoll = 0;
        let winners = [];
        
        currentGame.members.forEach(p => {
            resultMsg += `${p.name} رمى: ${p.roll}\n`;
            if (p.roll > highestRoll) {
                highestRoll = p.roll;
                winners = [p];
            } else if (p.roll === highestRoll) {
                winners.push(p);
            }
        });

        resultMsg += "\n";

        if (winners.length === 1) {
            const winner = winners[0];
            const totalPot = currentGame.members.reduce((sum, p) => sum + p.bet, 0);
            
            currentGame.members.forEach(p => {
                if (p.id === winner.id) {
                    players[p.id].balance += totalPot; 
                    players[p.id].wins++; 
                    players[p.id].moneyWon += totalPot;
                } else {
                    players[p.id].balance -= p.bet; 
                    players[p.id].losses++; 
                    players[p.id].moneyLost += p.bet;
                }
            });
            
            resultMsg += `🏆 الفائز: ${winner.name} - ربح ${totalPot} دولار`;
        } else {
            resultMsg += `⚖️ تعادل بين: ${winners.map(w => w.name).join(", ")}!`;
        }

        api.sendMessage(resultMsg, event.threadID, event.messageID);
    }

    savePlayersData();
    currentGame = { active: false, members: [], maxPlayers: 3, againstBot: false };
}

// حفظ بيانات اللاعبين
function savePlayersData() {
    try {
        fs.writeFileSync(dataFile, JSON.stringify(players, null, 2));
    } catch (error) {
        console.error("خطأ في حفظ بيانات اللاعبين:", error);
    }
}