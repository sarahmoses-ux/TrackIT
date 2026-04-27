const currencyFormatter = new Intl.NumberFormat("en-NG", {
  currency: "NGN",
  maximumFractionDigits: 0,
  style: "currency",
});

export function formatCurrency(amount = 0) {
  return currencyFormatter.format(Number(amount) || 0);
}
