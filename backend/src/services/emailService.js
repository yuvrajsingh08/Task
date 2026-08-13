const sgMail = require("@sendgrid/mail");

const isEmailConfigured = () => {
  return Boolean(
    process.env.SENDGRID_API_KEY &&
    (process.env.SENDGRID_FROM_EMAIL || process.env.EMAIL_FROM)
  );
};

const sendMail = async ({ to, subject, text, html }) => {
  if (!isEmailConfigured()) {
    return {
      skipped: true,
      reason:
        "Email is not configured. Set SENDGRID_API_KEY and SENDGRID_FROM_EMAIL.",
    };
  }

  const from =
    process.env.SENDGRID_FROM_EMAIL || process.env.EMAIL_FROM;

  sgMail.setApiKey(process.env.SENDGRID_API_KEY);

  await sgMail.send({
    from,
    to,
    subject,
    text,
    html,
  });

  return { skipped: false };
};

const formatDate = (date) => {
  if (!date) {
    return "No date set";
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
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
        "Email is not configured. Set SENDGRID_API_KEY and SENDGRID_FROM_EMAIL.",
    };
  }

  const appName = process.env.APP_NAME || "Stack";

  const safeTitle = escapeHtml(task.title);
  const safeDescription = escapeHtml(
    task.description || "No description added."
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

      <p>
        <strong>${safeTitle}</strong>
      </p>

      <p>
        ${safeDescription}
      </p>

      <ul>
        <li>
          <strong>Priority:</strong> ${safePriority}
        </li>
        <li>
          <strong>Category:</strong> ${safeCategory}
        </li>
        <li>
          <strong>Due date:</strong> ${formatDate(task.dueDate)}
        </li>
        <li>
          <strong>Reminder:</strong> ${formatDate(task.reminderAt)}
        </li>
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
        "Email is not configured. Set SENDGRID_API_KEY and SENDGRID_FROM_EMAIL.",
    };
  }

  const appName = process.env.APP_NAME || "Stack";

  const textBody = [
    "Hello,",
    "",
    `You requested a password reset for ${appName}.`,
    "",
    `Use this link to continue: ${resetLink}`,
    "",
    "If you did not request this, you can ignore this email.",
  ].join("\n");

  const htmlBody = `
    <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #0f172a;">
      <h2 style="margin: 0 0 12px;">
        ${appName} password reset
      </h2>

      <p>
        You requested a password reset for your account.
      </p>

      <p>
        Click the button below to reset your password:
      </p>

      <p>
        <a
          href="${resetLink}"
          style="
            display: inline-block;
            padding: 10px 18px;
            background: #2563eb;
            color: white;
            text-decoration: none;
            border-radius: 6px;
          "
        >
          Reset Password
        </a>
      </p>

      <p>
        Or copy and paste this link into your browser:
      </p>

      <p>
        ${escapeHtml(resetLink)}
      </p>

      <p>
        If you did not request this, you can safely ignore this email.
      </p>
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