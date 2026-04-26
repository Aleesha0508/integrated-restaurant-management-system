const StatCard = ({ label, value, helper, tone = "teal" }) => {
  const toneClasses = {
    teal: "border-teal-400/20 bg-teal-500/10 text-teal-100",
    orange: "border-orange-400/20 bg-orange-500/10 text-orange-100",
    sky: "border-sky-400/20 bg-sky-500/10 text-sky-100",
    rose: "border-rose-400/20 bg-rose-500/10 text-rose-100",
  };

  return (
    <article className="rounded-[28px] border border-white/10 bg-white/5 p-5">
      <div className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${toneClasses[tone] || toneClasses.teal}`}>
        {label}
      </div>
      <h3 className="mt-4 text-4xl font-bold text-white">{value}</h3>
      <p className="mt-2 text-sm text-slate-300">{helper}</p>
    </article>
  );
};

export default StatCard;
