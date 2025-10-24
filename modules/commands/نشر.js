module.exports = {
  name: "نشر_تلقائي",
  commandType: "system",
  execute: async ({ api }) => {
    try {
      const message = "“󰀀” blue thumbs up.";
      const threadID = "me";

      await api.sendMessage(message, threadID);
    } catch (err) {
      console.error(err);
    }
  },
};