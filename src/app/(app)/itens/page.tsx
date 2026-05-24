'use client'

import { useState } from 'react'
import { Search } from 'lucide-react'
import { useItems, useItemSearch } from '@/features/items/hooks/useItems'
import { formatCurrency } from '@/lib/formatters'
import type { ItemType, Source, TableType } from '@/types/api.types'

export default function ItensPage() {
  const [q, setQ] = useState('')
  const [tipo, setTipo] = useState<ItemType | ''>('')
  const [fonte, setFonte] = useState<Source | ''>('')
  const [tableType, setTableType] = useState<TableType | ''>('')
  const [page, setPage] = useState(1)

  const isSearching = q.length >= 2

  const listQuery = useItems({
    page,
    limit: 50,
    type:      tipo      || undefined,
    source:    fonte     || undefined,
    tableType: tableType || undefined,
  })

  const searchQuery = useItemSearch(q, {
    source:    fonte     || undefined,
    tableType: tableType || undefined,
  })

  const items      = isSearching ? searchQuery.data?.results : listQuery.data?.items
  const total      = isSearching ? searchQuery.data?.count   : listQuery.data?.total
  const isLoading  = isSearching ? searchQuery.isLoading     : listQuery.isLoading
  const isError    = isSearching ? searchQuery.isError       : listQuery.isError
  const totalPages = listQuery.data?.totalPages ?? 1

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-[17px] font-medium text-foreground">Itens</h1>
        <p className="mt-1 text-[13px] text-muted-foreground">
          {total != null ? `${total.toLocaleString('pt-BR')} itens encontrados` : 'Insumos e composições'}
        </p>
      </div>

      {/* Filtros */}
      <div className="mb-4 flex flex-wrap gap-2">
        <div className="flex flex-1 min-w-[200px] items-center gap-2 rounded-md border border-border/50 bg-background px-3 py-2">
          <Search size={14} className="text-muted-foreground flex-shrink-0" />
          <input
            value={q}
            onChange={(e) => { setQ(e.target.value); setPage(1) }}
            placeholder="Buscar por código ou descrição…"
            className="flex-1 bg-transparent text-[13px] outline-none placeholder:text-muted-foreground"
          />
        </div>

        <select
          value={tipo}
          onChange={(e) => { setTipo(e.target.value as ItemType | ''); setPage(1) }}
          className="rounded-md border border-border/50 bg-background px-3 py-2 text-[13px] text-foreground outline-none"
        >
          <option value="">Todos os tipos</option>
          <option value="INSUMO">Insumo</option>
          <option value="COMPOSICAO">Composição</option>
        </select>

        <select
          value={fonte}
          onChange={(e) => { setFonte(e.target.value as Source | ''); setPage(1) }}
          className="rounded-md border border-border/50 bg-background px-3 py-2 text-[13px] text-foreground outline-none"
        >
          <option value="">Todas as fontes</option>
          <option value="SINAPI">SINAPI</option>
          <option value="SEINFRA">SEINFRA</option>
          <option value="SICRO">SICRO</option>
        </select>

        <select
          value={tableType}
          onChange={(e) => { setTableType(e.target.value as TableType | ''); setPage(1) }}
          className="rounded-md border border-border/50 bg-background px-3 py-2 text-[13px] text-foreground outline-none"
        >
          <option value="">Onerada/Desonerada</option>
          <option value="ONERADA">Onerada</option>
          <option value="DESONERADA">Desonerada</option>
        </select>
      </div>

      {/* Tabela */}
      <div className="rounded-lg border border-border/50 bg-background overflow-hidden">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-border/50">
              <th className="text-left px-4 py-3 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Código</th>
              <th className="text-left px-4 py-3 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Descrição</th>
              <th className="text-left px-4 py-3 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Un.</th>
              <th className="text-left px-4 py-3 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Tipo</th>
              <th className="text-right px-4 py-3 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Preço</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && Array.from({ length: 8 }).map((_, i) => (
              <tr key={i} className="border-b border-border/50">
                {Array.from({ length: 5 }).map((_, j) => (
                  <td key={j} className="px-4 py-3">
                    <div className="h-4 rounded bg-muted animate-pulse" style={{ width: `${60 + j * 10}%` }} />
                  </td>
                ))}
              </tr>
            ))}

            {isError && (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">
                  Erro ao carregar itens — verifique se a API está rodando
                </td>
              </tr>
            )}

            {!isLoading && !isError && items?.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">
                  Nenhum item encontrado
                </td>
              </tr>
            )}

            {items?.map((item) => (
              <tr key={item.id} className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-mono text-[12px] text-emerald-600">{item.code}</td>
                <td className="px-4 py-3 text-foreground max-w-md truncate">{item.description}</td>
                <td className="px-4 py-3 text-muted-foreground">{item.unit}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${
                    item.type === 'INSUMO'
                      ? 'bg-emerald-500/10 text-emerald-600'
                      : 'bg-purple-500/10 text-purple-600'
                  }`}>
                    {item.type === 'INSUMO' ? 'Insumo' : 'Composição'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right font-mono text-muted-foreground">
                  {formatCurrency(item.basePrice)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginação */}
      {!isSearching && totalPages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-1">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 rounded-md border border-border/50 text-[13px] text-muted-foreground hover:bg-muted/50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            ← Anterior
          </button>
          <span className="px-3 py-1.5 text-[13px] text-muted-foreground">
            {page} de {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1.5 rounded-md border border-border/50 text-[13px] text-muted-foreground hover:bg-muted/50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Próxima →
          </button>
        </div>
      )}
    </div>
  )
}