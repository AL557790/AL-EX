module.exports.config = {
  name: "حجرة",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "مصطفى",
  description: "🪨📄✂️ لعبة حجرة ورقة مقص بالرهان",
  commandCategory: "العاب",
  usages: "حجرة|ورقة|مقص <المبلغ>",
  cooldowns: 5
};

module.exports.run = async function ({ api, event, Currencies, args, Users }) {
  const choices = ["حجرة", "ورقة", "مقص"];
  const playerChoice = args[0];
  const bet = parseInt(args[1]);

  // تحقق من الكتابة
  if (!choices.includes(playerChoice) || !bet || bet <= 0) {
    return api.sendMessage("⚠️ استعمل الأمر هكذا:\nحجرة 100\nورقة 200\nمقص 50", event.threadID, event.messageID);
  }

  // بيانات اللاعب
  const userData = await Currencies.getData(event.senderID);
  const userMoney = userData.money;
  const userName = await Users.getNameUser(event.senderID);

  if (userMoney < bet) {
    return api.sendMessage(`💸 ${userName}، ما عندك رصيد كافي (${userMoney}$ فقط).`, event.threadID, event.messageID);
  }

  // خصم المبلغ من اللاعب
  await Currencies.decreaseMoney(event.senderID, bet);

  // اختيار البوت عشوائي
  const botChoice = choices[Math.floor(Math.random() * choices.length)];

  let resultMsg = "";
  if (
    (playerChoice === "حجرة" && botChoice === "مقص") ||
    (playerChoice === "ورقة" && botChoice === "حجرة") ||
    (playerChoice === "مقص" && botChoice === "ورقة")
  ) {
    // اللاعب فاز
    const prize = bet * 2;
    await Currencies.increaseMoney(event.senderID, prize);
    resultMsg = `🎉 ${userName} فزت!\nربحت ${prize}$ 💰`;
  } else if (playerChoice === botChoice) {
    // تعادل
    await Currencies.increaseMoney(event.senderID, bet);
    resultMsg = `🤝 تعادل! رجعلك رصيدك (${bet}$).`;
  } else {
    // اللاعب خسر
    resultMsg = `😢 ${userName} خسرت ${bet}$.\nالبوت لعب ${botChoice} وفاز! 💻`;
  }

  api.sendMessage(
    `🪨📄✂️ لعبة حجرة ورقة مقص:\n\n👤 ${userName}: ${playerChoice}\n💻 البوت: ${botChoice}\n\n${resultMsg}`,
    event.threadID,
    event.messageID
  );
};