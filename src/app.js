const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const path = require("path");

const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http);

const port = process.env.PORT || 3000;

http.listen(port, () => {
  console.log(`Server is up at port ${port}`);
});

/*
if (process.env.NODE_ENV === "production") {
  app.use(express.static("client/public"));
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "client", "public", "index.html"));
  });
}
*/

app.use(bodyParser.json());

app.use(cors());

const test = require("./routes/api/test");
app.use("/api/test", test);

app.get("/", (req, res, next) => {
  res.send(`<a href="https://76xzn-5000.sse.codesandbox.io/">Client</a>`);
});

// -----

const slots = ["weapon", "head", "chest", "hands", "legs", "feet"];
const rarities = ["common", "uncommon", "rare", "epic"];
const bonusList = ["strength", "agility", "intelligence"];
const gearNames = {
  weapon: ["Longsword", "Rapier", "Hand Axe", "Mace", "Greatsword", "Pike"],
  head: ["Cap", "Coif", "Barbute", "Great Helm"],
  chest: ["Vest", "Jacket", "Hauberk", "Cuirass", "Breastplate"],
  hands: ["Gloves", "Gauntlets"],
  legs: ["Pants", "Leggings", "Greaves"],
  feet: ["Boots", "Sabatons"]
};
const mobList = {
  rat: { id: "rat", name: "Rat", level: 1, boss: false },
  wolf: { id: "wolf", name: "Wolf", level: 2, boss: false },
  cutpurse: { id: "cutpurse", name: "Cutpurse", level: 3, boss: false },
  bandit: { id: "bandit", name: "Bandit", level: 4, boss: false },
  sorceror: { id: "sorceror", name: "Sorceror", level: 5, boss: false },
  skeleton: { id: "skeleton", name: "Skeleton", level: 6, boss: false },
  ghost: { id: "ghost", name: "Ghost", level: 7, boss: false },
  giant: { id: "giant", name: "Giant", level: 8, boss: false },
  golem: { id: "golem", name: "Golem", level: 9, boss: false },
  babydragon: { id: "babydragon", name: "Baby Dragon", level: 10, boss: false },
  golestandt: { id: "golestandt", name: "Golestandt", level: 10, boss: true }
};

class PlayerCharacter {
  constructor(name, level, health) {
    this.name = name;
    this.level = level;
    this.health = health;
  }
}

class MobCharacter {
  constructor(mobListID, name, level, health, maxHealth, damage, boss = false) {
    this.mobListID = mobListID; // string
    this.name = name; // string
    this.level = level; // number
    this.health = health; // number
    this.maxHealth = maxHealth; // number
    this.damage = damage; // number
    this.boss = boss; // boolean
  }
}

class Player {
  constructor(id) {
    this.id = id;
    this.name = "Player";
    this.level = 1;
    this.xp = 0;
    this.gold = 0;
    this.health = 10;
    this.maxHealth = 10;
    this.mana = 10;
    this.maxMana = 10;
    this.inventory = [];
    this.gear = {
      weapon: false,
      head: false,
      chest: false,
      hands: false,
      legs: false,
      feet: false
    };

    this.baseStats = {
      strength: 1,
      agility: 1,
      intelligence: 1,
      unspent: 0,
      damage: 0,
      armor: 0
    };

    this.gearStats = {
      strength: 0,
      agility: 0,
      intelligence: 0,
      damage: 0,
      armor: 0
    };

    this.totalStats = {
      strength: 1,
      agility: 1,
      intelligence: 1,
      damage: 0,
      armor: 0
    };
  }
}

// Gear & Bonuses

class Gear {
  constructor(
    slot = "head",
    level = 0,
    rarity = "common",
    name = "Gear",
    bonuses = []
  ) {
    this.slot = slot; // string
    this.level = level; // number
    this.rarity = rarity; // string
    this.name = name; // string
    this.bonuses = bonuses; // array
  }
}

class BonusOnGear {
  constructor(attr, attrAmount) {
    this.attr = attr; // string
    this.attrAmount = attrAmount; // number
  }
}

// -----

let players = {};
let party = {};
let mobs = {};
let autospawn = true;

mobs["a"] = new MobCharacter("rat", "Rat", 1, 2, 2, 1);

