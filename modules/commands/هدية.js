module.exports.config = {
  name: "رصيدي",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "عمر",
  description: "يعرض لك رصيدك الحالي",
  commandCategory: "الاموال",
  usages: "",
  cooldowns: 5
};

module.exports.run = async function ({ api, event, Users, Currencies, args }) {
  var out = (msg) => api.sendMessage(msg, event.threadID, event.messageID);

  // جلب رصيدك
  let money = (await Currencies.getData(event.senderID)).money || 0;

  return out(`💰 رصيدك الحالي هو: ${money} دولار`);
};