import { Header } from '@/components/header'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export default function ContactsLoading() {
  return (
    <>
      <Header
        title="Contacts"
        breadcrumbs={[{ label: 'Dashboard', href: '/' }, { label: 'Contacts' }]}
      />
      <div className="flex flex-1 flex-col gap-4 p-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-9 w-28 rounded-md" />
            </div>
            <Skeleton className="h-4 w-48" />
          </CardHeader>

          {/* Toolbar skeleton */}
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Skeleton className="h-9 w-64 rounded-md" />
              <Skeleton className="h-9 w-24 rounded-md" />
            </div>

            {/* Table header */}
            <div className="rounded-md border">
              <div className="flex items-center gap-4 border-b px-4 py-3">
                <Skeleton className="size-4" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-40 ml-auto" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
              </div>

              {/* Table rows */}
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 border-b px-4 py-3 last:border-b-0">
                  <Skeleton className="size-4" />
                  <div className="flex items-center gap-3 flex-1">
                    <Skeleton className="size-9 rounded-full" />
                    <div className="space-y-1.5">
                      <Skeleton className="h-4 w-28" />
                      <Skeleton className="h-3 w-40" />
                    </div>
                  </div>
                  <Skeleton className="h-3 w-28" />
                  <Skeleton className="h-3 w-8" />
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-5 w-14 rounded-full" />
                  <Skeleton className="size-8 rounded-md" />
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-32" />
              <div className="flex items-center gap-2">
                <Skeleton className="size-8 rounded-md" />
                <Skeleton className="size-8 rounded-md" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