io.on("connection", (socket) => {
  console.log("Player connected. ID: " + socket.id);

  // add player
  let newPlayer = new Player(socket.id);
  players[socket.id] = newPlayer;
  party[socket.id] = null; // syncParty() will populate

  // full sync
  syncParty(party, players);
  syncMobs(mobs);
  syncPlayer(players[socket.id]);
  socket.emit("moblist update", mobList);

  console.log("Players connected: " + Object.keys(party).length);

  socket.on("attack", () => {
    playerAttackMob(players[socket.id], mobs["a"]);

    socket.emit("attack return");
  });

  socket.on("player spend attribute", (spendAttrChoice) => {
    playerSpendAttr(players[socket.id], spendAttrChoice);
    syncPlayer(players[socket.id]);
  });

  socket.on("engage", (mobID) => {
    spawnMob(mobList[mobID]);
    io.emit("mobs update", mobs);
  });

  socket.on("autospawn update", (autospawnUpdated) => {
    autospawn = autospawnUpdated;
    socket.broadcast.emit("autospawn update", autospawn);
  });

  socket.on("player equip item", (inventoryID) => {
    playerEquipGear(players[socket.id], inventoryID);
    syncPlayer(players[socket.id]);
  });

  socket.on("player change name", (name) => {
    players[socket.id]["name"] = name;
    syncParty(party, players);
    syncPlayer(players[socket.id]);
  });

  socket.on("disconnect", () => {
    console.log("Player disconnected. ID: " + socket.id);
    delete party[socket.id];
    io.emit("party update", party);
  });
});

const spawnMob = (mob) => {
  let mobListID = mob.id;
  let name = mob.name;
  let level = mob.level;
  let maxHealth = 0;
  let damage = 0;

  if (mob.boss) {
    maxHealth = mob.level * 30;
    damage = mob.level * 2;
  } else {
    maxHealth = mob.level * 10;
    damage = mob.level;
  }

  let health = maxHealth;
  let boss = mob.boss;

  mobs["a"] = new MobCharacter(
    mobListID,
    name,
    level,
    health,
    maxHealth,
    damage,
    boss
  );

  io.emit("mobs update", mobs);
};

const playerAttackMob = (player, mob) => {
  if (mob.health === 0) {
    console.log("Mob already dead.");
    return;
  }

  let damage = player.totalStats.strength + player.totalStats.damage;

  mob.health -= damage;

  // sync attack
  io.emit("player attack mob", { playerID: player.id, mobID: 0 });
  io.emit(
    "gamelog message",
    `${player.name} attacks ${mob.name} for ${damage} damage.`
  );

  if (mob.health <= 0) {
    mob.health = 0;

    io.emit("gamelog message", `${mob.name} dies.`);

    grantXPFromMob(mob, party);
    grantLootFromMob(mob, party);

    let anyMobAlive = false;
    for (let iMob in mobs) {
      if (!anyMobAlive && iMob.health > 0) {
        anyMobAlive = true;
      }
    }

    if (!anyMobAlive) {
      console.log("All mobs are dead.");
    }

    // respawn mob?
    if (autospawn) {
      setTimeout(spawnMob, 1000, mobList[mob.mobListID]);
    }
  }

  // sync mob
  io.emit("mobs update", mobs);
};

const mobAttackPlayer = (mob, player) => {
  if (mob.health === 0 || !player) {
    return false;
  }

  let rawDamage = mob.damage;
  let mitigatedDamage = 0;
  let finalDamage = 0;

  let mitigationMulti =
    player.totalStats.armor / (player.totalStats.armor + player.level * 5);

  mitigatedDamage = Math.floor(rawDamage * mitigationMulti);

  finalDamage = rawDamage - mitigatedDamage;

  player.health -= finalDamage;

  if (player.health <= 0) {
    player.health = 0;
  }

  io.emit(
    "gamelog message",
    `${mob.name} attacks ${player.name} for ${finalDamage} damage.`
  );

  syncParty(party, players);
};

const grantXPFromMob = (mob, party) => {
  let xp = 2;

  for (const id in party) {
    players[id]["xp"] += xp;

    io.to(id).emit("gamelog message", `You receive ${xp} experience.`);

    if (players[id]["xp"] >= players[id]["level"] * 10) {
      players[id]["level"]++;
      players[id]["baseStats"]["unspent"]++;
      players[id]["maxHealth"] += 5;
      players[id]["health"] = players[id]["maxHealth"];

      io.to(id).emit(
        "gamelog message",
        `You are now level ${players[id]["level"]}!`
      );
      syncParty(party, players);
    }

    io.to(id).emit("player update", players[id]);
  }
};

