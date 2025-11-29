module.exports = function ({ api, models }) {
    const fs = require("fs");
    const moment = require('moment-timezone');
    const axios = require("axios");

    const Users = require("./controllers/users")({ models, api });
    const Threads = require("./controllers/threads")({ models, api });
    const Currencies = require("./controllers/currencies")({ models });
    const logger = require("../utils/log.js");

    var day = moment.tz("Asia/Ho_Chi_Minh").day();
    const checkttDataPath = __dirname + '/../modules/commands/tuongtac/checktt/';  

    // ===================== Notifications =====================
    setInterval(() => {
        if (global.config.NOTIFICATION) {
            require("./handle/handleNotification.js")({ api });
        }
    }, 1000*60);

    // ===================== Load environment =====================
    (async function () {
        try {
            logger(global.getText('listen', 'startLoadEnvironment'), '[ NINO ]');  
            let threads = await Threads.getAll();
            let users = await Users.getAll(['userID', 'name', 'data']);
            let currencies = await Currencies.getAll(['userID']);

            for (const data of threads) {
                const idThread = String(data.threadID);
                if (!global.data.allThreadID.includes(idThread)) global.data.allThreadID.push(idThread);
                global.data.threadData.set(idThread, data['data'] || {});
                global.data.threadInfo.set(idThread, data.threadInfo || {});
            }

            for (const dataU of users) {
                const idUsers = String(dataU['userID']);
                if (!global.data.allUserID.includes(idUsers)) global.data.allUserID.push(idUsers);
                if (dataU.name && dataU.name.length != 0) global.data.userName.set(idUsers, dataU.name);
            }

            for (const dataC of currencies) global.data.allCurrenciesID.push(String(dataC['userID']));

            logger.loader(global.getText('listen', 'successLoadEnvironment'), '[ Bot information ]');
        } catch (error) {
            logger.loader(global.getText('listen', 'failLoadEnvironment', error), 'error');
        }
    })();

    logger(`[ ${global.config.PREFIX} ] • ${(!global.config.BOTNAME) ? "NINO" : global.config.BOTNAME}`, "[ Bot information ]");

    // ===================== Require handlers =====================
    const handleCommand = require("./handle/handleCommand")({ api, models, Users, Threads, Currencies });
    const handleCommandEvent = require("./handle/handleCommandEvent")({ api, models, Users, Threads, Currencies });
    const handleReply = require("./handle/handleReply")({ api, models, Users, Threads, Currencies });
    const handleReaction = require("./handle/handleReaction")({ api, models, Users, Threads, Currencies });
    const handleRefresh = require("./handle/handleRefresh")({ api, Threads, Users, Currencies, models });
    const handleEvent = require("./handle/handleEvent")({ api, models, Users, Threads, Currencies });
    const handleCreateDatabase = require("./handle/handleCreateDatabase")({ api, Threads, Users, Currencies, models });

    const datlichPath = __dirname + "/../modules/commands/cache/data/datlich.json";  

    const tenMinutes = 10 * 60 * 1000;

    const checkTime = (time) => new Promise((resolve) => {
        time.forEach((e, i) => time[i] = parseInt(String(e).trim()));
        const getDayFromMonth = (month) => (month == 0) ? 0 : (month == 2) ? (time[2] % 4 == 0 ? 29 : 28) : ([1,3,5,7,8,10,12].includes(month) ? 31 : 30);
        if (time[1] > 12 || time[1] < 1) resolve(0);
        if (time[0] > getDayFromMonth(time[1]) || time[0] < 1) resolve(0);
        const yr = time[2] - 1970;
        let yearToMS = yr * 365 * 24 * 60 * 60 * 1000;
        yearToMS += Math.floor((yr - 2)/4) * 24 * 60 * 60 * 1000;
        let monthToMS = 0;
        for (let i = 1; i < time[1]; i++) monthToMS += [31,28,31,30,31,30,31,31,30,31,30,31][i-1] * 24 * 60 * 60 * 1000;
        if (time[2] % 4 == 0) monthToMS += 24*60*60*1000;
        const dayToMS = time[0] * 24*60*60*1000;
        const hourToMS = time[3] * 60*60*1000;
        const minuteToMS = time[4]*60*1000;
        const secondToMS = time[5]*1000;
        resolve(yearToMS + monthToMS + dayToMS + hourToMS + minuteToMS + secondToMS - 24*60*60*1000);
    });

    const checkAndExecuteEvent = async () => {
        if (!fs.existsSync(datlichPath)) fs.writeFileSync(datlichPath, JSON.stringify({}, null, 4));
        const data = JSON.parse(fs.readFileSync(datlichPath));
        const timeVN = moment().tz('Asia/Ho_Chi_Minh').format('DD/MM/YYYY_HH:mm:ss').split(/[/_:]/).map(Number);
        const vnMS = await checkTime(timeVN);
        let temp = [];

        for (const boxID in data) {
            for (const e of Object.keys(data[boxID])) {
                const getTimeMS = await checkTime(data[boxID][e].time.split("_").map(Number));
                if (getTimeMS < vnMS && vnMS - getTimeMS < tenMinutes) {
                    data[boxID][e]["TID"] = boxID;
                    temp.push(data[boxID][e]);
                    delete data[boxID][e];
                } else delete data[boxID][e];
            }
        }
        fs.writeFileSync(datlichPath, JSON.stringify(data, null, 4));

        for (const el of temp) {
            try {
                const all = (await Threads.getInfo(el["TID"])).participantIDs.filter(id => id != api.getCurrentUserID());
                let body = el.REASON || "🥰🥰🥰";
                const mentions = all.map((id,i) => ({ tag: body[i] || ' ', id, fromIndex: i }));
                const out = { body, mentions };

                if ("ATTACHMENT" in el) {
                    out.attachment = [];
                    for (const a of el.ATTACHMENT) {
                        const getAttachment = (await axios.get(encodeURI(a.url), { responseType: "arraybuffer" })).data;
                        fs.writeFileSync(__dirname + `/../modules/commands/cache/${a.fileName}`, Buffer.from(getAttachment, 'utf-8'));
                        out.attachment.push(fs.createReadStream(__dirname + `/../modules/commands/cache/${a.fileName}`));
                    }
                }
                api.sendMessage(out, el["TID"], () => ("ATTACHMENT" in el) ? el.ATTACHMENT.forEach(a => fs.unlinkSync(__dirname + `/../modules/commands/cache/${a.fileName}`)) : "");
            } catch (err) { console.log(err); }
        }
    };

    setInterval(checkAndExecuteEvent, tenMinutes / 10);

    // ===================== Event handler =====================
    return async (event) => {
        // إضافة أي Thread جديد تلقائياً
        if (!global.data.allThreadID.includes(event.threadID)) {
            global.data.allThreadID.push(event.threadID);
            global.data.threadData.set(event.threadID, {});
            global.data.threadInfo.set(event.threadID, {});
        }

        if (event.type == "change_thread_image")
            api.sendMessage(`» [ 𝐂𝐀̣̂𝐏 𝐍𝐇𝐀̣̂𝐓 𝐍𝐇𝐎́𝐌 ]\n»  ${event.snippet}`, event.threadID);

        switch (event.type) {
            case "message":
            case "message_reply":
            case "message_unsend":
                handleCreateDatabase({ event });
                handleCommand({ event });
                handleReply({ event });
                handleCommandEvent({ event });
                break;

            case "change_thread_image":
            case "event":
                handleEvent({ event });
                handleRefresh({ event });
                break;

            case "message_reaction":
                handleReaction({ event });
                break;

            default:
                break;
        }
    };
};