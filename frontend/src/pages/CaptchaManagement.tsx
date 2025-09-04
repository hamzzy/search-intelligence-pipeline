import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  Shield, 
  CheckCircle, 
  XCircle, 
  Clock, 
  DollarSign,
  Activity,
  Settings,
  RefreshCw,
  Eye,
  EyeOff
} from 'lucide-react'

interface CaptchaService {
  id: string
  name: string
  type: '2captcha' | 'anticaptcha' | 'capmonster' | 'custom'
  api_key: string
  is_active: boolean
  balance?: number
  currency?: string
  success_rate: number
  average_solve_time: number
  total_solved: number
  last_used?: string
  cost_per_solve: number
}

interface CaptchaTask {
  id: string
  service_id: string
  task_type: 'image' | 'recaptcha_v2' | 'recaptcha_v3' | 'hcaptcha'
  status: 'pending' | 'processing' | 'solved' | 'failed'
  created_at: string
  solved_at?: string
  cost: number
  image_url?: string
  site_key?: string
  page_url?: string
  solution?: string
  error_message?: string
}

export function CaptchaManagement() {
  const queryClient = useQueryClient()
  const [showAddForm, setShowAddForm] = useState(false)
  const [showApiKey, setShowApiKey] = useState<Record<string, boolean>>({})
  const [newService, setNewService] = useState({
    name: '',
    type: '2captcha' as const,
    api_key: ''
  })

  const { data: services, isLoading: servicesLoading } = useQuery({
    queryKey: ['captcha-services'],
    queryFn: async () => {
      // Mock data - replace with actual API call
      return {
        services: [
          {
            id: '1',
            name: '2Captcha Primary',
            type: '2captcha',
            api_key: 'sk_1234567890abcdef',
            is_active: true,
            balance: 15.50,
            currency: 'USD',
            success_rate: 0.95,
            average_solve_time: 12.5,
            total_solved: 1250,
            last_used: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
            cost_per_solve: 0.001
          },
          {
            id: '2',
            name: 'AntiCaptcha Backup',
            type: 'anticaptcha',
            api_key: 'sk_abcdef1234567890',
            is_active: false,
            balance: 8.25,
            currency: 'USD',
            success_rate: 0.92,
            average_solve_time: 15.2,
            total_solved: 850,
            last_used: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
            cost_per_solve: 0.0015
          }
        ]
      }
    },
    refetchInterval: 30000
  })

  const { data: recentTasks, isLoading: tasksLoading } = useQuery({
    queryKey: ['captcha-tasks'],
    queryFn: async () => {
      // Mock data - replace with actual API call
      return {
        tasks: [
          {
            id: 'task-1',
            service_id: '1',
            task_type: 'recaptcha_v2',
            status: 'solved',
            created_at: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
            solved_at: new Date(Date.now() - 1000 * 60 * 4).toISOString(),
            cost: 0.001,
            site_key: '6Le-wvkSAAAAAPBMRTvw0Q4Muexq9bi0DJwx_mJ-',
            page_url: 'https://example.com/login',
            solution: '03AGdBq25...'
          },
          {
            id: 'task-2',
            service_id: '1',
            task_type: 'image',
            status: 'processing',
            created_at: new Date(Date.now() - 1000 * 30).toISOString(),
            cost: 0.001,
            image_url: 'https://example.com/captcha.jpg'
          },
          {
            id: 'task-3',
            service_id: '2',
            task_type: 'hcaptcha',
            status: 'failed',
            created_at: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
            cost: 0.0015,
            error_message: 'Invalid site key'
          }
        ]
      }
    },
    refetchInterval: 5000
  })

  const addServiceMutation = useMutation({
    mutationFn: async (service: typeof newService) => {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      return { success: true }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['captcha-services'] })
      setShowAddForm(false)
      setNewService({
        name: '',
        type: '2captcha',
        api_key: ''
      })
    }
  })

  const toggleServiceMutation = useMutation({
    mutationFn: async (serviceId: string) => {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 500))
      return { success: true }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['captcha-services'] })
    }
  })

  const testServiceMutation = useMutation({
    mutationFn: async (serviceId: string) => {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      return { success: true }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['captcha-services'] })
    }
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'solved':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'processing':
        return <Clock className="w-4 h-4 text-yellow-500 animate-pulse" />
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />
      case 'pending':
        return <Clock className="w-4 h-4 text-gray-400" />
      default:
        return <Clock className="w-4 h-4 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'solved':
        return 'bg-green-100 text-green-800'
      case 'processing':
        return 'bg-yellow-100 text-yellow-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      case 'pending':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getTaskTypeIcon = (type: string) => {
    switch (type) {
      case 'recaptcha_v2':
      case 'recaptcha_v3':
        return '🛡️'
      case 'hcaptcha':
        return '🔒'
      case 'image':
        return '🖼️'
      default:
        return '❓'
    }
  }

  const handleAddService = (e: React.FormEvent) => {
    e.preventDefault()
    addServiceMutation.mutate(newService)
  }

  const handleToggleService = (serviceId: string) => {
    toggleServiceMutation.mutate(serviceId)
  }

  const handleTestService = (serviceId: string) => {
    testServiceMutation.mutate(serviceId)
  }

  const toggleApiKeyVisibility = (serviceId: string) => {
    setShowApiKey(prev => ({
      ...prev,
      [serviceId]: !prev[serviceId]
    }))
  }

  if (servicesLoading || tasksLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const serviceList = services?.services || []
  const taskList = recentTasks?.tasks || []

  // Calculate totals
  const totalBalance = serviceList.reduce((sum, service) => sum + (service.balance || 0), 0)
  const totalSolved = serviceList.reduce((sum, service) => sum + service.total_solved, 0)
  const averageSuccessRate = serviceList.length > 0 
    ? serviceList.reduce((sum, service) => sum + service.success_rate, 0) / serviceList.length 
    : 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">CAPTCHA Management</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage CAPTCHA solving services and monitor task execution
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
        >
          <Shield className="w-4 h-4 mr-2" />
          Add Service
        </button>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DollarSign className="h-6 w-6 text-green-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Balance
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    ${totalBalance.toFixed(2)}
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
                <CheckCircle className="h-6 w-6 text-blue-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Solved
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">{totalSolved}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Activity className="h-6 w-6 text-purple-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Success Rate
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {(averageSuccessRate * 100).toFixed(1)}%
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
                <Settings className="h-6 w-6 text-yellow-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Active Services
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {serviceList.filter(s => s.is_active).length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Service Form */}
      {showAddForm && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Add CAPTCHA Service</h3>
          <form onSubmit={handleAddService} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">Service Name</label>
                <input
                  type="text"
                  value={newService.name}
                  onChange={(e) => setNewService({...newService, name: e.target.value})}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="e.g., 2Captcha Primary"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Service Type</label>
                <select
                  value={newService.type}
                  onChange={(e) => setNewService({...newService, type: e.target.value as any})}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="2captcha">2Captcha</option>
                  <option value="anticaptcha">AntiCaptcha</option>
                  <option value="capmonster">CapMonster</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">API Key</label>
              <input
                type="password"
                value={newService.api_key}
                onChange={(e) => setNewService({...newService, api_key: e.target.value})}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Enter your API key"
                required
              />
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
                disabled={addServiceMutation.isPending}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
              >
                {addServiceMutation.isPending ? 'Adding...' : 'Add Service'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Services List */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">CAPTCHA Services</h3>
          </div>
          
          {serviceList.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <Shield className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No services</h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by adding your first CAPTCHA service.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {serviceList.map((service) => (
                <div key={service.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h4 className="text-sm font-medium text-gray-900">{service.name}</h4>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          service.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {service.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <div className="mt-1 text-sm text-gray-500">
                        {service.type.toUpperCase()} • {service.total_solved} solved • {(service.success_rate * 100).toFixed(1)}% success
                      </div>
                      <div className="mt-1 text-xs text-gray-400">
                        API Key: {showApiKey[service.id] ? service.api_key : '••••••••••••••••'}
                        <button
                          onClick={() => toggleApiKeyVisibility(service.id)}
                          className="ml-2 text-blue-600 hover:text-blue-800"
                        >
                          {showApiKey[service.id] ? <EyeOff className="w-3 h-3 inline" /> : <Eye className="w-3 h-3 inline" />}
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">
                          ${service.balance?.toFixed(2)} {service.currency}
                        </div>
                        <div className="text-xs text-gray-500">
                          {service.average_solve_time}s avg
                        </div>
                      </div>
                      <div className="flex space-x-1">
                        <button
                          onClick={() => handleTestService(service.id)}
                          disabled={testServiceMutation.isPending}
                          className="p-1 text-blue-600 hover:text-blue-800 disabled:opacity-50"
                          title="Test Service"
                        >
                          <RefreshCw className={`w-4 h-4 ${testServiceMutation.isPending ? 'animate-spin' : ''}`} />
                        </button>
                        <button
                          onClick={() => handleToggleService(service.id)}
                          disabled={toggleServiceMutation.isPending}
                          className={`p-1 ${service.is_active ? 'text-red-600 hover:text-red-800' : 'text-green-600 hover:text-green-800'} disabled:opacity-50`}
                          title={service.is_active ? 'Disable' : 'Enable'}
                        >
                          {service.is_active ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Tasks */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Recent Tasks</h3>
          </div>
          
          {taskList.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <Clock className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No tasks</h3>
              <p className="mt-1 text-sm text-gray-500">
                No CAPTCHA tasks have been processed yet.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {taskList.map((task) => (
                <div key={task.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">{getTaskTypeIcon(task.task_type)}</span>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="text-sm font-medium text-gray-900">
                            {task.task_type.replace('_', ' ').toUpperCase()}
                          </h4>
                          {getStatusIcon(task.status)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {task.page_url && (
                            <div className="truncate max-w-xs">{task.page_url}</div>
                          )}
                          {task.image_url && (
                            <div className="truncate max-w-xs">Image CAPTCHA</div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">
                        ${task.cost.toFixed(4)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(task.created_at).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  {task.error_message && (
                    <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-md">
                      <p className="text-xs text-red-800">{task.error_message}</p>
                    </div>
                  )}
                  {task.solution && (
                    <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-md">
                      <p className="text-xs text-green-800 font-mono">{task.solution}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
