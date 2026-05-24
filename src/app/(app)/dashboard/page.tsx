'use client'

import { useImportJobs } from '@/features/imports/hooks/useImportJobs'
import { useItems } from '@/features/items/hooks/useItems'
import { formatDate, formatJobReference, formatDuration, parseJobLogs } from '@/lib/formatters'
import type { JobStatus } from '@/types/api.types'

const statusConfig: Record<JobStatus, { label: string; class: string }> = {
  PENDING: { label: 'Aguardando', class: 'bg-yellow-500/10 text-yellow-600' },
  RUNNING: { label: 'Rodando',    class: 'bg-blue-500/10 text-blue-600' },
  SUCCESS: { label: 'Concluído',  class: 'bg-emerald-500/10 text-emerald-600' },
  FAILED:  { label: 'Falhou',     class: 'bg-red-500/10 text-red-600' },
}

export default function DashboardPage() {
  const { data: jobs, isLoading: jobsLoading } = useImportJobs()
  const { data: itemsData, isLoading: itemsLoading } = useItems({ page: 1, limit: 1 })

  const totalJobs      = jobs?.length ?? 0
  const runningJobs    = jobs?.filter((j) => j.status === 'RUNNING').length ?? 0
  const successJobs    = jobs?.filter((j) => j.status === 'SUCCESS').length ?? 0
  const totalItems     = itemsData?.total ?? 0
  const recentJobs     = jobs?.slice(0, 5) ?? []

  const tables = jobs
    ?.filter((j) => j.status === 'SUCCESS')
    .filter((j, i, arr) =>
      arr.findIndex(
        (x) => x.source === j.source &&
               x.state === j.state &&
               x.month === j.month &&
               x.year === j.year &&
               x.version === j.version &&
               x.type === j.type
      ) === i
    ) ?? []
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-[17px] font-medium text-foreground">Dashboard</h1>
        <p className="mt-1 text-[13px] text-muted-foreground">
          Visão geral do sistema — SINAPI e SEINFRA-CE
        </p>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-2 gap-3 mb-6 sm:grid-cols-4">
        {[
          {
            label: 'Total de Itens',
            value: itemsLoading ? '—' : totalItems.toLocaleString('pt-BR'),
            sub: 'no catálogo',
            color: 'text-emerald-600',
          },
          {
            label: 'Tabelas Ativas',
            value: jobsLoading ? '—' : tables.length.toString(),
            sub: 'importadas com sucesso',
            color: 'text-blue-600',
          },
          {
            label: 'Jobs Concluídos',
            value: jobsLoading ? '—' : successJobs.toString(),
            sub: `de ${totalJobs} total`,
            color: 'text-emerald-600',
          },
          {
            label: 'Jobs Rodando',
            value: jobsLoading ? '—' : runningJobs.toString(),
            sub: runningJobs > 0 ? 'em execução agora' : 'nenhum ativo',
            color: runningJobs > 0 ? 'text-blue-600' : 'text-muted-foreground',
          },
        ].map((m) => (
          <div
            key={m.label}
            className="rounded-lg border border-border/50 bg-background p-4"
          >
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-2">
              {m.label}
            </p>
            <p className={`text-[26px] font-semibold leading-none tracking-tight ${m.color}`}>
              {m.value}
            </p>
            <p className="text-[11px] text-muted-foreground mt-1.5">{m.sub}</p>
          </div>
        ))}
      </div>

      {/* Jobs recentes */}
      <div className="rounded-lg border border-border/50 bg-background overflow-hidden">
        <div className="px-4 py-3 border-b border-border/50">
          <h2 className="text-[13px] font-medium text-foreground">Jobs recentes</h2>
        </div>
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-border/50">
              <th className="text-left px-4 py-2.5 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Fonte</th>
              <th className="text-left px-4 py-2.5 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Referência</th>
              <th className="text-left px-4 py-2.5 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Itens</th>
              <th className="text-left px-4 py-2.5 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Duração</th>
              <th className="text-left px-4 py-2.5 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Status</th>
              <th className="text-left px-4 py-2.5 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Iniciado</th>
            </tr>
          </thead>
          <tbody>
            {jobsLoading && Array.from({ length: 3 }).map((_, i) => (
              <tr key={i} className="border-b border-border/50">
                {Array.from({ length: 6 }).map((_, j) => (
                  <td key={j} className="px-4 py-3">
                    <div className="h-4 w-24 rounded bg-muted animate-pulse" />
                  </td>
                ))}
              </tr>
            ))}

            {!jobsLoading && recentJobs.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                  Nenhum job encontrado — inicie uma importação
                </td>
              </tr>
            )}

            {recentJobs.map((job) => {
              const logs = parseJobLogs(job.logs)
              const cfg  = statusConfig[job.status]
              return (
                <tr key={job.id} className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-medium text-foreground">{job.source}</td>
                  <td className="px-4 py-3 text-muted-foreground">{formatJobReference(job)}</td>
                  <td className="px-4 py-3 text-muted-foreground font-mono">
                    {job.itemsCount?.toLocaleString('pt-BR') ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground font-mono">
                    {logs ? formatDuration(logs.durationMs) : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium ${cfg.class}`}>
                      <span className="h-1.5 w-1.5 rounded-full bg-current" />
                      {cfg.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDate(job.startedAt)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}