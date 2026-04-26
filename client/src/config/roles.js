export const roleAccess = {
  Admin: {
    analytics: true,
    workflow: true,
    entities: "all",
  },
  Manager: {
    analytics: true,
    workflow: true,
    entities: [
      "customers",
      "employees",
      "menu-items",
      "inventory-items",
      "suppliers",
      "orders",
      "order-items",
      "bills",
      "recipes",
      "recipe-ingredients",
      "purchase-orders",
      "purchase-order-items",
    ],
  },
  Staff: {
    analytics: false,
    workflow: true,
    entities: ["orders", "order-items", "bills", "customers"],
  },
};

export const canAccessEntity = (userRole, entityKey) => {
  const config = roleAccess[userRole];

  if (!config) {
    return false;
  }

  if (config.entities === "all") {
    return true;
  }

  return config.entities.includes(entityKey);
};
