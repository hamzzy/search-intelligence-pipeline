const API_BASE_URL = ''

export interface SearchResult {
  query: string
  engine: string
  ts: string
  organic: Array<{
    rank: number
    title: string
    url: string
    snippet: string
    rich_type: string | null
  }>
  ads: any[]
  paa: string[]
  raw_snapshot_uri: string
  dom_signature: string
}

export interface JobResponse {
  job_id: string
  status: string
  message?: string
}

export interface SelectorAlert {
  id: string
  engine: string
  ts: string
  dom_signature: string
  break_rate: number
  suggested_patch: Record<string, string>
  status: 'open' | 'ack' | 'resolved'
  current_selectors?: Record<string, string>
  patch_confidence?: number
  affected_queries?: string[]
}

export interface AutocompleteResult {
  query: string
  suggestions: string[]
  engine: string
  ts: string
}


class ApiService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    })

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  // Search API
  async search(query: string, engine: string = 'google', fresh: boolean = false): Promise<SearchResult | JobResponse> {
    const params = new URLSearchParams({
      q: query,
      engine,
      fresh: fresh.toString()
    })
    return this.request<SearchResult | JobResponse>(`/v1/search?${params}`)
  }

  // Job status
  async getJobStatus(jobId: string): Promise<JobResponse> {
    return this.request<JobResponse>(`/v1/jobs/${jobId}`)
  }

  // Autocomplete
  async getAutocomplete(query: string, engine: string = 'google'): Promise<AutocompleteResult> {
    const params = new URLSearchParams({
      q: query,
      engine
    })
    return this.request<AutocompleteResult>(`/v1/autocomplete?${params}`)
  }


  // Selector alerts
  async getSelectorAlerts(): Promise<{ alerts: SelectorAlert[] }> {
    return this.request<{ alerts: SelectorAlert[] }>('/v1/selectors/alerts')
  }

  async acknowledgeAlert(alertId: string): Promise<void> {
    await this.request(`/v1/selectors/alerts/${alertId}/ack`, {
      method: 'PATCH'
    })
  }

  async resolveAlert(alertId: string): Promise<void> {
    await this.request(`/v1/selectors/alerts/${alertId}/resolve`, {
      method: 'PATCH'
    })
  }

  // Health and metrics
  async getHealth(): Promise<{ status: string }> {
    return this.request<{ status: string }>('/healthz')
  }

  async getMetrics(): Promise<any> {
    return this.request<any>('/metrics')
  }

  // Jobs API
  async getJobs(page: number = 1, perPage: number = 50): Promise<{ jobs: any[], pagination: any }> {
    const params = new URLSearchParams({
      page: page.toString(),
      per_page: perPage.toString()
    })
    return this.request<{ jobs: any[], pagination: any }>(`/v1/jobs?${params}`)
  }

  // Trends API
  async getTrends(days: number = 7): Promise<any> {
    const params = new URLSearchParams({
      days: days.toString()
    })
    return this.request<any>(`/v1/trends?${params}`)
  }

  // Search Results API
  async getSearchResults(page: number = 1, perPage: number = 20): Promise<{ search_results: any[], pagination: any }> {
    const params = new URLSearchParams({
      page: page.toString(),
      per_page: perPage.toString()
    })
    return this.request<{ search_results: any[], pagination: any }>(`/v1/search-results?${params}`)
  }
}

export const apiService = new ApiService()
