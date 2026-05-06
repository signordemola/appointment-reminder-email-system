import { Header } from '@/components/header'
import { ContactsContent } from './contacts-content'
import type { Contact } from '@/lib/hooks/use-contacts'

export const dynamic = 'force-dynamic'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

async function fetchContacts(): Promise<Contact[]> {
  try {
    const response = await fetch(`${API_URL}/contacts`, {
      next: { revalidate: 30 },
      headers: { Accept: 'application/json' },
    })
    if (!response.ok) return []
    return response.json()
  } catch {
    // API not ready yet — client-side useQuery will retry
    return []
  }
}

export default async function ContactsPage() {
  const contacts = await fetchContacts()
  return <ContactsContent initialContacts={contacts} />
}
