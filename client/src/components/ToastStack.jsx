const toneClasses = {
  info: "border-fuchsia-400/30 bg-fuchsia-500/15 text-fuchsia-50",
  success: "border-emerald-400/30 bg-emerald-500/15 text-emerald-50",
  error: "border-rose-400/30 bg-rose-500/15 text-rose-50",
};

const ToastStack = ({ toasts }) => (
  <div className="pointer-events-none fixed right-4 top-4 z-50 flex w-full max-w-sm flex-col gap-3">
    {toasts.map((toast) => (
      <div
        key={toast.id}
        className={`pointer-events-auto rounded-2xl border px-4 py-3 text-sm shadow-2xl backdrop-blur ${toneClasses[toast.tone] || toneClasses.info}`}
      >
        {toast.message}
      </div>
    ))}
  </div>
);

export default ToastStack;
