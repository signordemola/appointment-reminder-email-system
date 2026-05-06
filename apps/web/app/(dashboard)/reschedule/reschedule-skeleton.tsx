import { Header } from '@/components/header'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function RescheduleContentSkeleton() {
  return (
    <>
      <Header
        title="Reschedule Requests"
        breadcrumbs={[{ label: 'Dashboard', href: '/' }, { label: 'Reschedule Requests' }]}
      />
      <div className="flex flex-1 flex-col gap-6 p-6">
        {/* Heading skeleton */}
        <div className="hidden sm:block mb-2">
          <Skeleton className="h-8 w-52" />
          <Skeleton className="mt-1.5 h-4 w-64" />
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <Skeleton className="h-7 w-8" />
                    <Skeleton className="h-4 w-28" />
                  </div>
                  <Skeleton className="size-10 rounded-lg" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs + Cards */}
        <div className="space-y-4">
          <Skeleton className="h-10 w-72 rounded-md" />
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <Skeleton className="size-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-36" />
                    <Skeleton className="h-3 w-52" />
                  </div>
                  <div className="flex gap-2">
                    <Skeleton className="h-9 w-20 rounded-md" />
                    <Skeleton className="h-9 w-20 rounded-md" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </>
  )
}
