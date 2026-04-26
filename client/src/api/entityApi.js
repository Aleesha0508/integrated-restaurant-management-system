import axios from "axios";

const api = axios.create({
  // Using a relative /api base lets Vite proxy requests to the backend port during local development.
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
});

const triggerCsvDownload = async (url, filename) => {
  const response = await api.get(url, {
    responseType: "blob",
  });

  const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement("a");
  link.href = blobUrl;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(blobUrl);
};

export const entityApi = {
  getMeta: async () => {
    const { data } = await api.get("/meta/entities");
    return data;
  },
  listEntities: async (entityKey) => {
    const { data } = await api.get(`/${entityKey}`);
    return data;
  },
  createEntity: async (entityKey, payload) => {
    const { data } = await api.post(`/${entityKey}`, payload);
    return data;
  },
  updateEntity: async (entityKey, routeKey, payload) => {
    const { data } = await api.put(`/${entityKey}/${routeKey}`, payload);
    return data;
  },
  deleteEntity: async (entityKey, routeKey) => {
    const { data } = await api.delete(`/${entityKey}/${routeKey}`);
    return data;
  },
  getView: async (viewKey) => {
    const { data } = await api.get(`/views/${viewKey}`);
    return data;
  },
  getAnalyticsDashboard: async () => {
    const { data } = await api.get("/analytics/dashboard");
    return data;
  },
  getKitchenOrders: async () => {
    const { data } = await api.get("/workflow/kitchen");
    return data;
  },
  placeOrder: async (payload) => {
    const { data } = await api.post("/workflow/place-order", payload);
    return data;
  },
  updateWorkflowOrderStatus: async (orderId, order_status) => {
    const { data } = await api.patch(`/workflow/orders/${orderId}/status`, { order_status });
    return data;
  },
  getAuditLog: async () => {
    const { data } = await api.get("/workflow/audit-log");
    return data;
  },
  getInvoice: async (orderId) => {
    const { data } = await api.get(`/workflow/orders/${orderId}/invoice`);
    return data;
  },
  downloadOrdersReport: async (queryString = "") => {
    await triggerCsvDownload(`/reports/orders.csv${queryString}`, "orders-report.csv");
  },
  downloadCustomersReport: async () => {
    await triggerCsvDownload("/reports/customers.csv", "customers-report.csv");
  },
};
