const fs = require("fs");
const path = require("path");

const fruits = ["🍎", "🍌", "🍒", "🍇", "🍉", "🍓", "🍍", "🍏", "🥝", "🥭", "🫒"];
const dbPath = path.join(__dirname, "💰Balances", "balances.json");
const START_BALANCE = 1000;

function loadBalances() {
  if (!fs.existsSync(dbPath)) fs.writeFileSync(dbPath, JSON.stringify({}));
  return JSON.parse(fs.readFileSync(dbPath, "utf-8"));
}

function saveBalances(balances) {
  fs.writeFileSync(dbPath, JSON.stringify(balances, null, 2));
}

module.exports.config = {
  name: "فواكه",
  version: "2.1.0",
  hasPermssion: 0,
  credits: "مصطفى",
  description: "لعبة فواكه احترافية مع نظام الرصيد",
  commandCategory: "games",
  usages: "[المبلغ]",
  cooldowns: 5,
};

module.exports.run = async function({ api, event, args }) {
  const amount = parseInt(args[0]);
  if (!amount || isNaN(amount) || amount <= 0) {
    return api.sendMessage("❂ من فضلك أدخل المبلغ مثل: .فواكه 100", event.threadID, event.messageID);
  }

  const balances = loadBalances();
  const userID = event.senderID;

  // إعطاء رصيد ابتدائي للاعب جديد
  if (!balances[userID]) balances[userID] = START_BALANCE;

  // التحقق من الرصيد
  if (balances[userID] < amount) {
    return api.sendMessage(`❌ رصيدك الحالي: ${balances[userID]}$. لا يمكنك لعب ${amount}$`, event.threadID, event.messageID);
  }

  const userInfo = await api.getUserInfo(userID);
  const name = userInfo[userID].name || "لاعب";

  // توليد 5 فواكه عشوائية
  const result = Array.from({ length: 5 }, () => fruits[Math.floor(Math.random() * fruits.length)]);

  // تحديد النتيجة (ربح، خسارة، تعادل)
  const chance = Math.random();
  let msg = "";

  // خسارة
  if (chance < 0.4) {
    balances[userID] -= amount;
    msg = `✧══════ ∘◦❁◦∘ ══════✧

‣ 😢 ${name}  
‣ ${result.join(" ")}  
‣ خسرت ${amount}$  
‣ 💰 رصيدك الجديد: ${balances[userID]}$

✧════════════════✧`;

  // تعادل
  } else if (chance < 0.7) {
    msg = `✧══════ ∘◦❁◦∘ ══════✧

‣ 😐 ${name}  
‣ ${result.join(" ")}  
‣ ⚖️ تعادل، لم تربح ولم تخسر!  
‣ 💰 رصيدك الحالي: ${balances[userID]}$

✧════════════════✧`;

  // فوز
  } else {
    balances[userID] += amount;
    msg = `✧══════ ∘◦❁◦∘ ══════✧

‣ 👑 ${name}  
‣ ${result.join(" ")}  
‣ ربحت ${amount}$!  
‣ 💰 رصيدك الجديد: ${balances[userID]}$

✧════════════════✧`;
  }

  saveBalances(balances);
  api.sendMessage(msg, event.threadID, event.messageID);
};