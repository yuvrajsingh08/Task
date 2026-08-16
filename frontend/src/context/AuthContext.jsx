import { createContext, useContext, useEffect, useState } from "react";
import api from "../api";
import { useToast } from "./ToastContext";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const { showToast } = useToast();
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("stackUser");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [authLoading, setAuthLoading] = useState(false);
  const [authMessage, setAuthMessage] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("stackToken");

    if (!token) {
      return;
    }

    const loadProfile = async () => {
      try {
        const response = await api.get("/auth/profile");
        setUser(response.data.user);
        localStorage.setItem(
          "stackUser",
          JSON.stringify(response.data.user),
        );
      } catch (error) {
        logout();
      }
    };

    loadProfile();
  }, []);

  const saveSession = (data) => {
    localStorage.setItem("stackToken", data.token);
    localStorage.setItem("stackUser", JSON.stringify(data.user));
    setUser(data.user);
  };

  const signup = async (form) => {
    setAuthLoading(true);
    setAuthMessage("");

    try {
      const response = await api.post("/auth/signup", form);
      saveSession(response.data);
      showToast("Welcome! Your account has been created.", "success");
    } catch (error) {
      const message = error.response?.data?.message || "Signup failed";
      setAuthMessage(message);
      showToast(message, "error");
    } finally {
      setAuthLoading(false);
    }
  };

  const login = async (form) => {
    setAuthLoading(true);
    setAuthMessage("");

    try {
      const response = await api.post("/auth/login", form);
      saveSession(response.data);
      showToast("Logged in successfully.", "success");
    } catch (error) {
      const message = error.response?.data?.message || "Login failed";
      setAuthMessage(message);
      showToast(message, "error");
    } finally {
      setAuthLoading(false);
    }
  };

  const forgotPassword = async (email) => {
    setAuthLoading(true);
    setAuthMessage("");

    try {
      const response = await api.post("/auth/forgot-password", { email });
      const message = response.data.message || "Recovery instructions sent";
      setAuthMessage(message);
      showToast(message, "info");
    } catch (error) {
      const message =
        error.response?.data?.message || "Unable to process recovery request";
      setAuthMessage(message);
      showToast(message, "error");
    } finally {
      setAuthLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("stackToken");
    localStorage.removeItem("stackUser");
    setUser(null);
    showToast("You have been logged out.", "info");
  };

  return (
    <AuthContext.Provider
      value={{
        authLoading,
        authMessage,
        login,
        logout,
        signup,
        forgotPassword,
        user,
      }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
