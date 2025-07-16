const express = require("express");
const router = express.Router();
const Notification = require("../models/Notifications");
const authMiddleware = require("../middleware/authMiddleware");

// Fetch all notifications for user
router.get("/", async (req, res) => {
  try {
    const userId = req.user.id;
    const notifications = await Notification.find({ userId }).sort({ createdAt: -1 });
    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ message: "Error fetching notifications", error });
  }
});

// Fetch unread notifications count
router.get("/unread-count", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id; // Extract userId from the decoded token

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const unreadCount = await Notification.countDocuments({ userId, read: false });

    res.status(200).json({ unreadCount });
  } catch (error) {
    console.error("❌ Error fetching unread notifications:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Mark all notifications as read
router.put("/mark-read", async (req, res) => {
  try {
    const userId = req.user.id;
    await Notification.updateMany({ userId, read: false }, { $set: { read: true } });
    res.status(200).json({ message: "Notifications marked as read" });
  } catch (error) {
    res.status(500).json({ message: "Error updating notifications", error });
  }
});

module.exports = router;
