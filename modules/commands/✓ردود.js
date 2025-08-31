const fs = global.nodemodule["fs-extra"];
module.exports.config = {
  name: "goibot",
  version: "1.0.3",
  hasPermssion: 0,
  credits: "Mod by John Lester, updated by Grok",
  description: "goibot",
  commandCategory: "𝕊𝔸𝕐",
  usages: "noprefix",
  cooldowns: 5,
};

module.exports.handleEvent = async function ({ api, event, args, Threads, Users }) {
  var { threadID, messageID } = event;
  const moment = require("moment-timezone");
  const time = moment.tz("Asia/Dhaka").format("HH:MM:ss L");
  var id = event.senderID;

  // هنا كل الردود اللي يظهرها البوت، يمكنك تعديلها بحرية
  var responses = [
    "مرحباً بك! 🌸",
    "كيف حالك اليوم؟ ☀️",
    "أتمنى لك يوماً سعيداً 😊",
    "هل تحتاج لمساعدة؟ 🛠️",
    "لاري تحب المحادثة معك ❤️",
    "دعنا نتحدث قليلاً! ✨",
    "مزاجي اليوم جيد 😎",
    "تحتاج إلى استراحة؟ 💤"
  ];

  if (!global.usedResponses) {
    global.usedResponses = new Map();
  }

  let usedResponses = global.usedResponses.get(threadID) || [];

  if (usedResponses.length >= responses.length) {
    usedResponses = [];
  }

  let availableResponses = responses.filter(response => !usedResponses.includes(response));

  let rand = availableResponses[Math.floor(Math.random() * availableResponses.length)];

  usedResponses.push(rand);
  global.usedResponses.set(threadID, usedResponses);

  // أمثلة على ردود محددة على كلمات معينة
  const msgBody = event.body.toLowerCase();

  if (msgBody === "بوت" || msgBody === "يا بوت") {
    return api.sendMessage("اسمي لارا 🙂", threadID);
  }

  if (msgBody === "ما اسمك" || msgBody === "اسمك" || msgBody === "ما اسمها") {
    return api.sendMessage("لارا", threadID);
  }

  if (msgBody === "احبك" || msgBody === "أحبك") {
    return api.sendMessage("هممم... الامر محرج دعني افكر في الامر😾", threadID);
  }

  // الرد التلقائي العشوائي
  return api.sendMessage(rand, threadID);
}

module.exports.run = function ({ api, event, client, __GLOBAL }) { }