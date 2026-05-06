import { Header } from '@/components/header'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function RemindersContentSkeleton() {
  return (
    <>
      <Header
        title="Reminder Rules"
        breadcrumbs={[{ label: 'Dashboard', href: '/' }, { label: 'Reminder Rules' }]}
      />
      <div className="flex flex-1 flex-col gap-6 p-6">
        {/* Heading + CTA skeleton */}
        <div className="flex items-start justify-between gap-4 mb-2">
          <div className="hidden sm:block">
            <Skeleton className="h-8 w-40" />
            <Skeleton className="mt-1.5 h-4 w-72" />
          </div>
          <Skeleton className="h-9 w-28 rounded-md" />
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <Skeleton className="h-7 w-8" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <Skeleton className="size-10 rounded-lg" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Rules cards */}
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-lg border p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Skeleton className="size-10 rounded-lg" />
                    <div className="space-y-1.5">
                      <Skeleton className="h-4 w-36" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                  </div>
                  <Skeleton className="h-6 w-10 rounded-full" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </>
  )
}
