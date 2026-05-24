import { apiClient } from './client'
import type { CompositionResolveResult, CompositionRelation } from '@/types/api.types'
import type { ResolveCompositionParams, CompositionRelationParams } from '@/types/params.types'

export const compositionsService = {
  resolve: (code: string, params: ResolveCompositionParams) =>
    apiClient
      .get<CompositionResolveResult>(`/compositions/${code}/resolve`, { params })
      .then((r) => r.data),

  getChildren: (code: string, params: CompositionRelationParams) =>
    apiClient
      .get<CompositionRelation[]>(`/compositions/${code}/children`, { params })
      .then((r) => r.data),

  getParents: (code: string, params: CompositionRelationParams) =>
    apiClient
      .get<CompositionRelation[]>(`/compositions/${code}/parents`, { params })
      .then((r) => r.data),
}