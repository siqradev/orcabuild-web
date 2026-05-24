import axios, { AxiosError } from 'axios'

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000',
  timeout: 60_000,
  headers: { 'Content-Type': 'application/json' },
})

apiClient.interceptors.request.use(
  (config) => {
    const key = process.env.NEXT_PUBLIC_API_KEY
    if (key) config.headers['x-api-key'] = key
    return config
  },
  (error) => Promise.reject(error)
)

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const status = error.response?.status
    if (status === 401) console.error('[OrcaBuild API] Não autorizado — verifique a NEXT_PUBLIC_API_KEY no .env.local')
    if (status === 404) console.warn('[OrcaBuild API] Recurso não encontrado:', error.config?.url)
    if (status === 500) console.error('[OrcaBuild API] Erro interno do servidor:', error.config?.url)
    if (error.code === 'ECONNABORTED') console.error('[OrcaBuild API] Timeout — API demorou mais de 60s')
    if (error.code === 'ERR_NETWORK') console.error('[OrcaBuild API] Sem conexão — verifique se a orcabuild-api está rodando em', process.env.NEXT_PUBLIC_API_URL)
    return Promise.reject(error)
  }
)
