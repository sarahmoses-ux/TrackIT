import integrationsSeed from "../mock/integrations.json";
import insightsSeed from "../mock/insights.json";
import invoicesSeed from "../mock/invoices.json";
import productsSeed from "../mock/products.json";
import returnsSeed from "../mock/returns.json";
import salesSeed from "../mock/sales.json";
import settingsSeed from "../mock/settings.json";
import teamSeed from "../mock/team.json";
import { resolveProductBarcode } from "../utils/productCodes";

const STORAGE_KEYS = {
  integrations: "trackit_integrations",
  insights: "trackit_insights",
  invoices: "trackit_invoices",
  products: "trackit_products",
  returns: "trackit_returns",
  sales: "trackit_sales",
  settings: "trackit_settings",
  team: "trackit_team",
};

const delay = (ms = 300) => new Promise((resolve) => window.setTimeout(resolve, ms));

function clone(data) {
  return JSON.parse(JSON.stringify(data));
}

function enrichProduct(product) {
  return {
    ...product,
    barcode: resolveProductBarcode(product),
  };
}

function enrichProducts(products) {
  return products.map(enrichProduct);
}

function notifyDataChange(key) {
  window.dispatchEvent(
    new CustomEvent("trackit:data-changed", {
      detail: { key },
    }),
  );
}

function notifyUserChange(user) {
  window.dispatchEvent(
    new CustomEvent("trackit:user-changed", {
      detail: { user },
    }),
  );
}

function ensureSeeded() {
  const savedUser = JSON.parse(localStorage.getItem("trackit_user") ?? "null");
  if (!localStorage.getItem(STORAGE_KEYS.products)) {
    localStorage.setItem(STORAGE_KEYS.products, JSON.stringify(productsSeed));
  }
  if (!localStorage.getItem(STORAGE_KEYS.invoices)) {
    localStorage.setItem(STORAGE_KEYS.invoices, JSON.stringify(invoicesSeed));
  }
  if (!localStorage.getItem(STORAGE_KEYS.returns)) {
    localStorage.setItem(STORAGE_KEYS.returns, JSON.stringify(returnsSeed));
  }
  if (!localStorage.getItem(STORAGE_KEYS.sales)) {
    localStorage.setItem(STORAGE_KEYS.sales, JSON.stringify(salesSeed));
  }
  if (!localStorage.getItem(STORAGE_KEYS.insights)) {
    localStorage.setItem(STORAGE_KEYS.insights, JSON.stringify(insightsSeed));
  }
  if (!localStorage.getItem(STORAGE_KEYS.team)) {
    localStorage.setItem(STORAGE_KEYS.team, JSON.stringify(teamSeed));
  }
  if (!localStorage.getItem(STORAGE_KEYS.integrations)) {
    localStorage.setItem(STORAGE_KEYS.integrations, JSON.stringify(integrationsSeed));
  }
  if (!localStorage.getItem(STORAGE_KEYS.settings)) {
    localStorage.setItem(
      STORAGE_KEYS.settings,
      JSON.stringify({
        ...settingsSeed,
        business_email: savedUser?.email ?? settingsSeed.business_email,
        business_name: savedUser?.business_name ?? settingsSeed.business_name,
        owner_name: savedUser?.name ?? settingsSeed.owner_name,
      }),
    );
  }
}

function readCollection(key) {
  ensureSeeded();
  return JSON.parse(localStorage.getItem(key) ?? "[]");
}

function writeCollection(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
  notifyDataChange(key);
}

function createId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export async function getProducts() {
  await delay();
  return clone(enrichProducts(readCollection(STORAGE_KEYS.products)));
}

export async function getProductById(id) {
  await delay();
  const product = readCollection(STORAGE_KEYS.products).find((item) => item.id === id);
  if (!product) {
    throw new Error("Product not found");
  }
  return clone(enrichProduct(product));
}

export async function addProduct(data) {
  await delay();
  const products = readCollection(STORAGE_KEYS.products);
  const existing = products.find(
    (product) => product.sku.toLowerCase() === data.sku.trim().toLowerCase(),
  );

  if (existing) {
    throw new Error("A product with this SKU already exists.");
  }

  const product = {
    id: createId("prod"),
    created_at: new Date().toISOString(),
    barcode: data.barcode?.trim?.() || undefined,
    ...data,
  };

  products.unshift(product);
  writeCollection(STORAGE_KEYS.products, products);
  return { status: "success", product: clone(enrichProduct(product)) };
}

