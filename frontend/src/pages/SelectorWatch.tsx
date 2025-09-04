import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { AlertTriangle, CheckCircle, Clock, Eye, Code, Download, Copy, Check } from 'lucide-react'
import { useState } from 'react'
import { apiService } from '../services/api'
// import { SelectorAlert } from '../services/api'


export function SelectorWatch() {
  const queryClient = useQueryClient()
  const [copiedPatch, setCopiedPatch] = useState<string | null>(null)
  const [expandedAlert, setExpandedAlert] = useState<string | null>(null)

  const { data: alerts, isLoading, error } = useQuery({
    queryKey: ['alerts'],
    queryFn: async () => {
      try {
        return await apiService.getSelectorAlerts()
      } catch (error) {
        // Return demo data if API fails
        return {
          alerts: [
            {
              id: 'alert-1',
              engine: 'google',
              ts: new Date().toISOString(),
              dom_signature: 'abc123',
              break_rate: 0.85,
              suggested_patch: {
                'title': '.title-selector',
                'description': '.desc-selector'
              },
              status: 'open',
              current_selectors: {
                'title': '.old-title-selector',
                'description': '.old-desc-selector'
              },
              patch_confidence: 0.92,
              affected_queries: ['test query 1', 'test query 2']
            },
            {
              id: 'alert-2',
              engine: 'bing',
              ts: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
              dom_signature: 'def456',
              break_rate: 0.65,
              suggested_patch: {
                'result': '.result-selector'
              },
              status: 'ack',
              current_selectors: {
                'result': '.old-result-selector'
              },
              patch_confidence: 0.78,
              affected_queries: ['test query 3']
            }
          ]
        }
      }
    },
    refetchInterval: 30000, // Refresh every 30 seconds
    retry: false, // Don't retry on failure
  })

  const acknowledgeMutation = useMutation({
    mutationFn: (alertId: string) => apiService.acknowledgeAlert(alertId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] })
    }
  })

  const resolveMutation = useMutation({
    mutationFn: (alertId: string) => apiService.resolveAlert(alertId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] })
    }
  })

  const handleAcknowledge = (alertId: string) => {
    acknowledgeMutation.mutate(alertId)
  }

  const handleResolve = (alertId: string) => {
    resolveMutation.mutate(alertId)
  }

  const generatePatch = (alert: any) => {
    const patch = {
      engine: alert.engine,
      timestamp: new Date().toISOString(),
      confidence: alert.patch_confidence || 0.85,
      changes: alert.suggested_patch,
      current_selectors: alert.current_selectors || {},
      affected_queries: alert.affected_queries || []
    }
    return JSON.stringify(patch, null, 2)
  }

  const copyToClipboard = async (text: string, alertId: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedPatch(alertId)
      setTimeout(() => setCopiedPatch(null), 2000)
    } catch (err) {
      console.error('Failed to copy: ', err)
    }
  }

  const downloadPatch = (alert: any) => {
    const patch = generatePatch(alert)
    const blob = new Blob([patch], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `selector-patch-${alert.engine}-${alert.id}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />
      case 'ack':
        return <Clock className="w-5 h-5 text-blue-500" />
      case 'resolved':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      default:
        return null
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-yellow-100 text-yellow-800'
      case 'ack':
        return 'bg-blue-100 text-blue-800'
      case 'resolved':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Selector Watch</h1>
          <p className="mt-1 text-sm text-gray-500">
            Monitor selector breakage and manage alerts
          </p>
        </div>
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-800">
            Error loading alerts: {error.message}
          </p>
        </div>
      </div>
    )
  }

  const alertList = alerts?.alerts || []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Selector Watch</h1>
        <p className="mt-1 text-sm text-gray-500">
          Monitor selector breakage and manage alerts
        </p>
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-sm text-blue-800">
            📝 Showing demo data. Backend API calls will work when the server is running.
          </p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-6 w-6 text-yellow-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Open Alerts
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {alertList.filter((alert: any) => alert.status === 'open').length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Clock className="h-6 w-6 text-blue-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Acknowledged
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {alertList.filter((alert: any) => alert.status === 'ack').length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircle className="h-6 w-6 text-green-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Resolved
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {alertList.filter((alert: any) => alert.status === 'resolved').length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Alerts List */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Selector Alerts</h3>
        </div>
        
        {alertList.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <CheckCircle className="mx-auto h-12 w-12 text-green-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No alerts</h3>
            <p className="mt-1 text-sm text-gray-500">
              All selectors are working correctly.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {alertList.map((alert: any) => (
              <div key={alert.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(alert.status)}
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">
                        {alert.engine} Selector Breakage
                      </h4>
                      <p className="text-sm text-gray-500">
                        Break rate: {(alert.break_rate * 100).toFixed(1)}% | 
                        Detected: {new Date(alert.ts).toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Signature: {alert.dom_signature}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(alert.status)}`}>
                      {alert.status}
                    </span>
                    
                    {alert.status === 'open' && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleAcknowledge(alert.id)}
                          disabled={acknowledgeMutation.isPending}
                          className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                        >
                          Acknowledge
                        </button>
                        <button
                          onClick={() => handleResolve(alert.id)}
                          disabled={resolveMutation.isPending}
                          className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                        >
                          Resolve
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Advanced Patch Information */}
                {Object.keys(alert.suggested_patch).length > 0 && (
                  <div className="mt-4 space-y-4">
                    {/* Patch Header */}
                    <div className="flex items-center justify-between">
                      <h5 className="text-sm font-medium text-gray-900">Automated Patch Generation</h5>
                      <div className="flex items-center space-x-2">
                        {alert.patch_confidence && (
                          <span className="text-xs text-gray-500">
                            Confidence: {(alert.patch_confidence * 100).toFixed(1)}%
                          </span>
                        )}
                        <button
                          onClick={() => setExpandedAlert(expandedAlert === alert.id ? null : alert.id)}
                          className="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-600 hover:text-blue-800"
                        >
                          <Code className="w-3 h-3 mr-1" />
                          {expandedAlert === alert.id ? 'Hide' : 'Show'} Patch
                        </button>
                      </div>
                    </div>

                    {/* Patch Actions */}
                    <div className="flex space-x-2">
                      <button
                        onClick={() => copyToClipboard(generatePatch(alert), alert.id)}
                        className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                      >
                        {copiedPatch === alert.id ? (
                          <Check className="w-3 h-3 mr-1 text-green-500" />
                        ) : (
                          <Copy className="w-3 h-3 mr-1" />
                        )}
                        {copiedPatch === alert.id ? 'Copied!' : 'Copy Patch'}
                      </button>
                      <button
                        onClick={() => downloadPatch(alert)}
                        className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <Download className="w-3 h-3 mr-1" />
                        Download
                      </button>
                    </div>

                    {/* Expanded Patch Details */}
                    {expandedAlert === alert.id && (
                      <div className="space-y-3">
                        {/* Current vs New Selectors */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="p-3 bg-red-50 rounded-md">
                            <h6 className="text-xs font-medium text-red-800 mb-2">Current (Broken)</h6>
                            <div className="space-y-1">
                              {Object.entries(alert.current_selectors || {}).map(([key, value]) => (
                                <div key={key} className="text-xs">
                                  <span className="font-medium text-red-700">{key}:</span>
                                  <code className="ml-1 text-red-600 bg-white px-1 rounded">{value}</code>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="p-3 bg-green-50 rounded-md">
                            <h6 className="text-xs font-medium text-green-800 mb-2">Suggested (Fixed)</h6>
                            <div className="space-y-1">
                              {Object.entries(alert.suggested_patch).map(([key, value]) => (
                                <div key={key} className="text-xs">
                                  <span className="font-medium text-green-700">{key}:</span>
                                  <code className="ml-1 text-green-600 bg-white px-1 rounded">{value}</code>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Affected Queries */}
                        {alert.affected_queries && alert.affected_queries.length > 0 && (
                          <div className="p-3 bg-yellow-50 rounded-md">
                            <h6 className="text-xs font-medium text-yellow-800 mb-2">
                              Affected Queries ({alert.affected_queries.length})
                            </h6>
                            <div className="flex flex-wrap gap-1">
                              {alert.affected_queries.slice(0, 5).map((query, index) => (
                                <span
                                  key={index}
                                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"
                                >
                                  {query}
                                </span>
                              ))}
                              {alert.affected_queries.length > 5 && (
                                <span className="text-xs text-yellow-600">
                                  +{alert.affected_queries.length - 5} more
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Full Patch JSON */}
                        <div className="p-3 bg-gray-50 rounded-md">
                          <h6 className="text-xs font-medium text-gray-800 mb-2">Complete Patch JSON</h6>
                          <pre className="text-xs text-gray-600 bg-white p-2 rounded border overflow-x-auto">
                            {generatePatch(alert)}
                          </pre>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
