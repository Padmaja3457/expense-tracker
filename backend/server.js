const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const cors = require("cors");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
require("dotenv").config(); // Load environment variables
const authMiddleware = require("./middleware/authMiddleware");
const jwt = require("jsonwebtoken");
const budgetRoutes = require("./routes/budgetRoutes");
const Budget = require("./models/Budget");
const Expense = require("./models/Expense"); // ✅ Import Budget Routes
//const notification = require("./routes/notifications");
//const emailService = require("./utils/emailService"); // Use correct filename
const Group=require("./models/Group");
const Notification=require("./models/Notification");




const app = express();
app.use(cors());
app.use(bodyParser.json());

// 🔹 MongoDB Connection
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/authDB";
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));
// ✅ Use Routes
 // ✅ Use Budget Routes
//app.use("/api/notifications",authMiddleware, notification);
// 🔹 User Schema
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: {
    type: String,
    required: function () {
      return this.role !== "member"; // Password required for non-members
    },
  },
  otp: { type: String },
  otpExpiry: { type: Date },
  groupId: { type: mongoose.Schema.Types.ObjectId, ref: "Group", default: null },
  role: { type: String, enum: ["primary", "member", "individual"], default: "individual" },
  inviteToken: { type: String },
});

const User = mongoose.model("User", UserSchema);



// 🔹 Updated Group Schema




{/*// 🔹 Expense Schema
const ExpenseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  amount: { type: Number, required: true },
  category: { type: String, required: true },
  date: { type: Date, default: Date.now },
  description: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  groupId: { type: mongoose.Schema.Types.ObjectId, ref: "Group", default: null },
});*/}

//const Expense = mongoose.model("Expense", ExpenseSchema);

app.use("/api/budgets", authMiddleware , budgetRoutes);

// 🔹 Expenses Routes
app.get("/api/user/profile", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select("username email groupId role")
      .lean();

    if (!user) return res.status(404).json({ message: "User not found" });

    let groupDetails = null;
    if (user.groupId) {
      groupDetails = await Group.findById(user.groupId)
        .populate("primaryUser", "username email")
        .populate("members.user", "username email")
        .lean();

      if (groupDetails) {
        let membersList = groupDetails.members.map(m => ({
          _id: m.user?._id || m._id,
          username: m.user?.username || m.username,
        }));

        // ✅ Ensure primary user (creator) is in the members list
        if (groupDetails.primaryUser) {
          const primaryUser = {
            _id: groupDetails.primaryUser._id,
            username: groupDetails.primaryUser.username,
          };

          // Avoid duplicate if already in list
          if (!membersList.some(m => m._id.toString() === primaryUser._id.toString())) {
            membersList.unshift(primaryUser); // Add at the start
          }
        }

        groupDetails.members = membersList;
      }
    }

    res.json({ user, group: groupDetails });
  } catch (error) {
    console.error("Profile Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});



// Change Password
app.post("/api/user/change-password", authMiddleware, async (req, res) => {
  try {
    console.log("🔹 Change Password API Hit");

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "All fields are required." });
    }

    console.log("🔹 Checking user in DB with ID:", req.user?.id);
    const user = await User.findById(req.user.id);
    
    if (!user) {
      console.log("🔴 User not found!");
      return res.status(404).json({ message: "User not found." });
    }

    console.log("🔹 Hashed Password in DB:", user.password);

    // ✅ Compare hashed password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      console.log("🔴 Incorrect current password!");
      return res.status(400).json({ message: "Current password is incorrect." });
    }

    // ✅ Hash the new password before saving
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    await user.save();
    console.log("✅ Password changed successfully!");
    
    res.json({ message: "Password changed successfully." });

  } catch (error) {
    console.error("🔴 Error changing password:", error);
    res.status(500).json({ message: "Failed to change password." });
  }
});



