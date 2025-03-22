const mongoose = require("mongoose");
const User = require("./userModel");

const teamSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  tagline: { type: String, required: true, unique: true },
  description: { type: String, required: true, unique: true },
  createdBy: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

teamSchema.pre(/^find/, function (next) {
  this.populate("members", "name email"); // Fetch selected fields
  next();
});

teamSchema.post("save", async function (doc, next) {
  try {
    if (doc.members && doc.members.length > 0) {
      await User.updateMany(
        { _id: { $in: doc.members } },
        { $addToSet: { team: doc._id } } // Ensures no duplicate team IDs
      );
    }
    next();
  } catch (error) {
    next(error);
  }
});

const Team = mongoose.model("Team", teamSchema);
module.exports = Team;
