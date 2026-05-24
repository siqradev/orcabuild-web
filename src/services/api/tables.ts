import { apiClient } from './client'

export interface PriceTable {
  id:          string
  source:      string
  state:       string
  month:       number | null
  year:        number | null
  version:     string | null
  type:        string | null
  reference:   string
  description: string | null
}

export const tablesService = {
  list: () =>
    apiClient.get<PriceTable[]>('/price-tables').then((r) => r.data),
}