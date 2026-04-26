const BarList = ({ title, description, rows, labelKey, valueKey, formatter = (value) => value }) => {
  const maxValue = Math.max(...rows.map((row) => Number(row[valueKey] || 0)), 1);

  return (
    <section className="rounded-[28px] border border-white/10 bg-white/5 p-5">
      <div className="mb-5">
        <h3 className="text-xl font-semibold text-white">{title}</h3>
        <p className="mt-1 text-sm text-slate-300">{description}</p>
      </div>

      <div className="space-y-4">
        {rows.length ? (
          rows.map((row, index) => {
            const numericValue = Number(row[valueKey] || 0);
            const width = `${Math.max((numericValue / maxValue) * 100, 8)}%`;

            return (
              <div key={`${row[labelKey]}-${index}`} className="space-y-2">
                <div className="flex items-center justify-between gap-4 text-sm">
                  <span className="font-medium text-white">{row[labelKey]}</span>
                  <span className="text-slate-300">{formatter(numericValue, row)}</span>
                </div>
                <div className="h-3 rounded-full bg-slate-900/80">
                  <div
                    className="h-3 rounded-full bg-gradient-to-r from-teal-400 to-orange-400"
                    style={{ width }}
                  />
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-sm text-slate-300">No data available yet.</p>
        )}
      </div>
    </section>
  );
};

export default BarList;
