import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatCurrency } from "../../utils/formatCurrency";

export default function WeeklyBarChart({ data, xKey = "label", yKey = "value" }) {
  return (
    <div className="panel-card rounded-3xl p-5">
      <div className="h-[320px] w-full">
        <ResponsiveContainer>
          <BarChart data={data}>
            <CartesianGrid stroke="#E5E7EB" vertical={false} />
            <XAxis dataKey={xKey} tick={{ fill: "#6B7280", fontSize: 12 }} tickLine={false} axisLine={false} />
            <YAxis
              tickFormatter={(value) => `₦${Number(value).toLocaleString()}`}
              tick={{ fill: "#6B7280", fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              width={92}
            />
            <Tooltip formatter={(value) => formatCurrency(value)} />
            <Bar dataKey={yKey} fill="#1A7A4A" radius={[10, 10, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
