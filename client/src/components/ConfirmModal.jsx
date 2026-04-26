const toneClasses = {
  danger: "bg-rose-500 hover:bg-rose-400",
  primary: "bg-fuchsia-500 hover:bg-fuchsia-400",
};

const ConfirmModal = ({ config, onClose }) => {
  if (!config) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-[28px] border border-white/10 bg-slate-900/95 p-6 shadow-2xl">
        <h3 className="text-xl font-semibold text-white">{config.title}</h3>
        <p className="mt-3 text-sm leading-6 text-slate-300">{config.description}</p>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-white/15 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/10"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={config.onConfirm}
            className={`rounded-2xl px-4 py-3 text-sm font-semibold text-white transition ${toneClasses[config.tone] || toneClasses.primary}`}
          >
            {config.confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
