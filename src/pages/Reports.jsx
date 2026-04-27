import { Printer, X } from "lucide-react";
import { useMemo, useState } from "react";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";
import { TableSkeleton } from "../components/ui/Skeleton";
import Table, { TableEmpty, TableHead } from "../components/ui/Table";
import { useToast } from "../context/ToastContext";
import useProducts from "../hooks/useProducts";
import useSales from "../hooks/useSales";
import { getSaleRevenue } from "../utils/analytics";
import { toInputDate } from "../utils/dateHelpers";
import { downloadCsv } from "../utils/exportCsv";
import { formatCurrency } from "../utils/formatCurrency";

const reportTabs = ["Inventory Report", "Sales Report"];

function SummaryCard({ label, value }) {
  return (
    <div className="rounded-3xl border border-border bg-white p-5 shadow-card">
      <p className="text-base text-muted">{label}</p>
      <p className="mt-3 font-display text-2xl font-bold text-text">{value}</p>
    </div>
  );
}

export default function Reports() {
  const { loading: productsLoading, products } = useProducts();
  const { loading: salesLoading, sales } = useSales();
  const { showToast } = useToast();
  const [tab, setTab] = useState("Inventory Report");
  const [inventoryCategory, setInventoryCategory] = useState("All");
  const [stockStatus, setStockStatus] = useState("All");
  const [salesProductId, setSalesProductId] = useState("");
  const [salesStartDate, setSalesStartDate] = useState("");
  const [salesEndDate, setSalesEndDate] = useState("");

  const filteredInventory = useMemo(() => {
    return products.filter((product) => {
      const matchesCategory = inventoryCategory === "All" || product.category === inventoryCategory;
      const matchesStatus =
        stockStatus === "All" ||
        (stockStatus === "In Stock" && product.stock > 10) ||
        (stockStatus === "Low Stock" && product.stock > 0 && product.stock <= 10) ||
        (stockStatus === "Out of Stock" && product.stock === 0);
      return matchesCategory && matchesStatus;
    });
  }, [inventoryCategory, products, stockStatus]);

  const filteredSales = useMemo(() => {
    return sales.filter((sale) => {
      const saleDate = sale.timestamp.slice(0, 10);
      if (salesProductId && sale.product_id !== salesProductId) return false;
      if (salesStartDate && saleDate < salesStartDate) return false;
      if (salesEndDate && saleDate > salesEndDate) return false;
      return true;
    });
  }, [sales, salesEndDate, salesProductId, salesStartDate]);

  const productsById = useMemo(
    () => new Map(products.map((product) => [product.id, product])),
    [products],
  );

  const inventorySummary = filteredInventory.reduce(
    (totals, product) => {
      totals.products += 1;
      totals.stockValue += product.cost_price * product.stock;
      return totals;
    },
    { products: 0, stockValue: 0 },
  );

  const salesSummary = filteredSales.reduce(
    (totals, sale) => {
      totals.sales += 1;
      totals.revenue += getSaleRevenue(sale);
      totals.profit += Number(sale.total_profit);
      return totals;
    },
    { profit: 0, revenue: 0, sales: 0 },
  );

  const handleInventoryExport = () => {
    downloadCsv(
      `trackit-inventory-${toInputDate(new Date())}.csv`,
      filteredInventory.map((product) => ({
        Category: product.category,
        CostPrice: product.cost_price,
        MarginPercent: (((product.selling_price - product.cost_price) / product.selling_price) * 100).toFixed(1),
        Name: product.name,
        Price: product.selling_price,
        SKU: product.sku,
        Stock: product.stock,
      })),
    );
    showToast("Inventory CSV exported.", "success");
  };

  const handleSalesExport = () => {
    downloadCsv(
      `trackit-sales-${toInputDate(new Date())}.csv`,
      filteredSales.map((sale) => ({
        Date: sale.timestamp,
        Product: productsById.get(sale.product_id)?.name ?? "Unknown product",
        Profit: sale.total_profit,
        Quantity: sale.quantity,
        Revenue: getSaleRevenue(sale),
        SalePrice: sale.sale_price,
      })),
    );
    showToast("Sales CSV exported.", "success");
  };

  const clearInventoryFilters = () => {
    setInventoryCategory("All");
    setStockStatus("All");
  };

  const clearSalesFilters = () => {
    setSalesProductId("");
    setSalesStartDate("");
    setSalesEndDate("");
  };

  const loading = productsLoading || salesLoading;

  return (
    <div className="space-y-6 print-full">
      <section className="flex flex-wrap items-center gap-3">
        {reportTabs.map((item) => (
          <Button
            key={item}
            onClick={() => setTab(item)}
            variant={tab === item ? "primary" : "subtle"}
          >
            {item}
          </Button>
        ))}
      </section>

      {tab === "Inventory Report" ? (
        <section className="space-y-6">
          <div className="panel-card rounded-[28px] p-6">
            <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h2 className="font-display text-2xl font-bold text-text">Inventory Report</h2>
                <p className="mt-2 text-base text-muted">Filter stock and export a clean inventory snapshot.</p>
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                <Select onChange={(event) => setInventoryCategory(event.target.value)} value={inventoryCategory}>
                  <option value="All">All categories</option>
                  {[...new Set(products.map((product) => product.category))].map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </Select>
                <Select onChange={(event) => setStockStatus(event.target.value)} value={stockStatus}>
                  <option value="All">All statuses</option>
                  <option value="In Stock">In Stock</option>
                  <option value="Low Stock">Low Stock</option>
                  <option value="Out of Stock">Out of Stock</option>
                </Select>
                <div className="flex gap-3">
                  <Button className="flex-1" onClick={handleInventoryExport} variant="outline">
                    Export CSV
                  </Button>
                  <Button className="print-hidden" onClick={() => window.print()} variant="subtle">
                    <Printer className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="mb-6 grid gap-4 md:grid-cols-2">
              <SummaryCard label="Total products" value={inventorySummary.products} />
              <SummaryCard label="Total stock value" value={formatCurrency(inventorySummary.stockValue)} />
            </div>

            {loading ? (
              <TableSkeleton columns={7} rows={6} />
            ) : filteredInventory.length ? (
              <Table>
                <TableHead columns={["Name", "SKU", "Category", "Stock", "Cost", "Price", "Margin"]} />
                <tbody className="divide-y divide-border">
                  {filteredInventory.map((product) => (
                    <tr key={product.id} className="interactive-row">
                      <td className="px-4 py-4 font-semibold text-text">{product.name}</td>
                      <td className="px-4 py-4 font-mono text-xs text-muted">{product.sku}</td>
                      <td className="px-4 py-4 text-sm text-muted">{product.category}</td>
                      <td className="px-4 py-4">
                        <Badge tone={product.stock <= 10 ? "warning" : "success"}>{product.stock} units</Badge>
                      </td>
                      <td className="px-4 py-4 text-sm text-muted">{formatCurrency(product.cost_price)}</td>
                      <td className="px-4 py-4 text-sm text-muted">{formatCurrency(product.selling_price)}</td>
                      <td className="px-4 py-4 text-sm font-semibold text-primary">
                        {(((product.selling_price - product.cost_price) / product.selling_price) * 100).toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            ) : (
              <div className="rounded-3xl border border-dashed border-border bg-slate-50 px-6 py-14 text-center">
                <p className="text-lg font-semibold text-text">No data matches your filters</p>
                <button className="mt-3 text-sm font-semibold text-primary" onClick={clearInventoryFilters} type="button">
                  Clear filters
                </button>
              </div>
            )}
          </div>
        </section>
      ) : (
        <section className="space-y-6">
          <div className="panel-card rounded-[28px] p-6">
            <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h2 className="font-display text-2xl font-bold text-text">Sales Report</h2>
                <p className="mt-2 text-base text-muted">Filter transactions, review totals, then export or print.</p>
              </div>
              <div className="grid gap-3 md:grid-cols-5">
                <Input onChange={(event) => setSalesStartDate(event.target.value)} type="date" value={salesStartDate} />
                <Input onChange={(event) => setSalesEndDate(event.target.value)} type="date" value={salesEndDate} />
                <Select onChange={(event) => setSalesProductId(event.target.value)} value={salesProductId}>
                  <option value="">All products</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name}
                    </option>
                  ))}
                </Select>
                <Button onClick={handleSalesExport} variant="outline">
                  Export CSV
                </Button>
                <Button className="print-hidden" onClick={() => window.print()} variant="subtle">
                  <Printer className="h-4 w-4" />
                  Print / Save PDF
                </Button>
              </div>
            </div>

            <div className="mb-6 grid gap-4 md:grid-cols-3">
              <SummaryCard label="Total Sales" value={salesSummary.sales} />
              <SummaryCard label="Total Revenue" value={formatCurrency(salesSummary.revenue)} />
              <SummaryCard label="Total Profit" value={formatCurrency(salesSummary.profit)} />
            </div>

            {loading ? (
              <TableSkeleton columns={6} rows={6} />
            ) : filteredSales.length ? (
              <Table>
                <TableHead columns={["Product", "Qty", "Sale Price", "Revenue", "Profit", "Date"]} />
                <tbody className="divide-y divide-border">
                  {filteredSales.map((sale) => (
                    <tr key={sale.id} className="interactive-row">
                      <td className="px-4 py-4 font-semibold text-text">
                        {productsById.get(sale.product_id)?.name ?? "Unknown product"}
                      </td>
                      <td className="px-4 py-4 text-sm text-muted">{sale.quantity}</td>
                      <td className="px-4 py-4 text-sm text-muted">{formatCurrency(sale.sale_price)}</td>
                      <td className="px-4 py-4 text-sm text-muted">{formatCurrency(getSaleRevenue(sale))}</td>
                      <td className="px-4 py-4 text-sm font-semibold text-primary">
                        {formatCurrency(sale.total_profit)}
                      </td>
                      <td className="px-4 py-4 text-sm text-muted">{new Date(sale.timestamp).toLocaleString("en-NG")}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-50">
                  <tr>
                    <td className="px-4 py-4 text-sm font-semibold text-text">Totals</td>
                    <td className="px-4 py-4 text-sm font-semibold text-text">
                      {filteredSales.reduce((sum, sale) => sum + Number(sale.quantity), 0)}
                    </td>
                    <td className="px-4 py-4 text-sm text-muted">-</td>
                    <td className="px-4 py-4 text-sm font-semibold text-text">{formatCurrency(salesSummary.revenue)}</td>
                    <td className="px-4 py-4 text-sm font-semibold text-primary">{formatCurrency(salesSummary.profit)}</td>
                    <td className="px-4 py-4 text-sm text-muted">Filtered</td>
                  </tr>
                </tfoot>
              </Table>
            ) : (
              <div className="rounded-3xl border border-dashed border-border bg-slate-50 px-6 py-14 text-center">
                <p className="text-lg font-semibold text-text">No data matches your filters</p>
                <button className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-primary" onClick={clearSalesFilters} type="button">
                  <X className="h-4 w-4" />
                  Clear filters
                </button>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
