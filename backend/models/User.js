const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  otp: { type: String },
  otpExpiry: { type: Date },
  groupId: { type: mongoose.Schema.Types.ObjectId, ref: "Group", default: null },
  role: { type: String, enum: ["primary", "member", "individual"], default: "individual" },
  inviteToken: { type: String },
  expenses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Expense" }], // Track user expenses
});

module.exports = mongoose.model("User", userSchema);