const { exec } = require("child_process");
const os = require("os");
const fs = require("fs-extra");
const axios = require("axios");
const JavaScriptObfuscator = require('javascript-obfuscator');

module.exports.config = {
    name: "نظام",
    version: "17.5.0",
    hasPermssion: 2,
    credits: "100081948980908",
    description: "النواة الشاملة: إدارة الملفات، التشفير، تنفيذ الأوامر، وشرح AI مجاني",
    commandCategory: "المطور",
    usages: "[شرح/تشفير/تعديل/قراءة/تنفيذ/حالة/ملفات/إعادة]",
    cooldowns: 0
};

module.exports.run = async function ({ api, event, args }) {
    const { threadID, messageID, senderID } = event;
    const devID = "100081948980908";

    // 🛡️ نظام الحماية المتقدم - التحقق من هوية المطور
    if (senderID != devID) {
        return api.sendMessage("🚫 [SECURITY_ALERT]: محاولة وصول غير مصرح بها للنواة المركزية.\nتم تسجيل معرف المستخدم: " + senderID, threadID);
    }

    const action = args[0];
    const target = args[1];
    const query = args.slice(1).join(" ");

    // --- واجهة المستخدم الرسومية (Terminal UI) ---
    if (!action) {
        const dashboard = `
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
      SYSTEM OS V17.5 - ULTIMATE CORE
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
[ HOST: ${os.hostname()} | ARCH: ${os.arch()} ]
[ STATUS: ACTIVE | DEV: 61581906898524 ]

┌──  CORE COMMANDS LIST  ──┐
│
├─╼ شرح [كود]   : تحليل وتصحيح AI مجاني
├─╼ تشفير [مسار] : حماية الملفات من السرقة
├─╼ تعديل [مسار] : تحرير الكود البرمجي حياً
├─╼ قراءة [مسار] : عرض محتوى ملف معين
├─╼ تنفيذ [أمر]  : تشغيل أوامر Linux/Shell
├─╼ ملفات        : عرض شجرة مجلدات البوت
├─╼ حالة         : مراقبة الموارد (RAM/CPU)
├─╼ إعادة        : ريستارت كامل للنظام
│
└───────────────────────────┘
[ WAITING FOR SYSTEM INSTRUCTIONS... ]`.trim();
        return api.sendMessage(dashboard, threadID);
    }

    // --- 1. ميزة شرح الأكواد (Free AI Engine) ---
    if (action === "شرح") {
        if (!query || query.length < 10) return api.sendMessage("⚠️ [MISSING]: يرجى إدخال الكود البرمجي المراد شرحه.", threadID);
        api.sendMessage("📡 [AI_THINKING]: جاري الاتصال بخوادم Blackbox AI للتحليل...", threadID);
        try {
            const response = await axios.post("https://www.blackbox.ai/api/chat", {
                messages: [{ role: "user", content: `قم بشرح هذا الكود بالتفصيل ووضحه لي برمجياً واذكر أي ثغرات إن وجدت:\n${query}` }],
                id: "chat-v17",
                previewToken: null,
                userId: null,
                codeModelMode: true,
                agentMode: {},
                isFullText: true
            });
            let explanation = response.data.replace(/\$@\$.*?\$@\$/g, "").trim();
            return api.sendMessage(`📝 [AI CODE ANALYSIS]:\n\n${explanation}`, threadID);
        } catch (e) {
            return api.sendMessage("❌ [API_ERR]: تعذر الاتصال بمحرك الذكاء الاصطناعي المجاني.", threadID);
        }
    }

    // --- 2. ميزة التشفير القسري (Code Obfuscation) ---
    if (action === "تشفير") {
        if (!target) return api.sendMessage("⚠️ [MISSING]: حدد مسار الملف (مثل scripts/commands/test.js).", threadID);
        try {
            api.sendMessage("🔐 [ENCRYPTING]: جاري تطبيق طبقات الحماية والتشفير...", threadID);
            const code = fs.readFileSync(target, "utf8");
            const result = JavaScriptObfuscator.obfuscate(code, {
                compact: true, controlFlowFlattening: true, deadCodeInjection: true,
                debugProtection: true, selfDefending: true, stringArrayRotate: true
            }).getObfuscatedCode();
            fs.writeFileSync(target, result);
            return api.sendMessage(`✅ [SUCCESS]: تم تشفير الملف [${target}] وحمايته من السرقة بنجاح.`, threadID);
        } catch (e) { return api.sendMessage(`❌ [ERR]: فشل الوصول للملف. تأكد من المسار.`, threadID); }
    }

    // --- 3. إدارة الملفات (قراءة وتعديل) ---
    if (action === "قراءة") {
        if (!target) return api.sendMessage("⚠️ حدد الملف.", threadID);
        try {
            const data = fs.readFileSync(target, "utf8");
            return api.sendMessage(`📖 [FILE: ${target}]:\n\n${data.slice(0, 1800)}`, threadID);
        } catch (e) { return api.sendMessage("❌ لا يمكن قراءة الملف.", threadID); }
    }

    if (action === "تعديل") {
        const fileContent = args.slice(2).join(" ");
        if (!fileContent) return api.sendMessage("⚠️ لا يوجد محتوى جديد.", threadID);
        try {
            fs.writeFileSync(target, fileContent);
            return api.sendMessage(`📝 [UPDATED]: تم تحديث ملف [${target}] بنجاح.`, threadID);
        } catch (e) { return api.sendMessage("❌ فشل حفظ التعديلات.", threadID); }
    }

    // --- 4. أوامر النظام والشل (Terminal) ---
    if (action === "تنفيذ") {
        const cmd = args.slice(1).join(" ");
        if (!cmd) return api.sendMessage("⚠️ حدد أمر النظام للتنفيذ.", threadID);
        exec(cmd, (err, stdout, stderr) => {
            if (err) return api.sendMessage(`❌ [SHELL_ERR]:\n${err.message}`, threadID);
            return api.sendMessage(`💻 [TERMINAL]:\n${stdout || stderr}`, threadID);
        });
    }

    if (action === "ملفات") {
        exec("ls -F", (err, stdout) => {
            return api.sendMessage(`📂 [DIRECTORY TREE]:\n\n${stdout}`, threadID);
        });
    }

    // --- 5. مراقبة موارد الخادم (Status) ---
    if (action === "حالة") {
        const stats = `
╭─── [ 📊 SYSTEM MONITOR ]
│
├─╼ [📟] RAM: ${(os.freemem()/1024/1024).toFixed(0)}MB Free
├─╼ [🧠] CPU: ${os.cpus()[0].model.split(' ')[0]}
├─╼ [⏳] UP: ${(process.uptime()/60).toFixed(1)} Min
├─╼ [⚙️] NODE: ${process.version}
│
╰───────────────────────────╯`.trim();
        return api.sendMessage(stats, threadID);
    }

    // --- 6. إعادة التشغيل (Reboot) ---
    if (action === "إعادة") {
        await api.sendMessage("🔄 [SYSTEM_REBOOTING]: جاري إعادة تشغيل النواة والمكتبات...", threadID);
        process.exit(1);
    }
};
