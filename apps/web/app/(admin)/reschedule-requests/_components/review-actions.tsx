"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { reviewRescheduleRequest } from "@/lib/api"

function ReviewActions({ requestId }: { requestId: string }) {
  const router = useRouter()
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: ({
      decision,
    }: {
      decision: "accept" | "dismiss"
    }) =>
      reviewRescheduleRequest(requestId, {
        decision,
        reviewedBy: "Demo Admin",
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries()
      router.refresh()
    },
  })

  return (
    <div className="flex justify-end gap-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={mutation.isPending}
        onClick={() => mutation.mutate({ decision: "dismiss" })}
      >
        Dismiss
      </Button>
      <Button
        type="button"
        size="sm"
        disabled={mutation.isPending}
        onClick={() => mutation.mutate({ decision: "accept" })}
      >
        Accept
      </Button>
    </div>
  )
}

export { ReviewActions }