app.put("/api/user/edit-profile", authMiddleware, async (req, res) => {
  const { username, email } = req.body;

  // ✅ Validate input
  if (!username || !email) {
    return res.status(400).json({ message: "Username and email are required." });
  }

  try {
    // ✅ Find the user
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // ✅ Ensure email is unique
    const existingUser = await User.findOne({ email });
    if (existingUser && existingUser._id.toString() !== req.user.id) {
      return res.status(400).json({ message: "Email is already taken." });
    }

    // ✅ Update profile
    user.username = username;
    user.email = email;
    await user.save();

    console.log("✅ Profile updated successfully for user:", user);

    res.json({ message: "Profile updated successfully.", user });
  } catch (error) {
    console.error("🔴 Error updating profile:", error);
    res.status(500).json({ message: "Failed to update profile." });
  }
});


// Delete Account
app.delete("/api/user/delete-account",authMiddleware, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user.id);
    res.json({ message: "Account deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete account." });
  }
});

// 🔹 Email Transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});


// POST /api/expenses
app.post("/api/expenses", authMiddleware, async (req, res) => {
  try {
    const { amount, category, description, date, groupId } = req.body;
    const userId = req.user.id;

    const expenseData = {
      amount: Number(amount),
      category,
      description: description || "No description",
      date: date || new Date(),
      userId, // Who created it
      ...(groupId && { groupId }) // Only add if groupId exists
    };

    // Verify group membership if it's a group expense
    if (groupId) {
      const isMember = await Group.exists({
        _id: groupId,
        $or: [
          { primaryUser: userId },
          { "members.user": userId }
        ]
      });
      
      if (!isMember) {
        return res.status(403).json({ message: "Not a group member" });
      }
    }

    const newExpense = await Expense.create(expenseData);
    
// After creating the expense
const now = new Date();
const budget = await Budget.findOne({
  groupId: groupId,
  startDate: { $lte: now },
  endDate: { $gte: now },
});

if (budget) {
  const categoryLimit = budget.categories[category] || 0;

  const categoryExpenses = await Expense.aggregate([
    {
      $match: {
        groupId: groupId ? new mongoose.Types.ObjectId(groupId) : null,
       userId: new mongoose.Types.ObjectId(userId),


        category,
        date: { $gte: budget.startDate, $lte: budget.endDate },
      },
    },
    {
      $group: {
        _id: null,
        total: { $sum: "$amount" },
      },
    },
  ]);

  const totalSpent = categoryExpenses[0]?.total || 0;

  if (totalSpent > categoryLimit) {
    const user = await User.findById(userId);

    const message = `Alert: You exceeded your ${category} budget in group ${groupId}.`;

    // Save in DB
    await Notification.create({
      userId,
      groupId,
      message,
    });

    // Send email
    await transporter.sendMail({
      from: process.env.EMAIL_USER, // ✅ Same as your OTP setup
      to: user.email,
      subject: "Budget Limit Exceeded",
      text: `Hi ${user.username},\n\nYou have exceeded your budget in the category "${category}" for the group.\n\nKeep track of your expenses carefully.\n\n- Expense Tracker Team`,
    });
    
  }
}

res.status(201).json(newExpense);

  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Failed to add expense", error: error.message });
  }
});
// GET /api/expenses
app.get("/api/expenses", authMiddleware, async (req, res) => {
  try {
    const { groupId, userId } = req.query;
    const currentUserId = req.user.id;
    let query = {};

    if (groupId) {
      // Ensure the current user is part of the group
      const group = await Group.findOne({
        _id: groupId,
        $or: [{ primaryUser: currentUserId }, { "members.user": currentUserId }]
      });

      if (!group) {
        return res.status(403).json({ message: "Not a group member" });
      }

      query.groupId = groupId;

      if (userId) {
        // Ensure the selected user is also in the group
        const isMember = group.members.some(m => m.user.toString() === userId) || group.primaryUser.toString() === userId;
        if (!isMember) {
          return res.status(403).json({ message: "Cannot view this member's expenses" });
        }
        query.userId = userId;
      }

    } else {
      // Fetch personal expenses
      query.userId = currentUserId;
    }

    const expenses = await Expense.find(query).sort({ date: -1 });
    res.json(expenses);

  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Server error" });
  }
});


