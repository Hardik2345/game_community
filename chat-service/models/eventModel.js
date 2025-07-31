const mongoose = require("mongoose");
const simpleUserSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: String,
});
const Event = mongoose.model("Event", simpleUserSchema);
module.exports = Event;