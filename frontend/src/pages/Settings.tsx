import { useState } from 'react'
import { Settings as SettingsIcon, Save, RefreshCw } from 'lucide-react'

export function Settings() {
  const [settings, setSettings] = useState({
    scrapeInterval: 300,
    maxRetries: 3,
    timeout: 30,
    enableProxy: false,
    proxyList: '',
    enableCaptcha: false,
    captchaService: '2captcha',
    captchaApiKey: '',
    alertThreshold: 0.8,
    enableNotifications: true,
    notificationWebhook: ''
  })

  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsSaving(false)
    // Show success message
  }

  const handleReset = () => {
    setSettings({
      scrapeInterval: 300,
      maxRetries: 3,
      timeout: 30,
      enableProxy: false,
      proxyList: '',
      enableCaptcha: false,
      captchaService: '2captcha',
      captchaApiKey: '',
      alertThreshold: 0.8,
      enableNotifications: true,
      notificationWebhook: ''
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="mt-1 text-sm text-gray-500">
          Configure system parameters and integrations
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Scraping Settings */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center mb-4">
            <SettingsIcon className="w-5 h-5 text-gray-400 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Scraping Settings</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Scrape Interval (seconds)
              </label>
              <input
                type="number"
                value={settings.scrapeInterval}
                onChange={(e) => setSettings({...settings, scrapeInterval: parseInt(e.target.value)})}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Max Retries
              </label>
              <input
                type="number"
                value={settings.maxRetries}
                onChange={(e) => setSettings({...settings, maxRetries: parseInt(e.target.value)})}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Timeout (seconds)
              </label>
              <input
                type="number"
                value={settings.timeout}
                onChange={(e) => setSettings({...settings, timeout: parseInt(e.target.value)})}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
          </div>
        </div>

        {/* Proxy Settings */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center mb-4">
            <RefreshCw className="w-5 h-5 text-gray-400 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Proxy Settings</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                id="enableProxy"
                type="checkbox"
                checked={settings.enableProxy}
                onChange={(e) => setSettings({...settings, enableProxy: e.target.checked})}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="enableProxy" className="ml-2 block text-sm text-gray-900">
                Enable Proxy Rotation
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Proxy List (one per line)
              </label>
              <textarea
                value={settings.proxyList}
                onChange={(e) => setSettings({...settings, proxyList: e.target.value})}
                rows={4}
                disabled={!settings.enableProxy}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-50"
                placeholder="http://proxy1:port&#10;http://proxy2:port"
              />
            </div>
          </div>
        </div>

        {/* CAPTCHA Settings */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">CAPTCHA Settings</h3>
          
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                id="enableCaptcha"
                type="checkbox"
                checked={settings.enableCaptcha}
                onChange={(e) => setSettings({...settings, enableCaptcha: e.target.checked})}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="enableCaptcha" className="ml-2 block text-sm text-gray-900">
                Enable CAPTCHA Solving
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                CAPTCHA Service
              </label>
              <select
                value={settings.captchaService}
                onChange={(e) => setSettings({...settings, captchaService: e.target.value})}
                disabled={!settings.enableCaptcha}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-50"
              >
                <option value="2captcha">2Captcha</option>
                <option value="anticaptcha">AntiCaptcha</option>
                <option value="capmonster">CapMonster</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                API Key
              </label>
              <input
                type="password"
                value={settings.captchaApiKey}
                onChange={(e) => setSettings({...settings, captchaApiKey: e.target.value})}
                disabled={!settings.enableCaptcha}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-50"
                placeholder="Enter your API key"
              />
            </div>
          </div>
        </div>

        {/* Alert Settings */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Alert Settings</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Alert Threshold (break rate)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="1"
                value={settings.alertThreshold}
                onChange={(e) => setSettings({...settings, alertThreshold: parseFloat(e.target.value)})}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
              <p className="mt-1 text-sm text-gray-500">
                Alert when break rate exceeds this threshold
              </p>
            </div>

            <div className="flex items-center">
              <input
                id="enableNotifications"
                type="checkbox"
                checked={settings.enableNotifications}
                onChange={(e) => setSettings({...settings, enableNotifications: e.target.checked})}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="enableNotifications" className="ml-2 block text-sm text-gray-900">
                Enable Notifications
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Webhook URL
              </label>
              <input
                type="url"
                value={settings.notificationWebhook}
                onChange={(e) => setSettings({...settings, notificationWebhook: e.target.value})}
                disabled={!settings.enableNotifications}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-50"
                placeholder="https://hooks.slack.com/services/..."
              />
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3">
        <button
          onClick={handleReset}
          className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Reset
        </button>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          <Save className="w-4 h-4 mr-2" />
          {isSaving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  )
}
