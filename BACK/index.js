const express = require("express");
const app = express();
const morgan = require("morgan");
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const cors = require("cors");
app.use(cors());
const cookieParser = require("cookie-parser");
app.use(cookieParser());
const dotenv = require("dotenv");
dotenv.config();

const routes = require("./routes");
const path = require("path");

app.enable("trust proxy");

app.use(express.static(path.join(__dirname, "../web")));

app.use("/api/v1", routes);
app.use("/", function (req, res) {
  console.log(
    path.join(__dirname, "../web", "index.html"),
    path.join(__dirname, "index.html")
  );
  res.sendFile(path.join(__dirname, "../web", "index.html"));
});

app.set("port", process.env.PORT || 3001);

app.use(function (req, res, next) {
  res.status(404).json({ mensaje: "ERROR: 404 not found index" });
});

app.listen(app.get("port"), () =>
  console.log(`Listening on http://localhost:${app.get("port")}`)
);
