import { useEffect, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  LockKeyhole,
  Eye,
  EyeOff,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import api from "../api";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const query = useQuery();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const email = query.get("email") || "";
  const token = query.get("token") || "";

  useEffect(() => {
    if (!email || !token) {
      setError("The password reset link is incomplete.");
    }
  }, [email, token]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessage("");
    setError("");

    if (!password || password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/auth/reset-password", {
        email,
        token,
        password,
      });

      setMessage(
        response.data.message || "Password updated successfully."
      );

      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to reset password."
      );
    } finally {
      setLoading(false);
    }
  };

  const hasValidLink = Boolean(email && token);

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 dark:bg-slate-950 sm:px-6">
      {/* Header */}
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between">
        <Link
          to="/login"
          className="flex items-center gap-2.5"
        >
          <img
            src="/assets/logo.png"
            alt="Stack"
            className="h-9 w-9 rounded-lg object-contain"
          />

          <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
            Stack
          </span>
        </Link>

        <div className="text-sm text-slate-500 dark:text-slate-400">
          Remember your password?{" "}
          <Link
            to="/login"
            className="font-semibold text-orange-600 transition hover:text-orange-700 hover:underline dark:text-orange-400 dark:hover:text-orange-300"
          >
            Login
          </Link>
        </div>
      </header>

      {/* Content */}
      <section className="mx-auto flex w-full max-w-6xl justify-center py-10 sm:py-16">
        <div className="w-full max-w-md">
          {/* Heading */}
          <div className="mb-7">
            <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl border border-orange-100 bg-orange-50 text-orange-500 shadow-sm dark:border-orange-500/20 dark:bg-orange-500/10 dark:text-orange-400">
              {message ? (
                <CheckCircle2 size={20} strokeWidth={2} />
              ) : (
                <LockKeyhole size={20} strokeWidth={2} />
              )}
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-3xl">
              Create a new password
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
              Choose a strong password to secure your account.
            </p>
          </div>

          {/* Form Card */}
          <div className="rounded-xl border border-orange-100 bg-white p-5 shadow-sm shadow-orange-100/40 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none sm:p-6">
            <form onSubmit={handleSubmit}>
              {/* New Password */}
              <div className="mb-4">
                <label
                  htmlFor="password"
                  className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300"
                >
                  New password
                </label>

                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError("");
                      setMessage("");
                    }}
                    placeholder="Enter your new password"
                    autoComplete="new-password"
                    minLength={6}
                    required
                    disabled={!hasValidLink || loading}
                    className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-3.5 pr-11 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-orange-500 dark:focus:ring-orange-500/10"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    disabled={!password || loading}
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:text-slate-200"
                  >
                    {showPassword ? (
                      <EyeOff size={17} />
                    ) : (
                      <Eye size={17} />
                    )}
                  </button>
                </div>

                <p className="mt-1.5 text-xs text-slate-400 dark:text-slate-500">
                  Use at least 6 characters.
                </p>
              </div>

              {/* Confirm Password */}
              <div className="mb-4">
                <label
                  htmlFor="confirmPassword"
                  className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300"
                >
                  Confirm password
                </label>

                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={
                      showConfirmPassword ? "text" : "password"
                    }
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setError("");
                      setMessage("");
                    }}
                    placeholder="Re-enter your new password"
                    autoComplete="new-password"
                    required
                    disabled={!hasValidLink || loading}
                    className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-3.5 pr-11 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-orange-500 dark:focus:ring-orange-500/10"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword((current) => !current)
                    }
                    disabled={!confirmPassword || loading}
                    aria-label={
                      showConfirmPassword
                        ? "Hide password"
                        : "Show password"
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:text-slate-200"
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={17} />
                    ) : (
                      <Eye size={17} />
                    )}
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-sm leading-5 text-rose-600 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-400">
                  {error}
                </div>
              )}

              {/* Success */}
              {message && (
                <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-sm leading-5 text-emerald-600 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-400">
                  {message}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading || !hasValidLink}
                className="group flex w-full items-center justify-center gap-2 rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-orange-200 transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-orange-500 dark:text-white dark:shadow-orange-950/30 dark:hover:bg-orange-400"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Updating password...
                  </>
                ) : (
                  <>
                    Update password
                    <ArrowRight
                      size={16}
                      className="transition-transform group-hover:translate-x-0.5"
                    />
                  </>
                )}
              </button>
            </form>

            {/* Back to Login */}
            <Link
              to="/login"
              className="mt-4 block w-full text-center text-sm font-medium text-slate-500 transition hover:text-orange-600 hover:underline dark:text-slate-400 dark:hover:text-orange-400"
            >
              ← Back to login
            </Link>
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
