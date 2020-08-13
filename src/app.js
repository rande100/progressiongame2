const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const path = require("path");

const app = express();
const port = process.env.PORT || 3000;

if (process.env.NODE_ENV === "production") {
  app.use(express.static("client/public"));
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "client", "public", "index.html"));
  });
}

const test = require("./routes/api/test");

let player = {
  name: "John Doe",
  level: 10,
  health: 100
};

app.use(bodyParser.json());

app.use(cors());

app.use("/api/test", test);

app.get("/api/player", (req, res, next) => {
  res.send(player);
});

app.listen(port, () => {
  console.log(`Server is up at port ${port}`);
});

/*
app.get("/test", (req, res, next) => {
  res.send("YAY");
});
*/
