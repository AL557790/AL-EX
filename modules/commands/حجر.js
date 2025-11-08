const fs = require("fs");
const path = require("path");

const dbPath = path.join(__dirname, "includes", "balances.json");
const START_BALANCE = 1000;

// تحميل وحفظ الرصيد
function loadBalances() {
  if (!fs.existsSync(dbPath)) fs.writeFileSync(dbPath, JSON.stringify({}));
  return JSON.parse(fs.readFileSync(dbPath, "utf-8"));
}
function saveBalances(balances) {
  fs.writeFileSync(dbPath, JSON.stringify(balances, null, 2));
}

module.exports.config = {
  name: "عجلة",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "مصطفى",
  description: "لعبة عجلة الحظ للربح أو الخسارة",
  commandCategory: "games",
  usages: "[المبلغ]",
  cooldowns: 5,
};

module.exports.run = async function({ api, event, args }) {
  const amount = parseInt(args[0]);
  if (!amount || isNaN(amount) || amount <= 0) {
    return api.sendMessage("❌ استخدم: .عجلة 100", event.threadID, event.messageID);
  }

  const balances = loadBalances();
  const userID = event.senderID;

  if (!balances[userID]) return api.sendMessage("⚠️ ليس لديك رصيد للعب عجلة الحظ.", event.threadID, event.messageID);
  if (balances[userID] < amount) return api.sendMessage(`رصيدك الحالي: ${balances[userID]}$. لا يمكنك المراهنة بمبلغ ${amount}$`, event.threadID, event.messageID);

  const userInfo = await api.getUserInfo(userID);
  const name = userInfo[userID].name || "لاعب";

  // خيارات عجلة الحظ
  const wheel = [
    { text: "💰 ربح نصف الرصيد", multiplier: 0.5 },
    { text: "💰 ربح الرصيد كامل", multiplier: 1 },
    { text: "💸 خسارة الرصيد", multiplier: -1 },
    { text: "💎 مضاعف الرصيد ×2", multiplier: 2 },
    { text: "⚖️ لا شيء", multiplier: 0 }
  ];

  // اختيار عشوائي من العجلة
  const result = wheel[Math.floor(Math.random() * wheel.length)];

  // حساب التغير في الرصيد
  let change = Math.floor(amount * result.multiplier);
  balances[userID] += change;
  if (balances[userID] < 0) balances[userID] = 0; // لا يمكن أن يكون الرصيد سالب

  saveBalances(balances);

  const msg = `
🎡 عجلة الحظ 🎡

👤 اللاعب: ${name}
💵 المراهنة: ${amount}$
🎯 النتيجة: ${result.text}
💰 رصيدك الجديد: ${balances[userID]}$
`;

  return api.sendMessage(msg, event.threadID, event.messageID);
};