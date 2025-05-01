const path = require("path");
const express = require("express");
const morgan = require("morgan");
// const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
// const hpp = require("hpp");
const cookieParser = require("cookie-parser");
const compression = require("compression");
const cors = require("cors");
const User = require("./models/userModel");
const { fork } = require("child_process");
const cron = require("node-cron");
const GV = require("./models/gvModel");

const gvRoutes = require("./routes/gvRoutes");
const valorantRoutes = require("./routes/valorent");
const userRouter = require("./routes/userRoutes");
const eventRouter = require("./routes/eventRoutes");
const chatRouter = require("./routes/chatRoutes");
const teamRouter = require("./routes/teamRoutes");
const inviteRouter = require("./routes/inviteRoutes");
const matchRouter = require("./routes/matchRoutes");
const AppError = require("./utils/appError");
const globalErrorHandler = require("./controllers/errorController");

const app = express();
app.enable("trust proxy", 1);

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// Handle preflight requests for all routes
app.options("*", cors({ credentials: true, origin: "http://localhost:5173" }));

app.use(express.static(path.join(__dirname, "public")));
app.use("/img/users", express.static(path.join(__dirname, "public/img/users")));

// Set security HTTP headers
app.use(helmet());
// app.use(
//   helmet.contentSecurityPolicy({
//     directives: {
//       defaultSrc: ["'self'", "data:", "blob:"],

//       fontSrc: ["'self'", "https:", "data:"],

//       scriptSrc: ["'self'", "unsafe-inline"],

//       scriptSrc: ["'self'", "https://*.cloudflare.com"],

//       scriptSrcElem: ["'self'", "https:", "https://*.cloudflare.com"],

//       styleSrc: ["'self'", "https:", "unsafe-inline"],

//       connectSrc: ["'self'", "data", "https://*.cloudflare.com"],
//     },
//   })
// );

// Development logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Limit requests from same API
// const limiter = rateLimit({
//   max: 100,
//   windowMs: 60 * 60 * 1000,
//   keyGenerator: (req) => req.ip,
//   message: "Too many requests from this IP, please try again in an hour!",
// });
// app.use("/api", limiter);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());
app.use(compression());

app.use("/api/v1/users", userRouter);
app.use("/api/v1/events", eventRouter);
app.use("/api/v1/chats", chatRouter);
app.use("/api/v1/teams", teamRouter);
app.use("/api/v1/invites", inviteRouter);
app.use("/api/v1/matches", valorantRoutes);
app.use("/api/v1/gv", gvRoutes);
app.use("/api/v1/dashboard", matchRouter);

cron.schedule("0 * * * *", async () => {
  console.log("⏰ Running hourly GV update...");

  const users = await User.find({
    riotUsername: { $exists: true },
    riotTag: { $exists: true },
  });

  for (const user of users) {
    const riotId = `${user.riotUsername}#${user.riotTag}`;
    const child = fork(path.join(__dirname, "scraperWorker.js"));
    child.send({ riotId });

    child.on("message", async (message) => {
      if (message.success) {
        await GV.findOneAndUpdate(
          { user: user._id },
          { ...message.stats, updatedAt: Date.now() },
          { upsert: true }
        );
        console.log(`✅ Updated GV for ${user.name}`);
      } else {
        console.warn(`⚠️ Failed to update ${user.name}:`, message.error);
      }
    });
  }
});

app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
