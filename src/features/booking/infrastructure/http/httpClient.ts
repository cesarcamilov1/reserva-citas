import { ApiError } from './ApiError'

export type QueryValue = string | number | boolean | undefined

export interface RequestOptions {
  query?: Record<string, QueryValue>
  headers?: Record<string, string>
  body?: unknown
}

export interface HttpClient {
  get<T>(path: string, options?: RequestOptions): Promise<T>
  post<T>(path: string, options?: RequestOptions): Promise<T>
}

export interface HttpClientOptions {
  baseUrl: string
  fetch?: typeof fetch
}

export function createHttpClient(options: HttpClientOptions): HttpClient {
  const fetchImpl = options.fetch ?? globalThis.fetch.bind(globalThis)
  const baseUrl = options.baseUrl.replace(/\/$/, '')

  async function request<T>(method: string, path: string, opts: RequestOptions = {}): Promise<T> {
    const url = buildUrl(baseUrl, path, opts.query)
    const hasBody = opts.body !== undefined

    let response: Response
    try {
      response = await fetchImpl(url, {
        method,
        headers: {
          Accept: 'application/json',
          ...(hasBody ? { 'Content-Type': 'application/json' } : {}),
          ...opts.headers,
        },
        body: hasBody ? JSON.stringify(opts.body) : undefined,
      })
    } catch (cause) {
      throw ApiError.fromNetworkError(cause)
    }

    if (!response.ok) {
      throw await ApiError.fromResponse(response)
    }

    return parseJsonBody<T>(response)
  }

  return {
    get<T>(path: string, opts?: RequestOptions) {
      return request<T>('GET', path, opts)
    },
    post<T>(path: string, opts?: RequestOptions) {
      return request<T>('POST', path, opts)
    },
  }
}

async function parseJsonBody<T>(response: Response): Promise<T> {
  const text = await response.text()
  if (!text) {
    return undefined as T
  }
  try {
    return JSON.parse(text) as T
  } catch (cause) {
    throw new ApiError({
      status: response.status,
      code: 'INVALID_RESPONSE',
      detail: cause instanceof Error ? cause.message : String(cause),
    })
  }
}

function buildUrl(baseUrl: string, path: string, query?: Record<string, QueryValue>): string {
  const url = baseUrl ? new URL(baseUrl + path) : new URL(path, 'http://localhost')
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined) {
        url.searchParams.set(key, String(value))
      }
    }
  }
  return baseUrl ? url.toString() : `${url.pathname}${url.search}`
}
