const API_KEY = import.meta.env.VITE_GROK_API_KEY;
const API_URL = import.meta.env.VITE_GROK_API_URL;
const MODEL = "llama-3.1-8b-instant";

// Strip markdown code fences that Grok sometimes wraps around JSON responses
function extractJSON(text) {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  return fenced ? fenced[1].trim() : text.trim();
}

async function callGrok(messages) {
  if (!API_KEY || API_KEY.startsWith("your_")) {
    throw new Error("VITE_GROK_API_KEY is not configured in .env");
    
  }

  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        {
          role: "system",
          content:
            "You are a business analytics AI. Always respond with raw JSON only — no markdown, no explanation, no code fences.",
        },
        ...messages,
      ],
      max_tokens: 1500,
      temperature: 0.3,
    }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => response.statusText);
    throw new Error(`Grok API ${response.status}: ${body}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

// Slim down product data sent to the API — we don't need created_at or sku
function slimProducts(products) {
  return products.map(({ id, name, category, cost_price, selling_price, stock }) => ({
    id,
    name,
    category,
    cost_price,
    selling_price,
    stock,
  }));
}

// Slim down sales data
function slimSales(sales) {
  return sales.map(({ product_id, quantity, sale_price, total_profit, timestamp }) => ({
    product_id,
    quantity,
    sale_price,
    total_profit,
    timestamp,
  }));
}

/**
 * Returns a 30-element array: [{ label: "28 Apr", profit: 12000 }, ...]
 */
export async function generateProfitForecast(sales, products) {
  const prompt = `Given these sales transactions and product catalog, generate a 30-day profit forecast starting from tomorrow.

Sales (last 30):
${JSON.stringify(slimSales(sales.slice(-30)))}

Products:
${JSON.stringify(slimProducts(products))}

Return a JSON array of exactly 30 objects. Each object must have:
- "label": date string formatted as "D MMM" (e.g. "28 Apr")
- "profit": integer, the forecasted profit in NGN for that day

Base the forecast on the sales velocity and profit margins visible in the data.`;

  try {
    const raw = await callGrok([{ role: "user", content: prompt }]);
    const parsed = JSON.parse(extractJSON(raw));

    if (!Array.isArray(parsed) || parsed.length !== 30) {
      throw new Error("Unexpected forecast shape");
    }

    const startMs = Date.now();
    return parsed.map((item, index) => ({
      label:
        item.label ||
        new Date(startMs + (index + 1) * 86400000).toLocaleDateString("en-NG", {
          day: "numeric",
          month: "short",
        }),
      profit: Math.max(0, Math.round(Number(item.profit) || 0)),
    }));
  } catch (error) {
    console.warn("Profit forecast fallback:", error.message);
    return Array.from({ length: 30 }, (_, index) => ({
      label: new Date(Date.now() + (index + 1) * 86400000).toLocaleDateString("en-NG", {
        day: "numeric",
        month: "short",
      }),
      profit: Math.round(25000 + Math.sin(index / 3.4) * 5000 + (index % 5) * 1200),
    }));
  }
}

/**
 * Returns:
 * {
 *   weekly_summary: string,
 *   top_performing_products: string[],
 *   trend_direction: "increasing" | "decreasing" | "stable",
 *   growth_rate: number,
 *   recommendations: string[]
 * }
 */
export async function generateSalesTrends(sales, products) {
  const prompt = `Analyze these sales and return a JSON object with exactly these keys:
- "weekly_summary": one sentence describing recent sales performance
- "top_performing_products": array of up to 5 product names ranked by revenue
- "trend_direction": one of "increasing", "decreasing", or "stable"
- "growth_rate": number (percentage, e.g. 8.5 means 8.5% growth)
- "recommendations": array of 2-3 short, actionable strings

Sales data:
${JSON.stringify(slimSales(sales))}

Products:
${JSON.stringify(slimProducts(products))}`;

  try {
    const raw = await callGrok([{ role: "user", content: prompt }]);
    const parsed = JSON.parse(extractJSON(raw));

    return {
      weekly_summary:
        parsed.weekly_summary || "Sales show consistent performance with opportunities for growth.",
      top_performing_products: Array.isArray(parsed.top_performing_products)
        ? parsed.top_performing_products
        : products.slice(0, 3).map((p) => p.name),
      trend_direction: ["increasing", "decreasing", "stable"].includes(parsed.trend_direction)
        ? parsed.trend_direction
        : "stable",
      growth_rate: Number(parsed.growth_rate) || 0,
      recommendations: Array.isArray(parsed.recommendations)
        ? parsed.recommendations
        : ["Focus on high-margin products", "Monitor inventory levels closely"],
    };
  } catch (error) {
    console.warn("Sales trends fallback:", error.message);
    return {
      weekly_summary: "Sales data shows steady performance with room for optimisation.",
      top_performing_products: products.slice(0, 3).map((p) => p.name),
      trend_direction: "stable",
      growth_rate: 5.2,
      recommendations: [
        "Focus on high-margin products",
        "Run targeted promotions on slow-moving stock",
        "Monitor inventory levels ahead of restocks",
      ],
    };
  }
}

/**
 * Returns an array of predictions:
 * [{ product_id, predicted_low_stock_date, recommended_reorder_qty, confidence }, ...]
 *
 * Only products predicted to run out within 30 days are included.
 */
export async function generateLowStockPredictions(sales, products) {
  const prompt = `Based on the sales velocity and current stock levels, predict which products will run low within 30 days.

Sales data:
${JSON.stringify(slimSales(sales))}

Products (with current stock):
${JSON.stringify(slimProducts(products))}

Return a JSON array. Each object must have:
- "product_id": string (use the id from products)
- "predicted_low_stock_date": ISO 8601 date string
- "recommended_reorder_qty": integer
- "confidence": integer 0–100

Only include products that will likely run out within 30 days. Return an empty array if none qualify.`;

  try {
    const raw = await callGrok([{ role: "user", content: prompt }]);
    const parsed = JSON.parse(extractJSON(raw));

    if (!Array.isArray(parsed)) throw new Error("Expected array");

    return parsed.map((item) => ({
      product_id: item.product_id,
      predicted_low_stock_date: item.predicted_low_stock_date,
      recommended_reorder_qty: Math.max(1, Math.round(Number(item.recommended_reorder_qty) || 10)),
      confidence: Math.min(100, Math.max(0, Number(item.confidence) || 75)),
    }));
  } catch (error) {
    console.warn("Low stock predictions fallback:", error.message);
    return products
      .filter((p) => p.stock <= 10)
      .map((p) => ({
        product_id: p.id,
        predicted_low_stock_date: new Date(
          Date.now() + (p.stock * 2 + 7) * 86400000,
        ).toISOString(),
        recommended_reorder_qty: Math.max(10, Math.round(p.stock * 1.5)),
        confidence: 75,
      }));
  }
}

/**
 * Returns:
 * {
 *   business_overview: string,
 *   key_strengths: string[],
 *   areas_for_improvement: string[],
 *   actionable_recommendations: string[],
 *   profit_forecast_summary: string,
 *   risk_assessment: string
 * }
 */
export async function generateAIInsightsSummary(sales, products) {
  const prompt = `You are analysing a retail business. Return a JSON object with exactly these keys:
- "business_overview": 1–2 sentences summarising overall performance
- "key_strengths": array of 2–3 short strings
- "areas_for_improvement": array of 2–3 short strings
- "actionable_recommendations": array of 3–4 specific, actionable strings
- "profit_forecast_summary": 1 sentence on profit outlook
- "risk_assessment": 1 sentence on key risks

Sales (recent 20):
${JSON.stringify(slimSales(sales.slice(-20)))}

Products:
${JSON.stringify(slimProducts(products))}`;

  try {
    const raw = await callGrok([{ role: "user", content: prompt }]);
    const parsed = JSON.parse(extractJSON(raw));

    return {
      business_overview:
        parsed.business_overview ||
        "Your business shows steady performance with opportunities for growth.",
      key_strengths: Array.isArray(parsed.key_strengths)
        ? parsed.key_strengths
        : ["Consistent sales performance", "Good product margins"],
      areas_for_improvement: Array.isArray(parsed.areas_for_improvement)
        ? parsed.areas_for_improvement
        : ["Inventory management", "Marketing optimisation"],
      actionable_recommendations: Array.isArray(parsed.actionable_recommendations)
        ? parsed.actionable_recommendations
        : ["Focus on high-margin products", "Implement inventory alerts"],
      profit_forecast_summary:
        parsed.profit_forecast_summary ||
        "Profit outlook is positive with potential for growth.",
      risk_assessment:
        parsed.risk_assessment || "Low to moderate risk with good diversification.",
    };
  } catch (error) {
    console.warn("AI summary fallback:", error.message);
    return {
      business_overview:
        "Your retail business demonstrates consistent performance with room for strategic improvements.",
      key_strengths: ["Diverse product portfolio", "Established customer base", "Competitive pricing"],
      areas_for_improvement: [
        "Inventory optimisation",
        "Sales trend analysis",
        "Customer retention",
      ],
      actionable_recommendations: [
        "Implement automated inventory alerts",
        "Focus marketing on top-performing products",
        "Analyse customer buying patterns",
        "Optimise pricing strategy for slow movers",
      ],
      profit_forecast_summary:
        "Profit projections show a positive growth trajectory with proper inventory management.",
      risk_assessment: "Moderate risk level with opportunities to reduce stock-out incidents.",
    };
  }
}
