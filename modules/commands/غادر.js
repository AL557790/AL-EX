module.exports.config = {
  name: "غادر",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "عمر",
  description: "يجعل البوت يغادر المجموعة",
  commandCategory: "الإدارة",
  usages: "",
  cooldowns: 5
};

module.exports.run = async function ({ api, event, args }) {
  var out = (msg) => api.sendMessage(msg, event.threadID, event.messageID);

  // تحقق إذا المستخدم هو صاحب البوت
  let myID = "61560557804559";
  if (event.senderID != myID) {
    return out("❌ هذا الأمر مخصص لصاحب البوت فقط!");
  }

  // رسالة قبل الخروج
  api.sendMessage("👋 البوت سيغادر المجموعة الآن.", event.threadID, () => {
    // خروج البوت من المجموعة
    api.removeUserFromGroup(api.getCurrentUserID(), event.threadID);
  });
};