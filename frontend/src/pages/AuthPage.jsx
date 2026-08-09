import { useState } from "react";
import { CheckCircle2, LockKeyhole, LogIn, UserPlus } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const initialForm = {
  name: "",
  email: "",
  password: ""
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
    <main className="auth-page">
      <section className="auth-panel">
        <div className="auth-copy">
          <div className="brand auth-brand">
            <CheckCircle2 size={32} />
            <div>
              <h1>TaskFlow</h1>
              <span>Smart task management</span>
            </div>
          </div>

          <h2>Organize work with your own secure task board.</h2>
          <p>
            Login to manage private tasks, track progress, filter priorities, and get smart
            task suggestions.
          </p>

          <div className="auth-highlights">
            <span>JWT protected API</span>
            <span>User-wise tasks</span>
            <span>MongoDB storage</span>
          </div>
        </div>

        <form className="auth-card" onSubmit={handleSubmit}>
          <div className="auth-tabs">
            <button
              className={mode === "login" ? "active" : ""}
              type="button"
              onClick={() => switchMode("login")}
            >
              <LogIn size={17} />
              Login
            </button>
            <button
              className={mode === "signup" ? "active" : ""}
              type="button"
              onClick={() => switchMode("signup")}
            >
              <UserPlus size={17} />
              Signup
            </button>
          </div>

          <div className="auth-title">
            <LockKeyhole size={22} />
            <div>
              <h2>{isSignup ? "Create Account" : "Welcome Back"}</h2>
              <p>{isSignup ? "Signup to start your board." : "Login to continue your board."}</p>
            </div>
          </div>

          {isSignup && (
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Full name"
              required
            />
          )}

          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Email address"
            required
          />

          <input
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Password"
            minLength="6"
            required
          />

          {authMessage && <p className="auth-message">{authMessage}</p>}

          <button className="primary-btn auth-submit" type="submit" disabled={authLoading}>
            {isSignup ? <UserPlus size={18} /> : <LogIn size={18} />}
            {authLoading ? "Please wait..." : isSignup ? "Create Account" : "Login"}
          </button>
        </form>
      </section>
    </main>
  );
}

export default AuthPage;
