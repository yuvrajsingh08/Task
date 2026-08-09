const Task = require("../models/Task");
const { sendTaskReminderEmail } = require("./emailService");

const REMINDER_INTERVAL_MS = Number(process.env.REMINDER_INTERVAL_MS || 60000);

const processDueReminders = async () => {
  const now = new Date();

  const tasks = await Task.find({
    status: "Pending",
    reminderEmailEnabled: true,
    reminderAt: { $lte: now },
    reminderEmailSentAt: null,
    reminderEmailStatus: { $ne: "skipped" }
  }).populate("user", "name email emailNotificationsEnabled");

  for (const task of tasks) {
    if (task.user?.emailNotificationsEnabled === false) {
      task.reminderEmailStatus = "skipped";
      task.reminderLastError = "User has disabled email notifications.";
      await task.save();
      continue;
    }

    try {
      const result = await sendTaskReminderEmail({ task, user: task.user });

      if (result.skipped) {
        task.reminderEmailStatus = "skipped";
        task.reminderLastError = result.reason;
      } else {
        task.reminderEmailStatus = "sent";
        task.reminderEmailSentAt = new Date();
        task.reminderLastError = "";
      }

      await task.save();
    } catch (error) {
      task.reminderEmailStatus = "failed";
      task.reminderLastError = error.message;
      await task.save();
    }
  }
};

const startReminderScheduler = () => {
  setInterval(() => {
    processDueReminders().catch((error) => {
      console.error("Reminder scheduler failed:", error.message);
    });
  }, REMINDER_INTERVAL_MS);
};

module.exports = {
  processDueReminders,
  startReminderScheduler
};
