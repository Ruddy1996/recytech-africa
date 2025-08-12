// src/components/StatPie.jsx
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

const COLORS = ["#22c55e", "#ef4444"]; // Vert et rouge

export default function StatPie({ online = 0, offline = 0 }) {
  const data = [
    { name: "Bornes en ligne", value: online },
    { name: "Bornes hors ligne", value: offline },
  ];

  return (
    <div className="bg-white rounded shadow p-4">
      <h3 className="text-center font-semibold mb-2 text-gray-700">État des bornes</h3>
      <PieChart width={250} height={200}>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          outerRadius={60}
          fill="#8884d8"
          dataKey="value"
          label={({ name, percent }) =>
            `${name} ${(percent * 100).toFixed(0)}%`
          }
        >
          {data.map((entry, index) => (
            <Cell key={index} fill={COLORS[index]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </div>
  );
}
