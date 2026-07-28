'use client'

import { useState, useEffect } from 'react'
import {
  Search, Loader2, Building2,
  UserX, UserCheck,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
  Shield, X, CheckSquare, Square, Save
} from 'lucide-react'
import toast from 'react-hot-toast'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
const ITEMS_PER_PAGE = 8

const getAuthToken = () => {
  if (typeof window === 'undefined') return null
  const authData = localStorage.getItem('auth-storage')
  if (authData) {
    try {
      const parsed = JSON.parse(authData)
      const token = parsed.state?.token || parsed.token
      if (token) return token
    } catch (e) {}
  }
  const superAdminData = localStorage.getItem('superadmin-storage')
  if (superAdminData) {
    try {
      const parsed = JSON.parse(superAdminData)
      if (parsed.state?.token) return parsed.state.token
    } catch (e) {}
  }
  return localStorage.getItem('superadmin-token') ||
    localStorage.getItem('superAdminToken') ||
    localStorage.getItem('token')
}

const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const token = getAuthToken()
  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(token && { Authorization: `Bearer ${token}` }), ...options.headers }
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'API request failed')
  return data
}

// All permission modules and their actions
const PERMISSION_MODULES: Record<string, string[]> = {
  orders:       ['view', 'create', 'update', 'delete', 'assign', 'cancel', 'process', 'export'],
  customers:    ['view', 'create', 'update', 'delete', 'export'],
  staff:        ['view', 'create', 'update', 'delete', 'assignShift', 'manageAttendance', 'export'],
  branches:     ['view', 'create', 'update', 'delete', 'export'],
  branchAdmins: ['view', 'create', 'update', 'delete'],
  services:     ['view', 'create', 'update', 'delete', 'toggle', 'updatePricing', 'export'],
  inventory:    ['view', 'create', 'update', 'delete', 'restock', 'writeOff', 'export'],
  logistics:    ['view', 'create', 'update', 'delete', 'assign', 'track', 'export'],
  analytics:    ['view', 'export'],
  performance:  ['view', 'create', 'update', 'delete', 'export'],
  settings:     ['view', 'create', 'update', 'delete'],
  branding:     ['view', 'create', 'update', 'delete'],
  tickets:      ['view', 'create', 'update', 'delete', 'assign', 'resolve', 'escalate', 'export'],
  support:      ['view', 'create', 'update', 'delete', 'assign', 'manage', 'export'],
  coupons:      ['view', 'create', 'update', 'delete', 'export'],
  campaigns:    ['view', 'create', 'update', 'delete', 'export'],
  banners:      ['view', 'create', 'update', 'delete'],
  loyalty:      ['view', 'create', 'update', 'delete', 'export'],
  referrals:    ['view', 'create', 'update', 'delete', 'export'],
  wallet:       ['view', 'create', 'update', 'delete', 'export'],
}

const buildAllFalse = () =>
  Object.fromEntries(Object.entries(PERMISSION_MODULES).map(([mod, actions]) =>
    [mod, Object.fromEntries(actions.map(a => [a, false]))]
  ))

const buildAllTrue = () =>
  Object.fromEntries(Object.entries(PERMISSION_MODULES).map(([mod, actions]) =>
    [mod, Object.fromEntries(actions.map(a => [a, true]))]
  ))

type Permissions = Record<string, Record<string, boolean>>

interface Admin {
  _id: string
  name: string
  email: string
  phone: string
  role: string
  isActive: boolean
  createdAt: string
  staffCount?: number
  assignedBranch?: { _id: string; name: string; code: string }
  permissions?: Permissions
}

