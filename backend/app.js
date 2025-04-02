const path = require("path");
const express = require("express");
const morgan = require("morgan");
// const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");
const cookieParser = require("cookie-parser");
const compression = require("compression");
const cors = require("cors");

const userRouter = require("./routes/userRoutes");
const eventRouter = require("./routes/eventRoutes");
const chatRouter = require("./routes/chatRoutes");
const teamRouter = require("./routes/teamRoutes");
const inviteRouter = require("./routes/inviteRoutes");
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

app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
