'use client'

import React, { useState, useEffect } from 'react'
import {
  AlertTriangle,
  AlertCircle,
  Info,
  Bell,
  Settings,
  Save,
  RefreshCw,
  Plus,
  Trash2,
  Edit,
  Eye,
  BarChart3,
  Clock,
  Users,
  Shield,
  DollarSign
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import api from '@/lib/api'

interface PriorityRule {
  id: string
  priority: 'P0' | 'P1' | 'P2' | 'P3' | 'P4'
  name: string
  description: string
  events: string[]
  keywords: string[]
  conditions: {
    amountThreshold?: number
    securityLevel?: string
    businessImpact?: string
    systemOnly?: boolean
  }
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface PriorityStats {
  totalNotifications: number
  byPriority: {
    P0: number
    P1: number
    P2: number
    P3: number
    P4: number
  }
  averageResponseTime: {
    P0: number
    P1: number
    P2: number
    P3: number
    P4: number
  }
  classificationAccuracy: number
}

const priorityConfig = {
  P0: {
    name: 'Critical',
    color: 'red',
    bgColor: 'bg-red-50',
    textColor: 'text-red-700',
    borderColor: 'border-red-200',
    icon: AlertTriangle,
    description: 'Immediate action required - System critical'
  },
  P1: {
    name: 'High',
    color: 'orange',
    bgColor: 'bg-orange-50',
    textColor: 'text-orange-700',
    borderColor: 'border-orange-200',
    icon: AlertCircle,
    description: 'Action needed within hours'
  },
  P2: {
    name: 'Medium',
    color: 'blue',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-200',
    icon: Info,
    description: 'Action needed within days'
  },
  P3: {
    name: 'Low',
    color: 'gray',
    bgColor: 'bg-gray-50',
    textColor: 'text-gray-700',
    borderColor: 'border-gray-200',
    icon: Bell,
    description: 'Informational - No urgency'
  },
  P4: {
    name: 'Silent',
    color: 'gray',
    bgColor: 'bg-gray-25',
    textColor: 'text-gray-500',
    borderColor: 'border-gray-100',
    icon: Bell,
    description: 'System logs only - No user notification'
  }
}

export default function NotificationPrioritiesPage() {
  const [rules, setRules] = useState<PriorityRule[]>([])
  const [stats, setStats] = useState<PriorityStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'rules' | 'stats' | 'test'>('overview')
  const [showCreateModal, setShowCreateModal] = useState(false)

  const fetchRules = async () => {
    try {
      const res = await api.get('/superadmin/notifications/priorities')
      const d = res.data?.data || res.data
      setRules(Array.isArray(d) ? d : [])
    } catch {
      setRules([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRules()
  }, [])

  const handleSaveRule = async (rule: PriorityRule) => {
    try {
      await api.post('/superadmin/notifications/priorities', rule)
      toast.success('Priority rule saved')
      fetchRules()
    } catch { toast.error('Failed to save rule') }
    setShowCreateModal(false)
  }

  const handleDeleteRule = async (id: string) => {
    try {
      await api.delete(`/superadmin/notifications/priorities/${id}`)
      toast.success('Rule deleted')
      fetchRules()
    } catch { toast.error('Failed to delete rule') }
  }

  const handleToggleRule = async (id: string, isActive?: boolean) => {
    try {
      await api.patch(`/superadmin/notifications/priorities/${id}`, { isActive })
      fetchRules()
    } catch { toast.error('Failed to update rule') }
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
          <h1 className="text-2xl font-semibold text-gray-900">Notification Priority Management</h1>
          <p className="text-gray-600 mt-1">Manage P0-P4 priority classification rules and monitor system performance</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Rule
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', name: 'Overview', icon: BarChart3 },
            { id: 'rules', name: 'Priority Rules', icon: Settings },
            { id: 'stats', name: 'Statistics', icon: BarChart3 },
            { id: 'test', name: 'Test Classification', icon: Eye }
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
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Priority Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {Object.entries(priorityConfig).map(([priority, config]) => {
              const Icon = config.icon
              const count = stats?.byPriority[priority as keyof typeof stats.byPriority] || 0
              const responseTime = stats?.averageResponseTime[priority as keyof typeof stats.averageResponseTime] || 0

              return (
                <div key={priority} className={`p-4 rounded-lg border ${config.bgColor} ${config.borderColor}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <Icon className={`w-5 h-5 mr-2 ${config.textColor}`} />
                      <span className={`font-medium ${config.textColor}`}>{priority}</span>
                    </div>
                    <span className={`text-2xl font-bold ${config.textColor}`}>{count}</span>
                  </div>
                  <p className={`text-sm ${config.textColor} mb-1`}>{config.name}</p>
                  <p className="text-xs text-gray-500">
                    Avg Response: {responseTime === 0 ? 'N/A' : `${responseTime}min`}
                  </p>
                </div>
              )
            })}
          </div>

          {/* System Health */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Classification Accuracy</h3>
                <BarChart3 className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-3xl font-bold text-gray-400 mb-2">N/A</div>
              <p className="text-sm text-gray-600">Data not yet available</p>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Total Notifications</h3>
                <Bell className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-3xl font-bold text-gray-400 mb-2">N/A</div>
              <p className="text-sm text-gray-600">Data not yet available</p>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Active Rules</h3>
                <Settings className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-3xl font-bold text-blue-600 mb-2">{rules.filter(r => r.isActive).length}</div>
              <p className="text-sm text-gray-600">Out of {rules.length} total rules</p>
            </div>
          </div>

          {/* Who Manages What */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Priority Management Hierarchy</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                <div className="flex items-center mb-2">
                  <AlertTriangle className="w-4 h-4 text-red-600 mr-2" />
                  <span className="font-medium text-red-700">P0 - Critical</span>
                </div>
                <ul className="text-sm text-red-600 space-y-1">
                  <li>• SuperAdmins</li>
                  <li>• Security Team</li>
                  <li>• On-call Engineers</li>
                </ul>
              </div>

              <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                <div className="flex items-center mb-2">
                  <AlertCircle className="w-4 h-4 text-orange-600 mr-2" />
                  <span className="font-medium text-orange-700">P1 - High</span>
                </div>
                <ul className="text-sm text-orange-600 space-y-1">
                  <li>• SuperAdmins</li>
                  <li>• Platform Support</li>
                  <li>• Tenant Admins</li>
                </ul>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center mb-2">
                  <Info className="w-4 h-4 text-blue-600 mr-2" />
                  <span className="font-medium text-blue-700">P2 - Medium</span>
                </div>
                <ul className="text-sm text-blue-600 space-y-1">
                  <li>• All Admins</li>
                  <li>• Customer Service</li>
                  <li>• Operations Team</li>
                </ul>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center mb-2">
                  <Bell className="w-4 h-4 text-gray-600 mr-2" />
                  <span className="font-medium text-gray-700">P3/P4 - Low/Silent</span>
                </div>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• All Users (P3)</li>
                  <li>• System Only (P4)</li>
                  <li>• Marketing Team</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'rules' && (
        <div className="space-y-4">
          {rules.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <Settings className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No priority rules configured</h3>
              <p className="text-gray-600">Priority rule management is coming soon.</p>
            </div>
          ) : (
            rules.map((rule) => {
              const config = priorityConfig[rule.priority]
              const Icon = config.icon

              return (
                <div key={rule.id} className={`p-6 rounded-lg border ${config.bgColor} ${config.borderColor}`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <Icon className={`w-5 h-5 mr-3 ${config.textColor}`} />
                      <div>
                        <h3 className={`font-medium ${config.textColor}`}>{rule.name}</h3>
                        <p className="text-sm text-gray-600">{rule.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        rule.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {rule.isActive ? 'Active' : 'Inactive'}
                      </span>
                      <button
                        onClick={() => toast('Notification priority rules management coming soon')}
                        className="p-1 text-gray-400 hover:text-gray-600"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleToggleRule(rule.id, !rule.isActive)}
                        className="p-1 text-gray-400 hover:text-gray-600"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteRule(rule.id)}
                        className="p-1 text-gray-400 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      )}

      {activeTab === 'stats' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Average Response Times</h3>
            <div className="flex items-center justify-center h-32 text-gray-400 text-sm">
              Chart coming soon
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Priority Distribution</h3>
            <div className="flex items-center justify-center h-32 text-gray-400 text-sm">
              Chart coming soon
            </div>
          </div>
        </div>
      )}

      {activeTab === 'test' && (
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Test Priority Classification</h3>
          <p className="text-gray-600 mb-6">Test how the system would classify different notification scenarios</p>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Event Type</label>
                <input
                  type="text"
                  placeholder="e.g., payment_failed"
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-400 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Amount ($)</label>
                <input
                  type="number"
                  placeholder="e.g., 1500"
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-400 cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Message Content</label>
              <textarea
                placeholder="e.g., Payment processing failed for order #12345"
                rows={3}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-400 cursor-not-allowed"
              />
            </div>

            <button
              disabled
              className="px-4 py-2 bg-gray-300 text-gray-500 rounded-md cursor-not-allowed"
            >
              Coming soon
            </button>
          </div>
        </div>
      )}

      {/* Create Modal — coming soon */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Create Priority Rule</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            <div className="py-6 text-center text-gray-500">
              <Settings className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="font-medium text-gray-700 mb-1">Coming soon</p>
              <p className="text-sm">Notification priority rules management is not yet available.</p>
            </div>
            <button
              onClick={() => setShowCreateModal(false)}
              className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
