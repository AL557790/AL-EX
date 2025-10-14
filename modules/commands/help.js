const fs = require("fs");
const request = require("request");

module.exports.config = {
    name: "اوامر",
    version: "1.1.1",
    hasPermssion: 0,
    credits: "انس + تعديل مصطفى",
    description: "قائمة الأوامر مع صورة",
    commandCategory: "نظام",
    usages: "[رقم الصفحة أو اسم الأمر]",
    cooldowns: 5
};

module.exports.languages = {
    "en": {
        "moduleInfo": "「 %1 」\n%2\n\n❯ Usage: %3\n❯ Category: %4\n❯ Waiting time: %5 seconds(s)\n❯ Permission: %6\n\n» Module code by %7 «",
        "helpList": '[ There are %1 commands on this bot, Use: "%2help nameCommand" to know how to use! ]',
        "user": "User",
        "adminGroup": "Admin group",
        "adminBot": "Admin bot"
    }
};

module.exports.run = function({ api, event, args, getText }) {
    const { commands } = global.client;
    const { threadID, messageID } = event;
    const command = commands.get((args[0] || "").toLowerCase());
    const threadSetting = global.data.threadData.get(parseInt(threadID)) || {};
    const prefix = (threadSetting.hasOwnProperty("PREFIX")) ? threadSetting.PREFIX : global.config.PREFIX;

    // 🔹 رابط صورة الأوامر
    const imgURL = "https://files.catbox.moe/0v911k.jpg";

    // 🔹 إذا لم يجد المستخدم الأمر أو رقم الصفحة
    if (!command) {
        const arrayInfo = [];
        const page = parseInt(args[0]) || 1;
        const numberOfOnePage = 100;
        let msg = "╔══════════════╗\n🌟 قائمة الأوامر 🌟\n╚══════════════╝\n╭───────────────────╮\n";

        for (var [name] of (commands)) arrayInfo.push(name);
        arrayInfo.sort();

        const startSlice = numberOfOnePage * page - numberOfOnePage;
        const returnArray = arrayInfo.slice(startSlice, startSlice + numberOfOnePage);

        for (let item of returnArray) msg += `[■□■□]» ${item} ✅\n`;

        const text = `╰───────────────────╯\n\n📜 الصفحة (${page}/${Math.ceil(arrayInfo.length / numberOfOnePage)})\n📟 اكتب: ${prefix}اوامر [رقم الصفحة]\n🔢 مجموع الأوامر: ${arrayInfo.length}`;

        // 🔹 التأكد من وجود مجلد cache
        const cacheDir = __dirname + "/cache";
        if (!fs.existsSync(cacheDir)) {
            fs.mkdirSync(cacheDir, { recursive: true });
        }

        // 🔹 تحميل الصورة مؤقتاً ثم إرسالها مع الرسالة
        const callback = () => {
            api.sendMessage({
                body: msg + text,
                attachment: fs.createReadStream(cacheDir + "/help.jpg")
            }, threadID, () => fs.unlinkSync(cacheDir + "/help.jpg"));
        };

        return request(encodeURI(imgURL))
            .pipe(fs.createWriteStream(cacheDir + "/help.jpg"))
            .on("close", callback);
    }

    // 🔹 إذا كتب المستخدم اسم أمر محدد
    return api.sendMessage(getText("moduleInfo",
        command.config.name,
        command.config.description,
        `${prefix}${command.config.name} ${(command.config.usages) ? command.config.usages : ""}`,
        command.config.commandCategory,
        command.config.cooldowns,
        ((command.config.hasPermssion == 0) ? getText("user") : (command.config.hasPermssion == 1) ? getText("adminGroup") : getText("adminBot")),
        command.config.credits),
        threadID, messageID
    );
};