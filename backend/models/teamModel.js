const mongoose = require("mongoose");

const teamSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  createdAt: { type: Date, default: Date.now },
});

teamSchema.pre(/^find/, function (next) {
  this.populate("members", "username email avatar"); // Fetch selected fields
  next();
});

const Team = mongoose.model("Team", teamSchema);
module.exports = Team;
