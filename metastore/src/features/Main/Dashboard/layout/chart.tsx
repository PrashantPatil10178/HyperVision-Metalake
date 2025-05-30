import type * as React from "react";
import {
  Line,
  LineChart as RechartsLineChart,
  Bar,
  BarChart as RechartsBarChart,
  Area,
  AreaChart as RechartsAreaChart,
  Pie,
  PieChart as RechartsPieChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
  type TooltipProps,
} from "recharts";
import { cn } from "@/lib/utils";

// Common chart props
interface ChartProps {
  data: any[];
  index: string;
  categories?: string[];
  category?: string;
  colors?: string[];
  valueFormatter?: (value: number) => string;
  showLegend?: boolean;
  showGridLines?: boolean;
  startEndOnly?: boolean;
  showAnimation?: boolean;
  showTooltip?: boolean;
  className?: string;
}

// Custom tooltip component
const ChartTooltip = ({
  active,
  payload,
  label,
  valueFormatter,
}: TooltipProps<any, any> & { valueFormatter?: (value: number) => string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-background p-2 shadow-sm">
        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">{label}</span>
            {payload.map((entry: any, index: number) => (
              <span
                key={`item-${index}`}
                className="text-sm font-bold"
                style={{ color: entry.color }}
              >
                {valueFormatter ? valueFormatter(entry.value) : entry.value}
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return null;
};

// Line Chart
export function LineChart({
  data,
  index,
  categories = ["value"],
  colors = [
    "oklch(0.646 0.222 41.116)", // --chart-1
    "oklch(0.6 0.118 184.704)", // --chart-2
    "oklch(0.398 0.07 227.392)", // --chart-3
    "oklch(0.828 0.189 84.429)", // --chart-4
    "oklch(0.769 0.188 70.08)", // --chart-5
  ],
  valueFormatter = (value) => `${value}`,
  showLegend = true,
  showGridLines = true,
  startEndOnly = false,
  showAnimation = true,
  showTooltip = true,
  className,
}: ChartProps) {
  return (
    <div className={cn("w-full h-full", className)}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsLineChart
          data={data}
          margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
        >
          {showGridLines && (
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          )}
          <XAxis
            dataKey={index}
            tick={{ fontSize: 12 }}
            tickLine={{ stroke: "hsl(var(--border))" }}
            axisLine={{ stroke: "hsl(var(--border))" }}
            tickMargin={8}
            tickFormatter={
              startEndOnly
                ? (value, index) =>
                    index === 0 || index === data.length - 1 ? value : ""
                : undefined
            }
          />
          <YAxis
            tick={{ fontSize: 12 }}
            tickLine={{ stroke: "hsl(var(--border))" }}
            axisLine={{ stroke: "hsl(var(--border))" }}
            tickMargin={8}
            tickFormatter={(value) => valueFormatter(value)}
          />
          {showTooltip && (
            <Tooltip
              content={<ChartTooltip valueFormatter={valueFormatter} />}
            />
          )}
          {showLegend && <Legend />}
          {categories.map((category, index) => (
            <Line
              key={category}
              type="monotone"
              dataKey={category}
              stroke={colors[index % colors.length]}
              strokeWidth={2}
              dot={{ r: 4, strokeWidth: 2 }}
              activeDot={{ r: 6, strokeWidth: 2 }}
              isAnimationActive={showAnimation}
              animationDuration={1000}
            />
          ))}
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
}

// Bar Chart
export function BarChart({
  data,
  index,
  categories = ["value"],
  colors = [
    "oklch(0.646 0.222 41.116)", // --chart-1
    "oklch(0.6 0.118 184.704)", // --chart-2
    "oklch(0.398 0.07 227.392)", // --chart-3
    "oklch(0.828 0.189 84.429)", // --chart-4
    "oklch(0.769 0.188 70.08)", // --chart-5
  ],
  valueFormatter = (value) => `${value}`,
  showLegend = true,
  showGridLines = true,
  startEndOnly = false,
  showAnimation = true,
  showTooltip = true,
  className,
}: ChartProps) {
  return (
    <div className={cn("w-full h-full", className)}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart
          data={data}
          margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
        >
          {showGridLines && (
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          )}
          <XAxis
            dataKey={index}
            tick={{ fontSize: 12 }}
            tickLine={{ stroke: "hsl(var(--border))" }}
            axisLine={{ stroke: "hsl(var(--border))" }}
            tickMargin={8}
            tickFormatter={
              startEndOnly
                ? (value, index) =>
                    index === 0 || index === data.length - 1 ? value : ""
                : undefined
            }
          />
          <YAxis
            tick={{ fontSize: 12 }}
            tickLine={{ stroke: "hsl(var(--border))" }}
            axisLine={{ stroke: "hsl(var(--border))" }}
            tickMargin={8}
            tickFormatter={(value) => valueFormatter(value)}
          />
          {showTooltip && (
            <Tooltip
              content={<ChartTooltip valueFormatter={valueFormatter} />}
            />
          )}
          {showLegend && <Legend />}
          {categories.map((category, index) => (
            <Bar
              key={category}
              dataKey={category}
              fill={colors[index % colors.length]}
              isAnimationActive={showAnimation}
              animationDuration={1000}
              radius={[4, 4, 0, 0]}
            />
          ))}
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
}

// Area Chart
export function AreaChart({
  data,
  index,
  categories = ["value"],
  colors = [
    "oklch(0.646 0.222 41.116)", // --chart-1
    "oklch(0.6 0.118 184.704)", // --chart-2
    "oklch(0.398 0.07 227.392)", // --chart-3
    "oklch(0.828 0.189 84.429)", // --chart-4
    "oklch(0.769 0.188 70.08)", // --chart-5
  ],
  valueFormatter = (value) => `${value}`,
  showLegend = true,
  showGridLines = true,
  startEndOnly = false,
  showAnimation = true,
  showTooltip = true,
  className,
}: ChartProps) {
  return (
    <div className={cn("w-full h-full", className)}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsAreaChart
          data={data}
          margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
        >
          {showGridLines && (
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          )}
          <XAxis
            dataKey={index}
            tick={{ fontSize: 12 }}
            tickLine={{ stroke: "hsl(var(--border))" }}
            axisLine={{ stroke: "hsl(var(--border))" }}
            tickMargin={8}
            tickFormatter={
              startEndOnly
                ? (value, index) =>
                    index === 0 || index === data.length - 1 ? value : ""
                : undefined
            }
          />
          <YAxis
            tick={{ fontSize: 12 }}
            tickLine={{ stroke: "hsl(var(--border))" }}
            axisLine={{ stroke: "hsl(var(--border))" }}
            tickMargin={8}
            tickFormatter={(value) => valueFormatter(value)}
          />
          {showTooltip && (
            <Tooltip
              content={<ChartTooltip valueFormatter={valueFormatter} />}
            />
          )}
          {showLegend && <Legend />}
          {categories.map((category, index) => (
            <Area
              key={category}
              type="monotone"
              dataKey={category}
              stroke={colors[index % colors.length]}
              fill={colors[index % colors.length] + "40"}
              strokeWidth={2}
              isAnimationActive={showAnimation}
              animationDuration={1000}
            />
          ))}
        </RechartsAreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function PieChart({
  data,
  index,
  category = "value",
  colors = ["#2755D1", "#50AFFF", "#3088E8", "#D3EFFF"],
  valueFormatter = (value) => `${value}`,
  showAnimation = true,
  showTooltip = true,
  className,
}: ChartProps) {
  return (
    <div className={cn("w-full h-full", className)}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsPieChart margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
          <Pie
            data={data}
            nameKey={index}
            dataKey={category}
            cx="50%"
            cy="50%"
            outerRadius="80%"
            innerRadius="40%"
            paddingAngle={2}
            isAnimationActive={showAnimation}
            animationDuration={1000}
            label={false} // Disable labels
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={colors[index % colors.length]}
                id={entry}
              />
            ))}
          </Pie>
          {showTooltip && (
            <Tooltip
              content={<ChartTooltip valueFormatter={valueFormatter} />}
            />
          )}
          <Legend
            formatter={(value) => <span className="text-sm">{value}</span>}
          />
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  );
}
// Donut Chart (a variant of Pie Chart)
export function DonutChart({
  data,
  index,
  category = "value",
  colors = ["#2755D1", "#50AFFF", "#3088E8", "#D3EFFF"],
  valueFormatter = (value) => `${value}`,
  showAnimation = true,
  showTooltip = true,
  className,
}: ChartProps) {
  return (
    <div className={cn("w-full h-full", className)}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsPieChart margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
          <Pie
            data={data}
            nameKey={index}
            dataKey={category}
            cx="50%"
            cy="50%"
            outerRadius="80%"
            innerRadius="60%"
            paddingAngle={2}
            isAnimationActive={showAnimation}
            animationDuration={1000}
          >
            {data.map((index) => (
              <Cell
                key={`cell-${index}`}
                fill={colors[index % colors.length]}
              />
            ))}
          </Pie>
          {showTooltip && (
            <Tooltip
              content={<ChartTooltip valueFormatter={valueFormatter} />}
            />
          )}
          <Legend
            formatter={(value) => <span className="text-sm">{value}</span>}
          />
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  );
}

// Chart tooltip component for external use
export function ChartTooltipComponent({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border bg-background p-2 shadow-sm">
      {children}
    </div>
  );
}
