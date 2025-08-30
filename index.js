const { spawn } = require("child_process");
const { readFileSync } = require("fs-extra");
const http = require("http");
const axios = require("axios");
const semver = require("semver");
const logger = require("./utils/log");
const express = require('express');
const path = require('path');
const chalk = require('chalkercli');
const chalk1 = require('chalk');
const CFonts = require('cfonts');
const app = express();
const port = process.env.PORT || 2006;
const moment = require("moment-timezone");
var gio = moment.tz("Asia/Ho_Chi_Minh").format("HH:mm:ss || D/MM/YYYY");
var thu = moment.tz('Asia/Ho_Chi_Minh').format('dddd');
if (thu == 'Sunday') thu = '🌞 الأحد';
if (thu == 'Monday') thu = '🌙 الإثنين';
if (thu == 'Tuesday') thu = '🔥 الثلاثاء';
if (thu == 'Wednesday') thu = '💧 الأربعاء';
if (thu == "Thursday") thu = '🌈 الخميس';
if (thu == 'Friday') thu = '🎉 الجمعة';
if (thu == 'Saturday') thu = '⭐ السبت';

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname, '/index.html'));
});

app.listen(port);

const rainbow = chalk.rainbow(`\nㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤ『=== ✨ SAIKO BOT LAUNCH 🌟 ===』\n\n`).stop();
rainbow.render();
const frame = rainbow.frame(); 
console.log(frame);
logger(chalk1.cyanBright("🎉 Your version is sparkling fresh!") + chalk1.yellow(" ✨"), "UPDATE");

function startBot(message) {
    (message) ? logger(chalk1.magentaBright(message) + chalk1.yellow(" 🌟"), "🚀 SAIKO POWER-UP") : "";

    const child = spawn("node", ["--trace-warnings", "--async-stack-traces", "main.js"], {
        cwd: __dirname,
        stdio: "inherit",
        shell: true
    });

    child.on("close", async (codeExit) => {
        var x = 'codeExit'.replace('codeExit', codeExit);
        if (codeExit == 1) return startBot(chalk1.redBright("🔄 SAIKO IS REBOOTING!!!") + chalk1.green(" ⚡"));
        else if (x.indexOf(2) == 0) {
            await new Promise(resolve => setTimeout(resolve, parseInt(x.replace(2,'')) * 1000));
            startBot(chalk1.cyan("🌈 SAIKO is back online! Hang tight!") + chalk1.magenta(" 💖"));
        }
        else return; 
    });

    child.on("error", function (error) {
        logger(chalk1.red("⚠️ Oops! Something broke: ") + JSON.stringify(error) + chalk1.yellow(" 😿"), "[ Starting ]");
    });
};

axios.get("https://raw.githubusercontent.com/tandung1/Bot12/main/package.json").then((res) => {
    //logger(res['data']['name'], "[ PROJECT NAME ]");
    //logger("Version: " + res['data']['version'], "[ VERSION ]");
    //logger(res['data']['description'], "[ NOTE ]");
});

setTimeout(async function () {
    CFonts.say('SAIKO', {
        font: 'block',
        align: 'center',
        gradient: ['cyan', 'yellow'],
        letterSpacing: 3,
        space: false
    });
    CFonts.say(`Bot Messenger Powered By SAIKO 🚀`, {
        font: 'console',
        align: 'center',
        gradient: ['purple', 'pink'],
        transitionGradient: true
    });
    CFonts.say(`Crafted with 🌟 LOVE 🌟 & 🎨 COLORS`, {
        font: 'simple',
        align: 'center',
        gradient: ['red', 'blue'],
        letterSpacing: 2
    });
    console.log(chalk1.bgMagentaBright.white.bold(`\n 🎉 SAIKO BOT READY AT ${gio} 🎉 \n`));

    rainbow.render(); 
    const frame = rainbow.frame(); 
    console.log(frame);

    logger(chalk1.blueBright('🌌 Loading SAIKO magic code') + chalk1.greenBright(' ✨'), 'LOAD');
    startBot(chalk1.cyanBright("🚀 Launching SAIKO now!") + chalk1.yellow(" 🌟"));
}, 70);