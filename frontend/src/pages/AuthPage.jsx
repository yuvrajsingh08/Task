import { useState } from "react";
import { CheckCircle2, LockKeyhole, LogIn, UserPlus } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const initialForm = {
  name: "",
  email: "",
  password: "",
};

function AuthPage() {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState(initialForm);
  const { authLoading, authMessage, login, signup } = useAuth();
  const isSignup = mode === "signup";

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (isSignup) {
      signup(form);
      return;
    }

    login({ email: form.email, password: form.password });
  };

  const switchMode = (nextMode) => {
    setMode(nextMode);
    setForm(initialForm);
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-3 py-6 dark:bg-slate-950 sm:px-4 sm:py-10">
      <section className="grid w-full max-w-5xl overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl shadow-slate-200/60 dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/20 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="bg-slate-950 p-6 text-white sm:p-8">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-white/15 p-2.5">
              <CheckCircle2 size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-black">TaskFlow</h1>
              <p className="text-sm text-slate-200">Smart task management</p>
            </div>
          </div>

          <h2 className="mt-8 max-w-lg text-2xl font-black leading-tight sm:text-3xl">
            Organize work with your own secure task board.
          </h2>
          <p className="mt-4 text-sm leading-7 text-slate-200">
            Login to manage private tasks, track progress, filter priorities,
            and get smart task suggestions.
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-sm">
              JWT protected API
            </span>
            <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-sm">
              User-wise tasks
            </span>
            <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-sm">
              MongoDB storage
            </span>
          </div>
        </div>

        <form className="p-5 sm:p-8" onSubmit={handleSubmit}>
          <div className="flex gap-2 rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
            <button
              className={`flex min-w-0 flex-1 items-center justify-center gap-2 rounded-md px-3 py-2.5 text-sm font-semibold transition ${mode === "login" ? "bg-white text-slate-900 shadow dark:bg-slate-700 dark:text-white" : "text-slate-600 dark:text-slate-300"}`}
              type="button"
              onClick={() => switchMode("login")}>
              <LogIn size={17} />
              Login
            </button>
            <button
              className={`flex min-w-0 flex-1 items-center justify-center gap-2 rounded-md px-3 py-2.5 text-sm font-semibold transition ${mode === "signup" ? "bg-white text-slate-900 shadow dark:bg-slate-700 dark:text-white" : "text-slate-600 dark:text-slate-300"}`}
              type="button"
              onClick={() => switchMode("signup")}>
              <UserPlus size={17} />
              Signup
            </button>
          </div>

          <div className="mt-6 flex items-center gap-3">
            <div className="rounded-lg bg-pink-100 p-2.5 text-pink-600 dark:bg-pink-950/40 dark:text-pink-300">
              <LockKeyhole size={22} />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">
                {isSignup ? "Create Account" : "Welcome Back"}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {isSignup
                  ? "Signup to start your board."
                  : "Login to continue your board."}
              </p>
            </div>
          </div>

          {isSignup && (
            <input
              className="mt-5 w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-pink-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Full name"
              required
            />
          )}

          <input
            className="mt-3 w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-pink-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Email address"
            required
          />

          <input
            className="mt-3 w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-pink-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Password"
            minLength="6"
            required
          />

          {authMessage && (
            <p className="mt-3 text-sm text-rose-500">{authMessage}</p>
          )}

          <button
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-3 font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
            type="submit"
            disabled={authLoading}>
            {isSignup ? <UserPlus size={18} /> : <LogIn size={18} />}
            {authLoading
              ? "Please wait..."
              : isSignup
                ? "Create Account"
                : "Login"}
          </button>
        </form>
      </section>
    </main>
  );
}

export default AuthPage;
