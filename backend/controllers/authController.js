const crypto = require("crypto");
const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const passport = require("passport");
const User = require("./../models/userModel");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");
const Email = require("./../utils/email");

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, req, res) => {
  const token = signToken(user._id);
  res.cookie("jwt", token, {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: req.secure || req.headers["x-forwarded-proto"] === "https",
    sameSite: "Lax",
  });
  user.password = undefined;
  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    riotTag: req.body.riotTag,
    riotUsername: req.body.riotUsername,
  });
  const url = `${req.protocol}://${req.get("host")}/me`;
  req.login(newUser, (err) => {
    if (err) {
      return next(err);
    }
    createSendToken(newUser, 201, req, res);
  });
});

exports.login = catchAsync(async (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return next(new AppError("Incorrect email or password", 401));
    }
    req.login(user, (err) => {
      if (err) {
        return next(err);
      }
      createSendToken(user, 200, req, res);
    });
  })(req, res, next);
});

exports.logout = (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ status: "error", message: err.message });
    }
    res.cookie("jwt", "loggedout", {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true,
    });
    res.status(200).json({ status: "success" });
  });
};

exports.protect = passport.authenticate("jwt", { session: false });

exports.isLoggedIn = async (req, res, next) => {
  if (req.cookies.jwt && req.cookies.jwt !== "loggedout") {
    try {
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );
      const currentUser = await User.findById(decoded.id);
      if (!currentUser) {
        return next();
      }
      if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next();
      }
      res.locals.user = currentUser;
      req.user = currentUser;
      return next();
    } catch (err) {
      return next();
    }
  }
  next();
};

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(
        new AppError("You do not have permission to perform this action", 403)
      );
    }
    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError("There is no user with email address.", 404));
  }
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });
  try {
    const resetURL = `${req.protocol}://${req.get(
      "host"
    )}/api/v1/users/resetPassword/${resetToken}`;
    await new Email(user, resetURL).sendPasswordReset();
    res.status(200).json({
      status: "success",
      message: "Token sent to email!",
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(
      new AppError("There was an error sending the email. Try again later!"),
      500
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  if (!user) {
    return next(new AppError("Token is invalid or has expired", 400));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  req.login(user, (err) => {
    if (err) {
      return next(err);
    }
    createSendToken(user, 200, req, res);
  });
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("+password");
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError("Your current password is wrong.", 401));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();
  createSendToken(user, 200, req, res);
});

exports.steamAuth = passport.authenticate("steam");

exports.steamCallback = (req, res, next) => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  passport.authenticate("steam", (err, user, info) => {
    if (err || !user) {
      return res.redirect(`${frontendUrl}/login?error=steam_auth_failed`);
    }
    req.login(user, (err) => {
      if (err) {
        return res.redirect(`${frontendUrl}/login?error=steam_auth_failed`);
      }
      // Session is now established, redirect to dashboard
      return res.redirect(`${frontendUrl}/dashboard`);
    });
  })(req, res, next);
};

exports.googleAuth = passport.authenticate("google", { scope: ['profile', 'email'] });

exports.googleCallback = (req, res, next) => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  passport.authenticate("google", (err, user, info) => {
    if (err || !user) {
      return res.redirect(`${frontendUrl}/login?error=google_auth_failed`);
    }
    req.login(user, (err) => {
      if (err) {
        return res.redirect(`${frontendUrl}/login?error=google_auth_failed`);
      }
      // Session is now established, redirect to dashboard
      return res.redirect(`${frontendUrl}/dashboard`);
    });
  })(req, res, next);
};

exports.linkSteamAccount = catchAsync(async (req, res, next) => {
  passport.authenticate("steam", { session: false }, async (err, steamUser) => {
    if (err || !steamUser) {
      return next(new AppError("Failed to authenticate with Steam", 400));
    }
    const existingUser = await User.findOne({ 
      steamId: steamUser.steamId,
      _id: { $ne: req.user._id }
    });
    if (existingUser) {
      return next(
        new AppError("This Steam account is already linked to another user", 400)
      );
    }
    req.user.steamId = steamUser.steamId;
    req.user.steamProfile = steamUser.steamProfile;
    if (!req.user.photo || req.user.photo === "default.jpg") {
      req.user.photo = steamUser.steamProfile.avatarFull;
    }
    await req.user.save({ validateBeforeSave: false });
    res.status(200).json({
      status: "success",
      message: "Steam account linked successfully",
      data: {
        user: req.user,
      },
    });
  })(req, res, next);
});

exports.unlinkSteamAccount = catchAsync(async (req, res, next) => {
  if (req.user.authProvider === "steam") {
    return next(
      new AppError(
        "Cannot unlink Steam from a Steam-authenticated account. Please set an email and password first.",
        400
      )
    );
  }
  req.user.steamId = undefined;
  req.user.steamProfile = undefined;
  await req.user.save({ validateBeforeSave: false });
  res.status(200).json({
    status: "success",
    message: "Steam account unlinked successfully",
  });
});

// Dynamic protect middleware: session OR JWT
exports.dynamicProtect = (req, res, next) => {
  // If authenticated via session (Steam/Google)
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }
  // Otherwise, try JWT
  passport.authenticate("jwt", { session: false }, (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.status(401).json({ status: "fail", message: "Not authenticated" });
    req.user = user;
    next();
  })(req, res, next);
};