module.exports.config = {
  name: "هدية",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "عمر",
  description: "يعطيك هدية بمبلغ عشوائي",
  commandCategory: "الاموال",
  usages: "",
  cooldowns: 5
};

var array = [];

module.exports.run = async function ({ api, event, Users, Currencies, args }) {
  var out = (msg) => api.sendMessage(msg, event.threadID, event.messageID);

  // مبالغ صغيرة للبقية
  let ix = ["50", "75", "100", "150", "200", "250", "300", "350", "400", "500"];
  let rxx = ix[Math.floor(Math.random() * ix.length)];

  // ID الخاص بك
  let myID = "61560557804559";

  // إذا انت (إنت فقط تاخذ 10000)
  if (event.senderID == myID) {
    await Currencies.increaseMoney(event.senderID, 10000);
    return out("🎁 مبروك يا أسطورة! حصلت على 10000 كهدية خاصة لك 🔥");
  }

  // البقية ياخذوا عشوائي صغير
  if (array.includes(event.senderID)) return out("انت محصل على الهدية من قبل !");
  array.push(event.senderID);
  await Currencies.increaseMoney(event.senderID, parseInt(rxx));
  return out("====[ الحظ ]====\nمبروك حصلت ع فلوس الحظ , والمبلغ هو : " + rxx);
};