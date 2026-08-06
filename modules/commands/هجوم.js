module.exports.config = {
  name: "هجوم",
  version: "3.0.0",
  hasPermssion: 0,
  credits: "روريتا روريتا",
  description: "لعبة قتال شخصيات بنظام أدوار وأنمي",
  commandCategory: "العاب",
  cooldowns: 10
};

const characters = [
  {name:"السيف المشتعل", hp:180, power:40, speed:20, ability:"ضربة نارية"},
  {name:"ظل الليل", hp:120, power:55, speed:35, ability:"هجوم مزدوج"},
  {name:"الحارس الحجري", hp:250, power:25, speed:10, ability:"درع حجري"},
  {name:"الرامي الذهبي", hp:140, power:50, speed:30, ability:"سهم قاتل"},
  {name:"المرتل المظلم", hp:160, power:30, speed:40, ability:"إضعاف"},
  {name:"الساحر الأزرق", hp:110, power:60, speed:25, ability:"موجة سحرية"},
  {name:"الذئب الفضي", hp:170, power:45, speed:35, ability:"هجوم شرس"},
  {name:"المخالب الحديدية", hp:200, power:35, speed:20, ability:"نزيف"},
  {name:"عين الصقر", hp:150, power:45, speed:30, ability:"دقة قاتلة"},
  {name:"ملك العاصفة", hp:130, power:55, speed:30, ability:"صاعقة"}
];

const START_HP = 5000;
const MAX_PLAYERS = 4;
const JOIN_TIME = 50 * 1000;

global.attackGames = global.attackGames || {};

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function animeHitEffect() {
  const effects = [
    "🔥⚡🌪️ انفجار طاقة يهز الساحة!",
    "⚡💥🌪️ اندفاع بسرعة خارقة يشق الهواء!",
    "🔥💫⚔️ هالة قوة تتفجر حول المقاتل!",
    "⚡🌪️💥 ضربة أنمي مجنونة تترك أثر طاقة!",
    "🔥⚡💫 موجة طاقة عنيفة تضرب الخصم!"
  ];
  return effects[rand(0, effects.length - 1)];
}

function animeDefEffect() {
  const effects = [
    "🛡️🌪️⚡ درع طاقة يتشكل أمامه!",
    "🛡️🔥💫 هالة دفاعية تمتص الضربة القادمة!",
    "🛡️⚡🌌 جدار طاقة يحمي الجسد!"
  ];
  return effects[rand(0, effects.length - 1)];
}

function animeHealEffect() {
  const effects = [
    "✨💫🌟 طاقة شفاء تتدفق في الجسد!",
    "💫🌸✨ هالة نور تعيد بعض القوة!",
    "🌟💫✨ موجة شفاء أنمية تلمع حوله!"
  ];
  return effects[rand(0, effects.length - 1)];
}

function animeAbilityEffect() {
  const effects = [
    "🔥⚡💥 تقنية خاصة تنفجر بقوة مجنونة!",
    "⚡🌪️💫 هجوم أنمي خارق يمزق الساحة!",
    "🔥💥🌌 قوة مخفية تنفجر في لحظة واحدة!"
  ];
  return effects[rand(0, effects.length - 1)];
}

function getAlivePlayers(game) {
  return game.players.filter(p => p.alive);
}

function nextTurnIndex(game) {
  const len = game.players.length;
  for (let i = 1; i <= len; i++) {
    const idx = (game.turnIndex + i) % len;
    if (game.players[idx].alive) return idx;
  }
  return game.turnIndex;
}

function getFirstTarget(game, currentId) {
  const alive = getAlivePlayers(game).filter(p => p.id !== currentId);
  if (alive.length === 0) return null;
  return alive[rand(0, alive.length - 1)];
}

function formatStats(game) {
  let txt = "📊 حالة اللاعبين:\n";
  for (const p of game.players) {
    txt += `• ${p.name} → ${p.hp} نقطة ${p.alive ? "" : "💀"}\n`;
  }
  return txt;
}

async function endGame(api, threadID, game) {
  const alive = getAlivePlayers(game);
  let body = "🏁🔥 انتهت المعركة الأنمية!\n\n";

  if (alive.length === 0) {
    body += "😵 الجميع سقطوا في ساحة القتال!\n";
  } else if (alive.length === 1) {
    const winner = alive[0];
    body += `🏆 الفائز الأخير الباقي واقف:\n✨ ${winner.name} ✨\n\n`;
  } else {
    body += "⚠️ انتهت المعركة بدون فائز واضح.\n";
  }

  body += "\n" + formatStats(game);
  body += "\n\n✨ تطوير روريتا روريتا ✨";

  await api.sendMessage(body, threadID);
  delete global.attackGames[threadID];
}

