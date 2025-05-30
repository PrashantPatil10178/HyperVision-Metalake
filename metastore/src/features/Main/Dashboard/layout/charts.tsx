"use client";
import {
  Line,
  LineChart,
  Bar,
  BarChart,
  Area,
  AreaChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { cn } from "@/lib/utils";

interface ChartProps {
  data: any[];
  index: string;
  categories?: string[];
  colors?: string[];
  valueFormatter?: (value: number) => string;
  showLegend?: boolean;
  showGridLines?: boolean;
  startEndOnly?: boolean;
  showAnimation?: boolean;
  className?: string;
}

export function LineChartComponent({
  data,
  index,
  categories = ["value"],
  colors = [
    "var(--chart-1)",
    "var(--chart-2)",
    "var(--chart-3)",
    "var(--chart-4)",
    "var(--chart-5)",
  ],
  valueFormatter,
  showLegend = true,
  showGridLines = true,

  showAnimation = true,
  className,
}: ChartProps) {
  return (
    <ResponsiveContainer
      width="100%"
      height="100%"
      className={cn("", className)}
    >
      <LineChart data={data}>
        {showGridLines && <CartesianGrid strokeDasharray="3 3" />}
        <XAxis dataKey={index} />
        <YAxis />
        {showLegend && <Legend />}
        <Tooltip formatter={valueFormatter} />
        {categories.map((category, i) => (
          <Line
            key={category}
            type="monotone"
            dataKey={category}
            stroke={colors[i % colors.length]}
            activeDot={{ r: 8 }}
            isAnimationActive={showAnimation}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}

export function BarChartComponent({
  data,
  index,
  categories = ["value"],
  colors = [
    "var(--chart-1)",
    "var(--chart-2)",
    "var(--chart-3)",
    "var(--chart-4)",
    "var(--chart-5)",
  ],
  valueFormatter,
  showLegend = true,
  showGridLines = true,
  showAnimation = true,
  className,
}: ChartProps) {
  return (
    <ResponsiveContainer
      width="100%"
      height="100%"
      className={cn("", className)}
    >
      <BarChart data={data}>
        {showGridLines && <CartesianGrid strokeDasharray="3 3" />}
        <XAxis dataKey={index} />
        <YAxis />
        {showLegend && <Legend />}
        <Tooltip formatter={valueFormatter} />
        {categories.map((category, i) => (
          <Bar
            key={category}
            dataKey={category}
            fill={colors[i % colors.length]}
            isAnimationActive={showAnimation}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}

export function AreaChartComponent({
  data,
  index,
  categories = ["value"],
  colors = [
    "var(--chart-1)",
    "var(--chart-2)",
    "var(--chart-3)",
    "var(--chart-4)",
    "var(--chart-5)",
  ],
  valueFormatter,
  showLegend = true,
  showGridLines = true,
  showAnimation = true,
  className,
}: ChartProps) {
  return (
    <ResponsiveContainer
      width="100%"
      height="100%"
      className={cn("", className)}
    >
      <AreaChart data={data}>
        {showGridLines && <CartesianGrid strokeDasharray="3 3" />}
        <XAxis dataKey={index} />
        <YAxis />
        {showLegend && <Legend />}
        <Tooltip formatter={valueFormatter} />
        {categories.map((category, i) => (
          <Area
            key={category}
            type="monotone"
            dataKey={category}
            fill={colors[i % colors.length]}
            stroke={colors[i % colors.length]}
            isAnimationActive={showAnimation}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function PieChartComponent({
  data,
  index,
  categories = ["value"],
  colors = [
    "var(--chart-1)",
    "var(--chart-2)",
    "var(--chart-3)",
    "var(--chart-4)",
    "var(--chart-5)",
  ],
  valueFormatter,
  showLegend = true,
  showAnimation = true,
  className,
}: ChartProps) {
  return (
    <ResponsiveContainer
      width="100%"
      height="100%"
      className={cn("", className)}
    >
      <PieChart>
        <Pie
          data={data}
          dataKey={categories[0]}
          nameKey={index}
          cx="50%"
          cy="50%"
          outerRadius={80}
          fill={colors[0]}
          label
          isAnimationActive={showAnimation}
        />
        {showLegend && <Legend />}
        <Tooltip formatter={valueFormatter} />
      </PieChart>
    </ResponsiveContainer>
  );
}
