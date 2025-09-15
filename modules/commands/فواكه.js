module.exports.config = {
  name: "فواكه",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "مصطفى",
  description: "🍏🍍🥭🥝🫒 لعبة الفواكه بالرهان",
  commandCategory: "العاب",
  usages: "فواكه <المبلغ>",
  cooldowns: 5
};

module.exports.run = async function ({ api, event, Currencies, args, Users }) {
  const bet = parseInt(args[0]);
  const fruits = ["🥭", "🍍", "🍏", "🥝", "🫒"];

  // تحقق من الكتابة
  if (!bet || bet <= 0) {
    return api.sendMessage("⚠️ اكتب مبلغ صحيح.\nمثال: فواكه 100", event.threadID, event.messageID);
  }

  // بيانات اللاعب
  const userData = await Currencies.getData(event.senderID);
  const userMoney = userData.money;
  const userName = await Users.getNameUser(event.senderID);

  if (userMoney < bet) {
    return api.sendMessage(`💸 ${userName}، ما عندك رصيد كافي (${userMoney}$ فقط).`, event.threadID, event.messageID);
  }

  // خصم المبلغ
  await Currencies.decreaseMoney(event.senderID, bet);

  // توليد 5 فواكه عشوائية
  let result = [];
  for (let i = 0; i < 5; i++) {
    result.push(fruits[Math.floor(Math.random() * fruits.length)]);
  }

  // التحقق من الفوز
  let resultMsg = "";
  if (result.every(fruit => fruit === result[0])) {
    // كل الخانات متشابهة
    const prize = bet * 2;
    await Currencies.increaseMoney(event.senderID, prize);
    resultMsg = `🎉 ${userName} مبروك!\nطلع لك ${result.join("")}\nربحت ${prize}$ 💰`;
  } else {
    resultMsg = `😢 ${userName} طلع لك ${result.join("")}\nخسرت ${bet}$!`;
  }

  api.sendMessage(resultMsg, event.threadID, event.messageID);
};