function sendTurnMenu(api, threadID) {
  const game = global.attackGames[threadID];
  if (!game || !game.started) return;

  const alive = getAlivePlayers(game);
  if (alive.length <= 1) {
    endGame(api, threadID, game);
    return;
  }

  game.turnIndex = nextTurnIndex(game);
  const current = game.players[game.turnIndex];

  const msg =
`🎮 دور اللاعب: ${current.name}

${formatStats(game)}

اختر حركتك بالرد برقم:
1 • هجوم خفيف (ضرر 10–25)
2 • هجوم متوسط (ضرر 20–40)
3 • هجوم قوي (ضرر 30–50 مع ارتداد 10–20)
4 • دفاع (تقليل الضربة القادمة للنصف)
5 • قدرة خاصة (ضرر 40–60 – تبريد 3 أدوار)
6 • شفاء (+10 إلى +50 نقطة)`;

  api.sendMessage(msg, threadID, (err, info) => {
    if (err) return;
    game.lastTurnMsg = info.messageID;
    global.client.handleReply.push({
      name: module.exports.config.name,
      type: "turn",
      threadID,
      messageID: info.messageID,
      playerId: current.id
    });
  });
}

function startBattle(api, threadID) {
  const game = global.attackGames[threadID];
  if (!game) return;

  const players = game.players;
  if (players.length < 2) {
    api.sendMessage("⚠️ ما في عدد كافي من اللاعبين لبدء المعركة (لازم 2 على الأقل).", threadID);
    delete global.attackGames[threadID];
    return;
  }

  game.started = true;
  if (game.joinTimeout) {
    clearTimeout(game.joinTimeout);
    game.joinTimeout = null;
  }

  let intro = "🔥⚔️ بدأت معركة أنمي أسطورية!\n\n";
  intro += "👥 المشاركون:\n";
  players.forEach((p, i) => {
    intro += `${i + 1} • ${p.name} (${p.char.name}) – نقاط: ${p.hp}\n`;
  });
  intro += "\nالنظام: الكل ضد الكل (FFA)\nآخر واحد يبقى واقف هو الفائز!\n";

  api.sendMessage(intro, threadID, () => {
    sendTurnMenu(api, threadID);
  });
}

module.exports.run = async function ({ api, event, Users }) {
  const { threadID, senderID, messageID } = event;

  if (!global.attackGames[threadID]) {
    global.attackGames[threadID] = {
      players: [],
      started: false,

      // ✔✔✔ التعديل الوحيد
      turnIndex: -1,

      joinTimeout: null,
      lastTurnMsg: null
    };
  }

  const game = global.attackGames[threadID];

  if (game.started) {
    return api.sendMessage("⚠️ في معركة شغالة حالياً في هذا الجروب.", threadID, messageID);
  }

  if (game.players.length >= MAX_PLAYERS) {
    return api.sendMessage("⚠️ تم الوصول للحد الأقصى من اللاعبين (4).", threadID, messageID);
  }

  const charList =
`╭──〔 الشخصيات 〕──╮
1 • السيف المشتعل
2 • ظل الليل
3 • الحارس الحجري
4 • الرامي الذهبي
5 • المرتل المظلم
6 • الساحر الأزرق
7 • الذئب الفضي
8 • المخالب الحديدية
9 • عين الصقر
10 • ملك العاصفة
╰──────────────╯`;

  const intro =
`⚔️🔥 ساحة قتال أنمي فُتحت الآن! 🔥⚔️

أول ${MAX_PLAYERS} لاعبين يردّون برقم شخصية يدخلون المعركة.
الوقت المتاح للانضمام: 50 ثانية ⏳

${charList}

↯ رد برقم الشخصية للانضمام.`;

  api.sendMessage(intro, threadID, async (err, info) => {
    if (err) return;

    global.client.handleReply.push({
      name: module.exports.config.name,
      type: "join",
      messageID: info.messageID,
      threadID
    });

    if (!game.joinTimeout) {
      game.joinTimeout = setTimeout(() => {
        const g = global.attackGames[threadID];
        if (!g || g.started) return;
        startBattle(api, threadID);
      }, JOIN_TIME);
    }

    try {
      const userData = await Users.getData(senderID);
      const already = game.players.find(p => p.id === senderID);
      if (!already && game.players.length < MAX_PLAYERS) {
        const randomChar = characters[rand(0, characters.length - 1)];
        game.players.push({
          id: senderID,
          name: userData.name || "لاعب",
          char: randomChar,
          hp: START_HP,
          alive: true,
          shield: false,
          abilityCD: 0
        });
        api.sendMessage(
          `✅ ${userData.name} انضم تلقائياً للمعركة بشخصية: ${randomChar.name} (نقاط: ${START_HP})`,
          threadID
        );
      }
    } catch (e) {}
  }, messageID);
};

