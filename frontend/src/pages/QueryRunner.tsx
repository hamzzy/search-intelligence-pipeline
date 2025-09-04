import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { Search, ExternalLink, Eye, RefreshCw } from 'lucide-react'
import { apiService } from '../services/api'
// Temporarily commenting out type imports due to module resolution issues
// import { SearchResult, JobResponse } from '../services/api'


export function QueryRunner() {
  const [query, setQuery] = useState('')
  const [engine, setEngine] = useState('google')
  const [fresh, setFresh] = useState(false)
  const [currentJobId, setCurrentJobId] = useState<string | null>(null)

  const searchMutation = useMutation({
    mutationFn: async ({ query, engine, fresh }: { query: string; engine: string; fresh: boolean }) => {
      return apiService.search(query, engine, fresh)
    },
    onSuccess: (data: any) => {
      if ('job_id' in data) {
        setCurrentJobId(data.job_id)
      }
    }
  })

  const { data: jobStatus, refetch: refetchJob } = useQuery({
    queryKey: ['job', currentJobId],
    queryFn: async () => {
      if (!currentJobId) return null
      return apiService.getJobStatus(currentJobId)
    },
    enabled: !!currentJobId,
    refetchInterval: (data) => {
      if (data?.status === 'done' || data?.status === 'failed') {
        return false
      }
      return 2000 // Poll every 2 seconds
    }
  })

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return
    
    searchMutation.mutate({ query: query.trim(), engine, fresh })
  }

  const result = searchMutation.data && 'query' in searchMutation.data 
    ? searchMutation.data as SearchResult
    : jobStatus && 'query' in jobStatus 
    ? jobStatus as SearchResult
    : null

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Query Runner</h1>
        <p className="mt-1 text-sm text-gray-500">
          Test search queries across different engines
        </p>
      </div>

      {/* Search Form */}
      <div className="bg-white p-6 rounded-lg shadow">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <label htmlFor="query" className="block text-sm font-medium text-gray-700">
                Search Query
              </label>
              <input
                type="text"
                id="query"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter your search query..."
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                required
              />
            </div>
            <div>
              <label htmlFor="engine" className="block text-sm font-medium text-gray-700">
                Search Engine
              </label>
              <select
                id="engine"
                value={engine}
                onChange={(e) => setEngine(e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="google">Google</option>
                <option value="bing">Bing</option>
                <option value="ddg">DuckDuckGo</option>
              </select>
            </div>
          </div>
          
          <div className="flex items-center">
            <input
              id="fresh"
              type="checkbox"
              checked={fresh}
              onChange={(e) => setFresh(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="fresh" className="ml-2 block text-sm text-gray-900">
              Force fresh results (bypass cache)
            </label>
          </div>

          <button
            type="submit"
            disabled={searchMutation.isPending || !query.trim()}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <Search className="w-4 h-4 mr-2" />
            {searchMutation.isPending ? 'Searching...' : 'Search'}
          </button>
        </form>
      </div>

      {/* Job Status */}
      {currentJobId && jobStatus && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Job Status</h3>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-500">Job ID: {currentJobId}</span>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              jobStatus.status === 'done' ? 'bg-green-100 text-green-800' :
              jobStatus.status === 'failed' ? 'bg-red-100 text-red-800' :
              jobStatus.status === 'running' ? 'bg-blue-100 text-blue-800' :
              'bg-yellow-100 text-yellow-800'
            }`}>
              {jobStatus.status}
            </span>
            {jobStatus.status === 'running' && (
              <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />
            )}
          </div>
          {jobStatus.error && (
            <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-800">{jobStatus.error}</p>
            </div>
          )}
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-6">
          {/* Result Header */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  Results for "{result.query}"
                </h3>
                <p className="text-sm text-gray-500">
                  Engine: {result.engine} | Timestamp: {new Date(result.ts).toLocaleString()}
                </p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => window.open(result.raw_snapshot_uri, '_blank')}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View Raw HTML
                </button>
              </div>
            </div>
            <div className="mt-2 text-xs text-gray-500">
              DOM Signature: {result.dom_signature}
            </div>
          </div>

          {/* Organic Results */}
          {result.organic.length > 0 && (
            <div className="bg-white p-6 rounded-lg shadow">
              <h4 className="text-lg font-medium text-gray-900 mb-4">Organic Results</h4>
              <div className="space-y-4">
                {result.organic.map((item) => (
                  <div key={item.rank} className="border-l-4 border-blue-500 pl-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h5 className="text-sm font-medium text-blue-600 hover:text-blue-800">
                          <a href={item.url} target="_blank" rel="noopener noreferrer">
                            {item.title}
                          </a>
                        </h5>
                        <p className="text-sm text-gray-600 mt-1">{item.snippet}</p>
                        <p className="text-xs text-gray-500 mt-1">{item.url}</p>
                      </div>
                      <span className="ml-4 text-xs text-gray-500">#{item.rank}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* People Also Ask */}
          {result.paa.length > 0 && (
            <div className="bg-white p-6 rounded-lg shadow">
              <h4 className="text-lg font-medium text-gray-900 mb-4">People Also Ask</h4>
              <div className="space-y-2">
                {result.paa.map((question, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-md">
                    <p className="text-sm text-gray-700">{question}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Related Searches */}
          {result.related.length > 0 && (
            <div className="bg-white p-6 rounded-lg shadow">
              <h4 className="text-lg font-medium text-gray-900 mb-4">Related Searches</h4>
              <div className="flex flex-wrap gap-2">
                {result.related.map((term, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                  >
                    {term}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
