import { useState } from "react";
import { useAppShell } from "../context/AppShellContext.jsx";

const roles = [
  {
    role: "Admin",
    description: "Full access to analytics, workflow, and every entity.",
  },
  {
    role: "Manager",
    description: "Operational access to menu, inventory, orders, and analytics.",
  },
  {
    role: "Staff",
    description: "Focused access to active orders and kitchen workflow.",
  },
];

const LoginPage = () => {
  const { setUser, showToast } = useAppShell();
  const [name, setName] = useState("Aleeha");
  const [role, setRole] = useState("Admin");

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(168,85,247,0.22),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.18),_transparent_25%),linear-gradient(135deg,_#090611_0%,_#130c24_52%,_#090611_100%)] px-4 py-8 text-slate-100">
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-[36px] border border-white/10 bg-white/[0.04] p-8 shadow-2xl backdrop-blur">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-fuchsia-200">Restaurant Command Center</p>
          <h1 className="mt-4 max-w-xl text-5xl font-bold leading-tight text-white">
            Premium restaurant operations with a stronger DBMS story.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300">
            Login with a role to demonstrate differentiated access, then explore analytics, workflow automation, reporting, and schema-driven CRUD management.
          </p>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            <div className="rounded-[28px] border border-fuchsia-400/20 bg-fuchsia-500/10 p-5">
              <p className="text-sm text-fuchsia-100">Role-aware access</p>
              <h3 className="mt-2 text-xl font-semibold text-white">Admin / Manager / Staff</h3>
            </div>
            <div className="rounded-[28px] border border-sky-400/20 bg-sky-500/10 p-5">
              <p className="text-sm text-sky-100">Business insight</p>
              <h3 className="mt-2 text-xl font-semibold text-white">Analytics + exports</h3>
            </div>
            <div className="rounded-[28px] border border-violet-400/20 bg-violet-500/10 p-5">
              <p className="text-sm text-violet-100">Operational flow</p>
              <h3 className="mt-2 text-xl font-semibold text-white">Kitchen + orders</h3>
            </div>
          </div>
        </section>

        <section className="rounded-[36px] border border-white/10 bg-slate-900/80 p-8 shadow-2xl backdrop-blur">
          <p className="text-sm font-medium uppercase tracking-[0.3em] text-slate-300">Role-Based Login</p>
          <h2 className="mt-3 text-3xl font-bold text-white">Choose your demo identity</h2>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            This login screen is designed for your project demo to showcase role-aware UX and access control flow.
          </p>

          <div className="mt-6 space-y-4">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-200">Display Name</span>
              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none focus:border-fuchsia-400"
              />
            </label>

            <div className="space-y-3">
              <span className="block text-sm font-medium text-slate-200">Role</span>
              {roles.map((item) => (
                <button
                  key={item.role}
                  type="button"
                  onClick={() => setRole(item.role)}
                  className={`w-full rounded-[24px] border p-4 text-left transition ${
                    role === item.role
                      ? "border-fuchsia-400/40 bg-fuchsia-500/15"
                      : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]"
                  }`}
                >
                  <div className="text-base font-semibold text-white">{item.role}</div>
                  <div className="mt-1 text-sm text-slate-300">{item.description}</div>
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => {
                const nextUser = {
                  name: name.trim() || "Aleeha",
                  role,
                };
                setUser(nextUser);
                showToast(`Logged in as ${nextUser.role}.`, "success");
              }}
              className="w-full rounded-2xl bg-gradient-to-r from-fuchsia-500 via-violet-500 to-sky-500 px-5 py-3 text-sm font-semibold text-white transition hover:brightness-110"
            >
              Enter Dashboard
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default LoginPage;
