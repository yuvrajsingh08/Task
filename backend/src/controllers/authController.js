const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/User");
const { isValidEmail, normalizeEmail } = require("../utils/validation");
const { sendPasswordResetEmail } = require("../services/emailService");

const createToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET || "task_manager_secret",
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    },
  );
};

const sendAuthResponse = (res, user, statusCode) => {
  res.status(statusCode).json({
    token: createToken(user._id),
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      emailNotificationsEnabled: user.emailNotificationsEnabled !== false,
    },
  });
};

const createResetToken = () => crypto.randomBytes(32).toString("hex");

const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const normalizedEmail = normalizeEmail(email);

    if (!name || !normalizedEmail || !password) {
      return res
        .status(400)
        .json({ message: "Name, email, and password are required" });
    }

    if (!isValidEmail(normalizedEmail)) {
      return res
        .status(400)
        .json({ message: "Please enter a valid email address" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters long" });
    }

    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User already exists with this email" });
    }

    const user = await User.create({ name, email: normalizedEmail, password });
    sendAuthResponse(res, user, 201);
  } catch (error) {
    res.status(500).json({ message: "Signup failed", error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = normalizeEmail(email);

    if (!normalizedEmail || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email: normalizedEmail });

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    sendAuthResponse(res, user, 200);
  } catch (error) {
    res.status(500).json({ message: "Login failed", error: error.message });
  }
};

const getProfile = async (req, res) => {
  res.json({
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      emailNotificationsEnabled: req.user.emailNotificationsEnabled !== false,
    },
  });
};

const updatePreferences = async (req, res) => {
  try {
    const { emailNotificationsEnabled } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { emailNotificationsEnabled: Boolean(emailNotificationsEnabled) },
      { new: true, runValidators: true },
    ).select("-password");

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        emailNotificationsEnabled: user.emailNotificationsEnabled,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Unable to update preferences", error: error.message });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const normalizedEmail = normalizeEmail(email);

    if (!normalizedEmail) {
      return res.status(400).json({ message: "Email is required" });
    }

    if (!isValidEmail(normalizedEmail)) {
      return res
        .status(400)
        .json({ message: "Please enter a valid email address" });
    }

    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res
        .status(404)
        .json({ message: "No account found with that email" });
    }

    const resetToken = createResetToken();
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 1000 * 60 * 15;
    await user.save();

    const resetLink = `${process.env.FRONTEND_URL || "http://localhost:5173"}/reset-password?token=${resetToken}&email=${encodeURIComponent(normalizedEmail)}`;
    const result = await sendPasswordResetEmail({
      to: normalizedEmail,
      resetLink,
    });

    if (result.skipped) {
      return res.status(502).json({ message: result.reason });
    }

    res.json({
      message: "A password reset link has been sent.",
    });
  } catch (error) {
    res.status(500).json({
      message: "Unable to process password reset request",
      error: error.message,
    });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, token, password } = req.body;
    const normalizedEmail = normalizeEmail(email);

    if (!normalizedEmail || !token || !password) {
      return res
        .status(400)
        .json({ message: "Email, token, and password are required" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters long" });
    }

    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res
        .status(404)
        .json({ message: "No account found with that email" });
    }

    if (
      user.resetPasswordToken !== token ||
      !user.resetPasswordExpires ||
      user.resetPasswordExpires < Date.now()
    ) {
      return res
        .status(400)
        .json({ message: "Reset link is invalid or has expired" });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Unable to reset password", error: error.message });
  }
};

module.exports = {
  signup,
  login,
  getProfile,
  updatePreferences,
  forgotPassword,
  resetPassword,
};
