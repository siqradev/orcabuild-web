'use client'

import { useImportJobs } from '@/features/imports/hooks/useImportJobs'
import { formatDate } from '@/lib/formatters'
import type { JobStatus, Source } from '@/types/api.types'

const sourceColors: Record<Source, string> = {
  SINAPI:  'border-emerald-500 text-emerald-600',
  SEINFRA: 'border-blue-500 text-blue-600',
  SICRO:   'border-amber-500 text-amber-600',
  EMBASA:  'border-purple-500 text-purple-600',
  CPOS:    'border-pink-500 text-pink-600',
  ORSE:    'border-orange-500 text-orange-600',
}

const statusConfig: Record<JobStatus, { label: string; class: string }> = {
  PENDING: { label: 'Aguardando', class: 'bg-yellow-500/10 text-yellow-600' },
  RUNNING: { label: 'Importando', class: 'bg-blue-500/10 text-blue-600' },
  SUCCESS: { label: 'Sincronizado', class: 'bg-emerald-500/10 text-emerald-600' },
  FAILED:  { label: 'Falhou',     class: 'bg-red-500/10 text-red-600' },
}

export default function TabelasPage() {
  const { data: jobs, isLoading } = useImportJobs()

  // Deduplica tabelas por priceTableId
  const tables = jobs
    ?.filter((j) => j.priceTableId)
    .filter((j, i, arr) => arr.findIndex((x) => x.priceTableId === j.priceTableId) === i)
    ?? []

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-[17px] font-medium text-foreground">Tabelas</h1>
        <p className="mt-1 text-[13px] text-muted-foreground">
          {tables.length > 0
            ? `${tables.length} tabelas de preços importadas`
            : 'Tabelas de preços — SINAPI e SEINFRA-CE'}
        </p>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-lg border border-border/50 bg-background p-4 space-y-3">
              <div className="h-4 w-20 rounded bg-muted animate-pulse" />
              <div className="h-6 w-32 rounded bg-muted animate-pulse" />
              <div className="h-3 w-24 rounded bg-muted animate-pulse" />
            </div>
          ))}
        </div>
      )}

      {/* Empty */}
      {!isLoading && tables.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 gap-3 text-muted-foreground">
          <p className="text-[13px]">Nenhuma tabela encontrada — inicie uma importação primeiro.</p>
        </div>
      )}

      {/* Grid de tabelas */}
      {!isLoading && tables.length > 0 && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {tables.map((job) => {
            const colorClass = sourceColors[job.source] ?? 'border-border text-muted-foreground'
            const cfg = statusConfig[job.status]

            const reference = job.source === 'SEINFRA'
              ? `Versão ${job.version}`
              : `${String(job.month ?? '').padStart(2, '0')}/${job.year}`

            return (
              <div
                key={job.priceTableId}
                className={`rounded-lg border-l-2 border border-border/50 bg-background p-4 ${colorClass.split(' ')[0]}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-[12px] font-semibold ${colorClass.split(' ')[1]}`}>
                    {job.source}
                  </span>
                  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${cfg.class}`}>
                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                    {cfg.label}
                  </span>
                </div>

                <p className="text-[15px] font-medium text-foreground mb-1">
                  {reference} — {job.state}
                </p>

                {job.type && (
                  <p className="text-[11px] text-muted-foreground mb-3">{job.type}</p>
                )}

                <div className="space-y-1.5 pt-3 border-t border-border/50">
                  <div className="flex justify-between text-[12px]">
                    <span className="text-muted-foreground">Itens</span>
                    <span className="font-mono text-foreground">
                      {job.itemsCount?.toLocaleString('pt-BR') ?? '—'}
                    </span>
                  </div>
                  <div className="flex justify-between text-[12px]">
                    <span className="text-muted-foreground">Importado em</span>
                    <span className="text-foreground">{formatDate(job.startedAt)}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}