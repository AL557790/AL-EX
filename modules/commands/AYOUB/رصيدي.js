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
  name: "رصيدي",
  description: "عرض رصيد اللاعب",
  commandCategory: "العاب",
  usages: ".رصيدي",
  cooldowns: 2
};

module.exports.run = async function({ api, event, global }) {
  const players = loadPlayers();
  const userID = event.senderID;

  // إذا اللاعب جديد، أعطه 1000$
  if (!players[userID]) players[userID] = { balance: 1000, wins: 0, losses: 0 };
  const player = players[userID];
  savePlayers(players);

  const name = global.data.userName.get(userID) || "لاعب";

  let rank = "ضيف";
  if (player.wins >= 10) rank = "محترف";
  else if (player.wins >= 5) rank = "قوي";
  else if (player.wins >= 1) rank = "مبتدئ";

  api.sendMessage(
    `💰 ${name}\n🏆 انتصارات: ${player.wins}\n❌ خسائر: ${player.losses}\n💵 رصيدك: ${player.balance}$\n⭐ تصنيفك: ${rank}`,
    event.threadID
  );
};