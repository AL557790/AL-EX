const { spawn } = require("child_process");
const { readFileSync } = require("fs-extra");
const axios = require("axios");
const semver = require("semver");
const logger = require("./utils/log");
const express = require("express");
const path = require("path");

const app = express();
const port = process.env.PORT || 2006;

// 🔹 صغير ASCII شعار للبوت
const logo = `
😎 LARA BOT 😎
================
`;

// 🔗 الصفحة الرئيسية
app.get("/", function (req, res) {
  res.sendFile(path.join(__dirname, "/index.html"));
});

app.listen(port, () => {
  console.log("===========================");
  console.log(" Server started on port:", port, "🚀");
  console.log("===========================");
});

// 🚀 بدء البوت
function startBot(message) {
  if (message) logger("😈 " + message + " 😈", "[ STARTING ]");

  const child = spawn("node", ["--trace-warnings", "--async-stack-traces", "main.js"], {
    cwd: __dirname,
    stdio: "inherit",
    shell: true
  });

  child.on("close", async (codeExit) => {
    if (codeExit == 1) {
      return startBot("🔄 LARA IS REBOOTING...");
    } else if (String(codeExit).startsWith("2")) {
      const delay = parseInt(String(codeExit).replace("2", "")) * 1000;
      await new Promise((resolve) => setTimeout(resolve, delay));
      startBot("✨ LARA is back online!");
    } else return;
  });

  child.on("error", function (error) {
    logger("⚠️ Error: " + JSON.stringify(error), "[ STARTING ]");
  });
}

// 📡 Check updates from GitHub (optional)
axios.get("https://raw.githubusercontent.com/tandung1/Bot12/main/package.json").then((res) => {
  logger("😈 Project: " + res.data.name + " 😈", "[ INFO ]");
  logger("😈 Version: " + res.data.version + " 😈", "[ INFO ]");
});

// 🎨 Console output
setTimeout(() => {
  console.log(logo);
  console.log("😈 LARA BOT READY 😈");
  console.log("===========================");
  logger("⚡ Loading LARA core system...", "LOAD");
  startBot("🚀 Launching LARA...");
}, 70);