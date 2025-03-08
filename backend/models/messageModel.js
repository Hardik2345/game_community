const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  teamId: { type: mongoose.Schema.Types.ObjectId, ref: "Team", required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  content: { type: String, required: true },
  iv: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

messageSchema.pre(/^find/, function (next) {
  this.populate("teamId", "name") // Populates team name only
    .populate("sender", "name email avatar"); // Populates user details
  next();
});

const Message = mongoose.model("Message", messageSchema);
module.exports = Message;
