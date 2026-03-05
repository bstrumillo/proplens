"use client";

import { Label, Pie, PieChart } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { OccupancyBreakdown } from "@/lib/services/dashboard";

const statusLabels: Record<string, string> = {
  occupied: "Occupied",
  vacant: "Vacant",
  maintenance: "Maintenance",
  reserved: "Reserved",
  not_rentable: "Not Rentable",
};

export function OccupancyChart({
  data,
  occupancyRate,
  totalUnits,
}: {
  data: OccupancyBreakdown[];
  occupancyRate: number;
  totalUnits: number;
}) {
  const chartConfig: ChartConfig = {};
  for (const item of data) {
    chartConfig[item.status] = {
      label: statusLabels[item.status] ?? item.status,
      color: item.fill,
    };
  }

  return (
    <Card variant="glass" className="hover:shadow-[var(--elevation-3)] transition-all duration-300">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">Occupancy</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="mx-auto aspect-square h-[200px]">
          <PieChart>
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value, name) => [
                    `${value} unit${Number(value) !== 1 ? "s" : ""}`,
                    statusLabels[name as string] ?? name,
                  ]}
                />
              }
            />
            <Pie
              data={data}
              dataKey="count"
              nameKey="status"
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
                          {occupancyRate.toFixed(0)}%
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy ?? 0) + 14}
                          className="fill-muted-foreground text-xs"
                        >
                          {totalUnits} units
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
        <div className="flex justify-center gap-4 text-xs text-muted-foreground">
          {data.map((item) => (
            <span key={item.status} className="flex items-center gap-1.5">
              <span
                className="inline-block size-2.5 rounded-full"
                style={{ backgroundColor: item.fill }}
              />
              {statusLabels[item.status] ?? item.status} ({item.count})
            </span>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
