export const STUDIO_SERVER_RETRY_DELAYS_MS = [15_000, 60_000] as const

export type StudioServerRetryCycle = {
  mutationId: string | null
  failedRequestCount: number
}

export function createStudioServerRetryCycle(
  mutationId: string | null = null
): StudioServerRetryCycle {
  return { mutationId, failedRequestCount: 0 }
}

export function alignStudioServerRetryCycle(
  cycle: StudioServerRetryCycle,
  mutationId: string
): StudioServerRetryCycle {
  return cycle.mutationId === mutationId
    ? cycle
    : createStudioServerRetryCycle(mutationId)
}

export function recordStudioServerRetryableFailure(
  cycle: StudioServerRetryCycle,
  mutationId: string
): StudioServerRetryCycle {
  const aligned = alignStudioServerRetryCycle(cycle, mutationId)
  return {
    mutationId,
    failedRequestCount: aligned.failedRequestCount + 1,
  }
}

export function getStudioServerRetryDelay(failedRequestCount: number): number | null {
  if (!Number.isInteger(failedRequestCount) || failedRequestCount < 1) return null
  return STUDIO_SERVER_RETRY_DELAYS_MS[failedRequestCount - 1] ?? null
}
