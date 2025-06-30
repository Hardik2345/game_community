const crypto = require("crypto");
const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const Wallet = require("./walletModel");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please tell us your name."],
  }, 
  email: {
    type: String,
    required: [true, "Please provide your email."],
    unique: true,
    lowercase: true,
    validate: {
      validator: function(value) {
        if (this.authProvider === 'steam' && value.includes('@placeholder.com')) {
          return true;
        }
        if (this.authProvider === 'google') {
          return validator.isEmail(value);
        }
        return validator.isEmail(value);
      },
      message: "Please provide a valid email."
    }
  },
  photo: {
    type: String,
    default: "default.jpg",
  },
  role: {
    type: String,
    enum: ["user", "admin", "leader"],
    default: "user",
  },
  password: {
    type: String,
    required: [function() { return this.authProvider === 'local'; }, "Please provide a password for local authentication"],
    minlength: [8, "Password must be at least 8 characters"],
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [function() { return this.authProvider === 'local'; }, "Please confirm your password for local authentication"],
    validate: {
      validator: function (el) {
        return this.authProvider === 'local' ? el === this.password : true;
      },
      message: "Passwords are not the same!",
    },
  },
  authProvider: {
    type: String,
    enum: ["local", "steam", "google"],
    default: "local",
  },
  steamId: {
    type: String,
    unique: true,
    sparse: true,
  },
  steamProfile: {
    displayName: String,
    photos: [
      {
        value: String,
      },
    ],
    profileUrl: String,
    avatar: String,
    avatarMedium: String,
    avatarFull: String,
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true,
  },
  googleProfile: {
    displayName: String,
    email: String,
    photo: String,
  },
  team: [{ type: mongoose.Schema.Types.ObjectId, ref: "Team" }],
  event: [{ type: mongoose.Schema.Types.ObjectId, ref: "Event" }],
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
  riotTag: {
    type: String,
    required: [true, "Please provide a riot tag"],
  },
  riotUsername: {
    type: String,
    required: [true, "Please provide a riot username"],
  },
});

userSchema.index({ team: 1 });

userSchema.pre("save", async function (next) {
  if (!this.isModified("password") || this.authProvider !== 'local') {
    this.passwordConfirm = undefined;
    return next();
  }
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

userSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew || this.authProvider !== 'local') {
    return next();
  }
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

userSchema.post("save", async function (doc, next) {
  try {
    const existing = await Wallet.findOne({ user: doc._id });
    if (!existing) {
      await Wallet.create({ user: doc._id });
      console.log(`🆕 Wallet created for user: ${doc.name}`);
    }
    next();
  } catch (err) {
    console.error("❌ Wallet creation failed for new user:", err.message);
    next(err);
  }
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

const User = mongoose.model("User", userSchema);

module.exports = User;