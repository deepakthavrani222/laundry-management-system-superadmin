'use client'

import { useState, useEffect } from 'react'
import { superAdminApi } from '@/lib/superAdminApi'
import toast from 'react-hot-toast'
import {
  Clock,
  Download,
  Search,
  Filter,
  Calendar,
  FileText,
  Shield,
  BarChart3,
  Eye,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Activity,
  Hash,
  Users,
  DollarSign,
  Table
} from 'lucide-react'

interface ExportRecord {
  _id: string
  exportId: string
  watermark: string
  type: 'financial' | 'security' | 'audit' | 'compliance' | 'rbac' | 'tenant'
  format: 'pdf' | 'csv' | 'excel'
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'expired'
  filename: string
  recordCount: number
  requestedBy: string
  requestedByEmail: string
  requestedAt: Date
  completedAt?: Date
  downloadedAt?: Date
  downloadCount: number
  expiresAt: Date
  expired: boolean
  fileSize?: string
  ipAddress: string
  notes?: string
}

export default function ExportHistoryPage() {
  const [records, setRecords] = useState<ExportRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFormat, setSelectedFormat] = useState('all')
  const [selectedType, setSelectedType] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [dateRange, setDateRange] = useState({ start: '', end: '' })
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [stats, setStats] = useState({
    totalExports: 0,
    pdfExports: 0,
    csvExports: 0,
    excelExports: 0,
    expiredExports: 0,
    failedExports: 0
  })

  useEffect(() => {
    fetchExportHistory()
  }, [page, selectedFormat, selectedType, selectedStatus, searchQuery, dateRange])

  const fetchExportHistory = async () => {
    try {
      setLoading(true)

      const params = new URLSearchParams()
      params.append('page', page.toString())
      params.append('limit', '20')
      if (selectedFormat !== 'all') params.append('format', selectedFormat)
      if (selectedType !== 'all') params.append('type', selectedType)
      if (selectedStatus !== 'all') params.append('status', selectedStatus)
      if (searchQuery) params.append('search', searchQuery)
      if (dateRange.start) params.append('startDate', dateRange.start)
      if (dateRange.end) params.append('endDate', dateRange.end)

      const data = await superAdminApi.get(`/audit/export/history?${params}`)

      if (data.success) {
        setRecords(data.data.exports || [])
        setTotalPages(data.data.pagination?.pages || 1)
        if (data.data.stats) {
          setStats(data.data.stats)
        }
      } else {
        throw new Error(data.message || 'Failed to fetch export history')
      }

    } catch (error) {
      console.error('Error fetching export history:', error)
      setError('Failed to load export history. Please try again.')
      setRecords([])
      setTotalPages(0)
    } finally {
      setLoading(false)
    }
  }

  const getFormatColor = (format: string) => {
    switch (format) {
      case 'pdf': return 'text-red-700 bg-red-100'
      case 'csv': return 'text-green-700 bg-green-100'
      case 'excel': return 'text-blue-700 bg-blue-100'
      default: return 'text-gray-700 bg-gray-100'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-700 bg-green-100'
      case 'processing': return 'text-blue-700 bg-blue-100'
      case 'pending': return 'text-yellow-700 bg-yellow-100'
      case 'failed': return 'text-red-700 bg-red-100'
      case 'expired': return 'text-gray-700 bg-gray-100'
      default: return 'text-gray-700 bg-gray-100'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />
      case 'processing': return <Activity className="w-4 h-4 animate-spin" />
      case 'pending': return <Clock className="w-4 h-4" />
      case 'failed': return <XCircle className="w-4 h-4" />
      case 'expired': return <AlertTriangle className="w-4 h-4" />
      default: return <Eye className="w-4 h-4" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'financial': return 'text-green-700 bg-green-100'
      case 'security': return 'text-red-700 bg-red-100'
      case 'audit': return 'text-blue-700 bg-blue-100'
      case 'compliance': return 'text-purple-700 bg-purple-100'
      case 'rbac': return 'text-orange-700 bg-orange-100'
      case 'tenant': return 'text-teal-700 bg-teal-100'
      default: return 'text-gray-700 bg-gray-100'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'financial': return <DollarSign className="w-4 h-4" />
      case 'security': return <Shield className="w-4 h-4" />
      case 'audit': return <Activity className="w-4 h-4" />
      case 'compliance': return <FileText className="w-4 h-4" />
      case 'rbac': return <Users className="w-4 h-4" />
      case 'tenant': return <BarChart3 className="w-4 h-4" />
      default: return <FileText className="w-4 h-4" />
    }
  }

  const filteredRecords = records.filter(record => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      if (
        !record.watermark.toLowerCase().includes(query) &&
        !record.requestedBy.toLowerCase().includes(query) &&
        !record.requestedByEmail.toLowerCase().includes(query)
      ) {
        return false
      }
    }
    return true
  })

  return (
    <div className="space-y-6">
      {/* Error Banner */}
      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 p-4">
          <p className="text-sm text-red-700">{error}</p>
          <button onClick={fetchExportHistory} className="mt-1 text-sm text-red-600 underline">Retry</button>
        </div>
      )}

      {/* Header */}
      <div className="bg-gradient-to-r from-gray-600 via-blue-600 to-indigo-600 rounded-xl shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center">
              <Clock className="w-8 h-8 mr-3" />
              Export History & Audit Trail
            </h1>
            <p className="text-blue-100 mt-2">
              Complete history of all data exports with audit tracking and compliance monitoring
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-blue-100">Audit Trail</p>
            <p className="text-xs text-blue-200">All Exports Tracked</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase">Total Exports</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalExports}</p>
            </div>
            <div className="p-2 bg-gray-100 rounded-lg">
              <Table className="w-5 h-5 text-gray-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase">PDF Exports</p>
              <p className="text-2xl font-bold text-red-600 mt-1">{stats.pdfExports}</p>
            </div>
            <div className="p-2 bg-red-100 rounded-lg">
              <FileText className="w-5 h-5 text-red-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase">CSV Exports</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{stats.csvExports}</p>
            </div>
            <div className="p-2 bg-green-100 rounded-lg">
              <BarChart3 className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase">Excel Exports</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">{stats.excelExports}</p>
            </div>
            <div className="p-2 bg-blue-100 rounded-lg">
              <Table className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase">Expired</p>
              <p className="text-2xl font-bold text-gray-600 mt-1">{stats.expiredExports}</p>
            </div>
            <div className="p-2 bg-gray-100 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-gray-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase">Failed</p>
              <p className="text-2xl font-bold text-red-600 mt-1">{stats.failedExports}</p>
            </div>
            <div className="p-2 bg-red-100 rounded-lg">
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
          <Filter className="w-5 h-5 mr-2 text-indigo-600" />
          Filters & Search
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by watermark or user..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full border border-gray-300 rounded-md pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Format Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Format</label>
            <select
              value={selectedFormat}
              onChange={(e) => { setSelectedFormat(e.target.value); setPage(1) }}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Formats</option>
              <option value="pdf">PDF</option>
              <option value="csv">CSV</option>
              <option value="excel">Excel</option>
            </select>
          </div>

          {/* Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
            <select
              value={selectedType}
              onChange={(e) => { setSelectedType(e.target.value); setPage(1) }}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Types</option>
              <option value="financial">Financial</option>
              <option value="security">Security</option>
              <option value="audit">Audit</option>
              <option value="compliance">Compliance</option>
              <option value="rbac">RBAC</option>
              <option value="tenant">Tenant</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => { setSelectedStatus(e.target.value); setPage(1) }}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Statuses</option>
              <option value="completed">Completed</option>
              <option value="processing">Processing</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
              <option value="expired">Expired</option>
            </select>
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
            <div className="flex space-x-2">
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => { setDateRange(prev => ({ ...prev, start: e.target.value })); setPage(1) }}
                className="w-full border border-gray-300 rounded-md px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <div className="flex space-x-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => { setDateRange(prev => ({ ...prev, end: e.target.value })); setPage(1) }}
                className="border border-gray-300 rounded-md px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          <button
            onClick={() => {
              setSearchQuery('')
              setSelectedFormat('all')
              setSelectedType('all')
              setSelectedStatus('all')
              setDateRange({ start: '', end: '' })
              setPage(1)
            }}
            className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
          >
            Clear All Filters
          </button>
        </div>
      </div>

      {/* Export History Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 flex items-center">
            <Clock className="w-5 h-5 mr-2 text-gray-600" />
            Export Records
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Showing {filteredRecords.length} export{filteredRecords.length !== 1 ? 's' : ''} {searchQuery && `matching "${searchQuery}"`}
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Activity className="w-8 h-8 text-indigo-600 animate-spin" />
            <span className="ml-3 text-gray-600 font-medium">Loading export history...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Watermark
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Format
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Records
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Requested By
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Requested At
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Downloaded
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Download Count
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Expires
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    IP Address
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan={12} className="px-6 py-12 text-center text-gray-500">
                      <FileText className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                      <p className="text-lg font-medium">No export records found</p>
                      <p className="text-sm mt-1">Try adjusting your filters or search criteria</p>
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map((record) => (
                    <tr key={record._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Hash className="w-4 h-4 mr-2 text-indigo-600" />
                          <div>
                            <div className="text-sm font-mono font-medium text-gray-900">{record.watermark}</div>
                            <div className="text-xs text-gray-500">{record.filename}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center w-fit ${getTypeColor(record.type)}`}>
                          {getTypeIcon(record.type)}
                          <span className="ml-1">{record.type.toUpperCase()}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getFormatColor(record.format)}`}>
                          {record.format.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center w-fit ${getStatusColor(record.status)}`}>
                          {getStatusIcon(record.status)}
                          <span className="ml-1">{record.status.toUpperCase()}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {record.recordCount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{record.requestedBy}</div>
                        <div className="text-xs text-gray-500">{record.requestedByEmail}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>{new Date(record.requestedAt).toLocaleDateString()}</div>
                        <div className="text-gray-500 text-xs">{new Date(record.requestedAt).toLocaleTimeString()}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {record.downloadedAt ? (
                          <div>
                            <div>{new Date(record.downloadedAt).toLocaleDateString()}</div>
                            <div className="text-gray-500 text-xs">{new Date(record.downloadedAt).toLocaleTimeString()}</div>
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          record.downloadCount > 0 ? 'text-indigo-700 bg-indigo-100' : 'text-gray-500 bg-gray-100'
                        }`}>
                          {record.downloadCount}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {record.expired ? (
                          <span className="text-red-600 font-medium text-xs">Expired</span>
                        ) : (
                          <div>
                            <div>{new Date(record.expiresAt).toLocaleDateString()}</div>
                            <div className="text-gray-500 text-xs">{new Date(record.expiresAt).toLocaleTimeString()}</div>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                        {record.ipAddress}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center space-x-2">
                          {record.status === 'completed' && !record.expired && (
                            <button
                              className="text-indigo-600 hover:text-indigo-900 flex items-center text-xs font-medium"
                              onClick={() => {
                                const link = document.createElement('a')
                                link.href = (record as any).downloadUrl || `/api/export/${record._id}/download`
                                link.download = record.filename || `export-${record._id}.csv`
                                link.click()
                                toast.success('Download started')
                              }}
                            >
                              <Download className="w-4 h-4 mr-1" />
                              Download
                            </button>
                          )}
                          <button
                            className="text-gray-600 hover:text-gray-900 flex items-center text-xs font-medium"
                            onClick={() => {
                              toast.success(`Export: ${record.filename || record.watermark}`)
                            }}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Page {page} of {totalPages}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setPage(prev => Math.max(1, prev - 1))}
                disabled={page === 1}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`px-3 py-1 text-sm border rounded-md ${
                    page === p
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                disabled={page === totalPages}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Security Notice */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start">
          <Shield className="w-5 h-5 text-yellow-600 mt-0.5 mr-3" />
          <div>
            <h4 className="text-sm font-medium text-yellow-800">Export Audit & Compliance Notice</h4>
            <div className="text-sm text-yellow-700 mt-1">
              <ul className="list-disc list-inside space-y-1">
                <li>All export activities are logged with IP address and user attribution for compliance</li>
                <li>Exported files contain unique watermarks for traceability and leak detection</li>
                <li>Downloads expire after 24 hours and access links are invalidated automatically</li>
                <li>Failed and expired exports are retained in the audit trail for regulatory review</li>
                <li>Unauthorized export attempts trigger security alerts to the compliance team</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}