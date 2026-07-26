'use client'

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { superAdminApi } from '@/lib/superAdminApi'
import { 
  Shield,
  Search,
  Filter,
  Calendar,
  Download,
  AlertTriangle,
  Eye,
  Clock,
  Activity,
  TrendingUp,
  TrendingDown,
  Users,
  Lock,
  Zap,
  Target
} from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts'

interface SecurityReport {
  _id: string
  reportId: string
  title: string
  description: string
  reportType: 'threat_analysis' | 'vulnerability_assessment' | 'incident_summary' | 'compliance_audit' | 'risk_assessment'
  period: {
    startDate: Date
    endDate: Date
  }
  generatedAt: Date
  generatedBy: string
  status: 'draft' | 'published' | 'archived'
  metrics: {
    totalIncidents: number
    criticalThreats: number
    resolvedIncidents: number
    averageResolutionTime: number
    securityScore: number
    complianceRate: number
  }
  threatAnalysis: {
    topThreats: {
      type: string
      count: number
      severity: string
      trend: 'increasing' | 'decreasing' | 'stable'
    }[]
    attackVectors: {
      vector: string
      attempts: number
      successRate: number
    }[]
    geographicDistribution: {
      country: string
      threatCount: number
      riskLevel: number
    }[]
  }
  vulnerabilities: {
    critical: number
    high: number
    medium: number
    low: number
    patched: number
    pending: number
  }
  incidents: {
    total: number
    byCategory: {
      category: string
      count: number
      avgImpact: number
    }[]
    timeline: {
      date: Date
      incidents: number
      severity: string
    }[]
  }
  recommendations: {
    priority: 'critical' | 'high' | 'medium' | 'low'
    title: string
    description: string
    impact: string
    effort: string
    timeline: string
  }[]
  compliance: {
    framework: string
    score: number
    requirements: {
      requirement: string
      status: 'compliant' | 'partial' | 'non_compliant'
      lastAudit: Date
    }[]
  }[]
}