export async function updateProduct(id, data) {
  await delay();
  const products = readCollection(STORAGE_KEYS.products);
  const index = products.findIndex((product) => product.id === id);

  if (index === -1) {
    throw new Error("Product not found");
  }

  const duplicateSku = products.find(
    (product) =>
      product.id !== id && product.sku.toLowerCase() === data.sku.trim().toLowerCase(),
  );

  if (duplicateSku) {
    throw new Error("A product with this SKU already exists.");
  }

  products[index] = { ...products[index], ...data, barcode: data.barcode?.trim?.() || undefined };
  writeCollection(STORAGE_KEYS.products, products);
  return clone(enrichProduct(products[index]));
}

export async function deleteProduct(id) {
  await delay();
  const products = readCollection(STORAGE_KEYS.products);
  const nextProducts = products.filter((product) => product.id !== id);

  if (nextProducts.length === products.length) {
    throw new Error("Product not found");
  }

  writeCollection(STORAGE_KEYS.products, nextProducts);
  return { status: "success" };
}

export async function getSales(filters = {}) {
  await delay();
  const sales = readCollection(STORAGE_KEYS.sales);
  const { endDate, productId, startDate } = filters;

  const filtered = sales.filter((sale) => {
    const saleDate = sale.timestamp.slice(0, 10);
    if (productId && sale.product_id !== productId) {
      return false;
    }
    if (startDate && saleDate < startDate) {
      return false;
    }
    if (endDate && saleDate > endDate) {
      return false;
    }
    return true;
  });

  return clone(filtered);
}

export async function getInvoices() {
  await delay();
  return clone(readCollection(STORAGE_KEYS.invoices));
}

export async function createInvoice(data) {
  await delay();
  const invoices = readCollection(STORAGE_KEYS.invoices);
  const index = invoices.length + 1;
  const invoice = {
    id: createId("inv"),
    invoice_number: `INV-2026-${String(index).padStart(3, "0")}`,
    receipt_number: `RCT-2026-${String(index).padStart(3, "0")}`,
    issued_at: new Date().toISOString(),
    ...data,
  };
  invoices.unshift(invoice);
  writeCollection(STORAGE_KEYS.invoices, invoices);
  return { status: "success", invoice: clone(invoice) };
}

export async function updateInvoiceStatus(id, status) {
  await delay();
  const invoices = readCollection(STORAGE_KEYS.invoices);
  const index = invoices.findIndex((invoice) => invoice.id === id);
  if (index === -1) {
    throw new Error("Invoice not found");
  }
  invoices[index] = { ...invoices[index], status };
  writeCollection(STORAGE_KEYS.invoices, invoices);
  return clone(invoices[index]);
}

export async function recordSale(data) {
  await delay();
  const products = readCollection(STORAGE_KEYS.products);
  const sales = readCollection(STORAGE_KEYS.sales);
  const product = products.find((item) => item.id === data.product_id);

  if (!product) {
    throw new Error("Product not found");
  }

  if (data.quantity > product.stock) {
    throw new Error("Quantity exceeds available stock.");
  }

  const profit = (Number(data.sale_price) - Number(product.cost_price)) * Number(data.quantity);
  product.stock -= Number(data.quantity);

  const sale = {
    id: createId("sale"),
    product_id: data.product_id,
    quantity: Number(data.quantity),
    sale_price: Number(data.sale_price),
    total_profit: profit,
    timestamp: new Date().toISOString(),
  };

  sales.unshift(sale);
  writeCollection(STORAGE_KEYS.products, products);
  writeCollection(STORAGE_KEYS.sales, sales);

  return {
    status: "success",
    updated_stock: product.stock,
    profit,
  };
}

export async function getReturns() {
  await delay();
  return clone(readCollection(STORAGE_KEYS.returns));
}

export async function createReturn(data) {
  await delay();
  const returns = readCollection(STORAGE_KEYS.returns);
  const sales = readCollection(STORAGE_KEYS.sales);
  const products = readCollection(STORAGE_KEYS.products);
  const sale = sales.find((item) => item.id === data.sale_id);

  if (!sale) {
    throw new Error("Sale not found");
  }

  const returnedQty = returns
    .filter((item) => item.sale_id === data.sale_id)
    .reduce((sum, item) => sum + Number(item.quantity), 0);

  if (returnedQty + Number(data.quantity) > Number(sale.quantity)) {
    throw new Error("Return quantity exceeds the quantity sold.");
  }

  const product = products.find((item) => item.id === sale.product_id);
  if (!product) {
    throw new Error("Product not found for return.");
  }

  product.stock += Number(data.quantity);

  const refundAmount =
    Number(data.refund_amount) || Number(sale.sale_price) * Number(data.quantity);

  const record = {
    id: createId("ret"),
    created_at: new Date().toISOString(),
    product_id: sale.product_id,
    refund_amount: refundAmount,
    status: "Refunded",
    ...data,
  };

  returns.unshift(record);
  writeCollection(STORAGE_KEYS.products, products);
  writeCollection(STORAGE_KEYS.returns, returns);
  return { status: "success", return: clone(record), updated_stock: product.stock };
}

