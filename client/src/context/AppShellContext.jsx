import { createContext, useContext, useEffect, useMemo, useState } from "react";

const AppShellContext = createContext(null);

const defaultUser = {
  role: "Admin",
  name: "Aleeha",
};

export const AppShellProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => localStorage.getItem("restaurant-theme") || "plum");
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("restaurant-user");
    return saved ? JSON.parse(saved) : null;
  });
  const [toasts, setToasts] = useState([]);
  const [modalConfig, setModalConfig] = useState(null);
  const [commandPalette, setCommandPalette] = useState({
    openOrderForm: 0,
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("restaurant-theme", theme);
  }, [theme]);

  useEffect(() => {
    if (user) {
      localStorage.setItem("restaurant-user", JSON.stringify(user));
      return;
    }

    localStorage.removeItem("restaurant-user");
  }, [user]);

  const showToast = (message, tone = "info") => {
    const id = Date.now() + Math.random();
    setToasts((current) => [...current, { id, message, tone }]);

    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 3200);
  };

  const showConfirm = ({ title, description, confirmLabel = "Confirm", onConfirm, tone = "danger" }) => {
    setModalConfig({
      title,
      description,
      confirmLabel,
      tone,
      onConfirm: () => {
        onConfirm?.();
        setModalConfig(null);
      },
    });
  };

  const value = useMemo(
    () => ({
      theme,
      setTheme,
      user,
      setUser,
      defaultUser,
      showToast,
      toasts,
      modalConfig,
      setModalConfig,
      showConfirm,
      commandPalette,
      triggerOrderShortcut: () =>
        setCommandPalette((current) => ({
          ...current,
          openOrderForm: current.openOrderForm + 1,
        })),
      logout: () => setUser(null),
    }),
    [theme, user, toasts, modalConfig, commandPalette],
  );

  return <AppShellContext.Provider value={value}>{children}</AppShellContext.Provider>;
};

export const useAppShell = () => {
  const context = useContext(AppShellContext);

  if (!context) {
    throw new Error("useAppShell must be used inside AppShellProvider.");
  }

  return context;
};
