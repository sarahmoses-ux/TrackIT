import {
  Boxes,
  ChartSpline,
  Coins,
  PackageSearch,
} from "lucide-react";
import { Link } from "react-router-dom";
import SalesTrendChart from "../components/charts/SalesTrendChart";
import TopProductsChart from "../components/charts/TopProductsChart";
import AlertBanner from "../components/ui/AlertBanner";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import KPICard from "../components/ui/KPICard";
import Skeleton, { TableSkeleton } from "../components/ui/Skeleton";
import Table, { TableHead } from "../components/ui/Table";
import useInsights from "../hooks/useInsights";
import useProducts from "../hooks/useProducts";
import useSales from "../hooks/useSales";
import { buildSalesTrendData, getMonthSummary, getPreviousMonth, getTopProductsByUnits, getTrendPercentage, getSaleRevenue } from "../utils/analytics";
import { formatRelativeTime, getTodayDate } from "../utils/dateHelpers";
import { formatCurrency } from "../utils/formatCurrency";

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-20 w-full rounded-3xl" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-40 w-full rounded-3xl" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Skeleton className="h-80 w-full rounded-3xl" />
        <Skeleton className="h-96 w-full rounded-3xl" />
      </div>
      <TableSkeleton columns={5} rows={5} />
    </div>
  );
}

export default function Dashboard() {
  const { insights, loading: insightsLoading } = useInsights();
  const { loading: productsLoading, products } = useProducts();
  const { loading: salesLoading, sales } = useSales();

  const loading = insightsLoading || productsLoading || salesLoading;

  if (loading) {
    return <DashboardSkeleton />;
  }

  const today = getTodayDate();
  const currentMonth = getMonthSummary(sales);
  const previousMonth = getMonthSummary(sales, getPreviousMonth());
  const salesToday = sales.filter((sale) => sale.timestamp.slice(0, 10) === today).length;
  const lowStock = products.filter((product) => product.stock < 10);
  const topProducts = getTopProductsByUnits(products, sales, 5);
  const chartData = buildSalesTrendData(sales, 7);
  const recentSales = [...sales]
    .sort((left, right) => new Date(right.timestamp) - new Date(left.timestamp))
    .slice(0, 5);
  const productsById = new Map(products.map((product) => [product.id, product]));
  const insightsById = new Map(insights.map((insight) => [insight.product_id, insight]));

  return (
    <div className="space-y-6">
      {lowStock.length ? (
        <AlertBanner
          action={
            <Link to="/inventory">
              <Button size="sm" variant="outline">
                View inventory
              </Button>
            </Link>
          }
          message={`${lowStock.length} products are running low on stock. View inventory to restock before demand spikes.`}
          tone="warning"
        />
      ) : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KPICard
          icon={Boxes}
          label="Total Products"
          trend={getTrendPercentage(products.length, Math.max(products.length - 2, 1))}
          value={products.length}
        />
        <KPICard
          icon={PackageSearch}
          label="Sales Today"
          trend={getTrendPercentage(salesToday, Math.max(salesToday - 1, 1))}
          value={salesToday}
        />
        <KPICard
          icon={ChartSpline}
          label="Revenue This Month"
          trend={getTrendPercentage(currentMonth.revenue, previousMonth.revenue)}
          value={formatCurrency(currentMonth.revenue)}
        />
        <KPICard
          icon={Coins}
          label="Total Profit This Month"
          trend={getTrendPercentage(currentMonth.profit, previousMonth.profit)}
          value={formatCurrency(currentMonth.profit)}
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <SalesTrendChart data={chartData} />
        <TopProductsChart data={topProducts} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <div className="panel-card rounded-3xl p-5">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-xl font-semibold text-text">Recent Sales</h2>
              <p className="text-base text-muted">Your latest five transactions.</p>
            </div>
            <Link className="text-sm font-semibold text-primary" to="/sales">
              View all sales →
            </Link>
          </div>
          <Table>
            <TableHead columns={["Product", "Qty", "Sale Price", "Profit", "Time"]} />
            <tbody className="divide-y divide-border">
              {recentSales.map((sale) => (
                <tr key={sale.id} className="interactive-row">
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
                  <td className="px-4 py-4 text-sm text-muted">{formatRelativeTime(sale.timestamp)}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>

        <div className="space-y-4">
          <div className="panel-card rounded-3xl p-5">
            <h2 className="font-display text-xl font-semibold text-text">Low Stock Cards</h2>
            <p className="mt-1 text-base text-muted">Reorder suggestions based on current stock levels.</p>
          </div>
          {lowStock.map((product) => {
            const insight = insightsById.get(product.id);
            return (
              <div key={product.id} className="rounded-3xl border border-amber-200 bg-amber-50 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-display text-lg font-semibold text-amber-950">{product.name}</h3>
                    <p className="mt-1 text-sm text-amber-800">{product.category}</p>
                  </div>
                  <Badge tone="danger">{product.stock} left</Badge>
                </div>
                <p className="mt-4 text-sm text-amber-900">
                  Recommended reorder qty:{" "}
                  <span className="font-semibold text-primary">
                    {insight?.recommended_reorder_qty ?? Math.max(12, 20 - product.stock)} units
                  </span>
                </p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
