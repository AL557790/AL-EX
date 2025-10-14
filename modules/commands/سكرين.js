const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const https = require("https");

// 🧠 تأكد أن المكتبات الضرورية مثبتة فقط مرة واحدة
function ensureDependencies(modules) {
  const cacheDir = path.join(__dirname, "cache");
  const flag = path.join(cacheDir, ".deps_installed");
  if (fs.existsSync(flag)) return;

  if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);
  console.log("🔍 Checking modules...");

  for (const mod of modules) {
    try {
      require.resolve(mod);
    } catch {
      console.log(`📦 Installing ${mod}...`);
      execSync(`npm install ${mod}`, { stdio: "inherit" });
    }
  }

  fs.writeFileSync(flag, "installed");
  console.log("✅ Dependencies ready!");
}

ensureDependencies(["fs-extra", "url"]);

const fse = require("fs-extra");
const url = require("url");

module.exports.config = {
  name: "سكرين",
  version: "2.0.0",
  hasPermssion: 0,
  credits: "مصطفى (تحديث عن عمر)",
  description: "التقاط سكرين شوت للمواقع والتحقق من أمانها 🔍",
  commandCategory: "خدمات",
  cooldowns: 5,
};

const pornListPath = path.join(__dirname, "cache", "pornlist.txt");

// 🧩 دالة لتحميل الملف مرة واحدة فقط
async function downloadBlockList() {
  if (fse.existsSync(pornListPath)) return;
  console.log("⬇️ Downloading block list...");
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(pornListPath);
    https.get(
      "https://raw.githubusercontent.com/blocklistproject/Lists/master/porn.txt",
      (res) => {
        res.pipe(file);
        file.on("finish", () => {
          file.close();
          console.log("✅ Block list downloaded!");
          resolve();
        });
      }
    ).on("error", (err) => {
      console.error("❌ Error downloading list:", err);
      reject(err);
    });
  });
}

// 🧩 تحميل اللائحة عند التشغيل
module.exports.onLoad = async () => {
  await downloadBlockList();
};

// 🧩 تنفيذ الأمر
module.exports.run = async ({ event, api, args }) => {
  if (!args[0]) {
    return api.sendMessage(
      "⚠️ استخدم الأمر مع رابط، مثل:\nسكرين https://example.com",
      event.threadID,
      event.messageID
    );
  }

  await downloadBlockList();
  const list = fs
    .readFileSync(pornListPath, "utf-8")
    .split("\n")
    .filter((l) => l && !l.startsWith("#"))
    .map((l) => l.replace(/^0\.0\.0\.0\s+/, "").trim());

  const parsed = url.parse(args[0]);
  const host = parsed.host?.replace(/^www\./, "");

  if (list.includes(host)) {
    return api.sendMessage(
      "🚫 الموقع الذي أدخلته غير آمن (موقع إباحي أو محظور)",
      event.threadID,
      event.messageID
    );
  }

  // 🖼️ جلب صورة الموقع
  const outputPath = path.join(__dirname, "cache", `${event.senderID}.png`);
  const siteURL = `https://image.thum.io/get/width/1920/crop/400/fullpage/noanimate/${args[0]}`;

  const file = fs.createWriteStream(outputPath);
  https
    .get(siteURL, (res) => {
      res.pipe(file);
      file.on("finish", () => {
        file.close(() => {
          api.sendMessage(
            {
              body: `📸 لقطة شاشة من: ${args[0]}`,
              attachment: fs.createReadStream(outputPath),
            },
            event.threadID,
            () => fs.unlinkSync(outputPath),
            event.messageID
          );
        });
      });
    })
    .on("error", () => {
      api.sendMessage(
        "❌ فشل في التقاط سكرين — تأكد من أن الرابط صحيح ويبدأ بـ https://",
        event.threadID,
        event.messageID
      );
    });
};