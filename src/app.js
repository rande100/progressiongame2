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

class PlayerCharacter {
  constructor(name, level, health) {
    this.name = name;
    this.level = level;
    this.health = health;
  }
}

class MobCharacter {
  constructor(name, level, health, maxHealth) {
    this.name = name;
    this.level = level;
    this.health = health;
    this.maxHealth = maxHealth;
    this.damage = 1;
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
    this.strength = 1;
    this.agility = 1;
    this.intelligence = 1;
    this.gear = {
      weapon: null,
      head: null,
      chest: null,
      hands: null,
      legs: null,
      feet: null
    };
  }
}

class PartyMember {
  constructor(id, name, health, maxHealth) {
    this.id = id;
    this.name = name;
    this.health = health;
    this.maxHealth = maxHealth;
  }
}

// Gear & Bonuses

class Gear {
  constructor() {
    this.slot = "";
    this.name = "";
    this.bonuses = {};
  }
}

class WeaponGear extends Gear {
  constructor() {
    super();
    this.damage = 0;
  }
}

class ArmorGear extends Gear {
  constructor() {
    super();
    this.armor = 0;
  }
}

class BonusOnGear {
  constructor() {
    this.attr = "";
    this.attrAmount = 0;
  }
}

// -----

let players = {};
let party = [];
let mobs = [];

mobs.push(new MobCharacter("Rat", 1, 5, 5));

io.on("connection", (socket) => {
  console.log("Player connected. ID: " + socket.id);

  let newPlayer = new Player(socket.id);

  players[socket.id] = newPlayer;
  party.push(newPlayer);

  console.log("Players connected: " + Object.keys(party).length);

  // initial sync
  socket.emit("player update", players[socket.id]);
  socket.emit("mobs update", mobs);
  io.emit("party update", party);

  socket.on("attack", () => {
    console.log("Attack event received.");
    playerAttackMob(players[socket.id], mobs[0]);

    socket.emit("attack return");
  });

  socket.on("disconnect", () => {
    console.log("Player disconnected. ID: " + socket.id);
    party = party.filter((item) => item.id !== socket.id);
    io.emit("party update", party);
  });
});

const playerAttackMob = (player, mob) => {
  if (mob.health === 0) {
    console.log("Mob already dead.");
    return;
  }

  let damage = player.strength;

  mob.health -= damage;

  if (mob.health <= 0) {
    mob.health = 0;

    let anyMobAlive = false;
    mobs.forEach((iMob) => {
      if (!anyMobAlive && iMob.health > 0) {
        anyMobAlive = true;
      }
    });

    if (!anyMobAlive) {
      console.log("All mobs are dead.");
    }

    // respawn mob for testing
    mob.health = mob.maxHealth;
  }

  io.emit("player attack mob", { playerID: player.id, mobID: 0 });
  io.emit("mobs update", mobs);
};

const mobAttackPlayer = (mob, player) => {
  let damage = mob.damage;

  player.health -= damage;

  if (player.health <= 0) {
    player.health = 0;
  }
};