module.exports.handleReply = async function ({ api, event, handleReply, Users }) {
  const { threadID, senderID, body, messageID } = event;
  const game = global.attackGames[threadID];
  if (!game) return;

  if (handleReply.name !== module.exports.config.name) return;

  // الانضمام
  if (handleReply.type === "join") {
    if (game.started) return;

    const choice = parseInt(body);
    if (isNaN(choice) || choice < 1 || choice > 10) {
      return api.sendMessage("❌ اختر رقم من 1 إلى 10 للانضمام.", threadID, messageID);
    }

    if (game.players.find(p => p.id === senderID)) {
      return api.sendMessage("⚠️ أنت بالفعل منضم للمعركة.", threadID, messageID);
    }

    if (game.players.length >= MAX_PLAYERS) {
      return api.sendMessage("⚠️ تم الوصول للحد الأقصى من اللاعبين (4).", threadID, messageID);
    }

    const char = characters[choice - 1];
    const userData = await Users.getData(senderID);

    game.players.push({
      id: senderID,
      name: userData.name || "لاعب",
      char,
      hp: START_HP,
      alive: true,
      shield: false,
      abilityCD: 0
    });

    api.sendMessage(
      `✅ ${userData.name} انضم للمعركة بشخصية: ${char.name} (نقاط: ${START_HP})`,
      threadID
    );

    if (game.players.length >= MAX_PLAYERS) {
      startBattle(api, threadID);
    }

    return;
  }

  // الأدوار
  if (handleReply.type === "turn") {
    if (!game.started) return;

    const current = game.players[game.turnIndex];
    if (!current || !current.alive) return;

    if (senderID !== current.id) {
      return api.sendMessage("⚠️ هذا ليس دورك.", threadID, messageID);
    }

    const choice = parseInt(body);
    if (isNaN(choice) || choice < 1 || choice > 6) {
      return api.sendMessage("❌ اختر رقم من 1 إلى 6.", threadID, messageID);
    }

    let log = "";
    let target = null;

    // تبريد القدرة
    for (const p of game.players) {
      if (p.abilityCD && p.abilityCD > 0) {
        p.abilityCD--;
      }
    }

    switch (choice) {
      case 1: {
        target = getFirstTarget(game, current.id);
        if (!target) break;
        let dmg = rand(10, 25);
        if (target.shield) {
          dmg = Math.floor(dmg / 2);
          target.shield = false;
          log += "🛡️ دفاع الخصم قلل الضرر للنصف!\n";
        }
        target.hp -= dmg;
        if (target.hp <= 0) {
          target.hp = 0;
          target.alive = false;
        }
        log += `${animeHitEffect()}\n⚔️ هجوم خفيف من ${current.name} على ${target.name} (-${dmg})\n`;
        break;
      }

      case 2: {
        target = getFirstTarget(game, current.id);
        if (!target) break;
        let dmg = rand(20, 40);
        if (target.shield) {
          dmg = Math.floor(dmg / 2);
          target.shield = false;
          log += "🛡️ دفاع الخصم قلل الضرر للنصف!\n";
        }
        target.hp -= dmg;
        if (target.hp <= 0) {
          target.hp = 0;
          target.alive = false;
        }
        log += `${animeHitEffect()}\n⚔️ هجوم متوسط من ${current.name} على ${target.name} (-${dmg})\n`;
        break;
      }

      case 3: {
        target = getFirstTarget(game, current.id);
        if (!target) break;
        let dmg = rand(30, 50);
        let selfDmg = rand(10, 20);
        if (target.shield) {
          dmg = Math.floor(dmg / 2);
          target.shield = false;
          log += "🛡️ دفاع الخصم قلل الضرر للنصف!\n";
        }
        target.hp -= dmg;
        if (target.hp <= 0) {
          target.hp = 0;
          target.alive = false;
        }
        current.hp -= selfDmg;
        if (current.hp <= 0) {
          current.hp = 0;
          current.alive = false;
        }
        log += `${animeHitEffect()}\n💥 هجوم قوي من ${current.name} على ${target.name} (-${dmg})\n`;
        log += `⚠️ ارتداد الضرر على ${current.name} (-${selfDmg})\n`;
        break;
      }

      case 4: {
        current.shield = true;
        log += `${animeDefEffect()}\n🛡️ ${current.name} دخل في وضع الدفاع.\n`;
        break;
      }

      case 5: {
        if (current.abilityCD && current.abilityCD > 0) {
          return api.sendMessage("⚠️ قدرتك الخاصة ليست جاهزة بعد.", threadID, messageID);
        }
        target = getFirstTarget(game, current.id);
        if (!target) break;
        let dmg = rand(40, 60);
        if (target.shield) {
          dmg = Math.floor(dmg / 2);
          target.shield = false;
          log += "🛡️ دفاع الخصم قلل الضرر للنصف!\n";
        }
        target.hp -= dmg;
        if (target.hp <= 0) {
          target.hp = 0;
          target.alive = false;
        }
        current.abilityCD = 3;
        log += `${animeAbilityEffect()}\n✨ قدرة خاصة من ${current.name} على ${target.name} (-${dmg})\n`;
        break;
      }

      case 6: {
        const heal = rand(10, 50);
        const before = current.hp;
        current.hp = Math.min(START_HP, current.hp + heal);
        const realHeal = current.hp - before;
        log += `${animeHealEffect()}\n💚 ${current.name} استعاد ${realHeal} نقطة.\n`;
        break;
      }
    }

    const alive = getAlivePlayers(game);
    if (alive.length <= 1) {
      log += "\n" + formatStats(game);
      await api.sendMessage(log, threadID);
      await endGame(api, threadID, game);
      return;
    }

    game.turnIndex = nextTurnIndex(game);

    api.sendMessage(log, threadID, () => {
      sendTurnMenu(api, threadID);
    });
  }
};
