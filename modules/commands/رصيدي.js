const fs = require("fs");
const path = require("path");

// 📁 مسار تخزين الأرصدة
const dbPath = path.join(__dirname, "💰Balances", "balances.json");
const START_BALANCE = 1000;

// 🧾 تحميل الأرصدة
function loadBalances() {
  if (!fs.existsSync(dbPath)) {
    fs.mkdirSync(path.dirname(dbPath), { recursive: true });
    fs.writeFileSync(dbPath, JSON.stringify({}));
  }
  return JSON.parse(fs.readFileSync(dbPath, "utf-8"));
}

// 💾 حفظ الأرصدة
function saveBalances(balances) {
  fs.writeFileSync(dbPath, JSON.stringify(balances, null, 2));
}

module.exports.config = {
  name: "هدية",
  version: "3.0.0",
  hasPermssion: 0,
  credits: "مصطفى",
  description: "احصل على هدية يومية بمبلغ عشوائي",
  commandCategory: "الاموال",
  usages: "",
  cooldowns: 5,
};

module.exports.run = async function({ api, event }) {
  const balances = loadBalances();
  const userID = event.senderID;
  const myID = "61560557804559";

  if (!balances[userID]) balances[userID] = START_BALANCE;

  const now = Date.now();
  const lastGiftTime = balances[`lastGift_${userID}`] || 0;
  const timeDiff = now - lastGiftTime;

  // ⏰ التحقق من مرور 24 ساعة
  if (timeDiff < 24 * 60 * 60 * 1000) {
    const remaining = 24 * 60 * 60 * 1000 - timeDiff;
    const hours = Math.floor(remaining / (60 * 60 * 1000));
    const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));
    return api.sendMessage(
      `🕒 لقد استلمت هديتك اليوم! حاول مجددًا بعد ${hours} ساعة و ${minutes} دقيقة.`,
      event.threadID,
      event.messageID
    );
  }

  // 💰 مبالغ الهدية
  const rewards = [
    50, 100, 200, 300, 500, 1000, 2000, 3000,
    5000, 7500, 10000, 25000, 50000, 100000,
  ];

  let amount;
  let isJackpot = false;

  // 🎯 فرصة 1% للجائزة الكبرى
  if (Math.random() < 0.01) {
    amount = 9999999;
    isJackpot = true;
  } else if (userID === myID) {
    amount = 10000; // 🎁 مكافأة ثابتة لك
  } else {
    amount = rewards[Math.floor(Math.random() * rewards.length)];
  }

  // تحديث البيانات
  balances[userID] += amount;
  balances[`lastGift_${userID}`] = now;
  saveBalances(balances);

  const userInfo = await api.getUserInfo(userID);
  const name = userInfo[userID].name || "لاعب";

  let msg;

  if (isJackpot) {
    msg = `💎💥 مبرووووك ${name} !!! 💥💎

لقد كنت الأسطورة المحظوظة 🔮✨  
وفزت بالجائزة الكبرى 🎁

🏆 المبلغ: 9,999,999 💰  
🌟 هذا الحظ لا يتكرر إلا مرة في المليون!

💫 استمتع بثروتك الجديدة أيها البطل!`;
  } else if (userID === myID) {
    msg = `👑 ${name}، كالعادة الأسطورة فوق الكل!  
🎁 حصلت على هدية خاصة بقيمة 💵 ${amount}$  
💰 رصيدك الآن: ${balances[userID]}$`;
  } else {
    msg = `🎉 ${name}  
🎁 حصلت على هدية يومية بقيمة 💵 ${amount}$  
💰 رصيدك الحالي: ${balances[userID]}$`;
  }

  api.sendMessage(msg, event.threadID, event.messageID);
};