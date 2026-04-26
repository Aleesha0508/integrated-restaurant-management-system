const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value || 0));

const InvoiceModal = ({ invoice, onClose }) => {
  if (!invoice) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-3xl rounded-[28px] border border-white/10 bg-slate-950/95 p-6 shadow-2xl">
        <div className="flex flex-col gap-4 border-b border-white/10 pb-5 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-fuchsia-200">Printable Invoice</p>
            <h3 className="mt-2 text-2xl font-bold text-white">Order #{invoice.order_id}</h3>
            <p className="mt-2 text-sm text-slate-300">{invoice.customer_name} • {invoice.customer_phone || "No phone"}</p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => window.print()}
              className="rounded-2xl bg-fuchsia-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-fuchsia-400"
            >
              Print Invoice
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-2xl border border-white/15 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/10"
            >
              Close
            </button>
          </div>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Order Status</p>
            <p className="mt-2 text-lg font-semibold text-white">{invoice.order_status}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Payment</p>
            <p className="mt-2 text-lg font-semibold text-white">{invoice.payment_mode} • {invoice.payment_status}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Date</p>
            <p className="mt-2 text-lg font-semibold text-white">{invoice.order_date}</p>
          </div>
        </div>

        <div className="mt-6 overflow-hidden rounded-2xl border border-white/10">
          <table className="min-w-full divide-y divide-white/10 text-left text-sm">
            <thead className="bg-white/[0.03]">
              <tr>
                <th className="px-4 py-3 text-slate-300">Item</th>
                <th className="px-4 py-3 text-slate-300">Quantity</th>
                <th className="px-4 py-3 text-slate-300">Price</th>
                <th className="px-4 py-3 text-slate-300">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {invoice.items.map((item) => (
                <tr key={item.order_item_id}>
                  <td className="px-4 py-3 text-white">{item.item_name}</td>
                  <td className="px-4 py-3 text-slate-200">{item.quantity}</td>
                  <td className="px-4 py-3 text-slate-200">{formatCurrency(item.item_price)}</td>
                  <td className="px-4 py-3 text-slate-200">{formatCurrency(item.subtotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 ml-auto max-w-sm rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm">
          <div className="flex justify-between text-slate-300">
            <span>Subtotal</span>
            <span>{formatCurrency(invoice.total_amount)}</span>
          </div>
          <div className="mt-2 flex justify-between text-slate-300">
            <span>Tax</span>
            <span>{formatCurrency(invoice.tax_amount)}</span>
          </div>
          <div className="mt-3 flex justify-between text-base font-semibold text-white">
            <span>Final Amount</span>
            <span>{formatCurrency(invoice.final_amount)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceModal;
