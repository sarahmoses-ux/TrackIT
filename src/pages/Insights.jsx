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
        <Skeleton className="h-20 w-full rounded-3xl" />
        <Skeleton className="h-[420px] w-full rounded-3xl" />
        <div className="grid gap-4 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-44 w-full rounded-3xl" />
          ))}
        </div>
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
        message={aiInsights ? "AI-powered insights are generated in real-time using advanced analytics on your sales and inventory data. Predictions are based on historical patterns and current trends." : "Generating AI insights... This may take a few moments."}
        tone={aiInsights ? "success" : "info"}
      />

      <div className="panel-card rounded-[28px] p-6">
        <h2 className="font-display text-2xl font-bold text-text mb-4">AI Insights Summary</h2>
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-20 w-full rounded-lg" />
            <div className="grid gap-4 md:grid-cols-2">
              <Skeleton className="h-24 w-full rounded-lg" />
              <Skeleton className="h-24 w-full rounded-lg" />
            </div>
            <Skeleton className="h-16 w-full rounded-lg" />
            <div className="grid gap-4 md:grid-cols-2">
              <Skeleton className="h-20 w-full rounded-lg" />
              <Skeleton className="h-20 w-full rounded-lg" />
            </div>
          </div>
        ) : aiInsights?.summary ? (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">Business Overview</h3>
              <p className="text-blue-800">{aiInsights.summary.business_overview}</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-green-900 mb-2">Key Strengths</h3>
                <ul className="text-green-800 space-y-1">
                  {aiInsights.summary.key_strengths.map((strength, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                      {strength}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <h3 className="font-semibold text-amber-900 mb-2">Areas for Improvement</h3>
                <ul className="text-amber-800 space-y-1">
                  {aiInsights.summary.areas_for_improvement.map((area, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
                      {area}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h3 className="font-semibold text-purple-900 mb-2">Actionable Recommendations</h3>
              <ul className="text-purple-800 space-y-1">
                {aiInsights.summary.actionable_recommendations.map((rec, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                    {rec}
                  </li>
                ))}
              </ul>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                <h3 className="font-semibold text-indigo-900 mb-2">Profit Forecast</h3>
                <p className="text-indigo-800">{aiInsights.summary.profit_forecast_summary}</p>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="font-semibold text-red-900 mb-2">Risk Assessment</h3>
                <p className="text-red-800">{aiInsights.summary.risk_assessment}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3 text-sm text-muted">
            <p>
              Based on your sales data, your business is showing strong growth in the {insights.length > 0 ? insights[0].category : 'electronics'} category with an average profit margin of {insights.length > 0 ? (insights.reduce((sum, i) => sum + i.profit_margin, 0) / insights.length).toFixed(1) : '15.5'}%.
            </p>
            <p>
              Key recommendation: Focus on restocking {lowStockPredictions.length > 0 ? productsById.get(lowStockPredictions[0].product_id)?.name : 'high-demand products'} as they are predicted to sell out soon.
            </p>
            <p>
              Trend analysis indicates {trendData.length > 1 && trendData[trendData.length - 1].amount > trendData[trendData.length - 2].amount ? 'increasing' : 'stable'} revenue over the {mode} period.
            </p>
          </div>
        )}
      </div>

      <ProfitForecastChart data={forecastData} />

      <section className="space-y-4">
        <div>
          <h2 className="font-display text-3xl font-bold text-text">Low Stock Predictions</h2>
          <p className="mt-2 text-base text-muted">Products likely to run out within the next 14 days.</p>
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          {lowStockPredictions.map((insight) => {
            const product = productsById.get(insight.product_id);
            if (!product) {
              return null;
            }
            return (
              <div key={insight.product_id} className="rounded-[28px] border border-amber-200 bg-amber-50 p-5">
                <div className="rounded-2xl bg-[#FEF3C7] px-4 py-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-display text-xl font-semibold text-amber-950">{product.name}</p>
                      <p className="mt-1 text-sm text-amber-900">{product.category}</p>
                    </div>
                    <Badge tone="danger">{product.stock} left</Badge>
                  </div>
                </div>
                <p className="mt-4 text-sm text-red-700">
                  Predicted stock-out:{" "}
                  <span className="font-semibold">{formatDate(insight.predicted_low_stock_date)}</span>
                </p>
                <p className="mt-2 text-sm text-primary">
                  Reorder qty: <span className="font-semibold">{insight.recommended_reorder_qty} units</span>
                </p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="font-display text-3xl font-bold text-text">Sales Trend Analysis</h2>
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

      {loading ? (
        <section className="panel-card rounded-[28px] p-6">
          <h2 className="font-display text-3xl font-bold text-text mb-4">AI Sales Analysis</h2>
          <div className="space-y-4">
            <Skeleton className="h-16 w-full rounded-lg" />
            <div className="grid gap-4 md:grid-cols-3">
              <Skeleton className="h-20 w-full rounded-lg" />
              <Skeleton className="h-20 w-full rounded-lg" />
              <Skeleton className="h-20 w-full rounded-lg" />
            </div>
            <Skeleton className="h-24 w-full rounded-lg" />
          </div>
        </section>
      ) : aiInsights?.trends && (
        <section className="panel-card rounded-[28px] p-6">
          <h2 className="font-display text-3xl font-bold text-text mb-4">AI Sales Analysis</h2>
          <div className="space-y-4">
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
              <h3 className="font-semibold text-slate-900 mb-2">Weekly Performance Summary</h3>
              <p className="text-slate-700">{aiInsights.trends.weekly_summary}</p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">Trend Direction</h3>
                <p className={`text-lg font-bold ${
                  aiInsights.trends.trend_direction === 'increasing' ? 'text-green-600' :
                  aiInsights.trends.trend_direction === 'decreasing' ? 'text-red-600' :
                  'text-slate-600'
                }`}>
                  {aiInsights.trends.trend_direction === 'increasing' ? '📈 Increasing' :
                   aiInsights.trends.trend_direction === 'decreasing' ? '📉 Decreasing' :
                   '➡️ Stable'}
                </p>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-green-900 mb-2">Growth Rate</h3>
                <p className="text-2xl font-bold text-green-600">
                  {aiInsights.trends.growth_rate > 0 ? '+' : ''}{aiInsights.trends.growth_rate.toFixed(1)}%
                </p>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h3 className="font-semibold text-purple-900 mb-2">Top Products</h3>
                <div className="space-y-1">
                  {aiInsights.trends.top_performing_products.slice(0, 3).map((product, index) => (
                    <p key={index} className="text-sm text-purple-800">#{index + 1} {product}</p>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
              <h3 className="font-semibold text-indigo-900 mb-2">AI Recommendations</h3>
              <ul className="text-indigo-800 space-y-1">
                {aiInsights.trends.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      )}

      <section className="panel-card rounded-[28px] p-6">
        <div className="mb-5">
          <h2 className="font-display text-3xl font-bold text-text">Top Performers</h2>
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
