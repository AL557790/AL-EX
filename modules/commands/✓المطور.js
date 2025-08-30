module.exports.config = {
  name: "مطور",
  version: "1.0.0",
  hasPermission: 0,
  credits: "AYOUB",
  description: "إرسال معلومات حول المطور",
  commandCategory: "معلومات",
  cooldowns: 1
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID } = event;

  const developerInfo = `
مطور: سيكو  👨‍💻  
الاسم: أيوب  💡  
العمر: 18 سنة  🎉

بعض لغات البرمجة التي أعرفها:  
- JavaScript  💻  
- Python  🐍  
- Node.js  🌐  
- HTML/CSS  🖥️  
- Java  ☕  
- C#  🎮  
- PHP  🔧  
- Ruby  💎  
- Go  🚀  
- Swift  🍏  

للتواصل معي أو في حالة تعطل البوت، يمكنك استخدام الرابط التالي:  
[رابط حسابي على فيسبوك](https://www.facebook.com/al.ex.25460) 📲
  `;

  return api.sendMessage(developerInfo, threadID);
};