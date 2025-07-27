const mongoose = require("mongoose");
const UserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: String,
    bio: String,
    avatarUrl: String,
    location: String,
    interests: [String],
    friends: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

UserSchema.index({ username: "text", name: "text", bio: "text" });
module.exports = mongoose.model("User", UserSchema);
