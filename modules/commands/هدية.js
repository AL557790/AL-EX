const fs = require("fs");
const path = require("path");

const dbPath = path.join(__dirname, "includes", "balances.json");

function loadBalances() {
  if (!fs.existsSync(dbPath)) fs.writeFileSync(dbPath, JSON.stringify({}));
  return JSON.parse(fs.readFileSync(dbPath, "utf-8"));
}

module.exports.config = {
  name: "رصيدي",
  version: "1.3.0",
  hasPermssion: 0,
  credits: "عمر",
  description: "يعرض لك رصيدك الحالي بشكل جميل",
  commandCategory: "الاموال",
  usages: "",
  cooldowns: 5
};

module.exports.run = async function ({ api, event }) {
  const balances = loadBalances();
  const userID = event.senderID;

  const userInfo = await api.getUserInfo(userID);
  const name = userInfo[userID].name || "لاعب";

  if (!balances[userID]) {
    return api.sendMessage(`⚠️ ${name}, لم يتم تسجيل أي رصيد لك بعد.`, event.threadID, event.messageID);
  }

  const money = balances[userID];

  const msg = `
╔═══════════════╗
║ 💳 بطاقة رصيد 💳
║
║ 👤 الاسم: ${name}
║ 💰 الرصيد: ${money} دولار
║
║ 📌 ملاحظة: الرصيد يظهر فقط إذا لعبت ألعابنا
╚═══════════════╝
`;

  return api.sendMessage(msg, event.threadID, event.messageID);
};