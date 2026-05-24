import { apiClient } from './client'
import type { Item, PaginatedResponse, SearchResponse } from '@/types/api.types'
import type { ListItemsParams, SearchItemsParams } from '@/types/params.types'

export const itemsService = {
  list: (params: ListItemsParams) =>
    apiClient
      .get<PaginatedResponse<Item>>('/items', { params })
      .then((r) => r.data),

  search: (params: SearchItemsParams) =>
    apiClient
      .get<SearchResponse<Item>>('/items/search', { params })
      .then((r) => r.data),

  getByCode: (code: string, tableId: string) =>
    apiClient
      .get<Item>(`/items/${code}`, { params: { tableId } })
      .then((r) => r.data),
}