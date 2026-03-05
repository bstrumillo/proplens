"use client";

import { Label, Pie, PieChart } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { IncomeBreakdownItem } from "@/lib/services/dashboard";

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

export function IncomeBreakdown({
  data,
  totalIncome,
}: {
  data: IncomeBreakdownItem[];
  totalIncome: number;
}) {
  // Build chart config from data
  const chartConfig: ChartConfig = {};
  for (const item of data) {
    chartConfig[item.type] = {
      label: item.label,
      color: item.color,
    };
  }

  // Transform data for Recharts PieChart (needs a "fill" key)
  const chartData = data.map((item) => ({
    ...item,
    fill: item.color,
  }));

  return (
    <Card variant="glass" className="hover:shadow-[var(--elevation-3)] transition-all duration-300">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">
          Income Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="mx-auto aspect-square h-[200px]">
          <PieChart>
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value, name) => [
                    currencyFormatter.format(Number(value)),
                    chartConfig[name as string]?.label ?? name,
                  ]}
                />
              }
            />
            <Pie
              data={chartData}
              dataKey="amount"
              nameKey="type"
              innerRadius={60}
              outerRadius={85}
              strokeWidth={2}
              stroke="var(--background)"
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy ?? 0) - 8}
                          className="fill-foreground text-2xl font-bold"
                        >
                          {currencyFormatter.format(totalIncome)}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy ?? 0) + 14}
                          className="fill-muted-foreground text-xs"
                        >
                          this month
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
        <div className="flex flex-wrap justify-center gap-4 text-xs text-muted-foreground">
          {data.map((item) => (
            <span key={item.type} className="flex items-center gap-1.5">
              <span
                className="inline-block size-2.5 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              {item.label} ({currencyFormatter.format(item.amount)})
            </span>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
