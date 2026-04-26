import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { entityDefinitions } from "../config/entities.js";
import { entityApi } from "../api/entityApi.js";
import EntityForm from "../components/EntityForm.jsx";
import EntityTable from "../components/EntityTable.jsx";
import { useAppShell } from "../context/AppShellContext.jsx";

const buildRouteKey = (entity, row) => entity.idFields.map((field) => row[field]).join("/");

const EntityPage = () => {
  const { showToast, showConfirm } = useAppShell();
  const { entityKey } = useParams();
  const entity = entityDefinitions.find((definition) => definition.key === entityKey);

  const [rows, setRows] = useState([]);
  const [selectedRow, setSelectedRow] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ field: "", direction: "asc" });
  const [orderStatusFilter, setOrderStatusFilter] = useState("");
  const deferredSearchTerm = useDeferredValue(searchTerm);

  const loadRows = async () => {
    if (!entity) {
      return;
    }

    try {
      setIsLoading(true);
      setError("");
      const data = await entityApi.listEntities(entity.key);
      setRows(data);
    } catch (loadError) {
      setError(loadError.response?.data?.message || loadError.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setSelectedRow(null);
    setShowForm(false);
    setSuccessMessage("");
    setSearchTerm("");
    setSortConfig({ field: "", direction: "asc" });
    setOrderStatusFilter("");
    loadRows();
  }, [entityKey]);

  const filteredRows = useMemo(() => {
    const normalizedQuery = deferredSearchTerm.trim().toLowerCase();

    let nextRows = rows;

    if (normalizedQuery) {
      nextRows = nextRows.filter((row) =>
        entity.columns.some((column) =>
          String(row[column] ?? "")
            .toLowerCase()
            .includes(normalizedQuery),
        ),
      );
    }

    if (entity.key === "orders" && orderStatusFilter) {
      nextRows = nextRows.filter((row) => row.order_status === orderStatusFilter);
    }

    if (sortConfig.field) {
      nextRows = [...nextRows].sort((a, b) => {
        const left = a[sortConfig.field];
        const right = b[sortConfig.field];

        if (left === right) {
          return 0;
        }

        const comparison = String(left ?? "").localeCompare(String(right ?? ""), undefined, {
          numeric: true,
          sensitivity: "base",
        });

        return sortConfig.direction === "asc" ? comparison : -comparison;
      });
    }

    return nextRows;
  }, [deferredSearchTerm, entity?.columns, entity?.key, orderStatusFilter, rows, sortConfig]);

  const exportEntityRows = () => {
    const columns = entity.columns;
    const lines = [
      columns.join(","),
      ...filteredRows.map((row) =>
        columns
          .map((column) => {
            const value = row[column] ?? "";
            const escaped = String(value).replaceAll('"', '""');
            return /[",\n]/.test(escaped) ? `"${escaped}"` : escaped;
          })
          .join(","),
      ),
    ];

    const blob = new Blob([`${lines.join("\n")}\n`], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${entity.key}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };

  if (!entity) {
    return <div className="rounded-2xl border border-rose-400/30 bg-rose-500/10 p-4 text-sm text-rose-100">Entity not found.</div>;
  }

  const handleCreate = async (payload) => {
    try {
      setIsSaving(true);
      setError("");
      await entityApi.createEntity(entity.key, payload);
      await loadRows();
      setSuccessMessage(`${entity.label.slice(0, -1)} created successfully.`);
      showToast(`${entity.label.slice(0, -1)} created successfully.`, "success");
      setShowForm(false);
    } catch (saveError) {
      setError(saveError.response?.data?.message || saveError.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdate = async (payload) => {
    try {
      setIsSaving(true);
      setError("");
      await entityApi.updateEntity(entity.key, buildRouteKey(entity, selectedRow), payload);
      await loadRows();
      setSuccessMessage(`${entity.label.slice(0, -1)} updated successfully.`);
      showToast(`${entity.label.slice(0, -1)} updated successfully.`, "success");
      setSelectedRow(null);
      setShowForm(false);
    } catch (saveError) {
      setError(saveError.response?.data?.message || saveError.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (row) => {
    showConfirm({
      title: `Delete ${entity.label.slice(0, -1)} record?`,
      description: "This action removes the selected record from the database. Use it only when you are sure the row is no longer needed.",
      confirmLabel: "Delete Record",
      tone: "danger",
      onConfirm: async () => {
        try {
          setError("");
          await entityApi.deleteEntity(entity.key, buildRouteKey(entity, row));
          await loadRows();
          setSuccessMessage(`${entity.label.slice(0, -1)} deleted successfully.`);
          showToast(`${entity.label.slice(0, -1)} deleted successfully.`, "success");
        } catch (deleteError) {
          setError(deleteError.response?.data?.message || deleteError.message);
          showToast(deleteError.response?.data?.message || deleteError.message, "error");
        }
      },
    });
  };

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 rounded-[32px] border border-white/10 bg-white/5 p-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-fuchsia-200">Entity Management</p>
          <h2 className="mt-2 text-3xl font-bold text-white">{entity.label}</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">{entity.description}</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={loadRows}
            className="rounded-2xl border border-white/15 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
          >
            Refresh
          </button>
          <button
            onClick={() => {
              exportEntityRows();
              showToast(`${entity.label} exported to CSV.`, "success");
            }}
            className="rounded-2xl border border-white/15 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
          >
            Export CSV
          </button>
          <button
            onClick={() => {
              setSelectedRow(null);
              setSuccessMessage("");
              setShowForm(true);
            }}
            className="rounded-2xl bg-fuchsia-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-fuchsia-400"
          >
            Add Record
          </button>
        </div>
      </section>

      {error ? <div className="rounded-2xl border border-rose-400/30 bg-rose-500/10 p-4 text-sm text-rose-100">{error}</div> : null}
      {successMessage ? <div className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-4 text-sm text-emerald-100">{successMessage}</div> : null}

      <section className="grid gap-4 md:grid-cols-3">
        <article className="rounded-[28px] border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-slate-300">Total Records</p>
          <h3 className="mt-3 text-4xl font-bold text-white">{isLoading ? "..." : rows.length}</h3>
          <p className="mt-2 text-xs uppercase tracking-[0.2em] text-fuchsia-200">Entity dataset size</p>
        </article>
        <article className="rounded-[28px] border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-slate-300">Filtered Results</p>
          <h3 className="mt-3 text-4xl font-bold text-white">{isLoading ? "..." : filteredRows.length}</h3>
          <p className="mt-2 text-xs uppercase tracking-[0.2em] text-fuchsia-200">Search-aware result count</p>
        </article>
        <article className="rounded-[28px] border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-slate-300">Editable Fields</p>
          <h3 className="mt-3 text-4xl font-bold text-white">{entity.formFields.length}</h3>
          <p className="mt-2 text-xs uppercase tracking-[0.2em] text-fuchsia-200">Schema-matched inputs</p>
        </article>
      </section>

      <section className="rounded-[28px] border border-white/10 bg-white/5 p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">Find Records Fast</h3>
            <p className="mt-1 text-sm text-slate-300">Search across every visible column in this entity.</p>
          </div>

          <div className="grid w-full gap-3 lg:max-w-4xl lg:grid-cols-[minmax(0,1fr)_220px_180px]">
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder={`Search ${entity.label.toLowerCase()}...`}
              className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none focus:border-fuchsia-400"
            />
            <select
              value={sortConfig.field ? `${sortConfig.field}:${sortConfig.direction}` : ""}
              onChange={(event) => {
                if (!event.target.value) {
                  setSortConfig({ field: "", direction: "asc" });
                  return;
                }

                const [field, direction] = event.target.value.split(":");
                setSortConfig({ field, direction });
              }}
              className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none focus:border-fuchsia-400"
            >
              <option value="">Default Sort</option>
              {entity.columns.map((column) => (
                <option key={`${column}-asc`} value={`${column}:asc`}>
                  {column} (A-Z)
                </option>
              ))}
              {entity.columns.map((column) => (
                <option key={`${column}-desc`} value={`${column}:desc`}>
                  {column} (Z-A)
                </option>
              ))}
            </select>

            {entity.key === "orders" ? (
              <select
                value={orderStatusFilter}
                onChange={(event) => setOrderStatusFilter(event.target.value)}
                className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none focus:border-fuchsia-400"
              >
                <option value="">All Statuses</option>
                {["Placed", "Preparing", "Ready", "Completed", "Cancelled"].map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            ) : (
              <div className="rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm text-slate-300">
                Local search, sorting, and CSV export enabled.
              </div>
            )}
          </div>
        </div>
      </section>

      {showForm ? (
        <EntityForm
          entity={entity}
          initialData={selectedRow}
          onSubmit={selectedRow ? handleUpdate : handleCreate}
          onCancel={() => {
            setSelectedRow(null);
            setShowForm(false);
          }}
          isSaving={isSaving}
        />
      ) : null}

      <EntityTable
        columns={entity.columns}
        rows={filteredRows}
        isLoading={isLoading}
        emptyMessage={searchTerm ? "No records match your search." : "No records found."}
        onEdit={(row) => {
          setSuccessMessage("");
          setSelectedRow(row);
          setShowForm(true);
        }}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default EntityPage;
