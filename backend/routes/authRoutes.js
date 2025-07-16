const express = require("express");
const { sendOTP, verifyOTP, resetPassword, login } = require("../controllers/authController");
const groupController = require("../controllers/groupController");

const router = express.Router();

// ✅ User Login Route
router.post("/login", login);

// ✅ OTP & Password Reset Routes
router.post("/send-otp", sendOTP);
router.post("/verify-otp", verifyOTP);
router.post("/reset-password", resetPassword);

// ✅ Group Management Routes
router.post("/register-group", groupController.registerGroup);
router.post("/complete-registration", groupController.completeRegistration);

module.exports = router;