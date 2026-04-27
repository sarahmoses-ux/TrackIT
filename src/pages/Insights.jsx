import {
  AlertTriangle,
  CheckCircle,
  Lightbulb,
  Minus,
  Package,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { useMemo, useState } from "react";
import ProfitForecastChart from "../components/charts/ProfitForecastChart";
import WeeklyBarChart from "../components/charts/WeeklyBarChart";
import AlertBanner from "../components/ui/AlertBanner";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import Skeleton, { TableSkeleton } from "../components/ui/Skeleton";
import Table, { TableHead } from "../components/ui/Table";
import useInsights from "../hooks/useInsights";
import useProducts from "../hooks/useProducts";
import useSales from "../hooks/useSales";
import { getMonthlyRevenue, getTopMarginProducts, getWeeklyRevenue } from "../utils/analytics";
import { formatDate } from "../utils/dateHelpers";
import { formatCurrency } from "../utils/formatCurrency";

function createForecastData(insights) {
  const totalForecast = insights.reduce((sum, insight) => sum + Number(insight.forecast_profit), 0);
  const baseDaily = totalForecast / 30;
  return Array.from({ length: 30 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() + index + 1);
    const wave = Math.sin(index / 3.4) * 0.11;
    const drift = (index % 5) * 0.014;
    return {
      label: date.toLocaleDateString("en-NG", { day: "numeric", month: "short" }),
      profit: Math.round(baseDaily * (1 + wave + drift)),
    };
  });
}

function TrendIcon({ direction }) {
  if (direction === "increasing") return <TrendingUp className="h-5 w-5 text-primary" />;
  if (direction === "decreasing") return <TrendingDown className="h-5 w-5 text-danger" />;
  return <Minus className="h-5 w-5 text-muted" />;
}