app.put("/api/expenses/:id", authMiddleware, async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) return res.status(404).json({ message: "❌ Expense not found" });

    // 🔹 Correct ownership check
    if (!expense.userId.equals(req.user.id)) {
      if (expense.groupId) {
        const isAdmin = await Group.exists({
          _id: expense.groupId,
          primaryUser: req.user.id
        });
        if (!isAdmin) {
          return res.status(403).json({ message: "❌ Only the admin can edit group expenses" });
        }
      } else {
        return res.status(403).json({ message: "❌ Unauthorized to edit this expense" });
      }
    }

    // 🔹 Ensure only allowed fields are updated
    const allowedUpdates = ["amount", "category", "date", "description"];
    const updates = {};
    Object.keys(req.body).forEach((key) => {
      if (allowedUpdates.includes(key)) updates[key] = req.body[key];
    });

    const updatedExpense = await Expense.findByIdAndUpdate(req.params.id, updates, { new: true });
    res.status(200).json({ message: "✅ Expense updated!", expense: updatedExpense });
  } catch (error) {
    console.error("❌ Error updating expense:", error);
    res.status(500).json({ message: "Server error", error });
  }
});

app.delete("/api/expenses/:id", authMiddleware, async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) return res.status(404).json({ message: "❌ Expense not found" });

    // 🔹 Correct ownership check
    if (!expense.userId.equals(req.user.id)) {
      if (expense.groupId) {
        const isAdmin = await Group.exists({
          _id: expense.groupId,
          primaryUser: req.user.id
        });
        if (!isAdmin) {
          return res.status(403).json({ message: "❌ Only the admin can delete group expenses" });
        }
      } else {
        return res.status(403).json({ message: "❌ Unauthorized to delete this expense" });
      }
    }

    await Expense.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "✅ Expense deleted successfully!" });
  } catch (error) {
    console.error("❌ Error deleting expense:", error);
    res.status(500).json({ message: "Server error", error });
  }
});
app.get("/api/notifications", authMiddleware, async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (error) {
    console.error("Notification fetch error:", error);
    res.status(500).json({ message: "Failed to fetch notifications" });
  }
});



// 🔹 User Registration
app.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });

    if (existingUser) {
      return res.status(400).json({ message: "⚠ Username or email already taken" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: "✅ Registration successful!" });
  } catch (error) {
    console.error("❌ Registration error:", error);
    res.status(500).json({ message: "❌ Registration failed", error });
  }
});

// 🔹 User Login

app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find the user in the database
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ message: "❌ User not found" });
    }

    console.log("🔹 Entered Password:", password);
    console.log("🔹 Hashed Password in DB:", user.password);

    // Check if the password is correct
    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log("🔹 Password Match Result:", isPasswordValid);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "❌ Invalid credentials - Password does not match" });
    }

    // Generate a JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "30h" });

    // Return the token and user details
    res.status(200).json({
      message: "✅ Login successful!",
      token,
      user: { _id: user._id.toString(), username: user.username, email: user.email },
    });
  } catch (error) {
    console.error("❌ Login error:", error);
    res.status(500).json({ message: "❌ Login failed", error });
  }
});

