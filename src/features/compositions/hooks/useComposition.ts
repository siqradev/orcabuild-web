import { useQuery } from '@tanstack/react-query'
import { compositionsService } from '@/services/api/compositions'

export const compositionKeys = {
  resolve:  (code: string, tableId: string, qty: number) =>
    ['compositions', 'resolve', code, tableId, qty] as const,
  children: (code: string, tableId: string) =>
    ['compositions', 'children', code, tableId] as const,
  parents:  (code: string, tableId: string) =>
    ['compositions', 'parents', code, tableId] as const,
}

export function useResolveComposition(code: string, tableId: string, qty = 1) {
  return useQuery({
    queryKey: compositionKeys.resolve(code, tableId, qty),
    queryFn:  () => compositionsService.resolve(code, { tableId, qty }),
    enabled:  !!code && !!tableId,
    staleTime: 15 * 60_000,
  })
}

export function useCompositionChildren(code: string, tableId: string) {
  return useQuery({
    queryKey: compositionKeys.children(code, tableId),
    queryFn:  () => compositionsService.getChildren(code, { tableId }),
    enabled:  !!code && !!tableId,
  })
}

export function useCompositionParents(code: string, tableId: string) {
  return useQuery({
    queryKey: compositionKeys.parents(code, tableId),
    queryFn:  () => compositionsService.getParents(code, { tableId }),
    enabled:  !!code && !!tableId,
  })
}