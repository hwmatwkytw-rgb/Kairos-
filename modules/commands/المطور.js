/**
 * @تحسين وتطوير: ᏦᎪᏆᎬ ᏢᏌᎿᏟᏆ
 * @النسخة: V7.0.0 [ULTRA]
 * @الوصف: كود عرض معلومات المطور والبوت بتنسيق فخم
 */

export const config = {
    name: "المطور",
    version: "7.0.0",
    hasPermssion: 0,
    credits: "ᏦᎪᏆᎬ ᏢᏌᎿᏟᏆ",
    description:" عرض معلومات مطور  ڪايࢪوس",
    commandCategory: "النظام",
    usages: "",
    cooldowns: 5
};

export async function run({ api, event, Currencies }) {
    const { threadID, messageID } = event;

    // إعداد الرسالة بتنسيق الخطوط الرفيعة الذي اخترته
    const infoMessage = 
`  ┈ ┈ ┈ ┈ ┈ ┈ ┈ ┈ ┈ ┈ ┈ ┈ ┈ ┈ ┈ ┈ 
         ✧ ريوزاكي | Ryuzaki  ✧
  ┈ ┈ ┈ ┈ ┈ ┈ ┈ ┈ ┈ ┈ ┈ ┈ ┈ ┈ ┈ ┈ 

   𓏲 نـظـام الـتـشـغـيـل
   ⊹ الإصـدار: V7.0.0 [ULTRA]
   ⊹ الـبـريـفـكـس: /
   ⊹ الـخـوادم: نشط في المجموعات

   𓏲 الـعـقـل الـمـدبـر
   ⊹ الـمـصـمم: ᏦᎪᏆᎬ ᏢᏌᎿᏟᏆ
   فـيـسـبـوكـعـمـر: 17 عاماً
   ⊹ الـمـكـانـة: الـقـائـد الأعلى

   𓏲 الـتـواصـل الـرسـمانـسـتـقـرا 
   مـتـقـرام:
   
   ⊹ فيسبوك
 
   
 : "https://www.facebook.com/profile.php?id=",

  — — — — — — — — — — — — — — — — 
         {Ryuzaki:السيادةالمطلقة} 

    // إرسال الرسالةةةةةرسال الرسالة الرسالةةةـلـة 』`;

   

    // إرسال الرسالة مع صورة المطور إذا أردت (يمكنك وضع رابط صورتك هنا)
    return api.sendMessage({
        body: infoMessage,
    }, threadID, messageID);
}
