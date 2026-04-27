const GROK_API_KEY = process.env.GROK_API_KEY;
const GROK_API_URL = process.env.GROK_API_URL;

async function callGrokAPI(messages) {
  const response = await fetch(GROK_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${GROK_API_KEY}`,
    },
    body: JSON.stringify({
      model: "grok-beta",
      messages,
      max_tokens: 1000,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    throw new Error(`Grok API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

export async function generateProfitForecast(sales, products) {
  const salesData = sales.slice(-30); // Last 30 sales for forecasting
  const productsData = products;

  const prompt = `Based on the following sales and product data, generate a 30-day profit forecast. Return ONLY a JSON array of 30 objects, each with a "profit" number representing daily profit forecast.

Sales data (last 30 transactions):
${JSON.stringify(salesData, null, 2)}

Products data:
${JSON.stringify(productsData, null, 2)}

Analyze the sales patterns, profit margins, and trends to create a realistic 30-day profit forecast. Consider seasonal patterns, product performance, and growth trends.`;

  try {
    const response = await callGrokAPI([{ role: "user", content: prompt }]);
    const forecastData = JSON.parse(response);

    if (!Array.isArray(forecastData) || forecastData.length !== 30) {
      throw new Error("Invalid forecast data format");
    }

    return forecastData.map((item, index) => ({
      label: new Date(Date.now() + (index + 1) * 24 * 60 * 60 * 1000).toLocaleDateString("en-NG", {
        day: "numeric",
        month: "short"
      }),
      profit: Math.max(0, Math.round(item.profit || 0)),
    }));
  } catch (error) {
    console.error("Error generating profit forecast:", error);
    // Fallback to mock data
    return Array.from({ length: 30 }, (_, index) => ({
      label: new Date(Date.now() + (index + 1) * 24 * 60 * 60 * 1000).toLocaleDateString("en-NG", {
        day: "numeric",
        month: "short"
      }),
      profit: Math.round(25000 + Math.sin(index / 3.4) * 5000 + (index % 5) * 1000),
    }));
  }
}

export async function generateSalesTrends(sales, products) {
  const productsById = new Map(products.map(p => [p.id, p]));

  const prompt = `Analyze the following sales data and provide insights about sales trends. Return ONLY a JSON object with these exact keys:
- "weekly_summary": A string describing the weekly sales performance
- "top_performing_products": Array of up to 5 product names that are performing best
- "trend_direction": Either "increasing", "decreasing", or "stable"
- "growth_rate": A number representing the growth rate percentage
- "recommendations": Array of 2-3 actionable recommendations

Sales data:
${JSON.stringify(sales, null, 2)}

Products data:
${JSON.stringify(products, null, 2)}

Focus on revenue trends, product performance, and actionable insights for business growth.`;

  try {
    const response = await callGrokAPI([{ role: "user", content: prompt }]);
    const trendsData = JSON.parse(response);

    return {
      weekly_summary: trendsData.weekly_summary || "Sales show consistent performance with opportunities for growth.",
      top_performing_products: trendsData.top_performing_products || [],
      trend_direction: trendsData.trend_direction || "stable",
      growth_rate: trendsData.growth_rate || 0,
      recommendations: trendsData.recommendations || [],
    };
  } catch (error) {
    console.error("Error generating sales trends:", error);
    return {
      weekly_summary: "Sales data shows steady performance with room for optimization.",
      top_performing_products: products.slice(0, 3).map(p => p.name),
      trend_direction: "stable",
      growth_rate: 5.2,
      recommendations: [
        "Focus on high-margin products",
        "Implement targeted marketing campaigns",
        "Monitor inventory levels closely"
      ],
    };
  }
}

export async function generateLowStockPredictions(sales, products) {
  const productsById = new Map(products.map(p => [p.id, p]));

  const prompt = `Based on sales velocity and current stock levels, predict when products will run low on stock. Return ONLY a JSON array of objects with these exact properties for products likely to run out within 30 days:
- "product_id": The product ID
- "predicted_low_stock_date": ISO date string when stock will be low
- "recommended_reorder_qty": Recommended quantity to reorder
- "confidence": A number 0-100 indicating prediction confidence

Sales data:
${JSON.stringify(sales, null, 2)}

Products data:
${JSON.stringify(products, null, 2)}

Calculate sales velocity (units sold per day) for each product and predict low stock dates based on current inventory levels. Only include products that will run low within 30 days.`;

  try {
    const response = await callGrokAPI([{ role: "user", content: prompt }]);
    const predictions = JSON.parse(response);

    if (!Array.isArray(predictions)) {
      throw new Error("Invalid predictions format");
    }

    return predictions.map(prediction => ({
      product_id: prediction.product_id,
      predicted_low_stock_date: prediction.predicted_low_stock_date,
      recommended_reorder_qty: Math.max(1, Math.round(prediction.recommended_reorder_qty || 10)),
      confidence: Math.min(100, Math.max(0, prediction.confidence || 80)),
    }));
  } catch (error) {
    console.error("Error generating low stock predictions:", error);
    // Fallback: predict for products with low stock
    return products
      .filter(p => p.stock <= 10)
      .map(p => ({
        product_id: p.id,
        predicted_low_stock_date: new Date(Date.now() + (p.stock * 2 + 7) * 24 * 60 * 60 * 1000).toISOString(),
        recommended_reorder_qty: Math.max(10, Math.round(p.stock * 1.5)),
        confidence: 75,
      }));
  }
}

export async function generateAIInsightsSummary(sales, products, insights) {
  const prompt = `Provide a comprehensive AI-powered business insights summary based on the following data. Return ONLY a JSON object with these exact keys:
- "business_overview": A brief overview of the business performance
- "key_strengths": Array of 2-3 key strengths
- "areas_for_improvement": Array of 2-3 areas that need attention
- "actionable_recommendations": Array of 3-4 specific, actionable recommendations
- "profit_forecast_summary": A summary of profit outlook
- "risk_assessment": Brief assessment of business risks

Sales data:
${JSON.stringify(sales.slice(-20), null, 2)}

Products data:
${JSON.stringify(products, null, 2)}

Insights data:
${JSON.stringify(insights, null, 2)}

Provide intelligent, data-driven insights that would be valuable for a small business owner.`;

  try {
    const response = await callGrokAPI([{ role: "user", content: prompt }]);
    const summary = JSON.parse(response);

    return {
      business_overview: summary.business_overview || "Your business shows steady performance with opportunities for growth.",
      key_strengths: summary.key_strengths || ["Consistent sales performance", "Good product margins"],
      areas_for_improvement: summary.areas_for_improvement || ["Inventory management", "Marketing optimization"],
      actionable_recommendations: summary.actionable_recommendations || [
        "Focus on high-margin products",
        "Implement inventory tracking",
        "Expand marketing efforts"
      ],
      profit_forecast_summary: summary.profit_forecast_summary || "Profit outlook is positive with potential for growth.",
      risk_assessment: summary.risk_assessment || "Low to moderate risk with good diversification.",
    };
  } catch (error) {
    console.error("Error generating AI insights summary:", error);
    return {
      business_overview: "Your retail business demonstrates consistent performance with room for strategic improvements.",
      key_strengths: ["Diverse product portfolio", "Established customer base", "Competitive pricing"],
      areas_for_improvement: ["Inventory optimization", "Sales trend analysis", "Customer retention"],
      actionable_recommendations: [
        "Implement automated inventory alerts",
        "Focus marketing on top-performing products",
        "Analyze customer buying patterns",
        "Optimize pricing strategy"
      ],
      profit_forecast_summary: "Profit projections show positive growth trajectory with proper inventory management.",
      risk_assessment: "Moderate risk level with opportunities to reduce stock-out incidents.",
    };
  }
}