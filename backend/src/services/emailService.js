let nodemailer = null;

try {
  nodemailer = require("nodemailer");
} catch (error) {
  nodemailer = null;
}

const isEmailConfigured = () => {
  console.log("Checking email configuration...");
  console.log("SMTP_HOST:", process.env.SMTP_HOST);
  console.log("SMTP_PORT:", process.env.SMTP_PORT);
  console.log("SMTP_USER:", process.env.SMTP_USER);
  console.log("SMTP_PASS:", process.env.SMTP_PASS);
  console.log("nodemailer module loaded:", nodemailer);
  const isConfigured = Boolean(
    nodemailer &&
    process.env.SMTP_HOST &&
    process.env.SMTP_PORT &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS,
  );
  console.log("Email configuration status:", isConfigured);
  return isConfigured;
};

const createTransporter = () => {
  console.log("Creating email transporter...");
  if (!isEmailConfigured()) {
    return null;
  }
  console.log("SMTP_HOST:", process.env.SMTP_HOST);
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

const formatDate = (date) => {
  if (!date) {
    return "No date set";
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

const escapeHtml = (value) => {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

const sendTaskReminderEmail = async ({ task, user }) => {
  const transporter = createTransporter();
  console.log("Transporter created:", transporter);
  if (!transporter) {
    return {
      skipped: true,
      reason:
        "Email is not configured. Install nodemailer and set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS.",
    };
  }

  const appName = process.env.APP_NAME || "TaskFlow";
  const from = process.env.EMAIL_FROM || process.env.SMTP_USER;
  const safeTitle = escapeHtml(task.title);
  const safeDescription = escapeHtml(
    task.description || "No description added.",
  );
  const safePriority = escapeHtml(task.priority);
  const safeCategory = escapeHtml(task.category || "General");

  await transporter.sendMail({
    from,
    to: user.email,
    subject: `${appName} reminder: ${task.title}`,
    text: [
      `Reminder for: ${task.title}`,
      "",
      `Priority: ${task.priority}`,
      `Category: ${task.category || "General"}`,
      `Due date: ${formatDate(task.dueDate)}`,
      `Reminder time: ${formatDate(task.reminderAt)}`,
      "",
      task.description || "No description added.",
    ].join("\n"),
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #0f172a;">
        <h2 style="margin: 0 0 12px;">${appName} reminder</h2>
        <p><strong>${safeTitle}</strong></p>
        <p>${safeDescription}</p>
        <ul>
          <li><strong>Priority:</strong> ${safePriority}</li>
          <li><strong>Category:</strong> ${safeCategory}</li>
          <li><strong>Due date:</strong> ${formatDate(task.dueDate)}</li>
          <li><strong>Reminder:</strong> ${formatDate(task.reminderAt)}</li>
        </ul>
      </div>
    `,
  });

  return { skipped: false };
};

const sendPasswordResetEmail = async ({ to, resetLink }) => {
  const transporter = createTransporter();

  if (!transporter) {
    return {
      skipped: true,
      reason:
        "Email is not configured. Install nodemailer and set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS.",
    };
  }

  const appName = process.env.APP_NAME || "TaskFlow";
  const from = process.env.EMAIL_FROM || process.env.SMTP_USER;

  await transporter.sendMail({
    from,
    to,
    subject: `${appName} password reset request`,
    text: [
      `Hello,`,
      "",
      `You requested a password reset for ${appName}.`,
      `Use this link to continue: ${resetLink}`,
      "",
      "If you did not request this, you can ignore this email.",
    ].join("\n"),
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #0f172a;">
        <h2 style="margin: 0 0 12px;">${appName} password reset</h2>
        <p>Use the link below to continue your password reset.</p>
        <p><a href="${resetLink}">${resetLink}</a></p>
      </div>
    `,
  });

  return { skipped: false };
};

module.exports = {
  isEmailConfigured,
  sendTaskReminderEmail,
  sendPasswordResetEmail,
};
