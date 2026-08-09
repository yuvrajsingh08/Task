import { createContext, useContext, useEffect, useState } from "react";
import api from "../api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("taskflowUser");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [authLoading, setAuthLoading] = useState(false);
  const [authMessage, setAuthMessage] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("taskflowToken");

    if (!token) {
      return;
    }

    const loadProfile = async () => {
      try {
        const response = await api.get("/auth/profile");
        setUser(response.data.user);
        localStorage.setItem("taskflowUser", JSON.stringify(response.data.user));
      } catch (error) {
        logout();
      }
    };

    loadProfile();
  }, []);

  const saveSession = (data) => {
    localStorage.setItem("taskflowToken", data.token);
    localStorage.setItem("taskflowUser", JSON.stringify(data.user));
    setUser(data.user);
  };

  const signup = async (form) => {
    setAuthLoading(true);
    setAuthMessage("");

    try {
      const response = await api.post("/auth/signup", form);
      saveSession(response.data);
    } catch (error) {
      setAuthMessage(error.response?.data?.message || "Signup failed");
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
    } catch (error) {
      setAuthMessage(error.response?.data?.message || "Login failed");
    } finally {
      setAuthLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("taskflowToken");
    localStorage.removeItem("taskflowUser");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ authLoading, authMessage, login, logout, signup, user }}>
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
