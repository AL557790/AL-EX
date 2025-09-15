module.exports.config = {
  name: "نرد",
  version: "2.0.0",
  hasPermssion: 0,
  credits: "مصطفى",
  description: "🎲 لعبة نرد بالرهان مع حفظ الأموال",
  commandCategory: "العاب",
  usages: "نرد <المبلغ>",
  cooldowns: 5
};

module.exports.run = async function ({ api, event, Currencies, args, Users }) {
  const bet = parseInt(args[0]); // المبلغ المراهن به

  // تحقق من الكتابة
  if (!bet || bet <= 0) {
    return api.sendMessage("⚠️ اكتب مبلغ صحيح.\nمثال: نرد 100", event.threadID, event.messageID);
  }

  // بيانات اللاعب
  const userData = await Currencies.getData(event.senderID);
  const userMoney = userData.money;
  const userName = await Users.getNameUser(event.senderID);

  // تحقق من رصيد اللاعب
  if (userMoney < bet) {
    return api.sendMessage(`💸 ${userName}، ما عندك رصيد كافي (${userMoney}$ فقط).`, event.threadID, event.messageID);
  }

  // خصم المبلغ من اللاعب
  await Currencies.decreaseMoney(event.senderID, bet);

  // رمي النرد (1-6)
  const dicePlayer = Math.floor(Math.random() * 6) + 1;
  const diceBot = Math.floor(Math.random() * 6) + 1;

  let resultMsg = "";
  if (dicePlayer > diceBot) {
    // اللاعب فاز
    const prize = bet * 2;
    await Currencies.increaseMoney(event.senderID, prize);
    resultMsg = `🎉 ${userName} فزت!\nربحت ${prize}$ 💰`;
  } else if (dicePlayer < diceBot) {
    // اللاعب خسر
    resultMsg = `😢 ${userName} خسرت ${bet}$.\nالبوت فاز عليك! 💻`;
  } else {
    // تعادل
    await Currencies.increaseMoney(event.senderID, bet);
    resultMsg = `🤝 تعادل! رجعلك رصيدك (${bet}$).`;
  }

  // إرسال النتيجة
  api.sendMessage(
    `🎲 لعبة النرد:\n\n👤 ${userName}: ${dicePlayer}\n💻 البوت: ${diceBot}\n\n${resultMsg}`,
    event.threadID,
    event.messageID
  );
};