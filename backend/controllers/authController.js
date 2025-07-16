const User = require("../models/User");
const bcrypt = require("bcrypt");
const sendEmail = require("../utils/emailService");

// Helper function to find user by email
const findUserByEmail = async (email) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error("User not found");
  return user;
};

// Send OTP for password reset
exports.sendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    // Validate email format (basic check)
    if (!email || !email.includes("@")) {
      return res.status(400).json({ message: "Invalid email address" });
    }

    const user = await findUserByEmail(email);

    // Generate OTP and set expiry
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 min expiry
    await user.save();

    // Send OTP via email
    await sendEmail(email, "Password Reset OTP", `Your OTP is: ${otp}`);

    res.json({ message: "OTP sent successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message || "Internal server error" });
  }
};

// Verify OTP
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await findUserByEmail(email);

    // Check if OTP is valid and not expired
    if (user.otp !== otp || new Date() > user.otpExpiry) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    res.json({ message: "OTP verified, proceed to reset password" });
  } catch (error) {
    res.status(500).json({ message: error.message || "Internal server error" });
  }
};

// Reset password
exports.resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    // Validate new password (e.g., minimum length)
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long" });
    }

    const user = await findUserByEmail(email);

    // Hash new password and clear OTP fields
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    res.json({ message: "Password reset successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message || "Internal server error" });
  }
};