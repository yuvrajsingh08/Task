import { useEffect, useState } from "react";
import {
  ArrowRight,
  LockKeyhole,
  LogIn,
  Mail,
  UserPlus,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const initialForm = {
  name: "",
  email: "",
  password: "",
};

const isEmailFormatValid = (value = "") => {
  const normalized = value.trim().toLowerCase();

  if (!normalized) {
    return false;
  }

  const emailPattern =
    /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9-]+(?:\.[a-z0-9-]+)+$/i;

  return (
    emailPattern.test(normalized) &&
    !normalized.startsWith(".") &&
    !normalized.endsWith(".")
  );
};

function AuthPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const initialMode =
    location.pathname === "/signup" ? "signup" : "login";

  const [mode, setMode] = useState(initialMode);
  const [isRecovery, setIsRecovery] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [formMessage, setFormMessage] = useState("");

  // Tracks only the action currently shown to the user.
  // This is intentionally separate from authLoading.
  const [submittingAction, setSubmittingAction] = useState(null);

  const { authMessage, login, signup, forgotPassword } = useAuth();

  const isSignup = mode === "signup";

  const isSubmitting = submittingAction !== null;

  useEffect(() => {
    setMode(initialMode);
    setIsRecovery(false);
    setFormMessage("");
    setForm(initialForm);

    // Important:
    // If the previous page was waiting for an API request,
    // switching routes should immediately reset the UI.
    setSubmittingAction(null);
  }, [initialMode]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormMessage("");

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const normalizedEmail = form.email.trim().toLowerCase();

    setFormMessage("");

    if (!isEmailFormatValid(normalizedEmail)) {
      setFormMessage("Please enter a valid email address");
      return;
    }

    if (isRecovery) {
      setSubmittingAction("recovery");

      forgotPassword(normalizedEmail);

      return;
    }

    if (isSignup) {
      setSubmittingAction("signup");

      signup({
        ...form,
        email: normalizedEmail,
      });

      return;
    }

    setSubmittingAction("login");

    login({
      email: normalizedEmail,
      password: form.password,
    });
  };

  const switchMode = (nextMode) => {
    // Immediately reset the UI state.
    // The previous API request can continue in the background.
    setSubmittingAction(null);
    setFormMessage("");
    setIsRecovery(false);

    navigate(nextMode === "signup" ? "/signup" : "/login");
  };

  const openRecovery = () => {
    setSubmittingAction(null);
    setFormMessage("");
    setIsRecovery(true);
  };

  const backToLogin = () => {
    setSubmittingAction(null);
    setFormMessage("");
    setIsRecovery(false);
  };

  /*
   * Only show authMessage while the current screen is actually
   * associated with the request that produced it.
   *
   * If the user switches from Forgot Password → Signup,
   * the old forgot-password message won't appear on Signup.
   */
  const visibleAuthMessage =
    submittingAction || formMessage ? authMessage : "";

  const message = formMessage || visibleAuthMessage;

  const submitLabel = isSubmitting
    ? submittingAction === "recovery"
      ? "Sending..."
      : submittingAction === "signup"
        ? "Creating account..."
        : "Signing in..."
    : isRecovery
      ? "Send recovery email"
      : isSignup
        ? "Create account"
        : "Login";

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 dark:bg-slate-950 sm:px-6">
      {/* Header */}
      <header className="mx-auto flex w-full max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={() => switchMode("login")}
          className="flex items-center gap-2.5 self-start"
        >
          <img
            src="/assets/logo.png"
            alt="Stack"
            className="h-9 w-9 rounded-lg object-contain"
          />

          <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
            Stack
          </span>
        </button>

        <div className="text-sm text-slate-500 dark:text-slate-400">
          {isSignup
            ? "Already have an account?"
            : "Don't have an account?"}{" "}
          <button
            type="button"
            onClick={() => switchMode(isSignup ? "login" : "signup")}
            className="font-semibold text-orange-600 transition hover:text-orange-700 hover:underline dark:text-orange-400 dark:hover:text-orange-300"
          >
            {isSignup ? "Login" : "Sign up"}
          </button>
        </div>
      </header>

      {/* Content */}
      <section className="mx-auto flex w-full max-w-6xl justify-center py-10 sm:py-16">
        <div className="w-full max-w-md">
          {/* Heading */}
          <div className="mb-7">
            <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl border border-orange-100 bg-orange-50 text-orange-500 shadow-sm dark:border-orange-500/20 dark:bg-orange-500/10 dark:text-orange-400">
              <LockKeyhole size={20} strokeWidth={2} />
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-3xl">
              {isRecovery
                ? "Reset your password"
                : isSignup
                  ? "Create your account"
                  : "Welcome back"}
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
              {isRecovery
                ? "Enter your email address and we'll send you a recovery link."
                : isSignup
                  ? "Create an account to start managing your work."
                  : "Sign in to continue managing your tasks."}
            </p>
          </div>

          {/* Form Card */}
          <div className="rounded-xl border border-orange-100 bg-white p-5 shadow-sm shadow-orange-100/40 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none sm:p-6">
            {/* Mode switch */}
            {!isRecovery && (
              <div className="mb-6 grid grid-cols-2 rounded-lg border border-orange-100 bg-orange-50/60 p-1 dark:border-slate-800 dark:bg-slate-950">
                <button
                  type="button"
                  onClick={() => switchMode("login")}
                  className={`rounded-md px-3 py-2 text-sm font-semibold transition ${
                    mode === "login"
                      ? "bg-white text-orange-600 shadow-sm dark:bg-slate-800 dark:text-orange-400"
                      : "text-slate-500 hover:text-orange-600 dark:text-slate-400 dark:hover:text-orange-400"
                  }`}
                >
                  Login
                </button>

                <button
                  type="button"
                  onClick={() => switchMode("signup")}
                  className={`rounded-md px-3 py-2 text-sm font-semibold transition ${
                    mode === "signup"
                      ? "bg-white text-orange-600 shadow-sm dark:bg-slate-800 dark:text-orange-400"
                      : "text-slate-500 hover:text-orange-600 dark:text-slate-400 dark:hover:text-orange-400"
                  }`}
                >
                  Sign up
                </button>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Name */}
              {isSignup && (
                <div className="mb-4">
                  <label
                    htmlFor="name"
                    className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300"
                  >
                    Full name
                  </label>

                  <input
                    id="name"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Enter your name"
                    autoComplete="name"
                    required
                    className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-orange-500 dark:focus:ring-orange-500/10"
                  />
                </div>
              )}

              {/* Email */}
              <div className="mb-4">
                <label
                  htmlFor="email"
                  className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300"
                >
                  Email
                </label>

                <div className="relative">
                  <Mail
                    size={17}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    autoComplete="email"
                    required
                    className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-orange-500 dark:focus:ring-orange-500/10"
                  />
                </div>
              </div>

              {/* Password */}
              {!isRecovery && (
                <div className="mb-4">
                  <div className="mb-1.5 flex items-center justify-between">
                    <label
                      htmlFor="password"
                      className="block text-sm font-medium text-slate-700 dark:text-slate-300"
                    >
                      Password
                    </label>

                    {!isSignup && (
                      <button
                        type="button"
                        onClick={openRecovery}
                        className="text-xs font-medium text-orange-600 transition hover:text-orange-700 hover:underline dark:text-orange-400 dark:hover:text-orange-300"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>

                  <input
                    id="password"
                    name="password"
                    type="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    autoComplete={
                      isSignup ? "new-password" : "current-password"
                    }
                    minLength={6}
                    required
                    className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-orange-500 dark:focus:ring-orange-500/10"
                  />
                </div>
              )}

              {/* Message */}
              {message && (
                <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-sm text-rose-600 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-400">
                  {message}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="group flex w-full items-center justify-center gap-2 rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-orange-200 transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-orange-500 dark:text-white dark:shadow-orange-950/30 dark:hover:bg-orange-400"
              >
                {isSubmitting ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    {submitLabel}
                  </>
                ) : isRecovery ? (
                  <>
                    {submitLabel}
                    <Mail size={16} />
                  </>
                ) : isSignup ? (
                  <>
                    {submitLabel}
                    <UserPlus size={16} />
                  </>
                ) : (
                  <>
                    {submitLabel}
                    <ArrowRight
                      size={16}
                      className="transition-transform group-hover:translate-x-0.5"
                    />
                  </>
                )}
              </button>
            </form>

            {/* Recovery back */}
            {isRecovery && (
              <button
                type="button"
                onClick={backToLogin}
                className="mt-4 w-full text-center text-sm font-medium text-slate-500 transition hover:text-orange-600 hover:underline dark:text-slate-400 dark:hover:text-orange-400"
              >
                ← Back to login
              </button>
            )}
          </div>

          {/* Footer */}
          <p className="mt-6 text-center text-xs text-slate-400 dark:text-slate-500">
            Your account and workspace data are securely protected.
          </p>
        </div>
      </section>
    </main>
  );
}

export default AuthPage;