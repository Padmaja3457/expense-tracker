const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Group = require("../models/Group");
const emailService = require("../utils/emailService");
const crypto = require("crypto");

exports.registerGroup = async (req, res) => {
  try {
    const { primaryName, primaryEmail, primaryPassword, members } = req.body;

    // Hash password
    const hashedPassword = await bcrypt.hash(primaryPassword, 10);

    // Create primary user
    const primaryUser = await User.create({
      username: primaryName,  // Changed from "name" to "username" for consistency
      email: primaryEmail,
      password: hashedPassword,
      role: "primary",
    });

    // Generate unique invite links for members
    const memberData = members.map((member) => ({
      email: member.email,
      relation: member.relation,
      status: "pending",
      inviteToken: crypto.randomBytes(20).toString("hex"),
    }));

    // Create group
    const group = await Group.create({
      primaryUserId: primaryUser._id,
      members: memberData,
    });

    // Update primary user with groupId
    primaryUser.groupId = group._id;
    await primaryUser.save();

    // Send invitations
    for (const member of memberData) {
      const inviteLink = `http://localhost:3000/accept-invite?token=${member.inviteToken}`;
      await emailService.sendEmail(
        member.email,
        "Group Invitation",
        `You have been invited to join a group by ${primaryName}. Click the link to complete registration: ${inviteLink}`
      );
    }

    // ✅ Generate JWT for the primary user
    const token = jwt.sign({ id: primaryUser._id, email: primaryUser.email }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.status(201).json({
      message: "Group registered successfully. Invitations sent.",
      token, // Send JWT to frontend
      groupId: group._id
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Handle member registration after clicking the invite link
exports.completeRegistration = async (req, res) => {
  try {
    const { token, password } = req.body;

    // Find member in any group
    const group = await Group.findOne({ "members.inviteToken": token });
    if (!group) return res.status(400).json({ message: "Invalid or expired token." });

    // Find the member being registered
    const memberIndex = group.members.findIndex((m) => m.inviteToken === token);
    if (memberIndex === -1) return res.status(400).json({ message: "Invalid token." });

    const member = group.members[memberIndex];

    // Create user account
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      username: member.email.split("@")[0],  // Generate a username from email
      email: member.email,
      password: hashedPassword,
      groupId: group._id,
      role: "member",
    });

    // Update group member status
    group.members[memberIndex].status = "registered";
    group.members[memberIndex].inviteToken = null;
    await group.save();

    // ✅ Generate JWT for the new member
    const authToken = jwt.sign({ id: newUser._id, email: newUser.email }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.status(200).json({
      message: "Registration successful. Please log in.",
      token: authToken, // Send JWT to frontend
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
