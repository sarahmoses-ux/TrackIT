import { Eye, Printer, Receipt, Wallet } from "lucide-react";
import { startTransition, useEffect, useMemo, useState } from "react";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import KPICard from "../components/ui/KPICard";
import Select from "../components/ui/Select";
import Skeleton, { TableSkeleton } from "../components/ui/Skeleton";
import Table, { TableEmpty, TableHead } from "../components/ui/Table";
import { useToast } from "../context/ToastContext";
import useInvoices from "../hooks/useInvoices";
import useProducts from "../hooks/useProducts";
import { createInvoice, updateInvoiceStatus } from "../services/mockApi";
import { formatDateTime } from "../utils/dateHelpers";
import { formatCurrency } from "../utils/formatCurrency";

const paymentMethods = ["Cash", "Transfer", "Paystack", "Flutterwave", "POS"];

const emptyForm = {
  customer_email: "",
  customer_name: "",
  customer_phone: "",
  payment_method: "Transfer",
  product_id: "",
  quantity: 1,
  unit_price: "",
};

function getStatusTone(status) {
  if (status === "Paid") return "success";
  if (status === "Pending") return "warning";
  return "neutral";
}

export function InvoicesView() {
  const { invoices, loading, refresh } = useInvoices();
  const { products } = useProducts();
  const { showToast } = useToast();
  const [selectedInvoiceId, setSelectedInvoiceId] = useState("");
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (invoices.length && !selectedInvoiceId) {
      setSelectedInvoiceId(invoices[0].id);
    }
  }, [invoices, selectedInvoiceId]);

  const selectedProduct = products.find((product) => product.id === form.product_id) ?? null;
  const selectedInvoice = invoices.find((invoice) => invoice.id === selectedInvoiceId) ?? invoices[0];

  const summary = useMemo(() => {
    return invoices.reduce(
      (totals, invoice) => {
        totals.total += invoice.total;
        if (invoice.status === "Paid") {
          totals.paid += invoice.total;
        }
        if (invoice.status === "Pending") {
          totals.pending += invoice.total;
        }
        return totals;
      },
      { paid: 0, pending: 0, total: 0 },
    );
  }, [invoices]);

  const liveTotal = Number(form.quantity || 0) * Number(form.unit_price || 0);

  const handleCreateInvoice = async (event) => {
    event.preventDefault();
    if (!form.customer_name.trim() || !form.customer_email.trim() || !selectedProduct) {
      showToast("Complete the customer and product fields first.", "error");
      return;
    }

    try {
      const result = await createInvoice({
        customer_email: form.customer_email.trim(),
        customer_name: form.customer_name.trim(),
        customer_phone: form.customer_phone.trim(),
        items: [
          {
            name: selectedProduct.name,
            product_id: selectedProduct.id,
            quantity: Number(form.quantity),
            unit_price: Number(form.unit_price),
          },
        ],
        payment_method: form.payment_method,
        status: "Pending",
        subtotal: liveTotal,
        total: liveTotal,
      });
      showToast("Invoice and receipt created.", "success");
      setSelectedInvoiceId(result.invoice.id);
      setForm(emptyForm);
      startTransition(() => refresh());
    } catch (error) {
      showToast(error.message || "Unable to create invoice.", "error");
    }
  };

  const handleMarkPaid = async (invoice) => {
    try {
      await updateInvoiceStatus(invoice.id, "Paid");
      showToast("Invoice marked as paid.", "success");
      startTransition(() => refresh());
    } catch (error) {
      showToast(error.message || "Unable to update invoice.", "error");
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
        <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <Skeleton className="h-[420px] rounded-3xl" />
          <Skeleton className="h-[420px] rounded-3xl" />
        </div>
        <TableSkeleton columns={6} rows={5} />
      </div>
    );
  }

  return (
    <div className="space-y-6 print-full">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KPICard icon={Receipt} label="Total Invoices" trend="New receipts ready" value={invoices.length} />
        <KPICard icon={Wallet} label="Total Billed" trend="Across all invoices" value={formatCurrency(summary.total)} />
        <KPICard icon={Wallet} label="Paid Value" trend="Cash collected" value={formatCurrency(summary.paid)} />
        <KPICard icon={Wallet} label="Pending Value" trend="Awaiting payment" value={formatCurrency(summary.pending)} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="panel-card rounded-[28px] p-6 print-hidden">
          <div className="mb-6">
            <h2 className="font-display text-3xl font-bold text-text">Create Invoice / Receipt</h2>
            <p className="mt-2 text-base text-muted">
              Generate a clean customer invoice and printable receipt in one step.
            </p>
          </div>
          <form className="space-y-5" onSubmit={handleCreateInvoice}>
            <div className="grid gap-5 sm:grid-cols-2">
              <Input
                label="Customer Name"
                onChange={(event) => setForm((current) => ({ ...current, customer_name: event.target.value }))}
                value={form.customer_name}
              />
              <Input
                label="Customer Email"
                onChange={(event) => setForm((current) => ({ ...current, customer_email: event.target.value }))}
                type="email"
                value={form.customer_email}
              />
              <Input
                label="Customer Phone"
                onChange={(event) => setForm((current) => ({ ...current, customer_phone: event.target.value }))}
                value={form.customer_phone}
              />
              <Select
                label="Payment Method"
                onChange={(event) => setForm((current) => ({ ...current, payment_method: event.target.value }))}
                value={form.payment_method}
              >
                {paymentMethods.map((method) => (
                  <option key={method} value={method}>
                    {method}
                  </option>
                ))}
              </Select>
              <Select
                label="Product"
                onChange={(event) => {
                  const product = products.find((item) => item.id === event.target.value);
                  setForm((current) => ({
                    ...current,
                    product_id: event.target.value,
                    unit_price: product ? String(product.selling_price) : "",
                  }));
                }}
                value={form.product_id}
              >
                <option value="">Select product</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name}
                  </option>
                ))}
              </Select>
              <Input
                label="Quantity"
                min="1"
                onChange={(event) => setForm((current) => ({ ...current, quantity: event.target.value }))}
                type="number"
                value={form.quantity}
              />
              <div className="sm:col-span-2">
                <Input
                  label="Unit Price"
                  min="1"
                  onChange={(event) => setForm((current) => ({ ...current, unit_price: event.target.value }))}
                  type="number"
                  value={form.unit_price}
                />
              </div>
            </div>
            <div className="rounded-2xl border border-primary/15 bg-primary-light/60 px-4 py-3 text-sm text-primary">
              Invoice total: <span className="font-semibold">{formatCurrency(liveTotal)}</span>
            </div>
            <Button type="submit">Generate Invoice & Receipt</Button>
          </form>
        </div>

        <div className="panel-card rounded-[28px] p-6">
          {selectedInvoice ? (
            <div>
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border pb-5">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Receipt Preview</p>
                  <h2 className="mt-3 font-display text-3xl font-bold text-text">
                    {selectedInvoice.invoice_number}
                  </h2>
                  <p className="mt-2 text-sm text-muted">{selectedInvoice.receipt_number}</p>
                </div>
                <div className="print-hidden flex gap-2">
                  <Button onClick={() => window.print()} variant="outline">
                    <Printer className="h-4 w-4" />
                    Print
                  </Button>
                  {selectedInvoice.status !== "Paid" ? (
                    <Button onClick={() => handleMarkPaid(selectedInvoice)}>Mark Paid</Button>
                  ) : null}
                </div>
              </div>
              <div className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
                <div>
                  <p className="font-semibold text-text">Billed To</p>
                  <p className="mt-2 text-muted">{selectedInvoice.customer_name}</p>
                  <p className="text-muted">{selectedInvoice.customer_email}</p>
                  <p className="text-muted">{selectedInvoice.customer_phone || "No phone added"}</p>
                </div>
                <div className="sm:text-right">
                  <p className="font-semibold text-text">Payment</p>
                  <p className="mt-2 text-muted">{selectedInvoice.payment_method}</p>
                  <Badge className="mt-2" tone={getStatusTone(selectedInvoice.status)}>
                    {selectedInvoice.status}
                  </Badge>
                  <p className="mt-2 text-muted">{formatDateTime(selectedInvoice.issued_at)}</p>
                </div>
              </div>
              <div className="mt-6 rounded-3xl border border-border">
                <div className="grid grid-cols-[1.2fr_0.5fr_0.6fr_0.7fr] gap-3 border-b border-border bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted">
                  <span>Item</span>
                  <span>Qty</span>
                  <span>Price</span>
                  <span>Total</span>
                </div>
                <div className="divide-y divide-border">
                  {selectedInvoice.items.map((item, index) => (
                    <div key={`${selectedInvoice.id}-${index}`} className="grid grid-cols-[1.2fr_0.5fr_0.6fr_0.7fr] gap-3 px-4 py-4 text-sm">
                      <span className="font-semibold text-text">{item.name}</span>
                      <span className="text-muted">{item.quantity}</span>
                      <span className="text-muted">{formatCurrency(item.unit_price)}</span>
                      <span className="font-semibold text-text">
                        {formatCurrency(item.quantity * item.unit_price)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-5 flex justify-end">
                <div className="w-full max-w-xs space-y-3 rounded-3xl bg-slate-50 p-4">
                  <div className="flex items-center justify-between text-sm text-muted">
                    <span>Subtotal</span>
                    <span>{formatCurrency(selectedInvoice.subtotal)}</span>
                  </div>
                  <div className="flex items-center justify-between border-t border-border pt-3 text-base font-semibold text-text">
                    <span>Total</span>
                    <span>{formatCurrency(selectedInvoice.total)}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex h-full items-center justify-center text-muted">
              Create an invoice to preview its receipt.
            </div>
          )}
        </div>
      </section>

      <section className="panel-card rounded-[28px] p-6 print-hidden">
        <div className="mb-5">
          <h2 className="font-display text-3xl font-bold text-text">Invoice History</h2>
          <p className="mt-2 text-base text-muted">Review generated invoices and open any receipt preview.</p>
        </div>
        <Table>
          <TableHead columns={["Invoice", "Customer", "Total", "Status", "Payment", "Actions"]} />
          {invoices.length ? (
            <tbody className="divide-y divide-border">
              {invoices.map((invoice) => (
                <tr key={invoice.id} className="interactive-row">
                  <td className="px-4 py-4">
                    <p className="font-semibold text-text">{invoice.invoice_number}</p>
                    <p className="text-xs text-muted">{formatDateTime(invoice.issued_at)}</p>
                  </td>
                  <td className="px-4 py-4">
                    <p className="font-semibold text-text">{invoice.customer_name}</p>
                    <p className="text-xs text-muted">{invoice.customer_email}</p>
                  </td>
                  <td className="px-4 py-4 text-sm font-semibold text-text">{formatCurrency(invoice.total)}</td>
                  <td className="px-4 py-4">
                    <Badge tone={getStatusTone(invoice.status)}>{invoice.status}</Badge>
                  </td>
                  <td className="px-4 py-4 text-sm text-muted">{invoice.payment_method}</td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-2">
                      <Button onClick={() => setSelectedInvoiceId(invoice.id)} size="sm" variant="subtle">
                        <Eye className="h-4 w-4" />
                        View
                      </Button>
                      {invoice.status !== "Paid" ? (
                        <Button onClick={() => handleMarkPaid(invoice)} size="sm">
                          Mark Paid
                        </Button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          ) : (
            <TableEmpty message="No invoices yet." />
          )}
        </Table>
      </section>
    </div>
  );
}

export default function Invoices() {
  return <InvoicesView />;
}