export default function AdminsPage() {
  const [admins, setAdmins] = useState<Admin[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [goToPage, setGoToPage] = useState('')

  // Permissions modal state
  const [permAdmin, setPermAdmin] = useState<Admin | null>(null)
  const [permissions, setPermissions] = useState<Permissions>(buildAllFalse())
  const [permLoading, setPermLoading] = useState(false)
  const [permSaving, setPermSaving] = useState(false)

  useEffect(() => { setCurrentPage(1) }, [searchTerm])
  useEffect(() => { fetchAdmins() }, [])

  const fetchAdmins = async () => {
    setLoading(true)
    try { const d = await apiCall('/superadmin/admins'); setAdmins(d.data?.admins || []) } catch { setAdmins([]) }
    setLoading(false)
  }

  const handleDeactivateAdmin = async (admin: Admin) => {
    try {
      await apiCall(`/superadmin/admins/${admin._id}`, { method: 'DELETE' })
      toast.success('Admin deactivated')
      setAdmins(prev => prev.map(a => a._id === admin._id ? { ...a, isActive: false } : a))
    } catch (e: any) { toast.error(e.message) }
  }

  const handleReactivateAdmin = async (admin: Admin) => {
    try {
      await apiCall(`/superadmin/admins/${admin._id}/reactivate`, { method: 'PUT' })
      toast.success('Admin reactivated')
      setAdmins(prev => prev.map(a => a._id === admin._id ? { ...a, isActive: true } : a))
    } catch (e: any) { toast.error(e.message) }
  }

  const openPermissions = async (admin: Admin) => {
    setPermAdmin(admin)
    setPermLoading(true)
    try {
      // Try to fetch full admin details including permissions
      const d = await apiCall(`/superadmin/admins/${admin._id}`)
      const perms = d.data?.admin?.permissions || d.data?.permissions || admin.permissions
      if (perms && Object.keys(perms).length > 0) {
        // Merge fetched permissions with the full module list (in case new modules added)
        const merged = buildAllFalse()
        for (const mod of Object.keys(merged)) {
          if (perms[mod]) {
            for (const action of Object.keys(merged[mod])) {
              if (perms[mod][action] !== undefined) merged[mod][action] = perms[mod][action]
            }
          }
        }
        setPermissions(merged)
      } else {
        setPermissions(buildAllFalse())
      }
    } catch {
      // Fallback: use permissions already in admin object or all-false
      const perms = admin.permissions
      if (perms && Object.keys(perms).length > 0) {
        const merged = buildAllFalse()
        for (const mod of Object.keys(merged)) {
          if (perms[mod]) {
            for (const action of Object.keys(merged[mod])) {
              if (perms[mod][action] !== undefined) merged[mod][action] = perms[mod][action]
            }
          }
        }
        setPermissions(merged)
      } else {
        setPermissions(buildAllFalse())
      }
    }
    setPermLoading(false)
  }

  const closePermissions = () => { setPermAdmin(null); setPermissions(buildAllFalse()) }

  const toggleAction = (mod: string, action: string) => {
    setPermissions(prev => ({ ...prev, [mod]: { ...prev[mod], [action]: !prev[mod][action] } }))
  }

  const toggleModule = (mod: string) => {
    const allOn = Object.values(permissions[mod]).every(Boolean)
    setPermissions(prev => ({
      ...prev,
      [mod]: Object.fromEntries(Object.keys(prev[mod]).map(a => [a, !allOn]))
    }))
  }

  const grantAll = () => setPermissions(buildAllTrue())
  const revokeAll = () => setPermissions(buildAllFalse())

  const countGranted = () => {
    let count = 0
    for (const mod of Object.values(permissions)) for (const v of Object.values(mod)) if (v) count++
    return count
  }

  const savePermissions = async () => {
    if (!permAdmin) return
    setPermSaving(true)
    try {
      await apiCall(`/superadmin/admins/${permAdmin._id}/permissions`, {
        method: 'PUT',
        body: JSON.stringify({ permissions })
      })
      toast.success(`Permissions updated for ${permAdmin.name}`)
      setAdmins(prev => prev.map(a => a._id === permAdmin._id ? { ...a, permissions } : a))
      closePermissions()
    } catch (e: any) { toast.error(e.message) }
    setPermSaving(false)
  }

  const filteredAdmins = admins.filter(a =>
    (a.name?.toLowerCase().includes(searchTerm.toLowerCase()) || a.email?.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const totalPages = Math.ceil(filteredAdmins.length / ITEMS_PER_PAGE)
  const paginatedAdmins = filteredAdmins.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      pages.push(1)
      if (currentPage > 3) pages.push('...')
      const start = Math.max(2, currentPage - 1)
      const end = Math.min(totalPages - 1, currentPage + 1)
      for (let i = start; i <= end; i++) pages.push(i)
      if (currentPage < totalPages - 2) pages.push('...')
      pages.push(totalPages)
    }
    return pages
  }

  const handlePageChange = (page: number) => setCurrentPage(page)

  const handleGoToPage = (e: React.FormEvent) => {
    e.preventDefault()
    const page = parseInt(goToPage)
    if (page >= 1 && page <= totalPages) { setCurrentPage(page); setGoToPage('') }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">Branch Admin Management</h1>
          <p className="text-[11px] text-gray-600">Manage branch admins and their permissions.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-lg shadow-sm p-3 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-blue-700">Total Admins</p>
              <p className="text-lg font-semibold text-gray-900 mt-1">{admins.length}</p>
            </div>
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100 rounded-lg shadow-sm p-4 lg:p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-700">Active</p>
              <p className="text-2xl lg:text-3xl font-semibold text-gray-900 mt-1 lg:mt-2">{admins.filter(a => a.isActive).length}</p>
            </div>
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <UserCheck className="w-5 h-5 lg:w-6 lg:h-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-red-50 to-rose-50 border border-red-100 rounded-lg shadow-sm p-4 lg:p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-700">Inactive</p>
              <p className="text-2xl lg:text-3xl font-semibold text-gray-900 mt-1 lg:mt-2">{admins.filter(a => !a.isActive).length}</p>
            </div>
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <UserX className="w-5 h-5 lg:w-6 lg:h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input type="text" placeholder="Search admins..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm" />
          </div>
        </div>
      </div>

      {/* Admins Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-12"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>
        ) : paginatedAdmins.length === 0 ? (
          <div className="text-center py-12 text-gray-500">No admins found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Admin</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Branch</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedAdmins.map((admin) => (
                  <tr key={admin._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-medium">
                          {admin.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{admin.name}</div>
                          <div className="text-sm text-gray-500">{admin.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {admin.assignedBranch ? (
                        <div className="flex items-center gap-1 text-sm">
                          <Building2 className="w-4 h-4 text-gray-400" />
                          {admin.assignedBranch.name}
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">Not assigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${admin.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {admin.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openPermissions(admin)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg" title="Manage Permissions">
                          <Shield className="w-4 h-4" />
                        </button>
                        {admin.isActive ? (
                          <button onClick={() => handleDeactivateAdmin(admin)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg" title="Deactivate">
                            <UserX className="w-4 h-4" />
                          </button>
                        ) : (
                          <button onClick={() => handleReactivateAdmin(admin)} className="p-2 text-green-600 hover:bg-green-50 rounded-lg" title="Reactivate">
                            <UserCheck className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {filteredAdmins.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-700">
              Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredAdmins.length)} of {filteredAdmins.length} admins
            </div>
            {totalPages > 1 && (
              <div className="flex items-center gap-2">
                <button onClick={() => handlePageChange(1)} disabled={currentPage === 1} className="hidden sm:flex px-2 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 hover:bg-gray-50" title="First Page">
                  <ChevronsLeft className="w-4 h-4" />
                </button>
                <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 hover:bg-gray-50">
                  <ChevronLeft className="w-4 h-4" /><span className="hidden sm:inline ml-1">Previous</span>
                </button>
                <div className="flex items-center gap-1">
                  {getPageNumbers().map((page, index) => (
                    page === '...' ? (
                      <span key={`ellipsis-${index}`} className="px-2 text-gray-500">...</span>
                    ) : (
                      <button key={page} onClick={() => handlePageChange(page as number)} className={`min-w-[36px] px-3 py-1 border rounded-md text-sm ${currentPage === page ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 hover:bg-gray-50'}`}>
                        {page}
                      </button>
                    )
                  ))}
                </div>
                <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 hover:bg-gray-50">
                  <span className="hidden sm:inline mr-1">Next</span><ChevronRight className="w-4 h-4" />
                </button>
                <button onClick={() => handlePageChange(totalPages)} disabled={currentPage === totalPages} className="hidden sm:flex px-2 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 hover:bg-gray-50" title="Last Page">
                  <ChevronsRight className="w-4 h-4" />
                </button>
                {totalPages > 10 && (
                  <form onSubmit={handleGoToPage} className="flex items-center gap-2 ml-4 pl-4 border-l border-gray-200">
                    <span className="text-sm text-gray-600 hidden sm:inline">Go to page</span>
                    <input type="number" min="1" max={totalPages} value={goToPage} onChange={(e) => setGoToPage(e.target.value)} placeholder="#" className="w-14 px-2 py-1 text-sm border border-gray-300 rounded-lg text-center" />
                    <button type="submit" disabled={!goToPage} className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 hover:bg-gray-50">Go</button>
                  </form>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Permissions Modal */}
      {permAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-indigo-100 rounded-full flex items-center justify-center">
                  <Shield className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-gray-900">Manage Permissions</h2>
                  <p className="text-xs text-gray-500">{permAdmin.name} · {permAdmin.email}</p>
                </div>
              </div>
              <button onClick={closePermissions} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            {/* Quick Actions Bar */}
            <div className="flex items-center gap-3 px-6 py-3 border-b bg-gray-50">
              <button onClick={grantAll} className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white text-xs font-medium rounded-lg hover:bg-indigo-700 transition-colors">
                <CheckSquare className="w-3.5 h-3.5" /> Grant All
              </button>
              <button onClick={revokeAll} className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-200 text-gray-700 text-xs font-medium rounded-lg hover:bg-gray-300 transition-colors">
                <Square className="w-3.5 h-3.5" /> Revoke All
              </button>
              <span className="text-xs text-gray-500 ml-auto">{countGranted()} permissions granted</span>
            </div>

            {/* Permissions Grid */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {permLoading ? (
                <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-indigo-500" /></div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(PERMISSION_MODULES).map(([mod, actions]) => {
                    const allOn = actions.every(a => permissions[mod]?.[a])
                    const someOn = actions.some(a => permissions[mod]?.[a])
                    return (
                      <div key={mod} className="border border-gray-200 rounded-xl overflow-hidden">
                        {/* Module Header */}
                        <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50 border-b">
                          <span className="text-xs font-semibold text-gray-700 capitalize">{mod.replace(/([A-Z])/g, ' $1')}</span>
                          <button
                            onClick={() => toggleModule(mod)}
                            className={`text-xs px-2 py-0.5 rounded font-medium transition-colors ${allOn ? 'bg-indigo-100 text-indigo-700' : someOn ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500'}`}
                          >
                            {allOn ? 'All On' : someOn ? 'Partial' : 'All Off'}
                          </button>
                        </div>
                        {/* Action Checkboxes */}
                        <div className="px-4 py-2 grid grid-cols-2 gap-1">
                          {actions.map(action => (
                            <label key={action} className="flex items-center gap-2 py-1 cursor-pointer group">
                              <input
                                type="checkbox"
                                checked={!!permissions[mod]?.[action]}
                                onChange={() => toggleAction(mod, action)}
                                className="w-3.5 h-3.5 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                              />
                              <span className="text-xs text-gray-600 capitalize group-hover:text-gray-900">
                                {action.replace(/([A-Z])/g, ' $1').toLowerCase()}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t bg-gray-50">
              <button onClick={closePermissions} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                Cancel
              </button>
              <button
                onClick={savePermissions}
                disabled={permSaving}
                className="flex items-center gap-2 px-5 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
              >
                {permSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Permissions
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
