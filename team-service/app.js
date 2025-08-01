const path = require("path");
const express = require("express");
const morgan = require("morgan");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const compression = require("compression");
const cors = require("cors");
const querystring = require('querystring');

const AppError = require("./utils/appError");
const teamRouter = require("./routes/teamRoutes");
const app = express();
app.enable("trust proxy", 1);

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

app.use(
  cors({
    origin: ["http://localhost:5173", "https://steamcommunity.com", "https://accounts.google.com"],
    credentials: true,
  })
);

app.use(express.static(path.join(__dirname, "public")));
app.use("/img/users", express.static(path.join(__dirname, "public/img/users")));

app.use(helmet());

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use((req, res, next) => {
  if (req.originalUrl.includes('?')) {
    req.query = querystring.parse(req.originalUrl.split('?')[1]);
  }
  next();
});

app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(compression());

require("./swagger")(app);

app.use("/api/v1/teams", teamRouter);

// app.all("*", (req, res, next) => {
//   next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
// });

module.exports = app;