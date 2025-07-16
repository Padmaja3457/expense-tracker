const express = require("express");
const Expense = require("../models/Expense");
const User = require("../models/User");
const authenticate = require("../middleware/authMiddleware");

const router = express.Router();

// Helper function to find expense by ID and user ID
const findExpenseByIdAndUser = async (expenseId, userId) => {
  return await Expense.findOne({ _id: expenseId, userId });
};

// ✅ Get all expenses for the logged-in user (with pagination)
router.get("/", authenticate, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // Default to page 1
    const limit = parseInt(req.query.limit) || 10; // Default to 10 expenses per page
    const skip = (page - 1) * limit;

    const expenses = await Expense.find({ userId: req.user.id })
      .sort({ date: -1 }) // Sort by latest expenses
      .skip(skip)
      .limit(limit);

    const totalExpenses = await Expense.countDocuments({ userId: req.user.id });

    res.status(200).json({
      expenses,
      pagination: {
        totalExpenses,
        totalPages: Math.ceil(totalExpenses / limit),
        currentPage: page,
        expensesPerPage: limit,
      },
    });
  } catch (error) {
    console.error("Error fetching expenses:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

// ✅ Add a new expense for the logged-in user
router.post("/", authenticate, async (req, res) => {
  const { date, category, amount, description } = req.body;

  // Input validation
  if (!date || !category || !amount || !description) {
    return res.status(400).json({ message: "All fields are required" });
  }

  if (typeof amount !== "number" || amount <= 0) {
    return res.status(400).json({ message: "Amount must be a positive number" });
  }

  try {
    const expense = new Expense({
      userId: req.user.id,
      date,
      category,
      amount,
      description,
    });
    await expense.save();

    // Link expense to the user
    await User.findByIdAndUpdate(req.user.id, { $push: { expenses: expense._id } });

    res.status(201).json(expense);
  } catch (error) {
    console.error("Error adding expense:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

// ✅ Delete an expense by ID (only if it belongs to the logged-in user)
router.delete("/:id", authenticate, async (req, res) => {
  try {
    const expense = await findExpenseByIdAndUser(req.params.id, req.user.id);

    if (!expense) {
      return res.status(404).json({ message: "Expense not found or unauthorized" });
    }

    await Expense.findByIdAndDelete(req.params.id);

    // Remove expense from the user's expenses array
    await User.findByIdAndUpdate(req.user.id, { $pull: { expenses: req.params.id } });

    res.status(200).json({ message: "Expense deleted successfully" });
  } catch (error) {
    console.error("Error deleting expense:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

// ✅ Update an expense by ID (only if it belongs to the logged-in user)
router.put("/:id", authenticate, async (req, res) => {
  const { date, category, amount, description } = req.body;

  // Input validation
  if (!date || !category || !amount || !description) {
    return res.status(400).json({ message: "All fields are required" });
  }

  if (typeof amount !== "number" || amount <= 0) {
    return res.status(400).json({ message: "Amount must be a positive number" });
  }

  try {
    const expense = await findExpenseByIdAndUser(req.params.id, req.user.id);

    if (!expense) {
      return res.status(404).json({ message: "Expense not found or unauthorized" });
    }

    const updatedExpense = await Expense.findByIdAndUpdate(
      req.params.id,
      { date, category, amount, description },
      { new: true }
    );

    res.status(200).json({ message: "Expense updated successfully", expense: updatedExpense });
  } catch (error) {
    console.error("Error updating expense:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;