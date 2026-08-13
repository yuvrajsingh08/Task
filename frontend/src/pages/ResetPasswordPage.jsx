import { useEffect, useState } from "react";
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

      setMessage(response.data.message || "Password updated successfully.");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to reset password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-8 text-slate-800 dark:bg-slate-950 dark:text-slate-100 sm:py-10">
      <div className="mx-auto flex w-full max-w-md flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-lg sm:p-8 dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold">Reset your password</h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Enter a new password for your account.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">
              New password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 outline-none ring-0 dark:border-slate-700 dark:bg-slate-800"
              placeholder="Enter a new password"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Confirm password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 outline-none ring-0 dark:border-slate-700 dark:bg-slate-800"
              placeholder="Re-enter the password"
            />
          </div>

          {error ? <p className="text-sm text-red-500">{error}</p> : null}
          {message ? <p className="text-sm text-green-600">{message}</p> : null}

          <button
            type="submit"
            disabled={loading || !email || !token}
            className="w-full rounded-lg bg-slate-900 px-4 py-2 font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-slate-700 dark:hover:bg-slate-600">
            {loading ? "Updating..." : "Update password"}
          </button>
        </form>

        <div className="mt-6 text-sm text-slate-600 dark:text-slate-400">
          <Link
            to="/login"
            className="font-medium text-slate-900 hover:underline dark:text-slate-200">
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}
