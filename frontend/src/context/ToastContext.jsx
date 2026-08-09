import { createContext, useContext, useMemo } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ToastContext = createContext();

export function ToastProvider({ children }) {
  const showToast = (message, type = "info", duration = 3000) => {
    const toastType =
      type === "error" ? "error" : type === "success" ? "success" : "info";

    toast[toastType](message, {
      autoClose: duration,
      position: "top-right",
      theme: "colored",
    });
  };

  const value = useMemo(() => ({ showToast }), []);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used inside ToastProvider");
  }

  return context;
}
