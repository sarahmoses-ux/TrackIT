import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatCurrency } from "../../utils/formatCurrency";

export default function ProfitForecastChart({ data }) {
  return (
    <div className="panel-card rounded-3xl p-5">
      <div className="mb-4">
        <h3 className="font-display text-xl font-semibold text-text">
          Projected Profit - Next 30 Days
        </h3>
        <p className="text-sm text-muted">Forecasted from recent product performance patterns.</p>
      </div>
      <div className="h-[320px] w-full">
        <ResponsiveContainer>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="profitGradient" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#1A7A4A" stopOpacity={0.36} />
                <stop offset="100%" stopColor="#1A7A4A" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#E5E7EB" vertical={false} />
            <XAxis dataKey="label" tick={{ fill: "#6B7280", fontSize: 12 }} tickLine={false} axisLine={false} />
            <YAxis
              tickFormatter={(value) => `₦${Number(value).toLocaleString()}`}
              tick={{ fill: "#6B7280", fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              width={92}
            />
            <Tooltip formatter={(value) => formatCurrency(value)} />
            <Area dataKey="profit" fill="url(#profitGradient)" stroke="#1A7A4A" strokeWidth={3} type="monotone" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
