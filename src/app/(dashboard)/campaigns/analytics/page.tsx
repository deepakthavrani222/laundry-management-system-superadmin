'use client'

import { useState, useEffect } from 'react'
import api from '@/lib/api'
import { BarChart3, TrendingUp, Users, DollarSign } from 'lucide-react'

interface CampaignAnalytics {
  totalCampaigns: number
  activeCampaigns: number
  totalReach: number
  totalRevenue: number
}

export default function CampaignAnalyticsPage() {
  const [analytics, setAnalytics] = useState<CampaignAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAnalytics = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.get('/superadmin/campaigns/analytics')
      const d = res.data?.data || res.data
      setAnalytics({
        totalCampaigns: d.totalCampaigns ?? 0,
        activeCampaigns: d.activeCampaigns ?? 0,
        totalReach: d.totalReach ?? 0,
        totalRevenue: d.totalRevenue ?? 0
      })
    } catch {
      setError('Failed to load campaign analytics. Please try again.')
      setAnalytics(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalytics()
  }, [])

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Campaign Analytics</h1>
        <p className="text-gray-600">View detailed analytics for all campaigns</p>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 p-4 mb-6">
          <p className="text-sm text-red-700">{error}</p>
          <button onClick={fetchAnalytics} className="mt-1 text-sm text-red-600 underline">Retry</button>
        </div>
      )}

      {/* Stats Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Campaigns</p>
                <p className="text-2xl font-bold text-gray-800">{analytics?.totalCampaigns ?? 0}</p>
              </div>
              <BarChart3 className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Campaigns</p>
                <p className="text-2xl font-bold text-gray-800">{analytics?.activeCampaigns ?? 0}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Reach</p>
                <p className="text-2xl font-bold text-gray-800">{(analytics?.totalReach ?? 0).toLocaleString()}</p>
              </div>
              <Users className="w-8 h-8 text-purple-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-800">
                  ₹{(analytics?.totalRevenue ?? 0).toLocaleString()}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-orange-500" />
            </div>
          </div>
        </div>
      )}

      {/* Analytics Content */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Campaign Performance</h2>
        {!loading && !error && (!analytics || analytics.totalCampaigns === 0) && (
          <div className="text-center py-12 text-gray-500">
            <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p>No campaign data available</p>
            <p className="text-sm">Create campaigns to see analytics here</p>
          </div>
        )}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
          </div>
        )}
      </div>
    </div>
  )
}
