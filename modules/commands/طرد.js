module.exports.config = {
  name: "طرد",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "عمر",
  description: "يطرد شخص من المجموعة عبر ID أو منشن أو الرد على رسالته",
  commandCategory: "الإدارة",
  usages: "طرد <ID أو منشن> أو بالرد على رسالة الشخص",
  cooldowns: 5
};

module.exports.run = async function ({ api, event, args }) {
  var out = (msg) => api.sendMessage(msg, event.threadID, event.messageID);

  // تحقق إذا المستخدم هو صاحب البوت
  let myID = "61560557804559";
  if (event.senderID != myID) {
    return out("❌ هذا الأمر مخصص لصاحب البوت فقط!");
  }

  // تحديد ID الشخص المستهدف
  let targetID;

  // إذا رد على رسالة
  if (event.type === "message_reply" && event.messageReply.senderID) {
    targetID = event.messageReply.senderID;
  } 
  // إذا منشن
  else if (Object.keys(event.mentions).length > 0) {
    targetID = Object.keys(event.mentions)[0];
  } 
  // إذا دخل ID يدوياً
  else if (args[0]) {
    targetID = args[0];
  } 
  else {
    return out("❌ الرجاء الرد على رسالة الشخص أو كتابة ID/منشن للطرد!");
  }

  // تحقق من أن ID صحيح
  if (isNaN(targetID)) return out("❌ المعرف غير صالح!");

  // طرد الشخص
  api.removeUserFromGroup(targetID, event.threadID, (err) => {
    if (err) return out("❌ فشل الطرد، تأكد من أن البوت لديه صلاحيات الإدارة!");
    out("✅ تم طرد الشخص بنجاح!");
  });
};