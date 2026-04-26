import { useEffect, useState } from "react";
import { entityApi } from "../api/entityApi.js";
import BarList from "../components/BarList.jsx";
import EntityTable from "../components/EntityTable.jsx";
import StatCard from "../components/StatCard.jsx";
import { useAppShell } from "../context/AppShellContext.jsx";

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value || 0));

const AnalyticsPage = () => {
  const { showToast } = useAppShell();
  const [dashboard, setDashboard] = useState({
    overview: {},
    revenueTrend: [],
    categorySales: [],
    topItems: [],
    peakHours: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = async () => {
    try {
      setIsLoading(true);
      setError("");
      const data = await entityApi.getAnalyticsDashboard();
      setDashboard(data);
    } catch (loadError) {
      setError(loadError.response?.data?.message || loadError.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const overview = dashboard.overview || {};
  const maxRevenue = Math.max(...(dashboard.revenueTrend || []).map((row) => Number(row.revenue || 0)), 1);

  return (
    <div className="space-y-6">
      <section className="rounded-[32px] border border-white/10 bg-gradient-to-r from-fuchsia-500/20 via-violet-500/10 to-sky-500/15 p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-fuchsia-200">Decision Support Layer</p>
            <h2 className="mt-2 text-3xl font-bold text-white">Business Analytics</h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-200">
              This page turns transactional restaurant data into KPIs, trend lines, sales insights, and operational visibility for demos and viva.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={async () => {
                await loadDashboard();
                showToast("Analytics refreshed.", "success");
              }}
              className="rounded-2xl border border-white/15 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
            >
              Refresh Analytics
            </button>
            <button
              onClick={async () => {
                await entityApi.downloadOrdersReport();
                showToast("Orders report downloaded.", "success");
              }}
              className="rounded-2xl bg-fuchsia-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-fuchsia-400"
            >
              Export Orders CSV
            </button>
          </div>
        </div>
      </section>

      {error ? <div className="rounded-2xl border border-rose-400/30 bg-rose-500/10 p-4 text-sm text-rose-100">{error}</div> : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Revenue" value={isLoading ? "..." : formatCurrency(overview.total_revenue)} helper="Combined billed revenue across orders." />
        <StatCard label="Average Bill" value={isLoading ? "..." : formatCurrency(overview.average_bill)} helper="Average billed amount per order." tone="orange" />
        <StatCard label="Repeat Customers" value={isLoading ? "..." : overview.repeat_customers ?? 0} helper="Customers with more than one order." tone="sky" />
        <StatCard label="Low Stock Items" value={isLoading ? "..." : overview.low_stock_items ?? 0} helper="Items currently below reorder level." tone="rose" />
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Revenue Today" value={isLoading ? "..." : formatCurrency(overview.revenue_today)} helper={`Yesterday: ${formatCurrency(overview.revenue_yesterday)}`} />
        <StatCard label="Orders Today" value={isLoading ? "..." : overview.orders_today ?? 0} helper={`Yesterday: ${overview.orders_yesterday ?? 0}`} tone="orange" />
        <StatCard label="This Week" value={isLoading ? "..." : formatCurrency(overview.revenue_this_week)} helper={`Last week: ${formatCurrency(overview.revenue_last_week)}`} tone="sky" />
        <StatCard label="Forecast" value={isLoading ? "..." : `${dashboard.demandForecast?.projected_orders_tomorrow ?? 0}`} helper="Projected orders tomorrow using a 7-day moving average." tone="rose" />
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-[28px] border border-white/10 bg-white/5 p-5">
          <div className="mb-5">
            <h3 className="text-xl font-semibold text-white">Revenue Curve</h3>
            <p className="mt-1 text-sm text-slate-300">A richer visual for daily revenue instead of a plain list.</p>
          </div>

          <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-950/50 p-4">
            {(dashboard.revenueTrend || []).length ? (
              <svg viewBox="0 0 600 260" className="h-64 w-full">
                <defs>
                  <linearGradient id="revenueStroke" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#d946ef" />
                    <stop offset="50%" stopColor="#a855f7" />
                    <stop offset="100%" stopColor="#60a5fa" />
                  </linearGradient>
                </defs>
                {dashboard.revenueTrend.map((row, index, rows) => {
                  if (index === rows.length - 1) {
                    return null;
                  }

                  const nextRow = rows[index + 1];
                  const x1 = 40 + (index * 520) / Math.max(rows.length - 1, 1);
                  const x2 = 40 + ((index + 1) * 520) / Math.max(rows.length - 1, 1);
                  const y1 = 220 - (Number(row.revenue || 0) / maxRevenue) * 170;
                  const y2 = 220 - (Number(nextRow.revenue || 0) / maxRevenue) * 170;

                  return <line key={`${row.order_day}-line`} x1={x1} y1={y1} x2={x2} y2={y2} stroke="url(#revenueStroke)" strokeWidth="4" strokeLinecap="round" />;
                })}
                {dashboard.revenueTrend.map((row, index, rows) => {
                  const x = 40 + (index * 520) / Math.max(rows.length - 1, 1);
                  const y = 220 - (Number(row.revenue || 0) / maxRevenue) * 170;

                  return (
                    <g key={row.order_day}>
                      <circle cx={x} cy={y} r="6" fill="#e879f9" />
                      <text x={x} y="245" textAnchor="middle" fill="#cbd5e1" fontSize="11">
                        {String(row.order_day).slice(5)}
                      </text>
                    </g>
                  );
                })}
              </svg>
            ) : (
              <div className="py-16 text-center text-sm text-slate-300">Revenue data will appear here once billing data exists.</div>
            )}
          </div>
        </section>

        <BarList
          title="Revenue Trend"
          description="Daily billed revenue based on order dates."
          rows={dashboard.revenueTrend || []}
          labelKey="order_day"
          valueKey="revenue"
          formatter={(value) => formatCurrency(value)}
        />
        <BarList
          title="Category-wise Sales"
          description="Revenue grouped by menu category."
          rows={dashboard.categorySales || []}
          labelKey="category"
          valueKey="total_revenue"
          formatter={(value, row) => `${formatCurrency(value)} • ${row.total_quantity} items`}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <BarList
          title="Customer Lifetime Value"
          description="Top customers ranked by lifetime spend."
          rows={dashboard.customerLifetimeValue || []}
          labelKey="name"
          valueKey="lifetime_value"
          formatter={(value, row) => `${formatCurrency(value)} • ${row.total_orders} orders`}
        />
        <BarList
          title="Most Consumed Ingredients"
          description="Ingredients used the most based on recipe-linked order quantities."
          rows={dashboard.mostConsumedIngredients || []}
          labelKey="item_name"
          valueKey="total_consumed"
          formatter={(value) => `${Number(value).toFixed(2)} units`}
        />
      </section>

      <section className="rounded-[28px] border border-white/10 bg-white/5 p-5">
        <div className="mb-4">
          <h3 className="text-xl font-semibold text-white">Query Optimization Benchmarks</h3>
          <p className="mt-1 text-sm text-slate-300">Use these explain plans to talk about index usage and optimization impact during viva.</p>
        </div>
        <div className="grid gap-4 xl:grid-cols-2">
          {(dashboard.queryBenchmarks?.indexed_queries || []).map((query) => (
            <article key={query.label} className="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
              <h4 className="text-lg font-semibold text-white">{query.label}</h4>
              <pre className="mt-3 overflow-x-auto whitespace-pre-wrap text-xs text-slate-300">{query.explain}</pre>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <BarList
          title="Top Selling Dishes"
          description="Most ordered menu items by quantity."
          rows={dashboard.topItems || []}
          labelKey="item_name"
          valueKey="total_quantity"
          formatter={(value, row) => `${value} sold • ${formatCurrency(row.total_revenue)}`}
        />
        <BarList
          title="Peak Order Hours"
          description="Order volume distributed by hour of day."
          rows={(dashboard.peakHours || []).map((row) => ({
            ...row,
            label: `${String(row.order_hour).padStart(2, "0")}:00`,
          }))}
          labelKey="label"
          valueKey="total_orders"
          formatter={(value) => `${value} orders`}
        />
      </section>

      <section className="space-y-3">
        <div>
          <h3 className="text-xl font-semibold text-white">Top Selling Items Table</h3>
          <p className="text-sm text-slate-300">Tabular analytics make it easier to explain SQL aggregations during viva.</p>
        </div>
        <EntityTable
          columns={["menu_item_id", "item_name", "total_quantity", "total_revenue"]}
          rows={dashboard.topItems || []}
          isLoading={isLoading}
        />
      </section>
    </div>
  );
};

export default AnalyticsPage;