export default function SecurityReportsPage() {
  const [reports, setReports] = useState<SecurityReport[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [dateRange, setDateRange] = useState('30d')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [stats, setStats] = useState({
    totalReports: 0,
    publishedReports: 0,
    criticalFindings: 0,
    avgSecurityScore: 0,
    complianceRate: 0,
    trendsImproving: 0
  })

  useEffect(() => {
    fetchSecurityReports()
  }, [page, selectedType, selectedStatus, dateRange, searchQuery])

  const fetchSecurityReports = async () => {
    try {
      setLoading(true)
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(selectedType !== 'all' && { type: selectedType }),
        ...(selectedStatus !== 'all' && { status: selectedStatus }),
        ...(searchQuery && { search: searchQuery }),
        range: dateRange
      })

      const data = await superAdminApi.get(`/audit/reports/security?${params}`)
      
      if (data.success) {
        setReports(data.data.reports)
        setStats(data.data.stats)
        setTotalPages(data.data.pagination.pages)
      } else {
        throw new Error(data.message || 'Failed to fetch security reports')
      }
      
    } catch (error) {
      console.error('Error fetching security reports:', error)
      setError('Failed to load security reports. Please try again.')
      setReports([])
      setTotalPages(1)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'text-green-700 bg-green-100'
      case 'draft': return 'text-yellow-700 bg-yellow-100'
      case 'archived': return 'text-gray-700 bg-gray-100'
      default: return 'text-gray-700 bg-gray-100'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'threat_analysis': return 'text-red-700 bg-red-100'
      case 'vulnerability_assessment': return 'text-orange-700 bg-orange-100'
      case 'incident_summary': return 'text-purple-700 bg-purple-100'
      case 'compliance_audit': return 'text-blue-700 bg-blue-100'
      case 'risk_assessment': return 'text-indigo-700 bg-indigo-100'
      default: return 'text-gray-700 bg-gray-100'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-700 bg-red-100'
      case 'high': return 'text-orange-700 bg-orange-100'
      case 'medium': return 'text-yellow-700 bg-yellow-100'
      case 'low': return 'text-green-700 bg-green-100'
      default: return 'text-gray-700 bg-gray-100'
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': return <TrendingUp className="w-4 h-4 text-red-600" />
      case 'decreasing': return <TrendingDown className="w-4 h-4 text-green-600" />
      case 'stable': return <Activity className="w-4 h-4 text-blue-600" />
      default: return <Activity className="w-4 h-4 text-gray-600" />
    }
  }

  const COLORS = ['#EF4444', '#F97316', '#EAB308', '#22C55E', '#3B82F6']

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Error Banner */}
      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 p-4">
          <p className="text-sm text-red-700">{error}</p>
          <button onClick={fetchSecurityReports} className="mt-1 text-sm text-red-600 underline">Retry</button>
        </div>
      )}

      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 via-pink-600 to-purple-600 rounded-xl shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center">
              <Shield className="w-8 h-8 mr-3" />
              Security Reports & Analysis
            </h1>
            <p className="text-red-100 mt-2">
              Comprehensive security reporting, threat analysis, and compliance monitoring
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-red-100">Security Score: {stats.avgSecurityScore}%</p>
            <p className="text-xs text-red-200">Threat Intelligence</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-sm p-4 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide">Total Reports</p>
              <p className="text-xl font-bold text-blue-900 mt-1">{stats.totalReports}</p>
            </div>
            <Shield className="w-5 h-5 text-blue-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-sm p-4 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-green-700 uppercase tracking-wide">Published</p>
              <p className="text-xl font-bold text-green-900 mt-1">{stats.publishedReports}</p>
            </div>
            <Eye className="w-5 h-5 text-green-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl shadow-sm p-4 border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-red-700 uppercase tracking-wide">Critical</p>
              <p className="text-xl font-bold text-red-900 mt-1">{stats.criticalFindings}</p>
            </div>
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl shadow-sm p-4 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-purple-700 uppercase tracking-wide">Security Score</p>
              <p className="text-xl font-bold text-purple-900 mt-1">{stats.avgSecurityScore}%</p>
            </div>
            <Target className="w-5 h-5 text-purple-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl shadow-sm p-4 border border-indigo-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-indigo-700 uppercase tracking-wide">Compliance</p>
              <p className="text-xl font-bold text-indigo-900 mt-1">{stats.complianceRate}%</p>
            </div>
            <Lock className="w-5 h-5 text-indigo-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl shadow-sm p-4 border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-orange-700 uppercase tracking-wide">Improving</p>
              <p className="text-xl font-bold text-orange-900 mt-1">{stats.trendsImproving}%</p>
            </div>
            <TrendingUp className="w-5 h-5 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Threat Trends */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-red-600" />
            Threat Trends Over Time
          </h3>
          <div className="h-64 flex items-center justify-center">
            <div className="text-center py-8 text-gray-500">Trend data not available</div>
          </div>
        </div>

        {/* Vulnerability Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2 text-orange-600" />
            Vulnerability Distribution
          </h3>
          <div className="h-64 flex items-center justify-center">
            <div className="text-center py-8 text-gray-500">Trend data not available</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="flex items-center space-x-2">
            <Search className="w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search reports..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
          
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="all">All Types</option>
            <option value="threat_analysis">Threat Analysis</option>
            <option value="vulnerability_assessment">Vulnerability Assessment</option>
            <option value="incident_summary">Incident Summary</option>
            <option value="compliance_audit">Compliance Audit</option>
            <option value="risk_assessment">Risk Assessment</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>

          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="1y">Last Year</option>
          </select>

          <button className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 transition-colors flex items-center">
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Reports List */}
      <div className="space-y-4">
        {reports.map((report) => (
          <div key={report._id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                {/* Header */}
                <div className="flex items-center space-x-3 mb-3">
                  <span className="font-mono text-sm text-gray-600">{report.reportId}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(report.reportType)}`}>
                    {report.reportType.replace('_', ' ').toUpperCase()}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                    {report.status.toUpperCase()}
                  </span>
                </div>

                {/* Title & Description */}
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-gray-900 mb-1">{report.title}</h3>
                  <p className="text-gray-600 text-sm">{report.description}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Period: {report.period.startDate ? new Date(report.period.startDate).toLocaleDateString() : '—'} - {report.period.endDate ? new Date(report.period.endDate).toLocaleDateString() : '—'}
                  </p>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-4">
                  <div className="text-center p-2 bg-red-50 rounded">
                    <p className="text-xs text-red-700">Incidents</p>
                    <p className="text-lg font-bold text-red-900">{report.metrics.totalIncidents}</p>
                  </div>
                  <div className="text-center p-2 bg-orange-50 rounded">
                    <p className="text-xs text-orange-700">Critical</p>
                    <p className="text-lg font-bold text-orange-900">{report.metrics.criticalThreats}</p>
                  </div>
                  <div className="text-center p-2 bg-green-50 rounded">
                    <p className="text-xs text-green-700">Resolved</p>
                    <p className="text-lg font-bold text-green-900">{report.metrics.resolvedIncidents}</p>
                  </div>
                  <div className="text-center p-2 bg-blue-50 rounded">
                    <p className="text-xs text-blue-700">Avg Time</p>
                    <p className="text-lg font-bold text-blue-900">{report.metrics.averageResolutionTime}h</p>
                  </div>
                  <div className="text-center p-2 bg-purple-50 rounded">
                    <p className="text-xs text-purple-700">Security</p>
                    <p className="text-lg font-bold text-purple-900">{report.metrics.securityScore}%</p>
                  </div>
                  <div className="text-center p-2 bg-indigo-50 rounded">
                    <p className="text-xs text-indigo-700">Compliance</p>
                    <p className="text-lg font-bold text-indigo-900">{report.metrics.complianceRate}%</p>
                  </div>
                </div>

                {/* Top Threats */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Top Threats</h4>
                  <div className="space-y-2">
                    {report.threatAnalysis.topThreats.slice(0, 3).map((threat, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-gray-900">{threat.type}</span>
                          <span className="text-xs text-gray-600">({threat.count} incidents)</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getTrendIcon(threat.trend)}
                          <span className={`px-1 py-0.5 rounded text-xs ${threat.severity === 'critical' ? 'text-red-700 bg-red-100' : threat.severity === 'high' ? 'text-orange-700 bg-orange-100' : 'text-yellow-700 bg-yellow-100'}`}>
                            {threat.severity}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Key Recommendations */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Key Recommendations</h4>
                  <div className="space-y-2">
                    {report.recommendations.slice(0, 2).map((rec, index) => (
                      <div key={index} className="bg-blue-50 p-3 rounded-lg">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-blue-900">{rec.title}</span>
                          <span className={`px-1 py-0.5 rounded text-xs ${getPriorityColor(rec.priority)}`}>
                            {rec.priority}
                          </span>
                        </div>
                        <p className="text-sm text-blue-800">{rec.description}</p>
                        <p className="text-xs text-blue-600 mt-1">Timeline: {rec.timeline}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Compliance Status */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Compliance Status</h4>
                  <div className="flex flex-wrap gap-2">
                    {report.compliance.map((comp, index) => (
                      <div key={index} className="bg-green-50 px-3 py-1 rounded-full">
                        <span className="text-sm text-green-800">{comp.framework}: {comp.score}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Actions & Timestamp */}
              <div className="flex flex-col items-end space-y-2 ml-4">
                <button className="text-blue-600 hover:text-blue-800 p-2 rounded-md hover:bg-blue-50">
                  <Eye className="w-4 h-4" />
                </button>
                <div className="text-xs text-gray-500 text-right">
                  <div>Generated:</div>
                  <div>{report.generatedAt ? new Date(report.generatedAt).toLocaleDateString() : '—'}</div>
                  <div className="text-gray-400">by {report.generatedBy}</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-sm text-gray-700">
            Page {page} of {totalPages}
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}