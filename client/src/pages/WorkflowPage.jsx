import { useEffect, useMemo, useState } from "react";
import { entityApi } from "../api/entityApi.js";
import EntityTable from "../components/EntityTable.jsx";
import StatCard from "../components/StatCard.jsx";
import { useAppShell } from "../context/AppShellContext.jsx";
import InvoiceModal from "../components/InvoiceModal.jsx";

const emptyOrderItem = { menu_item_id: "", quantity: 1 };

const paymentModes = ["Cash", "Card", "UPI"];
const paymentStatuses = ["Pending", "Paid", "Failed"];
const orderStatuses = ["Placed", "Preparing", "Ready", "Completed", "Cancelled"];
const kitchenStatuses = ["Placed", "Preparing", "Ready", "Completed"];

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value || 0));

const WorkflowPage = () => {
  const { showToast, commandPalette } = useAppShell();
  const [customers, setCustomers] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [kitchenOrders, setKitchenOrders] = useState([]);
  const [auditRows, setAuditRows] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [invoice, setInvoice] = useState(null);
  const [formState, setFormState] = useState({
    customer_id: "",
    employee_id: "",
    order_status: "Placed",
    payment_mode: "UPI",
    payment_status: "Pending",
    items: [{ ...emptyOrderItem }],
  });

  const loadWorkflowData = async () => {
    try {
      setIsLoading(true);
      setError("");
      const [customerRows, employeeRows, menuRows, kitchenRows, auditLogRows] = await Promise.all([
        entityApi.listEntities("customers"),
        entityApi.listEntities("employees"),
        entityApi.listEntities("menu-items"),
        entityApi.getKitchenOrders(),
        entityApi.getAuditLog().catch(() => []),
      ]);

      setCustomers(customerRows);
      setEmployees(employeeRows);
      setMenuItems(menuRows.filter((item) => item.availability_status === "Available"));
      setKitchenOrders(kitchenRows);
      setAuditRows(Array.isArray(auditLogRows) ? auditLogRows : []);
    } catch (loadError) {
      setError(loadError.response?.data?.message || loadError.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadWorkflowData();
  }, []);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      loadWorkflowData();
    }, 10000);

    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (!commandPalette.openOrderForm) {
      return;
    }

    const firstField = document.querySelector('[name="workflow-customer"]');
    firstField?.focus();
  }, [commandPalette.openOrderForm]);

  const preparedItems = useMemo(
    () =>
      formState.items.map((item) => {
        const menuItem = menuItems.find((menu) => menu.menu_item_id === Number(item.menu_item_id));
        const quantity = Number(item.quantity || 0);
        const price = Number(menuItem?.price || 0);

        return {
          ...item,
          menuItem,
          subtotal: quantity * price,
        };
      }),
    [formState.items, menuItems],
  );

  const orderSubtotal = preparedItems.reduce((sum, item) => sum + item.subtotal, 0);
  const taxAmount = orderSubtotal * 0.05;
  const finalAmount = orderSubtotal + taxAmount;

  const updateItem = (index, field, value) => {
    setFormState((current) => ({
      ...current,
      items: current.items.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item,
      ),
    }));
  };

  const handlePlaceOrder = async (event) => {
    event.preventDefault();

    try {
      setIsSubmitting(true);
      setError("");
      setSuccessMessage("");
      const payload = {
        ...formState,
        customer_id: Number(formState.customer_id),
        employee_id: formState.employee_id ? Number(formState.employee_id) : null,
        items: formState.items.map((item) => ({
          menu_item_id: Number(item.menu_item_id),
          quantity: Number(item.quantity),
        })),
      };

      const createdOrder = await entityApi.placeOrder(payload);
      setSuccessMessage(`Order #${createdOrder.order.order_id} placed successfully with final bill ${formatCurrency(createdOrder.order.final_amount)}.`);
      showToast(`Order #${createdOrder.order.order_id} placed successfully.`, "success");
      setInvoice(await entityApi.getInvoice(createdOrder.order.order_id));
      setFormState({
        customer_id: "",
        employee_id: "",
        order_status: "Placed",
        payment_mode: "UPI",
        payment_status: "Pending",
        items: [{ ...emptyOrderItem }],
      });
      await loadWorkflowData();
    } catch (submitError) {
      setError(submitError.response?.data?.message || submitError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusUpdate = async (orderId, order_status) => {
    try {
      setError("");
      await entityApi.updateWorkflowOrderStatus(orderId, order_status);
      setSuccessMessage(`Order #${orderId} moved to ${order_status}.`);
      showToast(`Order #${orderId} moved to ${order_status}.`, "success");
      await loadWorkflowData();
    } catch (updateError) {
      setError(updateError.response?.data?.message || updateError.message);
    }
  };

  return (
    <div className="space-y-6">
      <InvoiceModal invoice={invoice} onClose={() => setInvoice(null)} />
      <section className="rounded-[32px] border border-white/10 bg-gradient-to-r from-sky-500/15 via-violet-500/10 to-fuchsia-500/15 p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-fuchsia-200">Restaurant Workflow</p>
            <h2 className="mt-2 text-3xl font-bold text-white">Transactional Orders and Kitchen Board</h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-200">
              This screen demonstrates an end-to-end restaurant flow: place an order, generate a bill, update status, and review audit activity.
            </p>
            <p className="mt-2 text-xs uppercase tracking-[0.22em] text-slate-400">Shortcuts: `N` new order, `Esc` close modal, kitchen auto-refresh every 10 seconds.</p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={async () => {
                await loadWorkflowData();
                showToast("Workflow data refreshed.", "info");
              }}
              className="rounded-2xl border border-white/15 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
            >
              Refresh Workflow
            </button>
            <button
              onClick={async () => {
                await entityApi.downloadCustomersReport();
                showToast("Customers report downloaded.", "success");
              }}
              className="rounded-2xl bg-fuchsia-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-fuchsia-400"
            >
              Export Customers CSV
            </button>
          </div>
        </div>
      </section>

      {error ? <div className="rounded-2xl border border-rose-400/30 bg-rose-500/10 p-4 text-sm text-rose-100">{error}</div> : null}
      {successMessage ? <div className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-4 text-sm text-emerald-100">{successMessage}</div> : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Kitchen Queue" value={isLoading ? "..." : kitchenOrders.length} helper="Orders still active in the lifecycle." />
        <StatCard label="Order Subtotal" value={formatCurrency(orderSubtotal)} helper="Current cart before tax." tone="orange" />
        <StatCard label="Tax Amount" value={formatCurrency(taxAmount)} helper="5% tax applied in billing flow." tone="sky" />
        <StatCard label="Final Amount" value={formatCurrency(finalAmount)} helper="Estimated bill for current order." tone="rose" />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <form onSubmit={handlePlaceOrder} className="rounded-[28px] border border-white/10 bg-white/5 p-5">
          <div className="mb-5">
            <h3 className="text-xl font-semibold text-white">Place New Order</h3>
            <p className="mt-1 text-sm text-slate-300">
              This uses a backend transaction so order, bill, and inventory updates succeed or fail together.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label>
              <span className="mb-2 block text-sm font-medium text-slate-200">Customer</span>
              <select
                value={formState.customer_id}
                name="workflow-customer"
                required
                onChange={(event) => setFormState((current) => ({ ...current, customer_id: event.target.value }))}
                className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none focus:border-fuchsia-400"
              >
                <option value="">Select customer</option>
                {customers.map((customer) => (
                  <option key={customer.customer_id} value={customer.customer_id}>
                    {customer.name} ({customer.phone})
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span className="mb-2 block text-sm font-medium text-slate-200">Employee</span>
              <select
                value={formState.employee_id}
                onChange={(event) => setFormState((current) => ({ ...current, employee_id: event.target.value }))}
                className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none focus:border-fuchsia-400"
              >
                <option value="">Select employee</option>
                {employees.map((employee) => (
                  <option key={employee.employee_id} value={employee.employee_id}>
                    {employee.name} ({employee.role})
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span className="mb-2 block text-sm font-medium text-slate-200">Order Status</span>
              <select
                value={formState.order_status}
                onChange={(event) => setFormState((current) => ({ ...current, order_status: event.target.value }))}
                className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none focus:border-fuchsia-400"
              >
                {orderStatuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span className="mb-2 block text-sm font-medium text-slate-200">Payment Mode</span>
              <select
                value={formState.payment_mode}
                onChange={(event) => setFormState((current) => ({ ...current, payment_mode: event.target.value }))}
                className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none focus:border-fuchsia-400"
              >
                {paymentModes.map((mode) => (
                  <option key={mode} value={mode}>
                    {mode}
                  </option>
                ))}
              </select>
            </label>

            <label className="md:col-span-2">
              <span className="mb-2 block text-sm font-medium text-slate-200">Payment Status</span>
              <select
                value={formState.payment_status}
                onChange={(event) => setFormState((current) => ({ ...current, payment_status: event.target.value }))}
                className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none focus:border-fuchsia-400"
              >
                {paymentStatuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-semibold text-white">Order Items</h4>
              <button
                type="button"
                onClick={() =>
                  setFormState((current) => ({
                    ...current,
                    items: [...current.items, { ...emptyOrderItem }],
                  }))
                }
                className="rounded-2xl border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/15"
              >
                Add Item
              </button>
            </div>

            {formState.items.map((item, index) => (
              <div key={`item-${index}`} className="grid gap-3 rounded-2xl border border-white/10 bg-slate-950/40 p-4 md:grid-cols-[1.5fr_0.6fr_0.7fr_auto]">
                <select
                  value={item.menu_item_id}
                  required
                  onChange={(event) => updateItem(index, "menu_item_id", event.target.value)}
                  className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none focus:border-fuchsia-400"
                >
                  <option value="">Select menu item</option>
                  {menuItems.map((menuItem) => (
                    <option key={menuItem.menu_item_id} value={menuItem.menu_item_id}>
                      {menuItem.item_name} ({formatCurrency(menuItem.price)})
                    </option>
                  ))}
                </select>

                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(event) => updateItem(index, "quantity", event.target.value)}
                  className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none focus:border-fuchsia-400"
                />

                <div className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-slate-200">
                  {formatCurrency(preparedItems[index]?.subtotal || 0)}
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setFormState((current) => ({
                      ...current,
                      items: current.items.length === 1
                        ? [{ ...emptyOrderItem }]
                        : current.items.filter((_, itemIndex) => itemIndex !== index),
                    }))
                  }
                  className="rounded-2xl bg-rose-500/20 px-4 py-3 text-sm font-semibold text-rose-200 transition hover:bg-rose-500/30"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-2xl border border-white/10 bg-slate-950/40 p-4 text-sm text-slate-200">
            <div className="flex items-center justify-between">
              <span>Subtotal</span>
              <span>{formatCurrency(orderSubtotal)}</span>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span>Tax</span>
              <span>{formatCurrency(taxAmount)}</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-base font-semibold text-white">
              <span>Estimated Final Amount</span>
              <span>{formatCurrency(finalAmount)}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-6 rounded-2xl bg-fuchsia-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-fuchsia-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Placing Order..." : "Place Transactional Order"}
          </button>
        </form>

        <section className="space-y-6">
          <div className="rounded-[28px] border border-white/10 bg-white/5 p-5">
            <h3 className="text-xl font-semibold text-white">Kitchen Board</h3>
            <p className="mt-1 text-sm text-slate-300">Track active orders and move them through the preparation lifecycle.</p>

            <div className="mt-4 space-y-4">
              {isLoading ? (
                <div className="text-sm text-slate-300">Loading active orders...</div>
              ) : kitchenOrders.length ? (
                kitchenOrders.map((order) => (
                  <article key={order.order_id} className="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <h4 className="text-lg font-semibold text-white">Order #{order.order_id}</h4>
                        <p className="mt-1 text-sm text-slate-300">{order.customer_name} • {order.employee_name}</p>
                        <p className="mt-2 text-sm text-slate-300">{order.items || "No items listed."}</p>
                        <p className="mt-2 text-sm text-slate-400">{order.order_date}</p>
                      </div>

                      <div className="space-y-3">
                        <div className="rounded-full border border-fuchsia-400/20 bg-fuchsia-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-fuchsia-100">
                          {order.order_status}
                        </div>
                        <select
                          value={order.order_status}
                          onChange={(event) => handleStatusUpdate(order.order_id, event.target.value)}
                          className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none focus:border-fuchsia-400"
                        >
                          {kitchenStatuses.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={async () => {
                            setInvoice(await entityApi.getInvoice(order.order_id));
                            showToast(`Invoice ready for order #${order.order_id}.`, "info");
                          }}
                          className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                        >
                          View Invoice
                        </button>
                      </div>
                    </div>
                  </article>
                ))
              ) : (
                <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4 text-sm text-slate-300">
                  No active kitchen orders right now.
                </div>
              )}
            </div>
          </div>
        </section>
      </section>

      <section className="space-y-3">
        <div>
          <h3 className="text-xl font-semibold text-white">Audit Trail</h3>
          <p className="text-sm text-slate-300">Recent data changes help demonstrate traceability and accountability.</p>
        </div>
        <EntityTable
          columns={["audit_id", "table_name", "record_id", "action_type", "changed_by", "changed_at"]}
          rows={auditRows}
          isLoading={isLoading}
          emptyMessage="Run the enhancement SQL script to enable audit log storage, then perform updates."
        />
      </section>
    </div>
  );
};

export default WorkflowPage;