export async function getInsights() {
  await delay();
  return clone(readCollection(STORAGE_KEYS.insights));
}

export async function getInsightByProduct(id) {
  await delay();
  const insight = readCollection(STORAGE_KEYS.insights).find((item) => item.product_id === id);
  if (!insight) {
    throw new Error("Insight not found");
  }
  return clone(insight);
}

export async function getTeamMembers() {
  await delay();
  return clone(readCollection(STORAGE_KEYS.team));
}

export async function getTeamMemberById(id) {
  await delay();
  const member = readCollection(STORAGE_KEYS.team).find((item) => item.id === id);
  if (!member) {
    throw new Error("Team member not found");
  }
  return clone(member);
}

export async function inviteTeamMember(data) {
  await delay();
  const members = readCollection(STORAGE_KEYS.team);
  const duplicate = members.find(
    (member) => member.email.toLowerCase() === data.email.trim().toLowerCase(),
  );

  if (duplicate) {
    throw new Error("A team member with this email already exists.");
  }

  const member = {
    id: createId("team"),
    joined_at: new Date().toISOString(),
    last_active: new Date().toISOString(),
    status: "Pending Invite",
    ...data,
  };

  members.unshift(member);
  writeCollection(STORAGE_KEYS.team, members);
  return { status: "success", member: clone(member) };
}

export async function updateTeamMember(id, data) {
  await delay();
  const members = readCollection(STORAGE_KEYS.team);
  const index = members.findIndex((member) => member.id === id);

  if (index === -1) {
    throw new Error("Team member not found");
  }

  const duplicate = members.find(
    (member) =>
      member.id !== id && member.email.toLowerCase() === data.email.trim().toLowerCase(),
  );

  if (duplicate) {
    throw new Error("A team member with this email already exists.");
  }

  members[index] = {
    ...members[index],
    ...data,
    last_active: data.status === "Active" ? new Date().toISOString() : members[index].last_active,
  };
  writeCollection(STORAGE_KEYS.team, members);
  return clone(members[index]);
}

export async function removeTeamMember(id) {
  await delay();
  const members = readCollection(STORAGE_KEYS.team);
  const nextMembers = members.filter((member) => member.id !== id);

  if (nextMembers.length === members.length) {
    throw new Error("Team member not found");
  }

  writeCollection(STORAGE_KEYS.team, nextMembers);
  return { status: "success" };
}

export async function getSettings() {
  await delay();
  return clone(readCollection(STORAGE_KEYS.settings));
}

export async function getIntegrations() {
  await delay();
  return clone(readCollection(STORAGE_KEYS.integrations));
}

export async function updateIntegration(id, data) {
  await delay();
  const integrations = readCollection(STORAGE_KEYS.integrations);
  const index = integrations.findIndex((item) => item.id === id);
  if (index === -1) {
    throw new Error("Integration not found");
  }

  integrations[index] = {
    ...integrations[index],
    ...data,
    last_sync_at: data.status === "Connected" ? new Date().toISOString() : integrations[index].last_sync_at,
  };
  writeCollection(STORAGE_KEYS.integrations, integrations);
  return clone(integrations[index]);
}

export async function updateSettings(data) {
  await delay();
  const current = readCollection(STORAGE_KEYS.settings);
  const next = {
    ...current,
    ...data,
    notifications: {
      ...current.notifications,
      ...(data.notifications ?? {}),
    },
  };
  writeCollection(STORAGE_KEYS.settings, next);
  return clone(next);
}

export async function getCurrentUser() {
  await delay();
  return clone(JSON.parse(localStorage.getItem("trackit_user") ?? "null"));
}

export async function updateCurrentUser(data) {
  await delay();
  const current = JSON.parse(localStorage.getItem("trackit_user") ?? "null") ?? {};
  const next = { ...current, ...data };
  localStorage.setItem("trackit_user", JSON.stringify(next));
  notifyUserChange(next);
  return clone(next);
}

export function resetMockState() {
  localStorage.removeItem(STORAGE_KEYS.integrations);
  localStorage.removeItem(STORAGE_KEYS.products);
  localStorage.removeItem(STORAGE_KEYS.invoices);
  localStorage.removeItem(STORAGE_KEYS.returns);
  localStorage.removeItem(STORAGE_KEYS.sales);
  localStorage.removeItem(STORAGE_KEYS.insights);
  localStorage.removeItem(STORAGE_KEYS.settings);
  localStorage.removeItem(STORAGE_KEYS.team);
  ensureSeeded();
}
