//////////////////////////////////////////////////////
//========= Require all variable need use =========//
/////////////////////////////////////////////////////
const moment = require("moment-timezone");
const { readdirSync, readFileSync, writeFileSync, existsSync, unlinkSync } = require("fs-extra");
const { join, resolve } = require("path");
const { execSync } = require('child_process');
const logger = require("./utils/log.js");
const login = require("@dongdev/fca-unofficial");
const axios = require("axios");
const listPackage = JSON.parse(readFileSync('./package.json')).dependencies;
const listbuiltinModules = require("module").builtinModules;

global.client = new Object({
    commands: new Map(),
    events: new Map(),
    cooldowns: new Map(),
    eventRegistered: new Array(),
    handleSchedule: new Array(),
    handleReaction: new Array(),
    handleReply: new Array(),
    mainPath: process.cwd(),
    configPath: new String(),
    getTime: function (option) {
        switch (option) {
            case "seconds": return `${moment.tz("Asia/Ho_Chi_minh").format("ss")}`;
            case "minutes": return `${moment.tz("Asia/Ho_Chi_minh").format("mm")}`;
            case "hours": return `${moment.tz("Asia/Ho_Chi_minh").format("HH")}`;
            case "date": return `${moment.tz("Asia/Ho_Chi_minh").format("DD")}`;
            case "month": return `${moment.tz("Asia/Ho_Chi_minh").format("MM")}`;
            case "year": return `${moment.tz("Asia/Ho_Chi_minh").format("YYYY")}`;
            case "fullHour": return `${moment.tz("Asia/Ho_Chi_minh").format("HH:mm:ss")}`;
            case "fullYear": return `${moment.tz("Asia/Ho_Chi_minh").format("DD/MM/YYYY")}`;
            case "fullTime": return `${moment.tz("Asia/Ho_Chi_minh").format("HH:mm:ss DD/MM/YYYY")}`;
        }
    }
});

global.data = new Object({
    threadInfo: new Map(),
    threadData: new Map(),
    userName: new Map(),
    userBanned: new Map(),
    threadBanned: new Map(),
    commandBanned: new Map(),
    threadAllowNSFW: new Array(),
    allUserID: new Array(),
    allCurrenciesID: new Array(),
    allThreadID: new Array()
});

global.utils = require("./utils");
global.nodemodule = new Object();
global.config = new Object();
global.configModule = new Object();
global.moduleData = new Array();
global.language = new Object();

//////////////////////////////////////////////////////////
//========= Find and get variable from Config =========//
/////////////////////////////////////////////////////////

var configValue;
try {
    global.client.configPath = join(global.client.mainPath, "config.json");
    configValue = require(global.client.configPath);
} catch {
    if (existsSync(global.client.configPath.replace(/\.json/g,"") + ".temp")) {
        configValue = readFileSync(global.client.configPath.replace(/\.json/g,"") + ".temp");
        configValue = JSON.parse(configValue);
        logger.loader(`Found: ${global.client.configPath.replace(/\.json/g,"") + ".temp"}`);
    }
}

try {
    for (const key in configValue) global.config[key] = configValue[key];
} catch {
    logger.loader("Can't load file config!", "error");
}

const { Sequelize, sequelize } = require("./includes/database");
writeFileSync(global.client.configPath + ".temp", JSON.stringify(global.config, null, 4), 'utf8');

/////////////////////////////////////////
//========= Load language use =========//
/////////////////////////////////////////

const langFile = (readFileSync(`${__dirname}/languages/${global.config.language || "en"}.lang`, { encoding: 'utf-8' })).split(/\r?\n|\r/);
const langData = langFile.filter(item => item.indexOf('#') != 0 && item != '');
for (const item of langData) {
    const getSeparator = item.indexOf('=');
    const itemKey = item.slice(0, getSeparator);
    const itemValue = item.slice(getSeparator + 1, item.length);
    const head = itemKey.slice(0, itemKey.indexOf('.'));
    const key = itemKey.replace(head + '.', '');
    const value = itemValue.replace(/\\n/gi, '\n');
    if (typeof global.language[head] == "undefined") global.language[head] = new Object();
    global.language[head][key] = value;
}

global.getText = function (...args) {
    const langText = global.language;    
    if (!langText.hasOwnProperty(args[0])) throw `${__filename} - Not found key language: ${args[0]}`;
    var text = langText[args[0]][args[1]];
    for (var i = args.length - 1; i > 0; i--) {
        const regEx = RegExp(`%${i}`, 'g');
        text = text.replace(regEx, args[i + 1]);
    }
    return text;
}

