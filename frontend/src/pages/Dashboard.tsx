import { useQuery } from '@tanstack/react-query'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import { Activity, AlertTriangle, CheckCircle, Clock } from 'lucide-react'
import { apiService } from '../services/api'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042']

export function Dashboard() {
  // Test basic rendering first
  console.log('Dashboard component rendering...')

  const { data: metrics, error: metricsError } = useQuery({
    queryKey: ['metrics'],
    queryFn: async () => {
      try {
        return await apiService.getMetrics()
      } catch (error) {
        // Return demo metrics if API fails
        return {
          total_requests: 2400,
          successful_requests: 2280,
          failed_requests: 120,
          pending_requests: 0,
          running_requests: 0,
          average_latency: 125,
          success_rate: 95.0,
          timestamp: new Date().toISOString()
        }
      }
    },
    refetchInterval: 30000, // Refresh every 30 seconds
    retry: false, // Don't retry on failure
  })

  const { data: alerts, error: alertsError } = useQuery({
    queryKey: ['alerts'],
    queryFn: () => apiService.getSelectorAlerts(),
    refetchInterval: 60000, // Refresh every minute
    retry: false, // Don't retry on failure
  })

  // Mock data for demonstration
  const searchVolumeData = [
    { name: 'Google', requests: 1200, success: 1150 },
    { name: 'Bing', requests: 800, success: 750 },
    { name: 'DuckDuckGo', requests: 400, success: 380 },
  ]

  const latencyData = [
    { time: '00:00', latency: 120 },
    { time: '04:00', latency: 135 },
    { time: '08:00', latency: 110 },
    { time: '12:00', latency: 125 },
    { time: '16:00', latency: 140 },
    { time: '20:00', latency: 115 },
  ]

  const successRateData = [
    { name: 'Google', value: 95.8 },
    { name: 'Bing', value: 93.7 },
    { name: 'DuckDuckGo', value: 95.0 },
  ]

  const openAlerts = alerts?.alerts?.filter((alert: any) => alert.status === 'open') || []

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Search Intelligence Pipeline Overview
        </p>
        {(metricsError || alertsError) && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-sm text-yellow-800">
              ⚠️ API connection failed. Showing demo data. Make sure the backend server is running.
            </p>
          </div>
        )}
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Activity className="h-8 w-8 text-blue-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Requests</p>
              <p className="text-2xl font-semibold text-gray-900">{metrics?.total_requests?.toLocaleString() || '2,400'}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Success Rate</p>
              <p className="text-2xl font-semibold text-gray-900">{metrics?.success_rate?.toFixed(1) || '94.8'}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Clock className="h-8 w-8 text-purple-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Avg Latency</p>
              <p className="text-2xl font-semibold text-gray-900">{metrics?.average_latency || '125'}ms</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-8 w-8 text-yellow-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Open Alerts</p>
              <p className="text-2xl font-semibold text-gray-900">{openAlerts.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Search Volume by Engine */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Search Volume by Engine
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={searchVolumeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="requests" fill="#3B82F6" />
              <Bar dataKey="success" fill="#10B981" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Success Rate Distribution */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Success Rate by Engine
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={successRateData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {successRateData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Latency Trend */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Latency Trend (24h)
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={latencyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="latency" stroke="#3B82F6" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Recent Alerts */}
      {openAlerts.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-4" style={{ color: 'hsl(var(--foreground))' }}>
            Recent Alerts
          </h3>
          <div className="space-y-3">
            {openAlerts.slice(0, 5).map((alert: any) => (
              <div key={alert.id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {alert.engine} selector breakage detected
                  </p>
                  <p className="text-sm text-gray-500">
                    Break rate: {(alert.break_rate * 100).toFixed(1)}%
                  </p>
                </div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  Open
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