app.post("/register-group", async (req, res) => {
  const { primaryUser, members } = req.body;
  let createdUsers = [];
  let createdGroup = null;

  try {
    // 1. Check if primary user exists
    const existingUser = await User.findOne({ email: primaryUser.email });
    if (existingUser) {
      return res.status(400).json({ 
        message: "⚠ Email already registered. Choose a different one." 
      });
    }

    // 2. Create primary user
    const hashedPrimaryPassword = await bcrypt.hash(primaryUser.password, 10);
    const primary = new User({
      username: primaryUser.username,
      email: primaryUser.email,
      password: hashedPrimaryPassword,
      role: "primary",
    });
    await primary.save();
    createdUsers.push(primary._id);

    // 3. Create member users and prepare group members
    const groupMembers = await Promise.all(
      members.map(async (member) => {
        const rawPassword = member.password; // store original password
        const hashedPassword = await bcrypt.hash(member.password, 10);
        
        // Create User document
        const newUser = new User({
          username: member.username,
          email: member.email,
          password: hashedPassword,
          role: "member"
        });
        await newUser.save();
        createdUsers.push(newUser._id);

        // Prepare group member entry
        return {
          user: newUser._id,          // Reference to User
          username: member.username,   // Duplicated for legacy support
          email: member.email,         // Duplicated for legacy support
          relation: member.relation,
          passwordHash: hashedPassword, 
          rawPassword // pass this for emailing // Only if absolutely required
        };
      })
    );

    // 4. Create the group (mixed old/new structure)
    const newGroup = new Group({
      name: `${primaryUser.username}'s Group`,
      primaryUser: {
        _id: primary._id,             // New reference style
        username: primary.username,   // Legacy
        email: primary.email          // Legacy
      },
      members: groupMembers
    });
    await newGroup.save();
    createdGroup = newGroup._id;

    // 5. Update all users with groupId
    await User.updateMany(
      { _id: { $in: [primary._id, ...groupMembers.map(m => m.user)] } },
      { $set: { groupId: newGroup._id } }
    );

    // 6. Send emails (unchanged)
    for (const member of groupMembers) {
      const loginLink = `http://localhost:3000/login`;
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: member.email,
        subject: "Welcome to the Group!",
        text: `You've been added to ${primaryUser.username}'s group.\n\nUsername: ${member.username}\n\nPassword: ${member.rawPassword}\n`
      };
      await transporter.sendMail(mailOptions).catch(console.error);
    }

    res.status(201).json({ 
      message: "✅ Group registered successfully!", 
      groupId: newGroup._id 
    });

  } catch (error) {
    console.error("❌ Group registration error:", error);
    // Cleanup on failure
    await User.deleteMany({ _id: { $in: createdUsers } });
    if (createdGroup) await Group.findByIdAndDelete(createdGroup);
    res.status(500).json({ 
      message: "❌ Group registration failed",
      error: error.message 
    });
  }
});






// 🔹 Forgot Password - Send OTP
app.post("/send-otp", async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset OTP",
      text: `Your OTP is: ${otp}`,
    });

    res.status(200).json({ message: "OTP sent successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error sending OTP", error });
  }
});

// 🔹 Verify OTP
app.post("/verify-otp", async (req, res) => {
  const { email, otp } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || user.otp !== otp || new Date() > user.otpExpiry) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    res.status(200).json({ message: "OTP verified. Proceed to reset password" });
  } catch (error) {
    res.status(500).json({ message: "Error verifying OTP", error });
  }
});
// 🔹 Reset Password
app.post("/reset-password", async (req, res) => {
  const { email, newPassword } = req.body;
  try {
    const user = await User.findOne({ email });
    user.password = await bcrypt.hash(newPassword, 10);
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();
    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error resetting password", error });
  }
});

// 🔹 Accept Invite & Complete Registration
app.post("/complete-registration", async (req, res) => {
  try {
    const { token, password } = req.body;
    const user = await User.findOne({ inviteToken: token });

    if (!user) return res.status(400).json({ message: "❌ Invalid invite token" });

    user.password = await bcrypt.hash(password, 10);
    user.inviteToken = null;
    await user.save();

    res.status(200).json({ message: "✅ Registration complete. You can now log in!" });
  } catch (error) {
    res.status(500).json({ message: "❌ Failed to complete registration", error });
  }
});

// 🔹 Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});