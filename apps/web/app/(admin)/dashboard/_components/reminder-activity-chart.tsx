"use client"

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { formatCompactDay } from "@/lib/format"

type ReminderActivityDatum = {
  day: string
  sent: number
  failed: number
  bounced: number
}

function ReminderActivityChart({
  data,
}: {
  data: ReminderActivityDatum[]
}) {
  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} barGap={10}>
          <CartesianGrid stroke="currentColor" strokeOpacity={0.08} vertical={false} />
          <XAxis
            dataKey="day"
            tickLine={false}
            axisLine={false}
            tickMargin={10}
            tickFormatter={formatCompactDay}
            className="fill-muted-foreground text-xs"
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            width={36}
            className="fill-muted-foreground text-xs"
          />
          <Tooltip
            cursor={{ fill: "rgba(99, 102, 241, 0.08)" }}
            contentStyle={{
              borderRadius: 18,
              border: "1px solid rgba(148, 163, 184, 0.2)",
              background: "rgba(15, 23, 42, 0.95)",
              color: "white",
            }}
            labelFormatter={(value) => formatCompactDay(String(value))}
          />
          <Bar dataKey="sent" fill="oklch(var(--chart-1))" radius={[10, 10, 0, 0]} />
          <Bar dataKey="failed" fill="oklch(var(--chart-5))" radius={[10, 10, 0, 0]} />
          <Bar dataKey="bounced" fill="oklch(var(--chart-4))" radius={[10, 10, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export { ReminderActivityChart }
