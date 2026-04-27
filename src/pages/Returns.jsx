import { RefreshCcw, ShieldCheck, Undo2, Wallet } from "lucide-react";
import { startTransition, useMemo, useState } from "react";
import AlertBanner from "../components/ui/AlertBanner";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import KPICard from "../components/ui/KPICard";
import Select from "../components/ui/Select";
import Skeleton, { TableSkeleton } from "../components/ui/Skeleton";
import Table, { TableEmpty, TableHead } from "../components/ui/Table";
import { useToast } from "../context/ToastContext";
import useProducts from "../hooks/useProducts";
import useReturns from "../hooks/useReturns";
import useSales from "../hooks/useSales";
import { createReturn } from "../services/mockApi";
import { formatDateTime } from "../utils/dateHelpers";
import { formatCurrency } from "../utils/formatCurrency";

const refundMethods = ["Cash", "Transfer", "Store Credit", "Paystack Reversal"];

export function ReturnsView() {
  const { products, refresh: refreshProducts } = useProducts();
  const { refresh: refreshReturns, returns, loading: returnsLoading } = useReturns();
  const { refresh: refreshSales, sales, loading: salesLoading } = useSales();
  const { showToast } = useToast();
  const [form, setForm] = useState({
    quantity: 1,
    reason: "",
    refund_amount: "",
    refund_method: "Transfer",
    sale_id: "",
  });

  const loading = returnsLoading || salesLoading;
  const selectedSale = sales.find((sale) => sale.id === form.sale_id) ?? null;
  const productsById = useMemo(
    () => new Map(products.map((product) => [product.id, product])),
    [products],
  );
  const returnedBySale = useMemo(
    () =>
      returns.reduce((map, item) => {
        map.set(item.sale_id, (map.get(item.sale_id) ?? 0) + Number(item.quantity));
        return map;
      }, new Map()),
    [returns],
  );
  const availableToReturn = selectedSale
    ? Number(selectedSale.quantity) - (returnedBySale.get(selectedSale.id) ?? 0)
    : 0;

  const summary = useMemo(() => {
    return returns.reduce(
      (totals, item) => {
        totals.amount += Number(item.refund_amount);
        totals.units += Number(item.quantity);
        return totals;
      },
      { amount: 0, units: 0 },
    );
  }, [returns]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!selectedSale) {
      showToast("Choose a sale before processing a return.", "error");
      return;
    }
    if (Number(form.quantity) <= 0 || Number(form.quantity) > availableToReturn) {
      showToast("Return quantity is invalid for the selected sale.", "error");
      return;
    }
    if (!form.reason.trim()) {
      showToast("Add a return reason before submitting.", "error");
      return;
    }

    try {
      await createReturn({
        quantity: Number(form.quantity),
        reason: form.reason.trim(),
        refund_amount: Number(form.refund_amount) || Number(selectedSale.sale_price) * Number(form.quantity),
        refund_method: form.refund_method,
        sale_id: selectedSale.id,
      });
      showToast("Return processed and stock restored.", "success");
      setForm({
        quantity: 1,
        reason: "",
        refund_amount: "",
        refund_method: "Transfer",
        sale_id: "",
      });
      startTransition(() => {
        refreshReturns();
        refreshProducts();
        refreshSales();
      });
    } catch (error) {
      showToast(error.message || "Unable to process return.", "error");
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-40 rounded-3xl" />
          ))}
        </div>
        <Skeleton className="h-[340px] rounded-3xl" />
        <TableSkeleton columns={7} rows={5} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AlertBanner
        message="Processing a refund restores stock immediately in this demo workspace."
        tone="info"
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KPICard icon={Undo2} label="Total Returns" trend="Refund activity tracked" value={returns.length} />
        <KPICard icon={Wallet} label="Refunded Amount" trend="Money returned" value={formatCurrency(summary.amount)} />
        <KPICard icon={RefreshCcw} label="Units Restocked" trend="Inventory restored" value={summary.units} />
        <KPICard icon={ShieldCheck} label="Resolved Returns" trend="Processed successfully" value={returns.length} />
      </section>

      <section className="panel-card rounded-[28px] p-6">
        <div className="mb-6">
          <h2 className="font-display text-3xl font-bold text-text">Process Return / Refund</h2>
          <p className="mt-2 text-base text-muted">
            Select a sale, confirm the quantity being returned, and restore stock automatically.
          </p>
        </div>
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="grid gap-5 lg:grid-cols-2">
            <Select
              label="Original Sale"
              onChange={(event) => setForm((current) => ({ ...current, sale_id: event.target.value }))}
              value={form.sale_id}
            >
              <option value="">Select a sale</option>
              {sales.map((sale) => {
                const productName = productsById.get(sale.product_id)?.name ?? "Unknown product";
                return (
                  <option key={sale.id} value={sale.id}>
                    {productName} - {sale.quantity} unit(s) - {formatCurrency(sale.sale_price * sale.quantity)}
                  </option>
                );
              })}
            </Select>
            <Input
              label="Quantity to Return"
              max={availableToReturn || 0}
              min="1"
              onChange={(event) => setForm((current) => ({ ...current, quantity: event.target.value }))}
              type="number"
              value={form.quantity}
            />
            <Select
              label="Refund Method"
              onChange={(event) => setForm((current) => ({ ...current, refund_method: event.target.value }))}
              value={form.refund_method}
            >
              {refundMethods.map((method) => (
                <option key={method} value={method}>
                  {method}
                </option>
              ))}
            </Select>
            <Input
              label="Refund Amount"
              min="0"
              onChange={(event) => setForm((current) => ({ ...current, refund_amount: event.target.value }))}
              type="number"
              value={form.refund_amount}
            />
            <div className="lg:col-span-2">
              <Input
                label="Reason"
                onChange={(event) => setForm((current) => ({ ...current, reason: event.target.value }))}
                placeholder="Customer changed size, item damaged, duplicate order..."
                value={form.reason}
              />
            </div>
          </div>
          {selectedSale ? (
            <div className="rounded-2xl border border-primary/15 bg-primary-light/60 px-4 py-3 text-sm text-primary">
              Available to return from this sale:{" "}
              <span className="font-semibold">{availableToReturn} unit(s)</span>
            </div>
          ) : null}
          <Button type="submit">Process Return</Button>
        </form>
      </section>

      <section className="panel-card rounded-[28px] p-6">
        <div className="mb-5">
          <h2 className="font-display text-3xl font-bold text-text">Return History</h2>
          <p className="mt-2 text-base text-muted">Every refunded transaction and the stock it restored.</p>
        </div>
        <Table>
          <TableHead columns={["Product", "Sale", "Qty", "Refund", "Method", "Reason", "Date"]} />
          {returns.length ? (
            <tbody className="divide-y divide-border">
              {returns.map((item) => (
                <tr key={item.id} className="interactive-row">
                  <td className="px-4 py-4 font-semibold text-text">
                    {productsById.get(item.product_id)?.name ?? "Unknown product"}
                  </td>
                  <td className="px-4 py-4 font-mono text-xs text-muted">{item.sale_id}</td>
                  <td className="px-4 py-4 text-sm text-muted">{item.quantity}</td>
                  <td className="px-4 py-4 text-sm font-semibold text-danger">
                    {formatCurrency(item.refund_amount)}
                  </td>
                  <td className="px-4 py-4 text-sm text-muted">{item.refund_method}</td>
                  <td className="px-4 py-4 text-sm text-muted">{item.reason}</td>
                  <td className="px-4 py-4 text-sm text-muted">{formatDateTime(item.created_at)}</td>
                </tr>
              ))}
            </tbody>
          ) : (
            <TableEmpty message="No returns have been processed yet." />
          )}
        </Table>
      </section>
    </div>
  );
}

export default function Returns() {
  return <ReturnsView />;
}
