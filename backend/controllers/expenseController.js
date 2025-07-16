const Expense = require("../models/Expense");

// Add Expense
exports.addExpense = async (req, res) => {
  const { date, category, amount, description } = req.body;

  if (!req.user || !req.user._id) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  // Validate input
  if (!date || !category || !amount || !description) {
    return res.status(400).json({ message: "All fields are required" });
  }

  if (typeof amount !== "number" || amount <= 0) {
    return res.status(400).json({ message: "Amount must be a positive number" });
  }

  const userId = req.user._id;

  try {
    const expense = new Expense({ userId, date, category, amount, description });
    await expense.save();

    res.status(201).json(expense);
  } catch (error) {
    res.status(500).json({ message: error.message || "Internal server error" });
  }
};

// Get Expenses for Logged-In User
exports.getExpenses = async (req, res) => {
  if (!req.user || !req.user._id) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const userId = req.user._id;

  try {
    const expenses = await Expense.find({ userId }).sort({ date: -1 }); // Sort by latest expenses
    res.status(200).json(expenses);
  } catch (error) {
    res.status(500).json({ message: error.message || "Internal server error" });
  }
};

// Delete Expense
exports.deleteExpense = async (req, res) => {
  const { id } = req.params;

  if (!req.user || !req.user._id) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const userId = req.user._id;

  try {
    const expense = await Expense.findOne({ _id: id, userId });

    if (!expense) {
      return res.status(404).json({ message: "Expense not found or unauthorized" });
    }

    await Expense.findByIdAndDelete(id);

    res.status(200).json({ message: "Expense deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message || "Internal server error" });
  }
};

// Update Expense
exports.updateExpense = async (req, res) => {
  const { id } = req.params;
  const { date, category, amount, description } = req.body;

  if (!req.user || !req.user._id) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  // Validate input
  if (!date || !category || !amount || !description) {
    return res.status(400).json({ message: "All fields are required" });
  }

  if (typeof amount !== "number" || amount <= 0) {
    return res.status(400).json({ message: "Amount must be a positive number" });
  }

  const userId = req.user._id;

  try {
    const expense = await Expense.findOneAndUpdate(
      { _id: id, userId },
      { date, category, amount, description },
      { new: true }
    );

    if (!expense) {
      return res.status(404).json({ message: "Expense not found or unauthorized" });
    }

    res.status(200).json(expense);
  } catch (error) {
    res.status(500).json({ message: error.message || "Internal server error" });
  }
};