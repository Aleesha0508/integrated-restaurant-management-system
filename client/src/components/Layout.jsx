import { useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAppShell } from "../context/AppShellContext.jsx";

const secondaryNav = [
  { to: "/analytics", label: "Analytics" },
  { to: "/workflow", label: "Kitchen & Orders" },
];

const buildPageLabel = (pathname, entities) => {
  if (pathname === "/") {
    return "Operations Dashboard";
  }

  if (pathname === "/analytics") {
    return "Business Analytics";
  }

  if (pathname === "/workflow") {
    return "Kitchen and Order Workflow";
  }

  const entity = entities.find((item) => pathname.includes(item.key));
  return entity?.label || "Restaurant DBMS";
};

const Layout = ({ entities, children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const pageLabel = buildPageLabel(location.pathname, entities);
  const { theme, setTheme, user, logout, showToast, setModalConfig, triggerOrderShortcut } = useAppShell();

  useEffect(() => {
    const handler = (event) => {
      const activeTag = document.activeElement?.tagName?.toLowerCase();
      const isTyping = ["input", "textarea", "select"].includes(activeTag);

      if (event.key === "Escape") {
        setModalConfig(null);
      }

      if (isTyping) {
        return;
      }

      if (event.key === "/") {
        event.preventDefault();
        navigate("/entities/customers");
      }

      if (event.key.toLowerCase() === "n") {
        event.preventDefault();
        navigate("/workflow");
        triggerOrderShortcut();
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [navigate, setModalConfig, triggerOrderShortcut]);

  return (
    <div className="min-h-screen px-4 py-6 text-slate-100 md:px-6">
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[290px_minmax(0,1fr)]">
        <aside className="rounded-[32px] border border-white/10 bg-slate-900/70 p-5 shadow-glow backdrop-blur">
          <div className="rounded-[28px] border border-white/10 bg-gradient-to-br from-fuchsia-500/20 via-white/5 to-sky-500/10 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-fuchsia-200">Restaurant DBMS</p>
            <h1 className="mt-3 text-3xl font-bold leading-tight text-white">Integrated Management System</h1>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              Daily operations, billing, recipes, procurement, and stock management in one place.
            </p>

            <div className="mt-5 grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-3">
                <p className="text-slate-400">Stack</p>
                <p className="mt-1 font-semibold text-white">React + Express</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-3">
                <p className="text-slate-400">Database</p>
                <p className="mt-1 font-semibold text-white">MySQL Schema</p>
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-white/10 bg-slate-950/50 p-4">
              <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Signed In</p>
              <p className="mt-2 text-lg font-semibold text-white">{user.name}</p>
              <p className="text-sm text-fuchsia-200">{user.role}</p>
            </div>
          </div>

          <nav className="mt-8 space-y-2">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `block rounded-2xl px-4 py-3 text-sm transition ${
                  isActive
                    ? "bg-fuchsia-500 text-white shadow-lg shadow-fuchsia-500/20"
                    : "bg-white/5 text-slate-200 hover:bg-white/10"
                }`
              }
            >
              Dashboard
            </NavLink>

            {secondaryNav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `block rounded-2xl px-4 py-3 text-sm transition ${
                    isActive
                      ? "bg-sky-500 text-white shadow-lg shadow-sky-500/20"
                      : "bg-white/5 text-slate-200 hover:bg-white/10"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}

            {entities.map((entity) => (
              <NavLink
                key={entity.key}
                to={`/entities/${entity.key}`}
                className={({ isActive }) =>
                  `block rounded-2xl px-4 py-3 text-sm transition ${
                  isActive
                      ? "bg-violet-500 text-white shadow-lg shadow-violet-500/20"
                      : "bg-white/5 text-slate-200 hover:bg-white/10"
                  }`
                }
              >
                {entity.label}
              </NavLink>
            ))}
          </nav>

          <div className="mt-8 space-y-3 rounded-[28px] border border-white/10 bg-white/[0.03] p-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Theme</p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {[
                  { value: "plum", label: "Plum Night" },
                  { value: "aurora", label: "Aurora Blue" },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      setTheme(option.value);
                      showToast(`Theme switched to ${option.label}.`, "info");
                    }}
                    className={`rounded-2xl px-3 py-3 text-xs font-semibold transition ${
                      theme === option.value
                        ? "bg-white text-slate-950"
                        : "bg-slate-950/60 text-slate-200 hover:bg-slate-900"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                logout();
                showToast("Logged out successfully.", "success");
              }}
              className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm font-semibold text-slate-100 transition hover:bg-slate-900"
            >
              Switch Role
            </button>
          </div>
        </aside>

        <main className="rounded-[32px] border border-white/10 bg-slate-950/50 p-4 backdrop-blur md:p-6">
          <header className="mb-6 flex flex-col gap-4 rounded-[28px] border border-white/10 bg-white/[0.03] p-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-fuchsia-200">Control Center</p>
              <h2 className="mt-2 text-2xl font-bold text-white">{pageLabel}</h2>
              <p className="mt-2 text-sm text-slate-300">
                Clean operational visibility with schema-matched CRUD actions and live MySQL-backed data.
              </p>
            </div>

            <div className="flex flex-wrap gap-3 text-sm">
              <div className="rounded-2xl border border-fuchsia-400/20 bg-fuchsia-500/10 px-4 py-3 text-fuchsia-100">
                {user.role} workspace
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 text-slate-200">
                12 tables + 2 SQL views
              </div>
            </div>
          </header>

          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
