import type { Metadata } from "next"

import "./globals.css"
import { Providers } from "@/components/providers"

export const metadata: Metadata = {
  title: "Appointment Reminder System",
  description:
    "Operations dashboard for appointment confirmations, reminders, and reschedule workflows.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="antialiased">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
