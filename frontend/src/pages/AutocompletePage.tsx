import { useState, useRef } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { Search, RefreshCw, Clock, CheckCircle, XCircle } from 'lucide-react'
import { apiService } from '../services/api'
import type { AutocompleteResult } from '../services/api'

export function AutocompletePage() {
  const [query, setQuery] = useState('')
  const [engine, setEngine] = useState('google')

  const [isRetrying, setIsRetrying] = useState(false)
  const currentJobIdRef = useRef<string | null>(null)
  const isProcessingRef = useRef(false)

  const autocompleteMutation = useMutation({
    mutationFn: async ({ query, engine }: { query: string; engine: string }) => {
      // Prevent duplicate requests
      if (isProcessingRef.current) {
        throw new Error('Request already in progress')
      }
      isProcessingRef.current = true
      return apiService.getAutocomplete(query, engine)
    },
    onSuccess: (data: any) => {
      isProcessingRef.current = false
      
      // If we got a job response, store the job ID but don't auto-retry
      if (data && 'job_id' in data) {
        const jobId = data.job_id
        currentJobIdRef.current = jobId
        setIsRetrying(false)
      } else {
        // Got actual results, reset retry state
        currentJobIdRef.current = null
        setIsRetrying(false)
      }
    },
    onError: () => {
      isProcessingRef.current = false
      setIsRetrying(false)
    }
  })

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return
    
    autocompleteMutation.mutate({ query: query.trim(), engine })
  }

  const result = autocompleteMutation.data as AutocompleteResult | undefined
  const isJobResponse = result && 'job_id' in result

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Autocomplete Testing</h1>
        <p className="mt-2 text-gray-600">
          Test search autocomplete suggestions across different search engines
        </p>
      </div>

      {/* Search Form */}
      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label htmlFor="query" className="block text-sm font-medium text-gray-700 mb-2">
                Search Query
              </label>
              <div className="relative">
                <input
                  id="query"
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Enter search query..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <Search className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>
            
            <div>
              <label htmlFor="engine" className="block text-sm font-medium text-gray-700 mb-2">
                Search Engine
              </label>
              <select
                id="engine"
                value={engine}
                onChange={(e) => setEngine(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="google">Google</option>
                <option value="bing">Bing</option>
                <option value="ddg">DuckDuckGo</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={autocompleteMutation.isPending || !query.trim()}
            className="w-full md:w-auto px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {autocompleteMutation.isPending ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Testing...
              </>
            ) : (
              <>
                <Search className="h-4 w-4" />
                Test Autocomplete
              </>
            )}
          </button>
        </form>
      </div>

      {/* Results */}
      {autocompleteMutation.error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <XCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="mt-1 text-sm text-red-700">
                {autocompleteMutation.error.message}
              </p>
            </div>
          </div>
        </div>
      )}

      {result && !isJobResponse && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Autocomplete Results</h3>
            <p className="text-sm text-gray-600">
              Found {result.suggestions?.length || 0} suggestions for "{result.query}" on {result.engine}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Generated at: {new Date(result.ts).toLocaleString()}
            </p>
          </div>
          
          <div className="p-6">
            {result.suggestions && result.suggestions.length > 0 ? (
              <div className="space-y-2">
                {result.suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="flex items-center p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors"
                  >
                    <span className="text-sm font-medium text-gray-500 w-8">
                      {index + 1}.
                    </span>
                    <span className="text-gray-900 flex-1">{suggestion}</span>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No autocomplete suggestions found</p>
              </div>
            )}
          </div>
        </div>
      )}

      {result && isJobResponse && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <div className="flex">
            <Clock className="h-5 w-5 text-yellow-400" />
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-medium text-yellow-800">Job Queued</h3>
              <p className="mt-1 text-sm text-yellow-700">
                Your autocomplete request has been queued. Click "Check Status" to see if it's ready.
              </p>
              <p className="text-xs text-yellow-600 mt-1">
                Job ID: {(result as any).job_id}
              </p>
            </div>
            <button
              onClick={() => autocompleteMutation.mutate({ query, engine })}
              disabled={isLoading}
              className="ml-4 px-3 py-1 bg-yellow-600 text-white text-sm rounded-md hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
            >
              <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
              Check Status
            </button>
          </div>
        </div>
      )}

      {/* Usage Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <h4 className="text-sm font-medium text-blue-800 mb-2">How to use:</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Enter a partial search query to get autocomplete suggestions</li>
          <li>• Try different search engines to compare results</li>
          <li>• Suggestions are cached for 1 hour to improve performance</li>
          <li>• Use this to test and monitor autocomplete functionality</li>
        </ul>
      </div>
    </div>
  )
}
