'use client'

import React, { useState, useEffect } from 'react'
import {
  BarChart3,
  TrendingUp,
  Clock,
  Users,
  Activity,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Zap,
  Target,
  Eye,
  Send,
  Calendar,
  Download,
  Bell
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import api from '@/lib/api'

interface NotificationStats {
  overview: {
    totalSent: number
    totalDelivered: number
    totalFailed: number
    averageResponseTime: number
    deliveryRate: number
    readRate: number
  }
  priorityBreakdown: {
    P0: { sent: number, delivered: number, failed: number, avgResponseTime: number }
    P1: { sent: number, delivered: number, failed: number, avgResponseTime: number }
    P2: { sent: number, delivered: number, failed: number, avgResponseTime: number }
    P3: { sent: number, delivered: number, failed: number, avgResponseTime: number }
    P4: { sent: number, delivered: number, failed: number, avgResponseTime: number }
  }
  channelPerformance: {
    websocket: { sent: number, delivered: number, failed: number, avgResponseTime: number }
    email: { sent: number, delivered: number, failed: number, avgResponseTime: number }
    sms: { sent: number, delivered: number, failed: number, avgResponseTime: number }
    push: { sent: number, delivered: number, failed: number, avgResponseTime: number }
  }
  timeSeriesData: {
    timestamp: string
    sent: number
    delivered: number
    failed: number
  }[]
  userEngagement: {
    totalUsers: number
    activeUsers: number
    engagementRate: number
    averageReadTime: number
  }
}

const priorityConfig = {
  P0: { name: 'Critical', color: 'red' },
  P1: { name: 'High', color: 'orange' },
  P2: { name: 'Medium', color: 'blue' },
  P3: { name: 'Low', color: 'gray' },
  P4: { name: 'Silent', color: 'gray' }
}

const channelConfig = {
  websocket: { name: 'WebSocket', color: 'blue' },
  email: { name: 'Email', color: 'green' },
  sms: { name: 'SMS', color: 'purple' },
  push: { name: 'Push', color: 'orange' }
}

export default function NotificationStatsPage() {
  const [stats, setStats] = useState<NotificationStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<string>('7d')
  const [activeTab, setActiveTab] = useState<'overview' | 'priority' | 'channels' | 'engagement'>('overview')
  const [unreadCount, setUnreadCount] = useState<number | null>(null)

  const fetchUnreadCount = async () => {
    try {
      const res = await api.get('/superadmin/notifications/unread-count')
      const count = res.data?.count ?? res.data?.data?.count ?? null
      setUnreadCount(typeof count === 'number' ? count : null)
    } catch {
      setUnreadCount(null)
    }
  }

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      await fetchUnreadCount()
      // No /stats endpoint — leave stats null and show placeholder values
      setStats(null)
      setLoading(false)
    }
    load()
  }, [timeRange])

  const refreshStats = async () => {
    setLoading(true)
    await fetchUnreadCount()
    setLoading(false)
  }

  const exportStats = () => {
    toast('Export not yet supported')
  }

  const calculatePercentage = (value: number, total: number) => {
    return total > 0 ? ((value / total) * 100).toFixed(1) : '0.0'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Performance Statistics</h1>
          <p className="text-gray-600 mt-1">Monitor notification system performance and user engagement</p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
          <button
            onClick={refreshStats}
            className="flex items-center px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </button>
          <button
            onClick={exportStats}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Sent</p>
              <p className="text-2xl font-bold text-gray-400">N/A</p>
            </div>
            <Send className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Delivered</p>
              <p className="text-2xl font-bold text-gray-400">N/A</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Failed</p>
              <p className="text-2xl font-bold text-gray-400">N/A</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Delivery Rate</p>
              <p className="text-2xl font-bold text-gray-400">N/A</p>
            </div>
            <Target className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Read Rate</p>
              <p className="text-2xl font-bold text-gray-400">N/A</p>
            </div>
            <Eye className="w-8 h-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Unread</p>
              <p className="text-2xl font-bold text-orange-600">
                {unreadCount !== null ? unreadCount : 'N/A'}
              </p>
            </div>
            <Bell className="w-8 h-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', name: 'Overview', icon: BarChart3 },
            { id: 'priority', name: 'Priority Breakdown', icon: AlertTriangle },
            { id: 'channels', name: 'Channel Performance', icon: Activity },
            { id: 'engagement', name: 'User Engagement', icon: Users }
          ].map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {tab.name}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Time Series Chart Placeholder */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Notification Volume Trend</h3>
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                <div className="flex items-center justify-center h-32 text-gray-400 text-sm">
                  Chart coming soon
                </div>
              </div>
            </div>

            {/* Success Rate Chart Placeholder */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Success Rate Over Time</h3>
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                <div className="flex items-center justify-center h-32 text-gray-400 text-sm">
                  Chart coming soon
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'priority' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Priority Level Performance</h3>
              <div className="flex items-center justify-center h-32 text-gray-400 text-sm">
                Chart coming soon
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Average Response Times</h3>
              <div className="flex items-center justify-center h-32 text-gray-400 text-sm">
                Chart coming soon
              </div>
            </div>
          </div>
        )}

        {activeTab === 'channels' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Channel Performance</h3>
              <div className="flex items-center justify-center h-32 text-gray-400 text-sm">
                Chart coming soon
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Channel Comparison</h3>
              <div className="flex items-center justify-center h-32 text-gray-400 text-sm">
                Chart coming soon
              </div>
            </div>
          </div>
        )}

        {activeTab === 'engagement' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4">User Engagement Metrics</h3>
              <div className="flex items-center justify-center h-32 text-gray-400 text-sm">
                Chart coming soon
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Engagement Trends</h3>
              <div className="flex items-center justify-center h-32 text-gray-400 text-sm">
                Chart coming soon
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Performance Insights */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Performance Insights</h3>
        <div className="flex items-center justify-center h-20 text-gray-400 text-sm">
          Detailed statistics not yet available from the backend
        </div>
      </div>
    </div>
  )
}