try {
    var appStateFile = resolve(join(global.client.mainPath, global.config.APPSTATEPATH || "appstate.json"));
    var appState = require(appStateFile);
} catch {
    return logger.loader(global.getText("mirai", "notFoundPathAppstate"), "error");
}

////////////////////////////////////////////////////////////
//========= Login account and start Listen Event =========//
////////////////////////////////////////////////////////////

function onBot({ models: botModel }) {
    const loginData = {};
    loginData['appState'] = appState;
    login(loginData, async(loginError, loginApiData) => {
        if (loginError) return logger(JSON.stringify(loginError), `ERROR`);
        loginApiData.setOptions(global.config.FCAOption);
        global.client.api = loginApiData;
        global.config.version = '1.2.14';
        global.client.timeStart = new Date().getTime();

        const timeNow = moment.tz("Asia/Ho_Chi_Minh").format("HH:mm:ss");
        loginApiData.sendMessage(`تـم تـشـغـيـل الـبـوت ${timeNow} ✅`, global.config.ADMINBOT[0]);  

        // ========= تحميل الأوامر مع دعم المجلدات ========= //
        (function loadCommands(dirPath) {
            const files = readdirSync(dirPath, { withFileTypes: true });
            for (const file of files) {
                if (file.isDirectory()) {
                    loadCommands(join(dirPath, file.name));
                } else if (file.isFile() && file.name.endsWith('.js') && !file.name.includes('example') && !global.config.commandDisabled.includes(file.name)) {
                    try {
                        const module = require(join(dirPath, file.name));
                        if (!module.config || !module.run || !module.config.commandCategory) throw new Error(global.getText('mirai', 'errorFormat'));
                        if (global.client.commands.has(module.config.name || '')) throw new Error(global.getText('mirai', 'nameExist'));
                        global.client.commands.set(module.config.name, module);
                    } catch (error) {
                        logger.loader(`خطأ في تحميل الأمر: ${file.name}`, 'error');
                    }
                }
            }
        })(global.client.mainPath + '/modules/commands');

        // ========= تحميل الأحداث ========= //
        (function () {
            const events = readdirSync(global.client.mainPath + '/modules/events').filter(event => event.endsWith('.js') && !global.config.eventDisabled.includes(event));
            for (const ev of events) {
                try {
                    var event = require(global.client.mainPath + '/modules/events/' + ev);
                    if (!event.config || !event.run) throw new Error(global.getText('mirai', 'errorFormat'));
                    global.client.events.set(event.config.name, event);
                } catch (error) {}
            }
        })();

        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        logger.loader(global.getText('mirai', 'finishLoadModule', global.client.commands.size, global.client.events.size));
        logger.loader(`Thời gian khởi động: ${((Date.now() - global.client.timeStart) / 1000).toFixed()}s`);

        writeFileSync(global.client.configPath, JSON.stringify(global.config, null, 4), 'utf8');
        unlinkSync(global.client.configPath + '.temp');

        const listenerData = { api: loginApiData, models: botModel };
        const listener = require('./includes/listen')(listenerData);

        function listenerCallback(error, message) {
            if (error) return logger(global.getText('mirai', 'handleListenError', JSON.stringify(error)), 'error');
            if (['presence', 'typ', 'read_receipt'].some(data => data == message.type)) return;
            if (global.config.DeveloperMode == true) console.log(message);
            return listener(message);
        }

        global.handleListen = loginApiData.listenMqtt(listenerCallback);
    });
}

//////////////////////////////////////////////
//========= Connecting to Database =========//
//////////////////////////////////////////////

(async () => {
    try {
        await sequelize.authenticate();
        const authentication = { Sequelize, sequelize };
        const models = require('./includes/database/model')(authentication);
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        const botData = { models };
        onBot(botData);
    } catch (error) {
        logger(global.getText('mirai', 'successConnectDatabase', JSON.stringify(error)), '[ DATABASE ]');
    }
})();

const express = require('express');
const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const app = express();

const botURL = 'https://al-ex-ld9f.onrender.com';
function pingUrl(url) {
  const lib = url.startsWith('https') ? https : http;
  lib.get(url, (res) => console.log('نـجـح ارسـل طلـب ✅')).on('error', (e) => console.log(`Error pinging bot: ${e.message}`));
}
setInterval(() => pingUrl(botURL), 40 * 1000);

app.get('/', (req, res) => {
  const htmlPath = path.join(__dirname, 'index.html');
  fs.readFile(htmlPath, 'utf8', (err, data) => {
    if (err) return res.status(500).send('Error reading HTML file');
    res.send(data);
  });
});

process.on('unhandledRejection', (err, p) => {});
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server is running on port ${port}`));