import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { get, post, patch, del } from '../api'

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

export interface UpdateContactInput {
  id: string
  fullName?: string
  email?: string
  phone?: string | null
  timezone?: string
  emailOptOut?: boolean
}

export function useContacts(initialData?: Contact[]) {
  return useQuery<Contact[]>({
    queryKey: ['contacts'],
    queryFn: () => get('/contacts'),
    ...(initialData ? { initialData } : {}),
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

export function useUpdateContact() {
  const queryClient = useQueryClient()
  return useMutation<Contact, Error, UpdateContactInput>({
    mutationFn: ({ id, ...body }) => patch(`/contacts/${id}`, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] })
    },
  })
}

export function useDeleteContact() {
  const queryClient = useQueryClient()
  return useMutation<void, Error, string>({
    mutationFn: (id) => del(`/contacts/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] })
    },
  })
}
