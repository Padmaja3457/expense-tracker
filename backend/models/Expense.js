const mongoose = require("mongoose");

const ExpenseSchema = new mongoose.Schema({
  name: { type: String },
  amount: { type: Number, required: true },
  category: { type: String, required: true },
  date: { type: Date, default: Date.now },
  description: { type: String, default: "No description" },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  groupId: { type: mongoose.Schema.Types.ObjectId, ref: "Group", default: null },
  
  group: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Group" 
  },
  // For tracking individual ownership in groups:
  
  // Optional: For shared expenses
  splitAmong: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    amount: Number 
  }]
}, { timestamps: true });


module.exports = mongoose.model("Expense", ExpenseSchema);
