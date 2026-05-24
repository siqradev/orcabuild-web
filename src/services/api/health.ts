import { apiClient } from './client'
import type { HealthResponse } from '@/types/api.types'

export const healthService = {
  check: () =>
    apiClient.get<HealthResponse>('/health').then((r) => r.data),
}