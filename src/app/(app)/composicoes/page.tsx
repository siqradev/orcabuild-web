'use client'

import { useState } from 'react'
import { Play, ChevronRight, Minus } from 'lucide-react'
import { usePriceTables } from '@/features/tables/hooks/useTables'
import { useResolveComposition } from '@/features/compositions/hooks/useComposition'
import { formatCurrency } from '@/lib/formatters'
import type { CompositionNode } from '@/types/api.types'

function TreeNode({ node, depth = 0 }: { node: CompositionNode; depth?: number }) {
  const [open, setOpen] = useState(depth < 2)
  const hasChildren = node.children.length > 0

  return (
    <div>
      <div
        className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-[12px] transition-colors hover:bg-muted/50 ${hasChildren ? 'cursor-pointer' : ''} ${depth === 0 ? 'bg-muted/30 font-medium' : ''}`}
        style={{ paddingLeft: `${8 + depth * 20}px` }}
        onClick={() => hasChildren && setOpen((o) => !o)}
      >
        <span className="w-4 flex-shrink-0 flex items-center justify-center">
          {hasChildren ? (
            <ChevronRight size={12} className={`text-muted-foreground transition-transform duration-150 ${open ? 'rotate-90' : ''}`} />
          ) : (
            <Minus size={10} className="text-muted-foreground/40" />
          )}
        </span>
        <code className="text-[11px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 flex-shrink-0 font-mono">
          {node.code}
        </code>
        <span className="flex-1 text-muted-foreground truncate">{node.description}</span>
        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full flex-shrink-0 ${node.type === 'COMPOSICAO' ? 'bg-purple-500/10 text-purple-600' : 'bg-emerald-500/10 text-emerald-600'}`}>
          {node.type === 'COMPOSICAO' ? 'Comp.' : 'Insumo'}
        </span>
        <span className="text-[11px] text-muted-foreground w-8 text-center flex-shrink-0">{node.unit}</span>
        <span className="text-[11px] text-muted-foreground w-20 text-right flex-shrink-0 font-mono">×{node.coefficient.toFixed(4)}</span>
        <span className="text-[11px] text-muted-foreground w-24 text-right flex-shrink-0 font-mono">
          {node.unitPrice > 0 ? formatCurrency(node.unitPrice) : '—'}
        </span>
        <span className="text-[12px] font-semibold w-28 text-right flex-shrink-0 font-mono text-foreground">
          {formatCurrency(node.totalCost)}
        </span>
      </div>
      {open && hasChildren && (
        <div className="border-l border-dashed border-border/40 ml-5">
          {node.children.map((child, i) => (
            <TreeNode key={`${child.code}-${i}`} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  )
}

export default function ComposicoesPage() {
  const [code, setCode]           = useState('')
  const [tableId, setTableId]     = useState('')
  const [qty, setQty]             = useState(1)
  const [submitted, setSubmitted] = useState(false)

  const { data: tables, isLoading: tablesLoading } = usePriceTables()

  const { data, isLoading, isError } = useResolveComposition(
    submitted ? code : '',
    submitted ? tableId : '',
    qty
  )

  function handleSubmit() {
    if (!code || !tableId) return
    setSubmitted(true)
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-[17px] font-medium text-foreground">Composições</h1>
        <p className="mt-1 text-[13px] text-muted-foreground">Árvore recursiva de custos</p>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        <input
          value={code}
          onChange={(e) => { setCode(e.target.value.toUpperCase()); setSubmitted(false) }}
          placeholder="Código (ex: C1802 ou 74209)"
          className="rounded-md border border-border/50 bg-background px-3 py-2 text-[13px] text-foreground outline-none placeholder:text-muted-foreground flex-1 min-w-[200px] focus:border-emerald-500"
        />

        <select
          value={tableId}
          onChange={(e) => { setTableId(e.target.value); setSubmitted(false) }}
          className="rounded-md border border-border/50 bg-background px-3 py-2 text-[13px] text-foreground outline-none"
          disabled={tablesLoading}
        >
          <option value="">{tablesLoading ? 'Carregando...' : 'Selecione a tabela…'}</option>
          {tables?.map((t) => (
            <option key={t.id} value={t.id}>{t.description ?? t.reference}</option>
          ))}
        </select>

        <input
          type="number"
          value={qty}
          min={1}
          onChange={(e) => setQty(Number(e.target.value))}
          className="rounded-md border border-border/50 bg-background px-3 py-2 text-[13px] text-foreground outline-none w-24"
        />

        <button
          onClick={handleSubmit}
          disabled={!code || !tableId}
          className="flex items-center gap-2 rounded-md bg-emerald-600 px-4 py-2 text-[13px] font-medium text-white transition-colors hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Play size={13} />
          Resolver
        </button>
      </div>

      {isLoading && submitted && (
        <div className="flex items-center justify-center py-24 text-[13px] text-muted-foreground">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent mr-3" />
          Resolvendo composição…
        </div>
      )}

      {isError && submitted && (
        <div className="flex flex-col items-center justify-center py-24 gap-2">
          <p className="text-[13px] text-muted-foreground">Composição não encontrada nesta tabela.</p>
          <button onClick={() => setSubmitted(false)} className="text-[13px] text-emerald-600 hover:underline">Tentar novamente</button>
        </div>
      )}

      {data && !isLoading && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: 'Material',     value: data.breakdown.material,    color: 'text-emerald-600', bg: 'bg-emerald-500/8' },
              { label: 'Mão de obra',  value: data.breakdown.maoDeObra,   color: 'text-blue-600',    bg: 'bg-blue-500/8' },
              { label: 'Equipamentos', value: data.breakdown.equipamento,  color: 'text-amber-600',   bg: 'bg-amber-500/8' },
              { label: 'Total',        value: data.totalCost,              color: 'text-foreground',  bg: 'bg-muted/30' },
            ].map((item) => (
              <div key={item.label} className={`rounded-lg p-4 ${item.bg}`}>
                <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-1">{item.label}</p>
                <p className={`text-[18px] font-semibold ${item.color}`}>{formatCurrency(item.value)}</p>
                {item.label !== 'Total' && data.totalCost > 0 && (
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {((item.value / data.totalCost) * 100).toFixed(1)}%
                  </p>
                )}
              </div>
            ))}
          </div>

          <div className="rounded-lg border border-border/50 bg-background overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border/50">
              <h2 className="text-[13px] font-medium text-foreground">Árvore de composição</h2>
              <code className="text-[11px] text-emerald-600 bg-emerald-500/10 px-1.5 py-0.5 rounded font-mono">{data.code}</code>
              <span className="text-[12px] text-muted-foreground">{data.description}</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 border-b border-border/50 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
              <span className="w-4 flex-shrink-0" />
              <span className="w-20 flex-shrink-0">Código</span>
              <span className="flex-1">Descrição</span>
              <span className="w-16 flex-shrink-0">Tipo</span>
              <span className="w-8 text-center flex-shrink-0">Un.</span>
              <span className="w-20 text-right flex-shrink-0">Coeficiente</span>
              <span className="w-24 text-right flex-shrink-0">P. Unit.</span>
              <span className="w-28 text-right flex-shrink-0">Total</span>
            </div>
            <div className="p-2">
              {data.tree && (
                <TreeNode node={data.tree as unknown as CompositionNode} depth={0} />
              )}
            </div>
          </div>
        </div>
      )}

      {!submitted && !data && (
        <div className="flex flex-col items-center justify-center py-24 gap-3 text-muted-foreground">
          <p className="text-[13px]">Digite um código e selecione a tabela para resolver a composição.</p>
        </div>
      )}
    </div>
  )
}