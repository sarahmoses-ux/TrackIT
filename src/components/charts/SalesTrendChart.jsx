import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatCurrency } from "../../utils/formatCurrency";

export default function SalesTrendChart({ data }) {
  return (
    <div className="panel-card h-80 rounded-3xl p-5">
      <div className="mb-4">
        <h3 className="font-display text-xl font-semibold text-text">Sales Trend</h3>
        <p className="text-sm text-muted">Last 7 days revenue</p>
      </div>
      <div className="h-[240px] w-full">
        <ResponsiveContainer>
          <LineChart data={data}>
            <XAxis dataKey="label" tick={{ fill: "#6B7280", fontSize: 12 }} tickLine={false} axisLine={false} />
            <YAxis
              tick={{ fill: "#6B7280", fontSize: 12 }}
              tickFormatter={(value) => `₦${Number(value).toLocaleString()}`}
              tickLine={false}
              axisLine={false}
              width={84}
            />
            <Tooltip formatter={(value) => formatCurrency(value)} />
            <Line
              dataKey="amount"
              stroke="#1A7A4A"
              strokeWidth={3}
              dot={{ fill: "#1A7A4A", r: 4 }}
              type="monotone"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
