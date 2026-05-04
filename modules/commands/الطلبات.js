const fs = require("fs-extra");
const path = require("path");

// مسار تخزين القائمة السوداء
const blacklistPath = path.join(__dirname, "cache", "blacklist.json");

module.exports.config = {
  name: "الطلبات",
  version: "4.5.0",
  credits: "ᎠᎯᏁᎢᎬ ᏚᎮᎯᏒᎠᎯ",
  hasPermssion: 2,
  description: "إدارة طلبات الانضمام والقائمة السوداء للمطور",
  commandCategory: "المطور",
  usages: "[u/t/a/احصائيات/فحص]",
  cooldowns: 5
};

function getBlacklist() {
  if (!fs.existsSync(blacklistPath)) fs.writeJsonSync(blacklistPath, []);
  return fs.readJsonSync(blacklistPath);
}

module.exports.handleReply = async function({ api, event, handleReply }) {
  const developerID = "100081948980908";
  if (String(event.senderID) !== developerID) return;
  const { body, threadID, messageID } = event;

  if (body.toLowerCase().startsWith("رفض") || body.toLowerCase().startsWith("حظر")) {
    const isBan = body.toLowerCase().startsWith("حظر");
    const index = body.replace(/رفض|حظر/g, "").trim().split(/\s+/);
    let bl = getBlacklist();

    for (const i of index) {
      const target = handleReply.pending[i - 1];
      if (!target) continue;
      await api.sendMessage(`⚠️ نعتذر، تم رفض طلبكم ${isBan ? "وحظر المجموعة" : ""} بواسطة المطور.`, target.threadID);
      if (isBan) {
        bl.push(target.threadID);
        fs.writeJsonSync(blacklistPath, bl);
      }
      api.removeUserFromGroup(api.getCurrentUserID(), target.threadID);
    }
    return api.sendMessage(`✅ تم تنفيذ ${isBan ? "الحظر" : "الرفض"} لعدد (${index.length}) طلبات.`, threadID, messageID);
  } else {
    const index = body.split(/\s+/);
    for (const i of index) {
      const target = handleReply.pending[i - 1];
      if (!target) continue;
      api.unsendMessage(handleReply.messageID);
      api.changeNickname(`[ ${(!global.config.BOTNAME) ? "ᎠᎯᏁᎢᎬ ᏚᎮᎯᏒᎠᎯ BOT" : global.config.BOTNAME} ]`, target.threadID, api.getCurrentUserID());
      api.sendMessage({
        body: `⚔️ تـم تـفـعـيـل الـنـظـام بـنـجـاح!\n━━━━━━━━━━━━━━━━━━\n👑 الـمـطـور: ᎠᎯᏁᎢᎬ ᏚᎮᎯᏒᎠᎯ\n🔥 الـحـالـة: نـشـط الآن\n📝 الـتـعـلـيـمات: اكـتب (الاوامر) لـلبدء\n━━━━━━━━━━━━━━━━━━\n✅ اسـتـمـتـع بـالخـدمـة الـمـقـدمـة لـك.`
      }, target.threadID);
    }
    return api.sendMessage(`✅ تم تفعيل البوت في المجموعات المختارة.`, threadID, messageID);
  }
};

module.exports.run = async function({ api, event, args }) {
  const developerID = "61581906898524";
  if (event.senderID !== developerID) return api.sendMessage("❌ هـذا الأمر مـقـدس لـلمطور ᎠᎯᏁᎢᎬ ᏚᎮᎯᏒᎠᎯ فـقـط.", event.threadID, event.messageID);

  if (args[0] === "احصائيات") {
    const all = await api.getThreadList(100, null, ["INBOX"]);
    const pending = await api.getThreadList(100, null, ["PENDING", "OTHER"]);
    return api.sendMessage(`🏰 إحـصائـيات ᎠᎯᏁᎢᎬ ᏚᎮᎯᏒᎠᎯ:\n━━━━━━━━━━━━━\n🟢 مـفعلة: ${all.length}\n⏳ قـيد الإنـتظار: ${pending.length}\n🚫 الـحظر: ${getBlacklist().length}`, event.threadID);
  }

  try {
    const spam = await api.getThreadList(100, null, ["OTHER"]) || [];
    const pending = await api.getThreadList(100, null, ["PENDING"]) || [];
    let list = [...spam, ...pending];
    if (args[0] === "u") list = list.filter(i => !i.isGroup);
    if (args[0] === "t") list = list.filter(i => i.isGroup);

    if (list.length === 0) return api.sendMessage("📭 القائمة فارغة حالياً.", event.threadID);

    let msg = `📥 طـلـبات الـتـحـكـم:\n━━━━━━━━━━━━━\n`;
    list.forEach((s, i) => msg += `[${i + 1}] 👤 ${s.name}\n🆔 ${s.threadID}\n\n`);
    msg += `━━━━━━━━━━━━━\n💡 رد بـرقم للقبول\n💡 رد بـ (رفض/حظر + رقم) لـلتعامل`;

    return api.sendMessage(msg, event.threadID, (err, info) => {
      global.client.handleReply.push({ name: this.config.name, messageID: info.messageID, author: event.senderID, pending: list });
    }, event.messageID);
  } catch (e) { return api.sendMessage("❌ فشل في جلب البيانات.", event.threadID); }
};
