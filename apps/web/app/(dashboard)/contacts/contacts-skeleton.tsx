import { Header } from '@/components/header'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

/**
 * Focused skeleton for contacts content area only.
 * Renders Header + heading instantly, table area as skeleton.
 */
export function ContactsContentSkeleton() {
  return (
    <>
      <Header
        title="Contacts"
        breadcrumbs={[{ label: 'Dashboard', href: '/' }, { label: 'Contacts' }]}
      />
      <div className="flex flex-1 flex-col gap-4 p-6">
        {/* Heading + CTA skeleton */}
        <div className="flex items-start justify-between gap-4 mb-2">
          <div className="hidden sm:block">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="mt-1.5 h-4 w-64" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-20 rounded-md hidden sm:block" />
            <Skeleton className="h-9 w-20 rounded-md hidden sm:block" />
            <Skeleton className="h-9 w-28 rounded-md" />
          </div>
        </div>

        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <Skeleton className="h-9 w-64 rounded-md" />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Table header */}
            <div className="rounded-md border">
              <div className="flex items-center gap-4 border-b px-4 py-3">
                <Skeleton className="size-4" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-40 ml-auto" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-20" />
              </div>

              {/* Table rows */}
              {Array.from({ length: 6 }).map((_, i) => (
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
