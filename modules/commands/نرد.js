const fs = require("fs");
const path = require("path");

// ملف لتخزين بيانات اللاعبين
const dataFile = path.join(__dirname, "players.json");

function loadPlayers() {
  if (fs.existsSync(dataFile)) return JSON.parse(fs.readFileSync(dataFile, "utf8"));
  return {};
}

function savePlayers(players) {
  fs.writeFileSync(dataFile, JSON.stringify(players, null, 2));
}

module.exports.config = {
  name: "نرد",
  version: "1.0.5",
  hasPermssion: 0,
  credits: "مصطفى & ChatGPT",
  description: "لعبة نرد مع رصيد وانتصارات",
  commandCategory: "العاب",
  usages: ".نرد | .رصيدي | .انضمام <مبلغ> | .بوت انضمام <مبلغ>",
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

  const cmd = commandName.toLowerCase();
  const sub = args[0] ? args[0].toLowerCase() : "";

  // ------------------ الأوامر ------------------

  // .نرد → عرض التعليمات
  if (cmd === "نرد") {
    return api.sendMessage(
      `🎲 مرحبًا بك في لعبة النرد!
💰 كل لاعب يبدأ برصيد 1000$.
📝 أوامر اللعبة:
- .رصيدي → لعرض رصيدك وانتصاراتك
- .انضمام <المبلغ> → للعب جماعي (قريبًا)
- .بوت انضمام <المبلغ> → للعب ضد البوت
⭐ التصنيفات: 0 انتصارات = ضيف، 1-4 = مبتدئ، 5-9 = قوي، 10+ = محترف`,
      event.threadID
    );
  }

  // .رصيدي → عرض رصيد اللاعب
  if (cmd === "نرد" && sub === "رصيدي") {
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

  // .انضمام → رسالة مؤقتة للعب الجماعي
  if (cmd === "نرد" && sub === "انضمام") {
    return api.sendMessage(
      "👥 طور الانضمام الجماعي سيتم تفعيله قريبًا.\nجرب اللعب ضد البوت: .بوت انضمام 100",
      event.threadID
    );
  }

  // .بوت انضمام <مبلغ> → اللعب ضد البوت
  if (cmd === "نرد" && sub === "بوت") {
    if (args[1] !== "انضمام") return api.sendMessage("❌ استخدم: .بوت انضمام <مبلغ>", event.threadID);

    const bet = parseInt(args[2]) || 100;
    if (bet <= 0) return api.sendMessage("⚠️ المبلغ غير صحيح.", event.threadID);
    if (players[userID].balance < bet) return api.sendMessage("❌ رصيدك لا يكفي.", event.threadID);

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

  // أمر غير معروف
  return api.sendMessage("❌ هذا أمر غير موجود", event.threadID);
};