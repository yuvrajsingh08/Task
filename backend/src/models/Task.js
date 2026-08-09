const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      trim: true,
      default: ""
    },
    status: {
      type: String,
      enum: ["Pending", "Completed"],
      default: "Pending"
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium"
    },
    category: {
      type: String,
      trim: true,
      default: "General"
    },
    dueDate: {
      type: Date,
      default: null
    },
    reminderAt: {
      type: Date,
      default: null
    },
    reminderEmailEnabled: {
      type: Boolean,
      default: false
    },
    reminderEmailSentAt: {
      type: Date,
      default: null
    },
    reminderEmailStatus: {
      type: String,
      enum: ["pending", "sent", "skipped", "failed"],
      default: "pending"
    },
    reminderLastError: {
      type: String,
      default: ""
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Task", taskSchema);
