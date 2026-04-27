import { formatDate, getCurrentMonthKey, getLastNDates, startOfWeek } from "./dateHelpers";

export function getSaleRevenue(sale) {
  return Number(sale.sale_price) * Number(sale.quantity);
}

export function getMonthSummary(sales, date = new Date()) {
  const key = getCurrentMonthKey(date);
  const inMonth = sales.filter((sale) => sale.timestamp.startsWith(key));

  return {
    profit: inMonth.reduce((sum, sale) => sum + Number(sale.total_profit), 0),
    revenue: inMonth.reduce((sum, sale) => sum + getSaleRevenue(sale), 0),
    salesCount: inMonth.length,
  };
}

export function getPreviousMonth(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth() - 1, 1);
}

export function getTrendPercentage(currentValue, previousValue) {
  if (!previousValue) {
    return "+100% vs last month";
  }

  const delta = ((currentValue - previousValue) / previousValue) * 100;
  const sign = delta >= 0 ? "+" : "";
  return `${sign}${Math.round(delta)}% vs last month`;
}

export function buildSalesTrendData(sales, days = 7) {
  return getLastNDates(days).map((date) => {
    const key = date.toISOString().slice(0, 10);
    const amount = sales
      .filter((sale) => sale.timestamp.slice(0, 10) === key)
      .reduce((sum, sale) => sum + getSaleRevenue(sale), 0);

    return {
      amount,
      label: date.toLocaleDateString("en-NG", { weekday: "short" }),
    };
  });
}

export function getTopProductsByUnits(products, sales, limit = 5) {
  const byId = new Map(products.map((product) => [product.id, product]));
  const totals = sales.reduce((map, sale) => {
    map.set(sale.product_id, (map.get(sale.product_id) ?? 0) + Number(sale.quantity));
    return map;
  }, new Map());

  return Array.from(totals.entries())
    .map(([productId, units]) => ({
      name: byId.get(productId)?.name ?? "Unknown product",
      units,
    }))
    .sort((left, right) => right.units - left.units)
    .slice(0, limit);
}

export function getTopMarginProducts(products, sales, limit = 5) {
  const byId = new Map(products.map((product) => [product.id, product]));
  const performance = sales.reduce((map, sale) => {
    const product = byId.get(sale.product_id);
    if (!product) {
      return map;
    }

    const revenue = getSaleRevenue(sale);
    const cost = Number(product.cost_price) * Number(sale.quantity);
    const existing = map.get(sale.product_id) ?? {
      cost: 0,
      product: product.name,
      profit: 0,
      revenue: 0,
    };

    existing.revenue += revenue;
    existing.cost += cost;
    existing.profit += revenue - cost;
    map.set(sale.product_id, existing);
    return map;
  }, new Map());

  return Array.from(performance.values())
    .map((item) => ({
      ...item,
      margin: item.revenue ? (item.profit / item.revenue) * 100 : 0,
    }))
    .sort((left, right) => right.margin - left.margin)
    .slice(0, limit);
}

export function getWeeklyRevenue(sales, weeks = 8) {
  const results = [];
  for (let index = weeks - 1; index >= 0; index -= 1) {
    const start = startOfWeek(new Date(Date.now() - index * 7 * 24 * 60 * 60 * 1000));
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    const value = sales
      .filter((sale) => {
        const timestamp = new Date(sale.timestamp);
        return timestamp >= start && timestamp <= end;
      })
      .reduce((sum, sale) => sum + getSaleRevenue(sale), 0);
    results.push({
      label: start.toLocaleDateString("en-NG", { day: "numeric", month: "short" }),
      value,
    });
  }
  return results;
}

export function getMonthlyRevenue(sales, months = 6) {
  const results = [];
  for (let index = months - 1; index >= 0; index -= 1) {
    const date = new Date();
    date.setDate(1);
    date.setMonth(date.getMonth() - index);
    const year = date.getFullYear();
    const month = date.getMonth();
    const value = sales
      .filter((sale) => {
        const timestamp = new Date(sale.timestamp);
        return timestamp.getFullYear() === year && timestamp.getMonth() === month;
      })
      .reduce((sum, sale) => sum + getSaleRevenue(sale), 0);
    results.push({
      label: date.toLocaleDateString("en-NG", { month: "short" }),
      value,
    });
  }
  return results;
}
