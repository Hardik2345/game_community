const path = require("path");
const express = require("express");
const morgan = require("morgan");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const compression = require("compression");
const cors = require("cors");
const chatRouter = require("./routes/chatRoutes");

const app = express();
app.enable("trust proxy", 1);

app.use(
  cors({
    origin: ["http://localhost:5173"],
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

require("./swagger")(app);

app.use("/api/v1/chats", chatRouter);

// app.all("*", (req, res, next) => {
//   next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
// });

module.exports = app;