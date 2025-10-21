module.exports.config = {
  name: "نرد",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "مصطفى",
  description: "لعبة نرد احترافية",
  commandCategory: "العاب",
  usages: "[المبلغ]",
  cooldowns: 5,
};

module.exports.run = async function({ api, event, args }) {
  const amount = parseInt(args[0]);
  if (!amount || isNaN(amount)) {
    return api.sendMessage("🎲 استخدم الأمر هكذا: .نرد 100", event.threadID, event.messageID);
  }

  const name = event.senderName;

  // نرد اللاعب والبوت
  const userDice = Math.floor(Math.random() * 6) + 1;
  const botDice = Math.floor(Math.random() * 6) + 1;

  let msg = "";

  if (userDice > botDice) {
    // فوز 🎉
    msg = `✧══════ ∘◦❁◦∘ ══════✧

‣ 👑 ${name}  
‣ 🎲 نردك: ${userDice} مقابل ${botDice} للنظام  
‣ 😍 ربحت ${amount}$!

✧════════════════✧`;
  } else if (userDice < botDice) {
    // خسارة 😢
    msg = `✧══════ ∘◦❁◦∘ ══════✧

‣ 😢 ${name}  
‣ 🎲 نردك: ${userDice} مقابل ${botDice} للنظام  
‣ 💸 خسرت ${amount}$!

✧════════════════✧`;
  } else {
    // تعادل ⚖️
    msg = `✧══════ ∘◦❁◦∘ ══════✧

‣ 😐 ${name}  
‣ 🎲 نردك: ${userDice} مقابل ${botDice} للنظام  
‣ ⚖️ تعادل، لم تربح ولم تخسر!

✧════════════════✧`;
  }

  api.sendMessage(msg, event.threadID, event.messageID);
};