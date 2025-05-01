const mongoose = require("mongoose");
const slugify = require("slugify");
const User = require("./userModel");

const eventSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "An Event must have a name"],
    unique: true,
    trim: true,
    maxlength: [40, "An Event name must have less or equal then 40 characters"],
    minlength: [10, "An Event name must have more or equal then 10 characters"],
    // validate: [validator.isAlpha, 'Tour name must only contain characters']
  },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  slug: String,
  duration: {
    type: Number,
    required: [true, "An Event must have a duration"],
  },
  maxGroupSize: {
    type: Number,
    required: [true, "An Event must have a group size"],
  },
  difficulty: {
    type: String,
    required: [true, "An Event must have a difficulty"],
    enum: {
      values: ["easy", "medium", "difficult"],
      message: "Difficulty is either: easy, medium, difficult",
    },
  },
  price: {
    type: Number,
    required: [true, "An event must have a price"],
  },
  description: {
    type: String,
    trim: true,
    required: [true, "An event must have a description"],
  },
  imageCover: {
    type: String,
    required: [true, "An event must have a cover image"],
  },
  createdBy: { type: String, required: true },
  createdAt: {
    type: Date,
    default: Date.now(),
    select: false,
  },
  startDates: [Date],
});

//indexes
eventSchema.index({ createdAt: -1, price: 1 });
eventSchema.index({ slug: 1 });

eventSchema.virtual("durationDays").get(function () {
  return Math.round(this.duration);
});

eventSchema.pre("save", function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

eventSchema.pre(/^find/, function (next) {
  this.populate("members", "name email"); // Fetch selected fields
  next();
});

eventSchema.post("save", async function (doc, next) {
  try {
    if (doc.members && doc.members.length > 0) {
      await User.updateMany(
        { _id: { $in: doc.members } },
        { $addToSet: { event: doc._id } } // Ensures no duplicate team IDs
      );
    }
    next();
  } catch (error) {
    next(error);
  }
});

const Event = mongoose.model("Event", eventSchema);

module.exports = Event;