export default function Insights() {
  const { insights, aiInsights, loading: insightsLoading } = useInsights();
  const { loading: productsLoading, products } = useProducts();
  const { loading: salesLoading, sales } = useSales();
  const [mode, setMode] = useState("weekly");

  const loading = insightsLoading || productsLoading || salesLoading;

  const productsById = useMemo(
    () => new Map(products.map((product) => [product.id, product])),
    [products],
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-14 w-full rounded-2xl" />
        <Skeleton className="h-[360px] w-full rounded-[28px]" />
        <div className="grid gap-4 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-44 w-full rounded-[28px]" />
          ))}
        </div>
        <Skeleton className="h-[360px] w-full rounded-[28px]" />
        <TableSkeleton columns={6} rows={5} />
      </div>
    );
  }

  const forecastData = aiInsights?.forecast || createForecastData(insights);
  const now = new Date();
  const lowStockPredictions = insights.filter((insight) => {
    const target = new Date(insight.predicted_low_stock_date);
    const diffDays = (target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return diffDays >= 0 && diffDays <= 14;
  });
  const topPerformers = getTopMarginProducts(products, sales, 5);
  const trendData = mode === "weekly" ? getWeeklyRevenue(sales, 8) : getMonthlyRevenue(sales, 6);

  return (
    <div className="space-y-6">
      <AlertBanner
        message="AI-powered insights are generated from your real-time sales and inventory data. Predictions are based on historical patterns and current trends."
        tone="info"
      />

      {aiInsights?.summary && (
        <section className="panel-card rounded-[28px] p-6 space-y-4">
          <div>
            <h2 className="font-display text-xl font-bold text-text">AI Insights Summary</h2>
            <p className="mt-1 text-base text-muted">Powered by analysis of your sales and product data.</p>
          </div>

          <div className="rounded-2xl bg-primary-light/60 p-4">
            <p className="text-sm font-semibold text-primary mb-1">Business Overview</p>
            <p className="text-sm text-text">{aiInsights.summary.business_overview}</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="mb-2 flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-primary" />
                <p className="text-sm font-semibold text-text">Key Strengths</p>
              </div>
              <ul className="space-y-1">
                {aiInsights.summary.key_strengths.map((strength, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm text-muted">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    {strength}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="mb-2 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-warning" />
                <p className="text-sm font-semibold text-text">Areas for Improvement</p>
              </div>
              <ul className="space-y-1">
                {aiInsights.summary.areas_for_improvement.map((area, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm text-muted">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-warning" />
                    {area}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="rounded-2xl bg-slate-50 p-4">
            <div className="mb-2 flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-primary" />
              <p className="text-sm font-semibold text-text">Actionable Recommendations</p>
            </div>
            <ul className="space-y-1">
              {aiInsights.summary.actionable_recommendations.map((rec, index) => (
                <li key={index} className="flex items-center gap-2 text-sm text-muted">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  {rec}
                </li>
              ))}
            </ul>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl bg-primary-light/60 p-4">
              <p className="text-sm font-semibold text-primary mb-1">Profit Forecast</p>
              <p className="text-sm text-text">{aiInsights.summary.profit_forecast_summary}</p>
            </div>
            <div className="rounded-2xl border border-danger/20 bg-red-50 p-4">
              <p className="mb-1 text-sm font-semibold text-danger">Risk Assessment</p>
              <p className="text-sm text-text">{aiInsights.summary.risk_assessment}</p>
            </div>
          </div>
        </section>
      )}

      <ProfitForecastChart data={forecastData} />

      <section className="space-y-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-text">Low Stock Predictions</h2>
          <p className="mt-2 text-base text-muted">Products likely to run out within the next 14 days.</p>
        </div>
        {lowStockPredictions.length ? (
          <div className="grid gap-4 lg:grid-cols-3">
            {lowStockPredictions.map((insight) => {
              const product = productsById.get(insight.product_id);
              if (!product) return null;
              return (
                <div key={insight.product_id} className="panel-card rounded-[28px] p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-warning/10">
                        <Package className="h-5 w-5 text-warning" />
                      </div>
                      <div>
                        <p className="font-semibold text-text">{product.name}</p>
                        <p className="text-sm text-muted">{product.category}</p>
                      </div>
                    </div>
                    <Badge tone="danger">{product.stock} left</Badge>
                  </div>
                  <div className="mt-4 space-y-2 border-t border-border pt-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted">Stock-out by</span>
                      <span className="font-semibold text-danger">{formatDate(insight.predicted_low_stock_date)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted">Reorder qty</span>
                      <span className="font-semibold text-primary">{insight.recommended_reorder_qty} units</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="panel-card rounded-[28px] p-8 text-center">
            <Package className="mx-auto mb-3 h-10 w-10 text-muted/40" />
            <p className="text-sm text-muted">All stock levels look healthy for the next 14 days.</p>
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold text-text">Sales Trend Analysis</h2>
            <p className="mt-2 text-base text-muted">Switch between weekly and monthly revenue views.</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setMode("weekly")} variant={mode === "weekly" ? "primary" : "subtle"}>
              Weekly
            </Button>
            <Button onClick={() => setMode("monthly")} variant={mode === "monthly" ? "primary" : "subtle"}>
              Monthly
            </Button>
          </div>
        </div>
        <WeeklyBarChart data={trendData} />
      </section>

      {aiInsights?.trends && (
        <section className="panel-card rounded-[28px] p-6 space-y-4">
          <div>
            <h2 className="font-display text-xl font-bold text-text">AI Sales Analysis</h2>
            <p className="mt-1 text-base text-muted">AI-generated patterns and recommendations from your sales history.</p>
          </div>

          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="mb-1 text-sm font-semibold text-text">Weekly Performance Summary</p>
            <p className="text-sm text-muted">{aiInsights.trends.weekly_summary}</p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="mb-2 text-sm font-semibold text-text">Trend Direction</p>
              <div className="flex items-center gap-2">
                <TrendIcon direction={aiInsights.trends.trend_direction} />
                <span
                  className={`text-sm font-semibold capitalize ${
                    aiInsights.trends.trend_direction === "increasing"
                      ? "text-primary"
                      : aiInsights.trends.trend_direction === "decreasing"
                        ? "text-danger"
                        : "text-muted"
                  }`}
                >
                  {aiInsights.trends.trend_direction}
                </span>
              </div>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="mb-2 text-sm font-semibold text-text">Growth Rate</p>
              <p
                className={`text-2xl font-bold ${
                  aiInsights.trends.growth_rate >= 0 ? "text-primary" : "text-danger"
                }`}
              >
                {aiInsights.trends.growth_rate > 0 ? "+" : ""}
                {aiInsights.trends.growth_rate.toFixed(1)}%
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="mb-2 text-sm font-semibold text-text">Top Products</p>
              <div className="space-y-1">
                {aiInsights.trends.top_performing_products.slice(0, 3).map((product, index) => (
                  <p key={index} className="text-sm text-muted">
                    <span className="font-semibold text-text">#{index + 1}</span> {product}
                  </p>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-primary-light/60 p-4">
            <div className="mb-2 flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-primary" />
              <p className="text-sm font-semibold text-primary">AI Recommendations</p>
            </div>
            <ul className="space-y-1">
              {aiInsights.trends.recommendations.map((rec, index) => (
                <li key={index} className="flex items-center gap-2 text-sm text-text">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  {rec}
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <section className="panel-card rounded-[28px] p-6">
        <div className="mb-5">
          <h2 className="font-display text-2xl font-bold text-text">Top Performers</h2>
          <p className="mt-2 text-base text-muted">Highest profit margin products in your current sales history.</p>
        </div>
        <Table>
          <TableHead columns={["Rank", "Product", "Revenue", "Cost", "Profit", "Margin %"]} />
          <tbody className="divide-y divide-border">
            {topPerformers.map((product, index) => (
              <tr key={product.product} className={index === 0 ? "bg-primary-light/70" : "interactive-row"}>
                <td className="px-4 py-4 text-sm font-semibold text-text">#{index + 1}</td>
                <td className="px-4 py-4 font-semibold text-text">{product.product}</td>
                <td className="px-4 py-4 text-sm text-muted">{formatCurrency(product.revenue)}</td>
                <td className="px-4 py-4 text-sm text-muted">{formatCurrency(product.cost)}</td>
                <td className="px-4 py-4 text-sm font-semibold text-primary">{formatCurrency(product.profit)}</td>
                <td className="px-4 py-4 text-sm font-semibold text-text">{product.margin.toFixed(1)}%</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </section>
    </div>
  );
}
