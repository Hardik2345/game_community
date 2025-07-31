const mongoose = require("mongoose");
const slugify = require("slugify");
const User = require("./userModel");

const { publishEvent } = require('../eventPublisher');

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
  pool: {
    type: Number,
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

eventSchema.pre('save', async function () {
    if (this.isNew || this.isModified('name')) {
        try {
            const eventData = { eventId: this._id, name: this.name };
            await publishEvent('EventUpdated', eventData);
            console.log(`--- EventUpdated event published for: ${this.name} ---`);
        } catch (err) {
            console.error("❌ Failed to publish EventUpdated event:", err.message);
        }
    }
});

eventSchema.pre(/^find/, function (next) {
  this.populate("members", "name email"); // Fetch selected fields
  next();
});

eventSchema.pre("findOneAndUpdate", async function (next) {
  const update = this.getUpdate();
  const isMemberUpdate = update.$push || update.$addToSet || update.$pull;

  if (isMemberUpdate) {
    const doc = await this.model.findOne(this.getQuery());
    const updatedMembers = new Set(doc.members.map((m) => m.toString()));

    // Apply updates to simulate the new member count
    if (update.$addToSet && update.$addToSet.members) {
      updatedMembers.add(update.$addToSet.members.toString());
    }
    if (update.$pull && update.$pull.members) {
      updatedMembers.delete(update.$pull.members.toString());
    }

    const memberCount = updatedMembers.size;
    const newPool = memberCount * doc.price;

    update.$set = { ...(update.$set || {}), pool: newPool };
    this.setUpdate(update);
  }

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
