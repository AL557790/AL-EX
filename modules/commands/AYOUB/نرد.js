module.exports.config = {
  name: "نرد",
  description: "عرض تعليمات لعبة النرد",
  commandCategory: "العاب",
  usages: ".نرد",
  cooldowns: 2
};

module.exports.run = async function({ api, event }) {
  api.sendMessage(
    `🎲 مرحبًا بك في لعبة النرد!
💰 كل لاعب جديد يحصل على 1000$ عند أول استخدام
📝 أوامر اللعبة:
- .رصيدي → لعرض رصيدك وانتصاراتك
- .انضمام <مبلغ> → للعب جماعي (قريبًا)
- .بوت انضمام <مبلغ> → للعب ضد البوت
⭐ التصنيفات: 0 = ضيف، 1-4 = مبتدئ، 5-9 = قوي، 10+ = محترف`,
    event.threadID
  );
};