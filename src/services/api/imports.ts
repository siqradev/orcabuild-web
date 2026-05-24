import { apiClient } from './client'
import type { ImportJob, ImportResult } from '@/types/api.types'
import type { SinapiImportPayload, SeinfraImportPayload } from '@/types/params.types'

export const importsService = {
  listJobs: () =>
    apiClient.get<ImportJob[]>('/import/jobs').then((r) => r.data),

  getJob: (id: string) =>
    apiClient.get<ImportJob>(`/import/jobs/${id}`).then((r) => r.data),

  importSinapi: (payload: SinapiImportPayload) =>
    apiClient.post<ImportResult>('/import', payload).then((r) => r.data),

  importSeinfra: (payload: SeinfraImportPayload) =>
    apiClient.post<ImportResult>('/import/seinfra', payload).then((r) => r.data),
}