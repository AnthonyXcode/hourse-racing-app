export interface ApiClientConfig {
  baseURL: string
  token?: string
  headers?: Record<string, string>
  /** Next.js fetch cache option */
  cache?: RequestCache
  /** Next.js specific fetch options */
  next?: { revalidate?: number | false; tags?: string[] }
}

export interface RequestConfig {
  params?: Record<string, unknown>
  headers?: Record<string, string>
  cache?: RequestCache
  next?: { revalidate?: number | false; tags?: string[] }
}

/**
 * Serialize params to query string (handles nested objects and arrays)
 */
function serializeParams(params: Record<string, unknown>, prefix = ''): string {
  const parts: string[] = []

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue

    const paramKey = prefix ? `${prefix}[${key}]` : key

    if (Array.isArray(value)) {
      value.forEach((item, index) => {
        if (typeof item === 'object' && item !== null) {
          parts.push(serializeParams(item as Record<string, unknown>, `${paramKey}[${index}]`))
        } else {
          parts.push(`${encodeURIComponent(paramKey)}=${encodeURIComponent(String(item))}`)
        }
      })
    } else if (typeof value === 'object') {
      parts.push(serializeParams(value as Record<string, unknown>, paramKey))
    } else {
      parts.push(`${encodeURIComponent(paramKey)}=${encodeURIComponent(String(value))}`)
    }
  }

  return parts.filter(Boolean).join('&')
}

export class ApiClient {
  private baseURL: string
  private defaultHeaders: Record<string, string>
  private defaultCache?: RequestCache
  private defaultNext?: { revalidate?: number | false; tags?: string[] }

  constructor(config: ApiClientConfig) {
    this.baseURL = config.baseURL
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      ...(config.token && { Authorization: `Bearer ${config.token}` }),
      ...config.headers,
    }
    this.defaultCache = config.cache
    this.defaultNext = config.next
  }

  private async request<T>(
    method: string,
    url: string,
    data?: unknown,
    config?: RequestConfig
  ): Promise<T> {
    let fullUrl = `${this.baseURL}${url}`

    // Add query params if present
    if (config?.params) {
      const queryString = serializeParams(config.params)
      if (queryString) {
        fullUrl += `?${queryString}`
      }
    }

    const fetchOptions: RequestInit & { next?: { revalidate?: number | false; tags?: string[] } } = {
      method,
      headers: {
        ...this.defaultHeaders,
        ...config?.headers,
      },
      ...(this.defaultCache && { cache: this.defaultCache }),
      ...(config?.cache && { cache: config.cache }),
      ...(this.defaultNext && { next: this.defaultNext }),
      ...(config?.next && { next: config.next }),
    }

    if (data !== undefined && method !== 'GET' && method !== 'HEAD') {
      fetchOptions.body = JSON.stringify(data)
    }

    const response = await fetch(fullUrl, fetchOptions)

    if (!response.ok) {
      const errorBody = await response.text()
      throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorBody}`)
    }

    // Handle empty responses
    const contentType = response.headers.get('content-type')
    if (response.status === 204 || !contentType?.includes('application/json')) {
      return undefined as T
    }

    return response.json()
  }

  async get<T>(url: string, config?: RequestConfig): Promise<T> {
    return this.request<T>('GET', url, undefined, config)
  }

  async post<T>(url: string, data?: unknown, config?: RequestConfig): Promise<T> {
    return this.request<T>('POST', url, data, config)
  }

  async put<T>(url: string, data?: unknown, config?: RequestConfig): Promise<T> {
    return this.request<T>('PUT', url, data, config)
  }

  async delete<T>(url: string, config?: RequestConfig): Promise<T> {
    return this.request<T>('DELETE', url, undefined, config)
  }

  // Strapi-specific methods
  async find<T>(
    contentType: string,
    params?: {
      filters?: Record<string, unknown>
      populate?: string | string[] | Record<string, unknown>
      sort?: string | string[]
      pagination?: {
        page?: number
        pageSize?: number
        start?: number
        limit?: number
      }
      fields?: string[]
      locale?: string
    }
  ): Promise<T> {
    return this.get<T>(`/${contentType}`, { params })
  }

  async findOne<T>(contentType: string, id: number | string, params?: { populate?: string }): Promise<T> {
    return this.get<T>(`/${contentType}/${id}`, { params })
  }

  async create<T>(contentType: string, data: Record<string, unknown>): Promise<T> {
    return this.post<T>(`/${contentType}`, { data })
  }

  async update<T>(contentType: string, id: number | string, data: Record<string, unknown>): Promise<T> {
    return this.put<T>(`/${contentType}/${id}`, { data })
  }

  async remove<T>(contentType: string, id: number | string): Promise<T> {
    return this.delete<T>(`/${contentType}/${id}`)
  }
}

// Factory function for creating API client
export function createApiClient(config: ApiClientConfig): ApiClient {
  return new ApiClient(config)
}

// Default export
export default ApiClient
