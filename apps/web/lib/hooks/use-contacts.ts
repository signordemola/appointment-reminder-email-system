import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { get, post } from '../api'

export interface Contact {
  id: string
  fullName: string
  email: string
  phone: string | null
  timezone: string
  emailOptOut: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateContactInput {
  fullName: string
  email: string
  phone?: string | null
  timezone: string
  emailOptOut?: boolean
}

export function useContacts() {
  return useQuery<Contact[]>({
    queryKey: ['contacts'],
    queryFn: () => get('/contacts'),
  })
}

export function useCreateContact() {
  const queryClient = useQueryClient()
  return useMutation<Contact, Error, CreateContactInput>({
    mutationFn: (input) => post('/contacts', input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] })
    },
  })
}
