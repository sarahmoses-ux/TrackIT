import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export default function TopProductsChart({ data }) {
  return (
    <div className="panel-card h-96 rounded-3xl p-6">
      <div className="mb-6">
        <h3 className="font-display text-xl font-semibold text-text">Top Products</h3>
        <p className="text-sm text-muted">Highest units sold</p>
      </div>
      <div className="h-[300px] w-full">
        <ResponsiveContainer>
          <BarChart
            barCategoryGap="28%"
            data={data}
            layout="vertical"
            margin={{ top: 10, right: 18, bottom: 10, left: 54 }}
          >
            <CartesianGrid horizontal={false} stroke="#E5E7EB" />
            <XAxis axisLine={false} tickLine={false} type="number" />
            <YAxis
              axisLine={false}
              dataKey="name"
              tick={{ fill: "#6B7280", fontSize: 12 }}
              tickLine={false}
              tickMargin={12}
              type="category"
              width={138}
            />
            <Tooltip />
            <Bar barSize={18} dataKey="units" fill="#1A7A4A" radius={[0, 10, 10, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
