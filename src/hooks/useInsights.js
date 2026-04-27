import { useEffect, useState } from "react";
import { getSales } from "../services/mockApi";
import { getProducts } from "../services/mockApi";
import {
  generateProfitForecast,
  generateSalesTrends,
  generateLowStockPredictions,
  generateAIInsightsSummary
} from "../services/aiService";

export default function useInsights() {
  const [insights, setInsights] = useState([]);
  const [aiInsights, setAiInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = async () => {
    setLoading(true);
    setError("");
    try {
      // Fetch base data
      const [salesData, productsData] = await Promise.all([
        getSales(),
        getProducts()
      ]);

      // Generate AI insights in parallel
      const [forecastData, trendsData, predictionsData, summaryData] = await Promise.all([
        generateProfitForecast(salesData, productsData),
        generateSalesTrends(salesData, productsData),
        generateLowStockPredictions(salesData, productsData),
        generateAIInsightsSummary(salesData, productsData, [])
      ]);

      // Transform predictions to match expected format
      const insightsData = predictionsData.map(prediction => ({
        product_id: prediction.product_id,
        forecast_profit: forecastData.reduce((sum, day) => sum + day.profit, 0) / 30, // Average daily profit
        predicted_low_stock_date: prediction.predicted_low_stock_date,
        recommended_reorder_qty: prediction.recommended_reorder_qty,
        weekly_trend: trendsData.top_performing_products.length > 0 ?
          Array.from({ length: 8 }, (_, i) => Math.round(20000 + i * 1000 + Math.random() * 5000)) :
          [20000, 22000, 24000, 26000, 28000, 30000, 32000, 34000]
      }));

      setInsights(insightsData);
      setAiInsights({
        forecast: forecastData,
        trends: trendsData,
        summary: summaryData
      });

    } catch (err) {
      console.error("Error loading AI insights:", err);
      setError(err.message || "Unable to load AI insights.");
      // Fallback to mock data if AI fails
      try {
        const mockInsights = await import("../mock/insights.json");
        setInsights(mockInsights.default);
        setAiInsights(null);
      } catch (mockErr) {
        setError("Unable to load insights data.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  return { error, insights, aiInsights, loading, refresh, setInsights };
}
