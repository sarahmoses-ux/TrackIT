import { Download } from "lucide-react";
import { startTransition, useDeferredValue, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { BarcodePreview, QrPreview } from "../components/ui/CodePreview";
import AlertBanner from "../components/ui/AlertBanner";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";
import { TableSkeleton } from "../components/ui/Skeleton";
import Table, { TableEmpty, TableHead } from "../components/ui/Table";
import { useToast } from "../context/ToastContext";
import useProducts from "../hooks/useProducts";
import useSales from "../hooks/useSales";
import { InvoicesView } from "./Invoices";
import { ReturnsView } from "./Returns";
import { recordSale } from "../services/mockApi";
import { downloadCsv } from "../utils/exportCsv";
import { formatDateTime, getTodayDate } from "../utils/dateHelpers";
import { formatCurrency } from "../utils/formatCurrency";
import { resolveProductBarcode } from "../utils/productCodes";

const salesTabs = [
  { id: "log", label: "Sales Log" },
  { id: "invoices", label: "Invoices & Receipts" },
  { id: "returns", label: "Returns & Refunds" },
];

function buildSalesExportRows(sales, productsById) {
  return sales.map((sale, index) => ({
    Date: formatDateTime(sale.timestamp),
    Product: productsById.get(sale.product_id)?.name ?? "Unknown product",
    Profit: sale.total_profit,
    Quantity: sale.quantity,
    Revenue: sale.sale_price * sale.quantity,
    Row: index + 1,
    SalePrice: sale.sale_price,
  }));
}

function SalesLogView() {
  const { products, refresh: refreshProducts } = useProducts();
  const { filters, loading, refresh, sales, setFilters } = useSales({
    endDate: "",
    productId: "",
    startDate: "",
  });
  const { showToast } = useToast();
  const [productQuery, setProductQuery] = useState("");
  const [scanCode, setScanCode] = useState("");
  const [form, setForm] = useState({
    product_id: "",
    quantity: 1,
    sale_price: "",
  });
  const [formError, setFormError] = useState("");
  const deferredQuery = useDeferredValue(productQuery);

  const filteredProducts = useMemo(() => {
    const search = deferredQuery.trim().toLowerCase();
    return products.filter((product) => {
      return (
        !search ||
        product.name.toLowerCase().includes(search) ||
        product.sku.toLowerCase().includes(search) ||
        resolveProductBarcode(product).toLowerCase().includes(search)
      );
    });
  }, [deferredQuery, products]);

  const selectedProduct = products.find((product) => product.id === form.product_id) ?? null;
  const productsById = useMemo(
    () => new Map(products.map((product) => [product.id, product])),
    [products],
  );

  useEffect(() => {
    if (!selectedProduct) {
      return;
    }
    setForm((current) => ({
      ...current,
      sale_price: current.sale_price || String(selectedProduct.selling_price),
    }));
  }, [selectedProduct]);

  useEffect(() => {
    const normalized = scanCode.trim().toLowerCase();
    if (!normalized) {
      return;
    }

    const matched = products.find((product) => {
      return (
        product.sku.toLowerCase() === normalized ||
        resolveProductBarcode(product).toLowerCase() === normalized
      );
    });

    if (!matched) {
      return;
    }

    setForm((current) => ({
      ...current,
      product_id: matched.id,
      sale_price: current.sale_price || String(matched.selling_price),
    }));
  }, [products, scanCode]);

  const liveProfit = selectedProduct
    ? (Number(form.sale_price || 0) - Number(selectedProduct.cost_price)) * Number(form.quantity || 0)
    : 0;

  const summary = sales.reduce(
    (totals, sale) => {
      totals.quantity += Number(sale.quantity);
      totals.revenue += Number(sale.sale_price) * Number(sale.quantity);
      totals.profit += Number(sale.total_profit);
      return totals;
    },
    { profit: 0, quantity: 0, revenue: 0 },
  );

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError("");

    if (!selectedProduct) {
      setFormError("Choose a product before recording a sale.");
      return;
    }
    if (Number(form.quantity) <= 0) {
      setFormError("Quantity must be at least 1.");
      return;
    }
    if (Number(form.quantity) > selectedProduct.stock) {
      setFormError(`Only ${selectedProduct.stock} units are available in stock.`);
      return;
    }
    if (Number(form.sale_price) <= 0) {
      setFormError("Sale price must be greater than zero.");
      return;
    }

    try {
      await recordSale({
        product_id: selectedProduct.id,
        quantity: Number(form.quantity),
        sale_price: Number(form.sale_price),
      });
      showToast("Sale recorded. Stock updated.", "success");
      setForm({ product_id: "", quantity: 1, sale_price: "" });
      setProductQuery("");
      setScanCode("");
      startTransition(() => {
        refreshProducts();
        refresh(filters);
      });
    } catch (error) {
      setFormError(error.message || "Unable to record sale.");
      showToast(error.message || "Unable to record sale.", "error");
    }
  };

  const handleExport = () => {
    const filename = `trackit-sales-${getTodayDate()}.csv`;
    downloadCsv(filename, buildSalesExportRows(sales, productsById));
    showToast("Sales CSV exported.", "success");
  };

  return (
    <div className="space-y-6">
      <section className="panel-card rounded-[28px] p-6">
        <div className="mb-6">
          <h2 className="font-display text-2xl font-bold text-text">Record New Sale</h2>
          <p className="mt-2 text-base text-muted">
            Pick a product, scan or enter a barcode, review profit, and save the transaction.
          </p>
        </div>
        <form className="space-y-5" onSubmit={handleSubmit}>
          <AlertBanner
            message="Barcode/QR support is enabled in demo mode. Paste or type a saved product code to auto-select an item."
            tone="info"
          />
          <div className="grid gap-5 lg:grid-cols-[1fr_1fr_0.9fr]">
            <Input
              label="Search Products"
              onChange={(event) => setProductQuery(event.target.value)}
              placeholder="Search by name or SKU"
              value={productQuery}
            />
            <Input
              label="Scan / Enter Barcode"
              onChange={(event) => setScanCode(event.target.value)}
              placeholder="TRKAPPTS001 or scanner input"
              value={scanCode}
            />
            <Select
              label="Product"
              onChange={(event) => {
                const product = products.find((item) => item.id === event.target.value);
                setForm({
                  product_id: event.target.value,
                  quantity: 1,
                  sale_price: product ? String(product.selling_price) : "",
                });
              }}
              value={form.product_id}
            >
              <option value="">Select a product</option>
              {filteredProducts.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name} ({product.stock} in stock)
                </option>
              ))}
            </Select>
          </div>
          <div className="grid gap-5 lg:grid-cols-[1fr_1fr_0.9fr]">
            <Input
              label="Quantity"
              max={selectedProduct?.stock ?? 0}
              min="1"
              onChange={(event) => setForm((current) => ({ ...current, quantity: event.target.value }))}
              type="number"
              value={form.quantity}
            />
            <Input
              label="Sale Price"
              min="1"
              onChange={(event) => setForm((current) => ({ ...current, sale_price: event.target.value }))}
              type="number"
              value={form.sale_price}
            />
            <div className="rounded-2xl border border-primary/15 bg-primary-light/60 px-5 py-4 text-sm text-primary lg:self-end">
              Profit: <span className="font-semibold">{formatCurrency(liveProfit)}</span>
            </div>
          </div>
          {selectedProduct?.stock < 5 ? (
            <AlertBanner
              message={`Only ${selectedProduct.stock} left in stock for ${selectedProduct.name}.`}
              tone="warning"
            />
          ) : null}
          {selectedProduct ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <BarcodePreview value={resolveProductBarcode(selectedProduct)} />
              <QrPreview value={resolveProductBarcode(selectedProduct)} />
            </div>
          ) : null}
          {formError ? <p className="text-sm font-medium text-danger">{formError}</p> : null}
          <Button
            disabled={!selectedProduct || Number(form.quantity) <= 0 || Number(form.sale_price) <= 0}
            type="submit"
          >
            Record Sale
          </Button>
        </form>
      </section>

      <section className="panel-card rounded-[28px] p-6">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold text-text">Sales History</h2>
            <p className="mt-2 text-base text-muted">Review transactions, apply date filters, and export CSV.</p>
          </div>
          <div className="grid gap-3 md:grid-cols-4">
            <Input
              label="From"
              onChange={(event) => setFilters((current) => ({ ...current, startDate: event.target.value }))}
              type="date"
              value={filters.startDate}
            />
            <Input
              label="To"
              onChange={(event) => setFilters((current) => ({ ...current, endDate: event.target.value }))}
              type="date"
              value={filters.endDate}
            />
            <Select
              label="Product"
              onChange={(event) => setFilters((current) => ({ ...current, productId: event.target.value }))}
              value={filters.productId}
            >
              <option value="">All products</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </Select>
            <div className="flex items-end">
              <Button className="w-full" onClick={handleExport} variant="outline">
                <Download className="h-4 w-4" />
                Export CSV
              </Button>
            </div>
          </div>
        </div>

        {loading ? (
          <TableSkeleton columns={6} rows={6} />
        ) : (
          <Table>
            <TableHead columns={["#", "Product", "Qty", "Sale Price", "Profit", "Date & Time"]} />
            {sales.length ? (
              <tbody className="divide-y divide-border">
                {sales.map((sale, index) => (
                  <tr key={sale.id} className="interactive-row">
                    <td className="px-4 py-4 text-sm text-muted">{index + 1}</td>
                    <td className="px-4 py-4">
                      <p className="font-semibold text-text">
                        {productsById.get(sale.product_id)?.name ?? "Unknown product"}
                      </p>
                    </td>
                    <td className="px-4 py-4 text-sm text-muted">{sale.quantity}</td>
                    <td className="px-4 py-4 text-sm text-muted">{formatCurrency(sale.sale_price)}</td>
                    <td className="px-4 py-4 text-sm font-semibold text-primary">
                      {formatCurrency(sale.total_profit)}
                    </td>
                    <td className="px-4 py-4 text-sm text-muted">{formatDateTime(sale.timestamp)}</td>
                  </tr>
                ))}
              </tbody>
            ) : (
              <TableEmpty message="No sales in this period." />
            )}
            {sales.length ? (
              <tfoot className="bg-slate-50">
                <tr>
                  <td className="px-4 py-4 text-sm font-semibold text-text" colSpan={2}>
                    Totals
                  </td>
                  <td className="px-4 py-4 text-sm font-semibold text-text">{summary.quantity}</td>
                  <td className="px-4 py-4 text-sm font-semibold text-text">{formatCurrency(summary.revenue)}</td>
                  <td className="px-4 py-4 text-sm font-semibold text-primary">{formatCurrency(summary.profit)}</td>
                  <td className="px-4 py-4 text-sm text-muted">Filtered view</td>
                </tr>
              </tfoot>
            ) : null}
          </Table>
        )}
      </section>
    </div>
  );
}

export default function Sales() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = salesTabs.some((tab) => tab.id === searchParams.get("view"))
    ? searchParams.get("view")
    : "log";

  const handleTabChange = (tabId) => {
    const nextParams = new URLSearchParams(searchParams);
    if (tabId === "log") {
      nextParams.delete("view");
    } else {
      nextParams.set("view", tabId);
    }
    setSearchParams(nextParams, { replace: true });
  };

  return (
    <div className="space-y-6">
      <section className="panel-card rounded-[28px] p-4 sm:p-5">
        <div className="flex flex-wrap gap-3">
          {salesTabs.map((tab) => (
            <Button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              variant={activeTab === tab.id ? "primary" : "subtle"}
            >
              {tab.label}
            </Button>
          ))}
        </div>
      </section>

      {activeTab === "log" ? <SalesLogView /> : null}
      {activeTab === "invoices" ? <InvoicesView /> : null}
      {activeTab === "returns" ? <ReturnsView /> : null}
    </div>
  );
}