const grantLootFromMob = (mob, party) => {
  // each party member has a chance at individual loot
  for (const id in party) {
    // drop loot?
    if (Math.random() < 0.3) {
      let level = mob.level;
      let slot = slots[Math.floor(Math.random() * slots.length)];
      let name =
        gearNames[slot][Math.floor(Math.random() * gearNames[slot].length)];
      let damage = 0;
      let damageMulti = 1; // determined by rarity
      let armor = 0;
      let armorMulti = 1; // determined by rarity
      let rarity;
      let bonuses = [];

      // rarity
      let rarityRoll = Math.random();
      if (rarityRoll < 0.01) {
        rarity = "epic";
        damageMulti = 1.6;
        armorMulti = 1.6;
      } else if (rarityRoll < 0.05) {
        rarity = "rare";
        damageMulti = 1.4;
        armorMulti = 1.4;
      } else if (rarityRoll < 0.25) {
        rarity = "uncommon";
        damageMulti = 1.2;
        armorMulti = 1.2;
      } else {
        rarity = "common";
      }

      // base bonus (e.g. damage or armor)
      if (slot === "weapon") {
        damage = Math.floor(level * damageMulti);
        bonuses.push(new BonusOnGear("damage", damage));
      } else {
        // armor
        armor = Math.floor(level * armorMulti);
        bonuses.push(new BonusOnGear("armor", armor));
      }

      // additional bonuses (e.g. str, agi, int)
      let additionalBonus = generateBonusOnGear(level, rarity);
      if (additionalBonus) {
        bonuses.push(additionalBonus);
      }

      let item = new Gear(slot, level, rarity, name, bonuses);

      // place item in player's inventory
      players[id]["inventory"].push(item);

      syncPlayer(players[id]);
      io.to(id).emit(
        "gamelog message",
        `You receive <span class="gear gear-rarity-${rarity}">${name}</span>!`
      );
    }
  }
};

const syncMobs = (mobs) => {
  io.emit("mobs update", mobs);
};

const syncParty = (party, players) => {
  // for each member of the party
  for (const id in party) {
    // get the relevant data from players storage
    party[id] = {
      id: players[id]["id"],
      name: players[id]["name"],
      level: players[id]["level"],
      health: players[id]["health"],
      maxHealth: players[id]["maxHealth"]
    };
  }
  io.emit("party update", party);
};

const syncPlayer = (player) => {
  io.to(player.id).emit("player update", player);
};

const playerSpendAttr = (player, spendAttrChoice) => {
  if (player["baseStats"]["unspent"] <= 0) {
    return;
  }

  if (spendAttrChoice === "strength") {
    player["baseStats"]["unspent"]--;
    player["baseStats"]["strength"]++;
  } else if (spendAttrChoice === "agility") {
    player["baseStats"]["unspent"]--;
    player["baseStats"]["agility"]++;
  } else if (spendAttrChoice === "intelligence") {
    player["baseStats"]["unspent"]--;
    player["baseStats"]["intelligence"]++;
  }

  updatePlayerStats(player);
};

const generateBonusOnGear = (level, rarity) => {
  let bonusAttr = "";
  let bonusAttrAmount = 0;

  if (rarity === "epic") {
    bonusAttr = bonusList[Math.floor(Math.random() * bonusList.length)];
    bonusAttrAmount = Math.max(Math.floor(level * 0.6), 1);
  } else if (rarity === "rare") {
    bonusAttr = bonusList[Math.floor(Math.random() * bonusList.length)];
    bonusAttrAmount = Math.max(Math.floor(level * 0.4), 1);
  } else if (rarity === "uncommon") {
    bonusAttr = bonusList[Math.floor(Math.random() * bonusList.length)];
    bonusAttrAmount = Math.max(Math.floor(level * 0.2), 1);
  } else {
    // common rarity doesn't get any bonuses
    return false;
  }

  let bonus = new BonusOnGear(bonusAttr, bonusAttrAmount);

  return bonus;
};

const playerEquipGear = (player, inventoryID) => {
  let item = player["inventory"][inventoryID];

  // update equipped gear
  player["gear"][item.slot] = item;

  // update player stats
  updatePlayerStats(player);
};

const updatePlayerStats = (player) => {
  // first, reset stored gearStats
  for (let stat in player.gearStats) {
    player.gearStats[stat] = 0;
  }

  // then loop through every gear's bonuses and add them to gearStats
  for (let slot in player.gear) {
    if (player.gear[slot].bonuses) {
      player.gear[slot].bonuses.forEach((bonus) => {
        for (let stat in player.gearStats) {
          if (bonus.attr === stat) player.gearStats[stat] += bonus.attrAmount;
        }
      });
    }
  }

  // lastly, update totalStats
  for (let stat in player.totalStats) {
    player.totalStats[stat] = player.baseStats[stat] + player.gearStats[stat];
  }

  return player;
};

const mobsAutoAttack = () => {
  if (mobs["a"].health === 0) return false;

  // first, get active party members
  let playerKeys = Object.keys(party);
  if (playerKeys.length === 0) return false;

  // then filter out players that are dead
  playerKeys = playerKeys.filter((playerKey) => players[playerKey].health > 0);
  if (playerKeys.length === 0) return false;

  // pick a random one (it's their array index)
  let randomPlayerKeyIndex = Math.floor(Math.random() * playerKeys.length);

  mobAttackPlayer(mobs["a"], players[playerKeys[randomPlayerKeyIndex]]);
};

setInterval(mobsAutoAttack, 3000);
