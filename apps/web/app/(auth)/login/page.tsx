'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Mail, Lock, LogIn, Eye, EyeOff, CalendarClock } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const DEMO_EMAIL = 'admin@remindflow.com'
const DEMO_PASSWORD = 'demo1234'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Simulate network delay for realism
    await new Promise((r) => setTimeout(r, 800))

    if (email === DEMO_EMAIL && password === DEMO_PASSWORD) {
      // Set a simple cookie to mark as "authenticated"
      document.cookie = 'rf_session=demo_authenticated; path=/; max-age=86400; SameSite=Lax'
      router.push('/')
    } else {
      setError('Invalid email or password.')
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Logo + Brand — inline */}
      <div className="flex flex-col items-center gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-xl bg-linear-to-br from-primary to-primary/80 text-primary-foreground shadow-md shadow-primary/25">
            <CalendarClock className="size-5" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">RemindFlow</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Sign in to manage your appointments &amp; reminders
        </p>
      </div>

      {/* Login Card */}
      <Card className="card-elevated border-0 shadow-xl">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-lg">Welcome back</CardTitle>
          <CardDescription>Enter your credentials to continue</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@remindflow.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                  autoComplete="email"
                  autoFocus
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2 text-sm text-destructive">
                {error}
              </div>
            )}

            {/* Submit */}
            <Button type="submit" className="w-full gap-2" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign in'}
              {loading ? (
                <div className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : (
                <LogIn className="size-4" />
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Demo credentials hint */}
      <div className="rounded-lg border bg-muted/50 px-4 py-3 text-center">
        <p className="text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">Demo credentials:</span>{' '}
          admin@remindflow.com / demo1234
        </p>
      </div>

      {/* Footer */}
      <p className="text-center text-xs text-muted-foreground">
        Powered by <span className="font-semibold text-foreground">RemindFlow</span>
      </p>
    </div>
  )
}
