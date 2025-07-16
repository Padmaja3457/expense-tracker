const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const authMiddleware = require("../middleware/authMiddleware");
const Budget = require("../models/Budget"); // Import Budget model
const Expense = require("../models/Expense");
const Group=require("../models/Group");

// ✅ Get all budgets for the logged-in user
// ✅ Fetch all budgets with spent amounts per category
router.get("/", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id; // Get the logged-in user's ID

    // 🔹 Step 1: Find the group where this user belongs
    const group = await Group.findOne({ 
      $or: [{ primaryUser: userId }, { "members.user": userId }] 
    });
     let primaryUserId;
    
    if (!group) {
      // 🔹 If no group found, treat as individual user
      primaryUserId = userId;
    } else {
      // 🔹 Step 2: Get the primary user of the group
      primaryUserId = group.primaryUser;
    }

    // 🔹 Step 3: Fetch budgets created by the primary user
    const budgets = await Budget.find({ 
      $or: [
    { userId: primaryUserId },
    { createdBy: primaryUserId }
  ]
});
    // ✅ Get selected budget from request query (frontend should send this)
    const selectedBudgetId = req.query.selectedBudgetId;

    const budgetsWithSpent = await Promise.all(
      budgets.map(async (budget) => {
        const spent = {};

        for (const category of Object.keys(budget.categories)) {
          const totalSpent = await Expense.aggregate([
            { $match: { userId: new mongoose.Types.ObjectId(primaryUserId), category } },
            { $group: { _id: null, total: { $sum: "$amount" } } },
          ]);

          spent[category] = totalSpent.length > 0 ? totalSpent[0].total : 0;
        }

        // ✅ Apply spent only to the selected budget
        if (selectedBudgetId && budget._id.toString() !== selectedBudgetId) {
          return { ...budget.toObject(), spent: {} }; // Empty spent for unselected budgets
        }

        return { ...budget.toObject(), spent };
      })
    );

    res.json(budgetsWithSpent);
  } catch (error) {
    console.error("❌ Error fetching budgets:", error);
    res.status(500).json({ message: "Server error", error });
  }
});

// ✅ Create a new budget
router.post("/", authMiddleware, async (req, res) => {
  try {
    console.log("✅ User ID from token:", req.user);
    console.log("Received request body:", req.body);
    console.log("Extracted userId from authMiddleware:", req.user?.id); // Add this
    
    
    const userId =req.body.userId || req.user.id; // Always use authenticated userId

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID format" });
    }
     const userObjectId = new mongoose.Types.ObjectId(userId); // ✅ fix here
    const { name, monthlyIncome, startDate, endDate, categories } = req.body;

    if (!name || !monthlyIncome || !startDate || !endDate) {
      return res.status(400).json({ message: "Missing required budget fields" });
    }
     // 🔹 Step 1: Find the group where this user is the primary user
      // 🔹 Find the group this user is in
    const group = await Group.findOne({ members: userObjectId });

    // 🔐 Allow only primary user if in group
    if (group && String(group.primaryUser) !== String(userId)) {
      return res.status(403).json({ message: "Only the primary user can create budgets" });
    }

    const newBudget = new Budget({
      userId: userObjectId,
      name,
      monthlyIncome,
      startDate,
      endDate,
      categories,
      createdBy: req.user.id, 
      groupId: group?._id || null,
    });

    await newBudget.save();
    res.status(201).json(newBudget);
  } catch (error) {
    console.error("❌ Error creating budget:", error);
    res.status(500).json({ message: "Failed to create budget", error });
  }
});

// ✅ Update a budget by ID (only if it belongs to the user)
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid budget ID or user ID format" });
    }
     // 🔹 Step 1: Find the group where this user is the primary user
     const group = await Group.findOne({ members: new mongoose.Types.ObjectId(userId) });

    // 🔒 If user is in a group but not primary, block
    if (group && String(group.primaryUser) !== String(userId)) {
      return res.status(403).json({ message: "Only the primary user can edit group budgets" });
    }

    // 🔹 Step 2: Find and update the budget
    const budget = await Budget.findOneAndUpdate(
      { _id: id, createdBy: new mongoose.Types.ObjectId(userId)},
      req.body,
      { new: true }
    );

    if (!budget) {
      return res.status(404).json({ message: "Budget not found or unauthorized" });
    }

    res.json(budget);
  } catch (error) {
    console.error("❌ Error updating budget:", error);
    res.status(500).json({ message: "Failed to update budget", error });
  }
});

// ✅ Delete a budget by ID (only if it belongs to the user)
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid budget ID or user ID format" });
    }
    
    // 🔹 Step 1: Check if the user is the primary user of any group
    const group = await Group.findOne({ members: new mongoose.Types.ObjectId(userId) });

    if (group && String(group.primaryUser) !== String(userId)) {
      return res.status(403).json({ message: "Only the primary user can delete group budgets" });
    }

    // 🔹 Step 2: Find and delete the budget
    const budget = await Budget.findOneAndDelete({ _id: id });

    if (!budget) {
      return res.status(404).json({ message: "Budget not found" });
    }

    res.status(200).json({ message: "✅ Budget deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting budget:", error);
    res.status(500).json({ message: "Failed to delete budget", error });
  }
});

module.exports = router;
