module.exports.config = {
    name: "ريست",
    version: "2.0.2",
    hasPermssion: 3,
    credits: "Mirai Team mod by Jukie",
    description: "Khởi động lai bot",
    commandCategory: "Hệ thống admin-bot",
    usages: "restart",
    cooldowns: 5,
    dependencies: { }
}
 
module.exports.run = async function({ api, args, Users, event}) {
const { threadID, messageID } = event;
const axios = global.nodemodule["axios"];

const moment = require("moment-timezone");
    var gio = moment.tz("Asia/Ho_Chi_Minh").format("HH");
    var phut = moment.tz("Asia/Ho_Chi_Minh").format("mm");
    var giay = moment.tz("Asia/Ho_Chi_Minh").format("ss");
const fs = require("fs");
    let name = await Users.getNameUser(event.senderID)
  if (event.senderID != 100013384479798) return api.sendMessage(`❗هاذا الأمر للمطوريين فقط`, event.threadID, event.messageID)
if(args.length == 0) api.sendMessage(`[💟]➜  مرحبا يا زعيم: ${name}\n[🔰]➜ يرجى الانتظار للحظة من قبل ، وسيتم إعادة تشغيل نظام البوت بعد 10 ثوانٍ`,event.threadID, () =>process.exit(1))
else{    
let time = args.join(" ");
setTimeout(() =>
api.sendMessage(`[🔮]➜  سيتم إعادة تشغيل البوت بعد: ${time}s\n[⏰]➜ الآن هو: ${gio}:${phut}:${giay} `, threadID), 0)
setTimeout(() =>
api.sendMessage("[⌛]➜ بدء عملية إعادة التشغيل",event.threadID, () =>process.exit(1)), 1000*`${time}`);
}
}