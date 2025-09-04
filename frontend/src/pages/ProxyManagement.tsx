import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  RefreshCw, 
  Plus, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Globe,
  Activity,
  Settings,
  Download,
  Upload
} from 'lucide-react'

interface Proxy {
  id: string
  host: string
  port: number
  username?: string
  password?: string
  type: 'http' | 'socks4' | 'socks5'
  status: 'active' | 'inactive' | 'testing' | 'failed'
  last_checked: string
  response_time?: number
  success_rate: number
  country?: string
  provider?: string
  usage_count: number
  last_used?: string
}

interface ProxyPool {
  total: number
  active: number
  inactive: number
  testing: number
  failed: number
  average_response_time: number
  overall_success_rate: number
}

export function ProxyManagement() {
  const queryClient = useQueryClient()
  const [showAddForm, setShowAddForm] = useState(false)
  const [newProxy, setNewProxy] = useState({
    host: '',
    port: 8080,
    username: '',
    password: '',
    type: 'http' as const
  })
  const [selectedProxies, setSelectedProxies] = useState<string[]>([])

  const { data: proxyPool, isLoading: poolLoading } = useQuery({
    queryKey: ['proxy-pool'],
    queryFn: async () => {
      // Mock data - replace with actual API call
      return {
        total: 150,
        active: 120,
        inactive: 15,
        testing: 10,
        failed: 5,
        average_response_time: 245,
        overall_success_rate: 0.89
      } as ProxyPool
    },
    refetchInterval: 30000
  })

  const { data: proxies, isLoading: proxiesLoading } = useQuery({
    queryKey: ['proxies'],
    queryFn: async () => {
      // Mock data - replace with actual API call
      return {
        proxies: [
          {
            id: '1',
            host: '192.168.1.100',
            port: 8080,
            username: 'user1',
            type: 'http',
            status: 'active',
            last_checked: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
            response_time: 180,
            success_rate: 0.95,
            country: 'US',
            provider: 'ProxyProvider1',
            usage_count: 1250,
            last_used: new Date(Date.now() - 1000 * 60 * 2).toISOString()
          },
          {
            id: '2',
            host: '192.168.1.101',
            port: 3128,
            type: 'http',
            status: 'testing',
            last_checked: new Date(Date.now() - 1000 * 30).toISOString(),
            response_time: 320,
            success_rate: 0.78,
            country: 'UK',
            provider: 'ProxyProvider2',
            usage_count: 0
          },
          {
            id: '3',
            host: '192.168.1.102',
            port: 1080,
            type: 'socks5',
            status: 'failed',
            last_checked: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
            success_rate: 0.12,
            country: 'DE',
            provider: 'ProxyProvider3',
            usage_count: 45
          }
        ]
      }
    },
    refetchInterval: 10000
  })

  const testProxyMutation = useMutation({
    mutationFn: async (proxyId: string) => {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      return { success: true }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proxies'] })
    }
  })

  const addProxyMutation = useMutation({
    mutationFn: async (proxy: typeof newProxy) => {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      return { success: true }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proxies'] })
      setShowAddForm(false)
      setNewProxy({
        host: '',
        port: 8080,
        username: '',
        password: '',
        type: 'http'
      })
    }
  })

  const deleteProxyMutation = useMutation({
    mutationFn: async (proxyIds: string[]) => {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      return { success: true }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proxies'] })
      setSelectedProxies([])
    }
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'testing':
        return <Clock className="w-4 h-4 text-yellow-500 animate-pulse" />
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />
      case 'inactive':
        return <XCircle className="w-4 h-4 text-gray-400" />
      default:
        return <Clock className="w-4 h-4 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'testing':
        return 'bg-yellow-100 text-yellow-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      case 'inactive':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const handleAddProxy = (e: React.FormEvent) => {
    e.preventDefault()
    addProxyMutation.mutate(newProxy)
  }

  const handleTestProxy = (proxyId: string) => {
    testProxyMutation.mutate(proxyId)
  }

  const handleDeleteSelected = () => {
    if (selectedProxies.length > 0) {
      deleteProxyMutation.mutate(selectedProxies)
    }
  }

  const handleSelectProxy = (proxyId: string) => {
    setSelectedProxies(prev => 
      prev.includes(proxyId) 
        ? prev.filter(id => id !== proxyId)
        : [...prev, proxyId]
    )
  }

  const handleSelectAll = () => {
    const allProxyIds = proxies?.proxies?.map(p => p.id) || []
    setSelectedProxies(
      selectedProxies.length === allProxyIds.length ? [] : allProxyIds
    )
  }

  if (poolLoading || proxiesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const proxyList = proxies?.proxies || []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Proxy Management</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage proxy pool for search engine scraping
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Proxy
          </button>
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
            <Upload className="w-4 h-4 mr-2" />
            Import
          </button>
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Pool Statistics */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Globe className="h-6 w-6 text-blue-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Proxies
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">{proxyPool?.total}</dd>
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
                    Active
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">{proxyPool?.active}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Activity className="h-6 w-6 text-yellow-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Avg Response Time
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">{proxyPool?.average_response_time}ms</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Settings className="h-6 w-6 text-purple-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Success Rate
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {((proxyPool?.overall_success_rate || 0) * 100).toFixed(1)}%
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Proxy Form */}
      {showAddForm && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Proxy</h3>
          <form onSubmit={handleAddProxy} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Host</label>
                <input
                  type="text"
                  value={newProxy.host}
                  onChange={(e) => setNewProxy({...newProxy, host: e.target.value})}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Port</label>
                <input
                  type="number"
                  value={newProxy.port}
                  onChange={(e) => setNewProxy({...newProxy, port: parseInt(e.target.value)})}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Type</label>
                <select
                  value={newProxy.type}
                  onChange={(e) => setNewProxy({...newProxy, type: e.target.value as any})}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="http">HTTP</option>
                  <option value="socks4">SOCKS4</option>
                  <option value="socks5">SOCKS5</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Username</label>
                <input
                  type="text"
                  value={newProxy.username}
                  onChange={(e) => setNewProxy({...newProxy, username: e.target.value})}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <input
                  type="password"
                  value={newProxy.password}
                  onChange={(e) => setNewProxy({...newProxy, password: e.target.value})}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={addProxyMutation.isPending}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
              >
                {addProxyMutation.isPending ? 'Adding...' : 'Add Proxy'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Proxy List */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Proxy List</h3>
            <div className="flex items-center space-x-3">
              {selectedProxies.length > 0 && (
                <button
                  onClick={handleDeleteSelected}
                  disabled={deleteProxyMutation.isPending}
                  className="inline-flex items-center px-3 py-2 border border-red-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Selected ({selectedProxies.length})
                </button>
              )}
              <button
                onClick={handleSelectAll}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                {selectedProxies.length === proxyList.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>
          </div>
        </div>

        {proxyList.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <Globe className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No proxies</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by adding your first proxy.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedProxies.length === proxyList.length}
                      onChange={handleSelectAll}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Proxy
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Response Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Success Rate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usage
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Checked
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {proxyList.map((proxy) => (
                  <tr key={proxy.id} className={selectedProxies.includes(proxy.id) ? 'bg-blue-50' : ''}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedProxies.includes(proxy.id)}
                        onChange={() => handleSelectProxy(proxy.id)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {proxy.host}:{proxy.port}
                        </div>
                        <div className="text-sm text-gray-500">
                          {proxy.type.toUpperCase()} • {proxy.country} • {proxy.provider}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getStatusIcon(proxy.status)}
                        <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(proxy.status)}`}>
                          {proxy.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {proxy.response_time ? `${proxy.response_time}ms` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {(proxy.success_rate * 100).toFixed(1)}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {proxy.usage_count}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(proxy.last_checked).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleTestProxy(proxy.id)}
                        disabled={testProxyMutation.isPending}
                        className="text-blue-600 hover:text-blue-900 disabled:opacity-50"
                      >
                        <RefreshCw className={`w-4 h-4 ${testProxyMutation.isPending ? 'animate-spin' : ''}`} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
