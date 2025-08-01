const mongoose = require("mongoose");

const simpleUserSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: String,
    avatar: String
});
const User = mongoose.model("User", simpleUserSchema);
module.exports = User;