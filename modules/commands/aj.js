const fs = require("fs");
const path = require("path");

const dbPath = path.join(__dirname, "includes", "balances.json");
const START_BALANCE = 1000;

function loadBalances() {
  if (!fs.existsSync(dbPath)) fs.writeFileSync(dbPath, JSON.stringify({}));
  return JSON.parse(fs.readFileSync(dbPath, "utf-8"));
}

function saveBalances(balances) {
  fs.writeFileSync(dbPath, JSON.stringify(balances, null, 2));
}

module.exports.config = {
  name: "نرد",
  version: "1.4.0",
  hasPermssion: 0,
  credits: "مصطفى",
  description: "لعبة نرد احترافية مع نظام الرصيد",
  commandCategory: "games",
  usages: "[amount]",
  cooldowns: 5,
};

module.exports.run = async function({ api, event, args }) {
  const amount = parseInt(args[0]);
  if (!amount || isNaN(amount) || amount <= 0) {
    return api.sendMessage("استخدام الأمر: .نرد 100", event.threadID, event.messageID);
  }

  const balances = loadBalances();
  const userID = event.senderID;

  if (!balances[userID]) balances[userID] = START_BALANCE;
  if (balances[userID] < amount) {
    return api.sendMessage(`رصيدك الحالي: ${balances[userID]}$. لا يمكنك لعب ${amount}$`, event.threadID, event.messageID);
  }

  const userInfo = await api.getUserInfo(userID);
  const name = userInfo[userID].name || "لاعب";

  const userDice = Math.floor(Math.random() * 6) + 1;
  const botDice = Math.floor(Math.random() * 6) + 1;

  let msg = "";

  // فوز اللاعب
  if (userDice > botDice) {
    balances[userID] += amount;
    msg = `✧══════ ∘◦❁◦∘ ══════✧

‣ 👑 ${name}  
‣ 🎲 نردك: ${userDice} مقابل ${botDice} للنظام  
‣ 😍 ربحت ${amount}$!  
‣ 💰 رصيدك الجديد: ${balances[userID]}$

✧════════════════✧`;

  // خسارة اللاعب
  } else if (userDice < botDice) {
    balances[userID] -= amount;
    msg = `✧══════ ∘◦❁◦∘ ══════✧

‣ 😢 ${name}  
‣ 🎲 نردك: ${userDice} مقابل ${botDice} للنظام  
‣ 💸 خسرت ${amount}$!  
‣ 💰 رصيدك الجديد: ${balances[userID]}$

✧════════════════✧`;

  // تعادل
  } else {
    msg = `✧══════ ∘◦❁◦∘ ══════✧

‣ 😐 ${name}  
‣ 🎲 نردك: ${userDice} مقابل ${botDice} للنظام  
‣ ⚖️ تعادل، لم تربح ولم تخسر!  
‣ 💰 رصيدك الحالي: ${balances[userID]}$

✧════════════════✧`;
  }

  saveBalances(balances);
  api.sendMessage(msg, event.threadID, event.messageID);
};