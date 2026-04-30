'use client'

import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import type { DashboardMetrics } from '@/lib/types'

interface WeeklyChartProps {
  data: DashboardMetrics['weeklyTrend']
}

export function WeeklyChart({ data }: WeeklyChartProps) {
  const formattedData = data.map((item) => {
    const date = new Date(item.date)
    const isToday = new Date().toDateString() === date.toDateString()
    return {
      ...item,
      name: isToday ? 'Today' : date.toLocaleDateString('en-US', { weekday: 'short' }),
    }
  })

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">Weekly Appointment Trend</CardTitle>
        <CardDescription>Appointment status breakdown for the past 7 days</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={formattedData}
              margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
              barCategoryGap="20%"
            >
              <CartesianGrid 
                strokeDasharray="3 3" 
                vertical={false} 
                stroke="var(--color-border)"
              />
              <XAxis 
                dataKey="name" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'var(--color-muted-foreground)', fontSize: 12 }}
                dy={10}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'var(--color-muted-foreground)', fontSize: 12 }}
                dx={-10}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'var(--color-card)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                }}
                labelStyle={{ color: 'var(--color-foreground)', fontWeight: 500 }}
                itemStyle={{ color: 'var(--color-muted-foreground)' }}
              />
              <Legend 
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ paddingTop: 20 }}
                formatter={(value) => (
                  <span style={{ color: 'var(--color-foreground)', fontSize: 12 }}>{value}</span>
                )}
              />
              <Bar 
                dataKey="confirmed" 
                name="Confirmed"
                fill="var(--color-status-confirmed)" 
                radius={[4, 4, 0, 0]}
              />
              <Bar 
                dataKey="pending" 
                name="Pending"
                fill="var(--color-status-pending)" 
                radius={[4, 4, 0, 0]}
              />
              <Bar 
                dataKey="noShow" 
                name="No-Show"
                fill="var(--color-status-cancelled)" 
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
