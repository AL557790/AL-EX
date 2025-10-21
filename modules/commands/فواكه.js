const fruits = ["🍎", "🍌", "🍒", "🍇", "🍉", "🍓", "🍍", "🍏", "🥝", "🥭", "🫒"];

module.exports.config = {
  name: "فواكه",
  version: "2.0.0",
  hasPermssion: 0,
  credits: "مصطفى",
  description: "لعبة فواكه احترافية",
  commandCategory: "العاب",
  usages: "[المبلغ]",
  cooldowns: 5,
};

module.exports.run = async function({ api, event, args }) {
  const amount = parseInt(args[0]);
  if (!amount || isNaN(amount)) {
    return api.sendMessage("❂ من فضلك أدخل المبلغ مثل: .فواكه 100", event.threadID, event.messageID);
  }

  const name = event.senderName;

  // توليد 5 فواكه عشوائية
  const result = [];
  for (let i = 0; i < 5; i++) {
    result.push(fruits[Math.floor(Math.random() * fruits.length)]);
  }

  // تحديد النتيجة (ربح، خسارة، تعادل)
  const chance = Math.random();
  let msg = "";

  if (chance < 0.4) { // خسارة
    msg = `✧══════ ∘◦❁◦∘ ══════✧

‣ 👤 ${name}  
‣ ${result.join(" ")}  
‣ 😢 خسرت ${amount}$

✧════════════════✧`;
  } else if (chance < 0.7) { // تعادل
    msg = `✧══════ ∘◦❁◦∘ ══════✧

‣ 😐 ${name}  
‣ ${result.join(" ")}  
‣ ⚖️ تعادل، لم تربح ولم تخسر!

✧════════════════✧`;
  } else { // فوز
    msg = `✧══════ ∘◦❁◦∘ ══════✧

‣ 👑 ${name}  
‣ ${result.join(" ")}  
‣ 😍 ربحت ${amount}$!

✧════════════════✧`;
  }

  api.sendMessage(msg, event.threadID, event.messageID);
};