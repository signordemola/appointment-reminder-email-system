import { Header } from '@/components/header'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export default function DashboardLoading() {
  return (
    <>
      <Header title="Dashboard" />
      <div className="flex flex-1 flex-col gap-6 p-6">

        {/* KPI Stats Grid — 4 cards matching exact final layout */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <Skeleton className="size-10 rounded-lg" />
                  <Skeleton className="size-4 rounded" />
                </div>
                <div className="mt-4 space-y-2">
                  <Skeleton className="h-8 w-14" />
                  <Skeleton className="h-4 w-28" />
                </div>
                <Skeleton className="mt-1 h-3 w-36" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Middle row: Chart + Delivery Performance */}
        <div className="grid gap-6 lg:grid-cols-7">

          {/* Weekly Overview Chart skeleton */}
          <Card className="lg:col-span-4">
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="space-y-1.5">
                <Skeleton className="h-5 w-36" />
                <Skeleton className="h-4 w-64" />
              </div>
              <Skeleton className="h-8 w-20 rounded-md" />
            </CardHeader>
            <CardContent>
              <div className="h-[280px] flex items-end gap-[6%] px-8 pb-4">
                {[65, 80, 55, 90, 70, 45, 10].map((h, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2">
                    <Skeleton className="w-full rounded-t" style={{ height: `${h}%` }} />
                    <Skeleton className="h-3 w-6" />
                  </div>
                ))}
              </div>
              {/* Chart legend */}
              <div className="mt-4 flex items-center justify-center gap-6">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Skeleton className="size-3 rounded-sm" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Delivery Performance skeleton */}
          <Card className="lg:col-span-3">
            <CardHeader>
              <Skeleton className="h-5 w-44" />
              <Skeleton className="h-4 w-52" />
            </CardHeader>
            <CardContent className="space-y-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Skeleton className="size-4 rounded" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                    <Skeleton className="h-4 w-10" />
                  </div>
                  <Skeleton className="h-2 w-full rounded-full" />
                  <Skeleton className="h-3 w-48" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Bottom row: Upcoming + Activity */}
        <div className="grid gap-6 lg:grid-cols-5">

          {/* Upcoming today skeleton */}
          <Card className="lg:col-span-3">
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="space-y-1.5">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-44" />
              </div>
              <Skeleton className="h-8 w-20 rounded-md" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 rounded-lg border p-3">
                    <Skeleton className="size-10 rounded-full" />
                    <div className="flex-1 space-y-1.5">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right space-y-1.5">
                        <Skeleton className="h-4 w-16 ml-auto" />
                        <Skeleton className="h-5 w-20 rounded-full" />
                      </div>
                      <Skeleton className="size-8 rounded-md" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent activity skeleton */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-52" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex gap-3">
                    <Skeleton className="mt-0.5 size-4 shrink-0 rounded" />
                    <div className="flex-1 space-y-1.5">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
