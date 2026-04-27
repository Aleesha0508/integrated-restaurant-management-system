import { useEffect, useState } from "react";
import EntityTable from "../components/EntityTable.jsx";
import { entityApi } from "../api/entityApi.js";
import { viewDefinitions } from "../config/entities.js";
import { useAppShell } from "../context/AppShellContext.jsx";

const DashboardPage = ({ entities }) => {
  const { showToast } = useAppShell();
  const [counts, setCounts] = useState({});
  const [views, setViews] = useState({});
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const loadDashboard = async () => {
    try {
      setIsLoading(true);
      setError("");

      const entityResults = await Promise.all(
        entities.map(async (entity) => ({
          key: entity.key,
          rows: await entityApi.listEntities(entity.key),
        })),
      );

      const viewResults = await Promise.all(
        viewDefinitions.map(async (view) => ({
          key: view.key,
          data: await entityApi.getView(view.key),
        })),
      );

      setCounts(
        Object.fromEntries(entityResults.map(({ key, rows }) => [key, rows.length])),
      );
      setViews(
        Object.fromEntries(viewResults.map(({ key, data }) => [key, data.rows])),
      );
    } catch (loadError) {
      setError(loadError.response?.data?.message || loadError.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, [entities]);

  const totalRecords = Object.values(counts).reduce((sum, value) => sum + value, 0);
  const busiestEntity = entities.reduce((currentBest, entity) => {
    const entityCount = counts[entity.key] ?? 0;

    if (!currentBest || entityCount > currentBest.count) {
      return { label: entity.label, count: entityCount };
    }

    return currentBest;
  }, null);

  return (
    <div className="space-y-6">
      <section className="rounded-[32px] border border-white/10 bg-gradient-to-r from-fuchsia-500/20 via-violet-500/10 to-sky-500/15 p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-fuchsia-200">Project Overview</p>
            <h2 className="mt-2 text-3xl font-bold text-white">RestroSync Dashboard</h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-200">
              Live operational visibility across menu, billing, orders, employees, inventory, recipes, and purchasing.
            </p>
          </div>

          <button
            onClick={async () => {
              await loadDashboard();
              showToast("Dashboard refreshed.", "success");
            }}
            className="rounded-2xl border border-white/15 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
          >
            Refresh Dashboard
          </button>
        </div>
      </section>

      {error ? <div className="rounded-2xl border border-rose-400/30 bg-rose-500/10 p-4 text-sm text-rose-100">{error}</div> : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-[28px] border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-slate-300">Total Records</p>
          <h3 className="mt-3 text-4xl font-bold text-white">{isLoading ? "..." : totalRecords}</h3>
          <p className="mt-2 text-xs uppercase tracking-[0.2em] text-fuchsia-200">Across all entities</p>
        </article>

        <article className="rounded-[28px] border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-slate-300">Largest Module</p>
          <h3 className="mt-3 text-2xl font-bold text-white">{isLoading ? "Loading..." : busiestEntity?.label || "N/A"}</h3>
          <p className="mt-2 text-xs uppercase tracking-[0.2em] text-fuchsia-200">
            {isLoading ? "Checking records" : `${busiestEntity?.count ?? 0} rows available`}
          </p>
        </article>

        <article className="rounded-[28px] border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-slate-300">Analytics Views</p>
          <h3 className="mt-3 text-4xl font-bold text-white">{viewDefinitions.length}</h3>
          <p className="mt-2 text-xs uppercase tracking-[0.2em] text-fuchsia-200">Customer + stock insights</p>
        </article>

        <article className="rounded-[28px] border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-slate-300">Backend Status</p>
          <h3 className="mt-3 text-2xl font-bold text-white">{error ? "Attention Needed" : "Connected"}</h3>
          <p className="mt-2 text-xs uppercase tracking-[0.2em] text-fuchsia-200">API and database flow</p>
        </article>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {entities.map((entity) => (
          <article key={entity.key} className="rounded-[28px] border border-white/10 bg-white/5 p-5">
            <p className="text-sm text-slate-300">{entity.label}</p>
            <h3 className="mt-3 text-4xl font-bold text-white">{isLoading ? "..." : counts[entity.key] ?? 0}</h3>
            <p className="mt-2 text-xs uppercase tracking-[0.2em] text-fuchsia-200">Active records</p>
          </article>
        ))}
      </section>

      {viewDefinitions.map((view) => (
        <section key={view.key} className="space-y-3">
          <div>
            <h3 className="text-xl font-semibold text-white">{view.label}</h3>
            <p className="text-sm text-slate-300">Live data fetched from the MySQL view.</p>
          </div>
          <EntityTable columns={view.columns} rows={views[view.key] || []} isLoading={isLoading} />
        </section>
      ))}
    </div>
  );
};

export default DashboardPage;
