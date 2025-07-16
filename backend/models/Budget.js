const mongoose = require("mongoose");

const budgetSchema = new mongoose.Schema({
 //userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, 
 groupId: { type: mongoose.Schema.Types.ObjectId, ref: "Group", required: false,default: null }, // Link to Group
 createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false,default: null },
  name: { type: String, required: true },
  monthlyIncome: { type: Number, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  categories: {
    food: { type: Number, default: 0 },
    transportation: { type: Number, default: 0 },
    shopping: { type: Number, default: 0 },
    bills: { type: Number, default: 0 },
    entertainment: { type: Number, default: 0 },
    education: { type: Number, default: 0 },
    other: { type: Number, default: 0 },
  },
  
});

module.exports = mongoose.model("Budget", budgetSchema);