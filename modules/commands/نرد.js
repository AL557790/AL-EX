const fs = require("fs");
const path = require("path");

// ملف لتخزين بيانات اللاعبين
const dataFile = path.join(__dirname, "players.json");
function loadPlayers() {
  if (fs.existsSync(dataFile)) {
    return JSON.parse(fs.readFileSync(dataFile, "utf8"));
  }
  return {};
}
function savePlayers(players) {
  fs.writeFileSync(dataFile, JSON.stringify(players, null, 2));
}

module.exports.config = {
  name: "نرد",
  aliases: ["انضمام", "رصيدي", "بوت"], // 🟢 يدعم أوامر متعددة
  version: "1.0.2",
  hasPermssion: 0,
  credits: "مصطفى & ChatGPT",
  description: "لعبة نرد مع رصيد وانتصارات",
  commandCategory: "العاب",
  usages: ".نرد | .انضمام <مبلغ> | .رصيدي | .بوت انضمام <مبلغ>",
  cooldowns: 2
};

module.exports.run = async function({ api, event, args, commandName }) {
  let players = loadPlayers();
  const userID = event.senderID;
  const name = global.data.userName.get(userID) || "لاعب";

  // إنشاء حساب جديد إذا غير موجود
  if (!players[userID]) {
    players[userID] = { balance: 1000, wins: 0, losses: 0 };
    savePlayers(players);
  }

  // 🔹 لو كتب ".نرد" فقط → عرض التعليمات
  if (commandName === "نرد") {
    return api.sendMessage(
      `🎲 مرحبًا بك في لعبة النرد!

💰 كل لاعب يبدأ برصيد 1000$.

📝 أوامر اللعبة:
- .انضمام <المبلغ> → للعب مع آخرين (قريبًا).
- .رصيدي → لعرض رصيدك وانتصاراتك.
- .بوت انضمام <المبلغ> → للعب ضد البوت.

⭐ التصنيفات:
- 10+ انتصارات: محترف
- 5-9 انتصارات: قوي
- 1-4 انتصارات: مبتدئ
- 0 انتصارات: ضيف

📌 كل شيء يتم حفظه في players.json.`,
      event.threadID
    );
  }

  // 🔹 لو كتب ".رصيدي"
  if (commandName === "رصيدي") {
    const player = players[userID];
    let rank = "ضيف";
    if (player.wins >= 10) rank = "محترف";
    else if (player.wins >= 5) rank = "قوي";
    else if (player.wins >= 1) rank = "مبتدئ";

    return api.sendMessage(
      `💰 ${name}
🏆 انتصارات: ${player.wins}
❌ خسائر: ${player.losses}
💵 رصيدك: ${player.balance}$
⭐ تصنيفك: ${rank}`,
      event.threadID
    );
  }

  // 🔹 لو كتب ".انضمام" (لعبة جماعية مستقبلًا)
  if (commandName === "انضمام") {
    return api.sendMessage(
      "👥 طور الانضمام الجماعي سيتم تفعيله قريبًا.\nحالياً جرب اللعب ضد البوت: .بوت انضمام 100",
      event.threadID
    );
  }

  // 🔹 لو كتب ".بوت انضمام <مبلغ>"
  if (commandName === "بوت") {
    if (args[0] !== "انضمام") {
      return api.sendMessage("❌ استخدم: .بوت انضمام <مبلغ>", event.threadID);
    }

    const bet = parseInt(args[1]) || 100;
    if (bet <= 0) return api.sendMessage("⚠️ المبلغ غير صحيح.", event.threadID);
    if (players[userID].balance < bet) {
      return api.sendMessage("❌ رصيدك لا يكفي.", event.threadID);
    }

    const userRoll = Math.floor(Math.random() * 6) + 1;
    const botRoll = Math.floor(Math.random() * 6) + 1;

    let result = `🎲 ${name} رمى: ${userRoll}\n🤖 البوت رمى: ${botRoll}\n`;

    if (userRoll > botRoll) {
      players[userID].balance += bet;
      players[userID].wins++;
      result += `🎉 فزت وربحت ${bet}$!`;
    } else if (userRoll < botRoll) {
      players[userID].balance -= bet;
      players[userID].losses++;
      result += `😢 خسرت ${bet}$.`;
    } else {
      result += "🤝 تعادل! لا ربح ولا خسارة.";
    }

    savePlayers(players);
    return api.sendMessage(result, event.threadID);
  }
};