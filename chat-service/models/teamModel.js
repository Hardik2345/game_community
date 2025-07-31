const mongoose = require("mongoose");
const simpleUserSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: String,
});
const Team = mongoose.model("Team", simpleUserSchema);
module.exports = Team;