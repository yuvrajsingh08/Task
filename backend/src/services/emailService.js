const sgMail = require("@sendgrid/mail");
let nodemailer = null;

try {
  nodemailer = require("nodemailer");
} catch (error) {
  nodemailer = null;
}

const isSendGridConfigured = () => {
  return Boolean(
    process.env.SENDGRID_API_KEY &&
    (process.env.SENDGRID_FROM_EMAIL || process.env.EMAIL_FROM),
  );
};

const isSmtpConfigured = () => {
  return Boolean(
    nodemailer &&
    process.env.SMTP_HOST &&
    process.env.SMTP_PORT &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS,
  );
};

const isEmailConfigured = () => {
  return isSendGridConfigured() || isSmtpConfigured();
};

const createSmtpTransporter = () => {
  if (!isSmtpConfigured()) {
    return null;
  }

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

const sendGridSendMail = async ({ from, to, subject, text, html }) => {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);

  await sgMail.send({
    from,
    to,
    subject,
    text,
    html,
  });
};

const sendSmtpMail = async ({ from, to, subject, text, html }) => {
  const transporter = createSmtpTransporter();

  if (!transporter) {
    throw new Error("SMTP email is not configured.");
  }

  await transporter.sendMail({
    from,
    to,
    subject,
    text,
    html,
  });
};

const sendMail = async ({ to, subject, text, html }) => {
  const from =
    process.env.EMAIL_FROM ||
    process.env.SENDGRID_FROM_EMAIL ||
    process.env.SMTP_USER;

  if (!from) {
    return {
      skipped: true,
      reason:
        "Email sender address is not configured. Set EMAIL_FROM or SENDGRID_FROM_EMAIL.",
    };
  }

  if (isSendGridConfigured()) {
    await sendGridSendMail({ from, to, subject, text, html });
    return { skipped: false };
  }

  if (isSmtpConfigured()) {
    await sendSmtpMail({ from, to, subject, text, html });
    return { skipped: false };
  }

  return {
    skipped: true,
    reason:
      "Email is not configured. Use SENDGRID_API_KEY with SENDGRID_FROM_EMAIL, or SMTP_HOST/SMTP_PORT/SMTP_USER/SMTP_PASS.",
  };
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
  if (!isEmailConfigured()) {
    return {
      skipped: true,
      reason:
        "Email is not configured. Use SENDGRID_API_KEY with SENDGRID_FROM_EMAIL, or SMTP_HOST/SMTP_PORT/SMTP_USER/SMTP_PASS.",
    };
  }

  const appName = process.env.APP_NAME || "TaskFlow";
  const from =
    process.env.EMAIL_FROM ||
    process.env.SENDGRID_FROM_EMAIL ||
    process.env.SMTP_USER;
  const safeTitle = escapeHtml(task.title);
  const safeDescription = escapeHtml(
    task.description || "No description added.",
  );
  const safePriority = escapeHtml(task.priority);
  const safeCategory = escapeHtml(task.category || "General");

  const textBody = [
    `Reminder for: ${task.title}`,
    "",
    `Priority: ${task.priority}`,
    `Category: ${task.category || "General"}`,
    `Due date: ${formatDate(task.dueDate)}`,
    `Reminder time: ${formatDate(task.reminderAt)}`,
    "",
    task.description || "No description added.",
  ].join("\n");

  const htmlBody = `
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
  `;

  await sendMail({
    to: user.email,
    subject: `${appName} reminder: ${task.title}`,
    text: textBody,
    html: htmlBody,
  });

  return { skipped: false };
};

const sendPasswordResetEmail = async ({ to, resetLink }) => {
  if (!isEmailConfigured()) {
    return {
      skipped: true,
      reason:
        "Email is not configured. Use SENDGRID_API_KEY with SENDGRID_FROM_EMAIL, or SMTP_HOST/SMTP_PORT/SMTP_USER/SMTP_PASS.",
    };
  }

  const appName = process.env.APP_NAME || "TaskFlow";
  const from =
    process.env.EMAIL_FROM ||
    process.env.SENDGRID_FROM_EMAIL ||
    process.env.SMTP_USER;

  const textBody = [
    `Hello,`,
    "",
    `You requested a password reset for ${appName}.`,
    `Use this link to continue: ${resetLink}`,
    "",
    "If you did not request this, you can ignore this email.",
  ].join("\n");

  const htmlBody = `
    <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #0f172a;">
      <h2 style="margin: 0 0 12px;">${appName} password reset</h2>
      <p>Use the link below to continue your password reset.</p>
      <p><a href="${resetLink}">${resetLink}</a></p>
    </div>
  `;

  await sendMail({
    to,
    subject: `${appName} password reset request`,
    text: textBody,
    html: htmlBody,
  });

  return { skipped: false };
};

module.exports = {
  isEmailConfigured,
  sendTaskReminderEmail,
  sendPasswordResetEmail,
};
