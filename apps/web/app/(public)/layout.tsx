import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Appointment Action - RemindFlow',
}

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-linear-to-br from-background via-background to-muted/30">
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <div className="w-full max-w-lg">
          {children}
        </div>
        <p className="mt-8 text-xs text-muted-foreground">
          Powered by <span className="font-semibold text-foreground">RemindFlow</span>
        </p>
      </div>
    </div>
  )
}
