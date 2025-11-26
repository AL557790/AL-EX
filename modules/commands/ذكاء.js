const axios = require('axios');

module.exports.config = {
    name: "نيرو",
    version: "2025.11.26-session",
    hasPermssion: 0,
    credits: "𝐘-𝐀𝐍𝐁𝐔 + Session Generator",
    description: "نيرو",
    commandCategory: "دردشة مع نيرو",
    usages: "[نص]",
    cooldowns: 5
};

async function generateSession() {
    const origin = "https://cht18.aichatosclx.com";
    const userAgent = "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Mobile Safari/537.36";
    
    const session = axios.create({
        baseURL: origin,
        headers: {
            "User-Agent": userAgent,
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
            "Accept-Language": "ar-DZ,ar;q=0.9,en-US;q=0.8,en;q=0.7",
            "Accept-Encoding": "gzip, deflate, br",
            "Sec-Ch-Ua": '"Not/A)Brand";v="8", "Chromium";v="132"',
            "Sec-Ch-Ua-Mobile": "?1",
            "Sec-Ch-Ua-Platform": '"Android"',
            "Sec-Fetch-Dest": "document",
            "Sec-Fetch-Mode": "navigate",
            "Sec-Fetch-Site": "none",
            "Sec-Fetch-User": "?1",
            "Upgrade-Insecure-Requests": "1"
        }
    });

    try {
        // خطوة 1: GET للموقع عشان جلسة (cookies/tokens)
        await session.get('/');

        // خطوة 2: OPTIONS request للـ API عشان CORS (زي الصور)
        const apiUrl = "https://api.binjie.fun/api/generateStream";
        const refer = "4jRDc3eWxBqwN2bDBADr12";  // الـ refer الجديد من الصور
        const optionsUrl = `\( {apiUrl}?refer__1360= \){refer}`;
        
        await axios.options(optionsUrl, {
            headers: {
                "Origin": origin,
                "User-Agent": userAgent,
                "Access-Control-Request-Method": "POST",
                "Access-Control-Request-Headers": "content-type",
                "Sec-Fetch-Mode": "cors",
                "Sec-Fetch-Site": "cross-site"
            }
        });

        // خطوة 3: توليد userId ديناميكي (بناءً على timestamp، زي الصور)
        const timestamp = Date.now().toString().slice(-10);  // يولد رقم عشوائي/زمني
        const userId = `#/chat/${timestamp}`;

        console.log(`جلسة مولدة: userId=\( {userId}, refer= \){refer}`);

        return { userId, refer, session };  // session للـ cookies إذا احتجنا
    } catch (error) {
        console.error("خطأ في توليد الجلسة:", error.message);
        throw new Error("فشل في إنشاء الجلسة، جرب بعد دقيقة.");
    }
}

async function sendRequest(prompt) {
    let userId, refer;
    try {
        const sessionData = await generateSession();
        userId = sessionData.userId;
        refer = sessionData.refer;
    } catch (error) {
        throw error;
    }

    const data = {
        prompt: prompt,
        userId: userId,  // الـ userId الديناميكي
        network: true,
        system: "",
        withoutContext: false,
        stream: false
    };

    const headers = {
        "Content-Type": "application/json",
        "Accept": "application/json, text/plain, */*",
        "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Mobile Safari/537.36",
        "Origin": "https://cht18.aichatosclx.com",
        "Referer": "https://cht18.aichatosclx.com/",
        "Accept-Encoding": "gzip, deflate, br",
        "Accept-Language": "ar-DZ,ar;q=0.9,en-US;q=0.8,en;q=0.7",
        "Sec-Ch-Ua": '"Not/A)Brand";v="8", "Chromium";v="132"',
        "Sec-Ch-Ua-Mobile": "?1",
        "Sec-Ch-Ua-Platform": '"Android"',
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "cross-site"
    };

    const url = `https://api.binjie.fun/api/generateStream?refer__1360=${refer}`;

    try {
        const response = await axios.post(url, data, { headers });
        console.log("URL المستخدمة:", url);  // عشان تحدثها لو وقفت
        console.log("Response status:", response.status);

        let answer = "";
        if (response.data && response.data.text) {
            answer = response.data.text;
        } else if (response.data && typeof response.data === 'string') {
            answer = response.data;
        } else if (response.data.choices && response.data.choices[0]) {
            answer = response.data.choices[0].text || response.data.choices[0].message?.content || "";
        }

        return answer || response.data || "ما فهمت الرد، كرر السؤال.";
    } catch (error) {
        console.error("Error details:", error.response?.status, error.response?.data || error.message);
        throw new Error("حدث خطأ أثناء التواصل مع API: " + (error.response?.status || error.message));
    }
}

module.exports.run = async ({ api, event, args }) => {
    const { threadID: tid, messageID: mid } = event;
    const promptText = args.join(" ");

    if (!promptText) {
        return api.sendMessage("اكتب السؤال أو النص الذي تريد إرساله إلى نيرو.", tid, mid);
    }

    api.sendMessage("🟡 نيرو يفكر... (جاري إنشاء جلسة جديدة)", tid, mid);

    try {
        const response = await sendRequest(promptText);
        return api.sendMessage(`🤖 رد نيرو: ${response}`, tid, mid);
    } catch (error) {
        return api.sendMessage(`خطأ: ${error.message}\n\nجرب أرسل سؤال جديد، أو شوف console للـ URL الجديد.`, tid, mid);
    }
};