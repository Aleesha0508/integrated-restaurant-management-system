const formatCellValue = (value) => {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  return String(value);
};

const EntityTable = ({
  columns,
  rows,
  onEdit,
  onDelete,
  isLoading = false,
  emptyMessage = "No records found.",
}) => (
  <div className="overflow-hidden rounded-[28px] border border-white/10 bg-white/5">
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-white/10 text-left text-sm">
        <thead className="bg-white/5">
          <tr>
            {columns.map((column) => (
              <th key={column} className="px-4 py-4 font-semibold uppercase tracking-wide text-slate-300">
                {column.replaceAll("_", " ")}
              </th>
            ))}
            {(onEdit || onDelete) && <th className="px-4 py-4 font-semibold uppercase tracking-wide text-slate-300">Actions</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, index) => (
              <tr key={`loading-${index}`} className="animate-pulse">
                {columns.map((column) => (
                  <td key={`${index}-${column}`} className="px-4 py-4">
                    <div className="h-4 rounded-full bg-white/10" />
                  </td>
                ))}
                {(onEdit || onDelete) && (
                  <td className="px-4 py-4">
                    <div className="h-4 w-24 rounded-full bg-white/10" />
                  </td>
                )}
              </tr>
            ))
          ) : rows.length ? (
            rows.map((row, index) => (
              <tr key={`${index}-${columns.map((column) => row[column]).join("-")}`} className="hover:bg-white/5">
                {columns.map((column) => (
                  <td key={`${index}-${column}`} className="max-w-[260px] px-4 py-4 text-slate-100">
                    <span className="block truncate">{formatCellValue(row[column])}</span>
                  </td>
                ))}
                {(onEdit || onDelete) && (
                  <td className="px-4 py-4">
                    <div className="flex gap-2">
                      {onEdit && (
                        <button
                          onClick={() => onEdit(row)}
                          className="rounded-xl bg-sky-500/20 px-3 py-2 text-xs font-semibold text-sky-200 hover:bg-sky-500/30"
                        >
                          Edit
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={() => onDelete(row)}
                          className="rounded-xl bg-rose-500/20 px-3 py-2 text-xs font-semibold text-rose-200 hover:bg-rose-500/30"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length + (onEdit || onDelete ? 1 : 0)} className="px-4 py-10 text-center text-slate-300">
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
);

export default EntityTable;
