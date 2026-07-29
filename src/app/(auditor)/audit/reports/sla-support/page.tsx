'use client'

import { useState, useEffect } from 'react'
import { superAdminApi } from '@/lib/superAdminApi'
import {
  MessageSquare,
  Timer,
  ArrowUpRight,
  Search,
  Download,
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Users,
  TrendingUp,
  Activity,
  BarChart3,
  Eye
} from 'lucide-react'

interface SLAReport {
  _id: string
  period: string
  totalTickets: number
  resolvedTickets: number
  pendingTickets: number
  escalatedTickets: number
  avgResponseTime: string
  avgResolutionTime: string
  slaComplianceRate: number
  breachedSLAs: number
  customerSatisfaction: number
  topCategories: {
    category: string
    count: number
    avgResolution: string
  }[]
  agentPerformance: {
    agentName: string
    ticketsResolved: number
    avgTime: string
    satisfaction: number
  }[]
  escalationDetails: {
    ticketId: string
    reason: string
    escalatedTo: string
    time: string
    resolved: boolean
  }[]
  tenantBreakdown: {
    tenantName: string
    tickets: number
    slaCompliance: number
    satisfaction: number
  }[]
}

export default function SLASupportReportsPage() {
  const [reports, setReports] = useState<SLAReport[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState('30d')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [stats, setStats] = useState({
    totalTickets: 0,
    resolvedTickets: 0,
    slaComplianceRate: 0,
    avgResponseTime: '',
    customerSatisfaction: 0,
    escalationRate: 0
  })

  useEffect(() => {
    fetchSLAReports()
  }, [page, selectedPeriod])

  const fetchSLAReports = async () => {
    try {
      setLoading(true)

      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        period: selectedPeriod
      })

      const data = await superAdminApi.get(`/audit/reports/sla-support?${params}`)

      if (data.success) {
        setReports(data.data.reports)
        setStats(data.data.stats)
        setTotalPages(data.data.pagination.pages)
      } else {
        throw new Error(data.message || 'Failed to fetch SLA support reports')
      }

    } catch (error) {
      console.error('Error fetching SLA support reports:', error)
      // Show empty state on API failure
      setReports([])
      setStats({
        totalTickets: 0,
        resolvedTickets: 0,
        slaComplianceRate: 0,
        avgResponseTime: '',
        customerSatisfaction: 0,
        escalationRate: 0
      })
      setTotalPages(1)
    } finally {
      setLoading(false)
    }
  }

  const getComplianceColor = (rate: number) => {
    if (rate >= 95) return 'text-green-700 bg-green-100'
    if (rate >= 80) return 'text-yellow-700 bg-yellow-100'
    return 'text-red-700 bg-red-100'
  }

  const getComplianceTextColor = (rate: number) => {
    if (rate >= 95) return 'text-green-600'
    if (rate >= 80) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getSatisfactionColor = (score: number) => {
    if (score >= 4.5) return 'text-green-700 bg-green-100'
    if (score >= 3.5) return 'text-yellow-700 bg-yellow-100'
    return 'text-red-700 bg-red-100'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 via-blue-600 to-indigo-600 rounded-xl shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center">
              <MessageSquare className="w-8 h-8 mr-3" />
              SLA & Support Reports
            </h1>
            <p className="text-teal-100 mt-2">
              Service level agreement compliance, support ticket analytics, and customer satisfaction tracking
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-teal-100">SLA Compliance: {stats.slaComplianceRate}%</p>
            <p className="text-xs text-teal-200">Customer Satisfaction: {stats.customerSatisfaction}/5</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-sm p-4 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide">Total Tickets</p>
              <p className="text-xl font-bold text-blue-900 mt-1">{stats.totalTickets.toLocaleString()}</p>
            </div>
            <MessageSquare className="w-5 h-5 text-blue-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-sm p-4 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-green-700 uppercase tracking-wide">Resolved</p>
              <p className="text-xl font-bold text-green-900 mt-1">{stats.resolvedTickets.toLocaleString()}</p>
            </div>
            <CheckCircle className="w-5 h-5 text-green-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-xl shadow-sm p-4 border border-teal-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-teal-700 uppercase tracking-wide">SLA Compliance</p>
              <p className="text-xl font-bold text-teal-900 mt-1">{stats.slaComplianceRate}%</p>
            </div>
            <Activity className="w-5 h-5 text-teal-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl shadow-sm p-4 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-purple-700 uppercase tracking-wide">Avg Response</p>
              <p className="text-xl font-bold text-purple-900 mt-1">{stats.avgResponseTime}</p>
            </div>
            <Timer className="w-5 h-5 text-purple-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl shadow-sm p-4 border border-indigo-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-indigo-700 uppercase tracking-wide">Satisfaction</p>
              <p className="text-xl font-bold text-indigo-900 mt-1">{stats.customerSatisfaction}/5</p>
            </div>
            <TrendingUp className="w-5 h-5 text-indigo-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl shadow-sm p-4 border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-orange-700 uppercase tracking-wide">Escalation Rate</p>
              <p className="text-xl font-bold text-orange-900 mt-1">{stats.escalationRate}%</p>
            </div>
            <ArrowUpRight className="w-5 h-5 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-gray-500" />
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 90 Days</option>
                <option value="1y">Last Year</option>
              </select>
            </div>
          </div>

          <button className="bg-teal-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-teal-700 transition-colors flex items-center">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </button>
        </div>
      </div>

      {/* Reports */}
      <div className="space-y-6">
        {reports.map((report) => (
          <div key={report._id} className="space-y-6">
            {/* Period Header */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900 flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2 text-teal-600" />
                  {report.period} Overview
                </h2>
                <div className="flex items-center space-x-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getComplianceColor(report.slaComplianceRate)}`}>
                    SLA: {report.slaComplianceRate}%
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getSatisfactionColor(report.customerSatisfaction)}`}>
                    CSAT: {report.customerSatisfaction}/5
                  </span>
                </div>
              </div>

              {/* Overview Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs text-blue-700 font-medium">Total</p>
                  <p className="text-lg font-bold text-blue-900">{report.totalTickets.toLocaleString()}</p>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <p className="text-xs text-green-700 font-medium">Resolved</p>
                  <p className="text-lg font-bold text-green-900">{report.resolvedTickets.toLocaleString()}</p>
                </div>
                <div className="text-center p-3 bg-yellow-50 rounded-lg">
                  <p className="text-xs text-yellow-700 font-medium">Pending</p>
                  <p className="text-lg font-bold text-yellow-900">{report.pendingTickets}</p>
                </div>
                <div className="text-center p-3 bg-orange-50 rounded-lg">
                  <p className="text-xs text-orange-700 font-medium">Escalated</p>
                  <p className="text-lg font-bold text-orange-900">{report.escalatedTickets}</p>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <p className="text-xs text-purple-700 font-medium">Avg Response</p>
                  <p className="text-lg font-bold text-purple-900">{report.avgResponseTime}</p>
                </div>
                <div className="text-center p-3 bg-indigo-50 rounded-lg">
                  <p className="text-xs text-indigo-700 font-medium">Avg Resolution</p>
                  <p className="text-lg font-bold text-indigo-900">{report.avgResolutionTime}</p>
                </div>
                <div className="text-center p-3 bg-teal-50 rounded-lg">
                  <p className="text-xs text-teal-700 font-medium">SLA Compliance</p>
                  <p className={`text-lg font-bold ${getComplianceTextColor(report.slaComplianceRate)}`}>{report.slaComplianceRate}%</p>
                </div>
                <div className="text-center p-3 bg-red-50 rounded-lg">
                  <p className="text-xs text-red-700 font-medium">Breached SLAs</p>
                  <p className="text-lg font-bold text-red-900">{report.breachedSLAs}</p>
                </div>
              </div>
            </div>

            {/* Top Ticket Categories */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
                  Top Ticket Categories
                </h3>
                <p className="text-sm text-gray-600 mt-1">Most common support ticket categories for {report.period}</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ticket Count
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        % of Total
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Avg Resolution
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Volume
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {report.topCategories.map((cat, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className="text-sm font-medium text-gray-900">{cat.category}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                          {cat.count.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {report.totalTickets > 0 ? ((cat.count / report.totalTickets) * 100).toFixed(1) : '0'}%
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="flex items-center text-sm text-gray-700">
                            <Clock className="w-3 h-3 mr-1 text-gray-400" />
                            {cat.avgResolution}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="w-full bg-gray-200 rounded-full h-2 max-w-[120px]">
                            <div
                              className="bg-teal-500 h-2 rounded-full"
                              style={{ width: `${(cat.count / report.topCategories[0].count) * 100}%` }}
                            ></div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Agent Performance */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 flex items-center">
                  <Users className="w-5 h-5 mr-2 text-purple-600" />
                  Agent Performance
                </h3>
                <p className="text-sm text-gray-600 mt-1">Individual agent metrics and satisfaction scores for {report.period}</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Agent
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tickets Resolved
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Avg Resolution Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Satisfaction
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Performance
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {report.agentPerformance.map((agent, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center text-white text-xs font-bold mr-3">
                              {agent.agentName.split(' ').map(n => n[0]).join('')}
                            </div>
                            <span className="text-sm font-medium text-gray-900">{agent.agentName}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                          {agent.ticketsResolved}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="flex items-center text-sm text-gray-700">
                            <Timer className="w-3 h-3 mr-1 text-gray-400" />
                            {agent.avgTime}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSatisfactionColor(agent.satisfaction)}`}>
                            {agent.satisfaction}/5
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="w-full bg-gray-200 rounded-full h-2 max-w-[120px]">
                            <div
                              className={`h-2 rounded-full ${
                                agent.satisfaction >= 4.5 ? 'bg-green-500' :
                                agent.satisfaction >= 4.0 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${(agent.satisfaction / 5) * 100}%` }}
                            ></div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recent Escalations */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 flex items-center">
                  <ArrowUpRight className="w-5 h-5 mr-2 text-orange-600" />
                  Recent Escalations
                </h3>
                <p className="text-sm text-gray-600 mt-1">Escalated tickets requiring attention for {report.period}</p>
              </div>

              <div className="divide-y divide-gray-200">
                {report.escalationDetails.map((escalation, index) => (
                  <div key={index} className="px-6 py-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-1">
                          <span className="font-mono text-sm font-medium text-teal-700">{escalation.ticketId}</span>
                          {escalation.resolved ? (
                            <span className="flex items-center text-xs font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Resolved
                            </span>
                          ) : (
                            <span className="flex items-center text-xs font-medium text-red-700 bg-red-100 px-2 py-0.5 rounded-full">
                              <XCircle className="w-3 h-3 mr-1" />
                              Open
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-900 font-medium">{escalation.reason}</p>
                        <div className="flex items-center space-x-4 mt-1">
                          <span className="text-xs text-gray-500 flex items-center">
                            <Users className="w-3 h-3 mr-1" />
                            Escalated to: {escalation.escalatedTo}
                          </span>
                          <span className="text-xs text-gray-500 flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {escalation.time}
                          </span>
                        </div>
                      </div>
                      <button className="text-blue-600 hover:text-blue-800 p-2 rounded-md hover:bg-blue-50">
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tenant Breakdown */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 flex items-center">
                  <Activity className="w-5 h-5 mr-2 text-indigo-600" />
                  Tenant Breakdown
                </h3>
                <p className="text-sm text-gray-600 mt-1">SLA compliance and satisfaction by tenant for {report.period}</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tenant
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tickets
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        SLA Compliance
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Satisfaction
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {report.tenantBreakdown.map((tenant, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium text-gray-900">{tenant.tenantName}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                          {tenant.tickets.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getComplianceColor(tenant.slaCompliance)}`}>
                            {tenant.slaCompliance}%
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSatisfactionColor(tenant.satisfaction)}`}>
                            {tenant.satisfaction}/5
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {tenant.slaCompliance >= 95 ? (
                            <span className="flex items-center text-xs text-green-700">
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Excellent
                            </span>
                          ) : tenant.slaCompliance >= 80 ? (
                            <span className="flex items-center text-xs text-yellow-700">
                              <AlertTriangle className="w-4 h-4 mr-1" />
                              Needs Improvement
                            </span>
                          ) : (
                            <span className="flex items-center text-xs text-red-700">
                              <XCircle className="w-4 h-4 mr-1" />
                              Critical
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* SLA Compliance Summary */}
      <div className="bg-gradient-to-r from-teal-50 to-blue-50 border border-teal-200 rounded-lg p-6">
        <div className="flex items-start">
          <CheckCircle className="w-6 h-6 text-teal-600 mt-1 mr-4" />
          <div>
            <h4 className="text-lg font-medium text-teal-900">SLA Compliance Summary</h4>
            <div className="text-sm text-teal-800 mt-2 space-y-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="font-medium">Response Time SLA: {stats.slaComplianceRate >= 95 ? 'Meeting Target' : 'Below Target'}</p>
                  <p>Average first response time is {stats.avgResponseTime}</p>
                </div>
                <div>
                  <p className="font-medium">Resolution Rate: {stats.totalTickets > 0 ? ((stats.resolvedTickets / stats.totalTickets) * 100).toFixed(1) : '0'}%</p>
                  <p>{stats.resolvedTickets.toLocaleString()} of {stats.totalTickets.toLocaleString()} tickets resolved</p>
                </div>
                <div>
                  <p className="font-medium">Customer Satisfaction: {stats.customerSatisfaction}/5</p>
                  <p>{stats.customerSatisfaction >= 4.0 ? 'Above industry average' : 'Needs attention'}</p>
                </div>
                <div>
                  <p className="font-medium">Escalation Rate: {stats.escalationRate}%</p>
                  <p>{stats.escalationRate <= 5 ? 'Within acceptable range' : 'Higher than expected - review required'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
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
