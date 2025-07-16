const mongoose = require("mongoose");

// Updated Group Schema
const GroupSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  primaryUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    user: {  // Reference to actual User document
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    relation: {
      type: String,
      required: true
    },
    passwordHash: { type: String, required: true },
  }]
  
}, { timestamps: true });


// Check if the model already exists, if not, define it
const Group = mongoose.models.Group || mongoose.model('Group', GroupSchema);

module.exports = Group;
