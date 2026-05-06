'use client'

import { AlertTriangle } from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Header } from '@/components/header'

export default function PageError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <>
      <Header title="Error" />
      <div className="flex flex-1 flex-col gap-6 p-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center gap-4 py-16">
            <div className="flex size-16 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="size-8 text-destructive" />
            </div>
            <div className="text-center space-y-1">
              <p className="text-lg font-semibold">Something went wrong</p>
              <p className="text-sm text-muted-foreground max-w-md">
                {error.message || 'An unexpected error occurred while loading this page.'}
              </p>
              {error.digest && (
                <p className="text-xs text-muted-foreground font-mono">
                  Error ID: {error.digest}
                </p>
              )}
            </div>
            <Button onClick={reset} variant="outline" size="sm">
              Try again
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
