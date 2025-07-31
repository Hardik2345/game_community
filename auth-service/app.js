const path = require("path");
const express = require("express");
const morgan = require("morgan");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const compression = require("compression");
const cors = require("cors");
const session = require("express-session");
const MongoStore = require("connect-mongo");
require("./config/passport");
const passport = require("passport");
const querystring = require('querystring');

const userRouter = require("./routes/userRoutes");

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

// app.options("*", cors({ credentials: true, origin: ["http://localhost:5173", "https://steamcommunity.com", "https://accounts.google.com"] }));

app.use(express.static(path.join(__dirname, "public")));
app.use("/img/users", express.static(path.join(__dirname, "public/img/users")));

app.use(helmet());

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// app.use((req, res, next) => {
//   if (req.originalUrl.includes('?')) {
//     req.query = querystring.parse(req.originalUrl.split('?')[1]);
//   }
//   next();
// });

app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(compression());

const mongoUrl = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);

const sessionStore = MongoStore.create({
  mongoUrl: mongoUrl,
  collectionName: "sessions", 
  touchAfter: 24 * 3600, 
});

app.use((req, res, next) => {
  session({
    secret: process.env.SESSION_SECRET || "your-session-secret",
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
      secure: false,
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    },
  })(req, res, next);
});

app.use(passport.initialize());
app.use(passport.session());

require("./swagger")(app);

app.use("/api/v1/users", userRouter);

// app.all("*", (req, res, next) => {
//   next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
// });

module.exports = app;