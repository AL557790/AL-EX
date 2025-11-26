const fs = global.nodemodule["fs-extra"];
module.exports.config = {
  name: "goibot",
  version: "1.0.4",
  hasPermssion: 0,
  credits: "Mod by John Lester",
  description: "goibot",
  commandCategory: "𝕊𝔸𝕐",
  usages: "noprefix",
  cooldowns: 5,
};

module.exports.handleEvent = async function({ api, event, args, Threads, Users }) {
  var { threadID, messageID } = event;
  var id = event.senderID;
  var name = await Users.getNameUser(id);

  // مصفوفة ردود نيرو العشوائية
  var tl = [
    "نعم أيوب؟ ماذا تريد؟ 😎",
    "اهلا يا أيوب، كل شيء تمام هنا 😏",
    "هل تريد مني أن أفعل شيئاً؟ 🤭",
    "اشتقت لك يا أيوب 🥰",
    "أنا هنا في خدمتك",
    "لن أجيبك الآن، مشغول 😤",
    "هاه مجدداً؟ 😒",
    "نيرو هنا، استمع لي جيداً 😎",
    "تحت أمرك يا سيد أيوب",
    "هل تتعب من مناداتي؟ 😏",
    "أهلاً يا أيوب، الجو رائع اليوم 😎",
    "هل أنت جائع؟ دعني أساعدك 🍔",
    "أيوب، أنت تعرف أنني أحب التحديات 😏",
    "توقف عن اللعب، لدي شيء مهم 😎",
    "لنذهب للمغامرة القادمة أيوب! ⚡",
    "نيرو مستعد لكل شيء، فقط قل لي 🚀",
    "نيرو زعلان 😞🧊" // هذا الرد الآن ضمن الردود العشوائية
  ];
  var rand = tl[Math.floor(Math.random() * tl.length)];

  const msgBody = event.body.toLowerCase();

  // الردود على الكلمات الشائعة
  if (["احبك", "أحبك"].includes(msgBody)) 
    return api.sendMessage("هممم... الأمر محرج دعني أفكر 😼", threadID);

  if (["❤️","💗"].includes(msgBody)) 
    return api.sendMessage("هل أنا حبيبتك لترسل لي هذا؟ 😏", threadID);

  if (["👍","👍🏻"].includes(msgBody)) 
    return api.sendMessage("أنت تعرف مكان اللايك 😉", threadID);

  if (["اكرهك","لا احبك"].includes(msgBody)) 
    return api.sendMessage("حطمت قلبي 💔", threadID);

  if (["نيرو","نينو"].includes(msgBody)) {
    // كل مرة يكتب فيها المستخدم "نيرو"، يرسل رد عشوائي من tl
    return api.sendMessage(rand, threadID, messageID);
  }

  // ميزة الملصق
  if (msgBody === ".نيرو") {
    return api.sendMessage({ sticker: fs.createReadStream(__dirname + "/stickers/nero.webp") }, threadID);
  }
};