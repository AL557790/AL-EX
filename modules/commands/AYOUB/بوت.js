const fs = require("fs");
const path = require("path");
const dataFile = path.join(__dirname, "players.json");

function loadPlayers() {
  if (fs.existsSync(dataFile)) return JSON.parse(fs.readFileSync(dataFile, "utf8"));
  return {};
}

function savePlayers(players) {
  fs.writeFileSync(dataFile, JSON.stringify(players, null, 2));
}

module.exports.config = {
  name: "بوت",
  description: "اللعب ضد البوت",
  commandCategory: "العاب",
  usages: ".بوت انضمام <مبلغ>",
  cooldowns: 2
};

module.exports.run = async function({ api, event, args, global }) {
  const players = loadPlayers();
  const userID = event.senderID;
  const name = global.data.userName.get(userID) || "لاعب";

  // إذا اللاعب جديد، أعطه 1000$
  if (!players[userID]) players[userID] = { balance: 1000, wins: 0, losses: 0 };

  if (args[0] !== "انضمام") return api.sendMessage("❌ استخدم: .بوت انضمام <مبلغ>", event.threadID);

  const bet = parseInt(args[1]) || 100;
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
  api.sendMessage(result, event.threadID);
};