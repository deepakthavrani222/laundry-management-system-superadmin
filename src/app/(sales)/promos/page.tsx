'use client'

import { useState, useEffect } from 'react'
import api from '@/lib/api'
import { Gift, Plus, Power, PowerOff, Copy, Check, Pencil } from 'lucide-react'

interface Plan { _id: string; name: string; displayName: string; price?: { monthly: number; yearly: number } }
interface Promo {
  _id: string
  code: string
  description?: string
  grantsPlanId: Plan | string
  trialDays: number
  billingCycle: 'monthly' | 'yearly'
  maxRedemptions: number | null
  usedCount: number
  expiresAt: string | null
  isActive: boolean
  createdAt: string
}

export default function PromosPage() {
  const [promos, setPromos] = useState<Promo[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [editPromo, setEditPromo] = useState<Promo | null>(null)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  const fetchPromos = async () => {
    setLoading(true)
    try {
      const res = await api.get('/sales/promos')
      if (res.data?.success) setPromos(res.data.data || [])
    } catch (e) {
      console.error('Fetch promos failed', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchPromos() }, [])

  const toggleActive = async (promo: Promo) => {
    try {
      await api.patch(`/sales/promos/${promo._id}`, { isActive: !promo.isActive })
      fetchPromos()
    } catch (e) {
      console.error('Toggle failed', e)
    }
  }

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 1500)
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Gift className="w-7 h-7 text-purple-600" />
            Promo Codes
          </h1>
          <p className="text-gray-500 text-sm mt-1">Issue free-trial codes new tenants can redeem at signup.</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white rounded-xl font-semibold flex items-center gap-2 hover:from-purple-700 hover:to-fuchsia-700"
        >
          <Plus className="w-5 h-5" />
          New Promo Code
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500">Loading…</div>
        ) : promos.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            No promo codes yet. Create one to let firms redeem free trials at signup.
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr className="text-left text-xs font-semibold text-gray-600 uppercase">
                <th className="px-6 py-3">Code</th>
                <th className="px-6 py-3">Plan</th>
                <th className="px-6 py-3">Trial</th>
                <th className="px-6 py-3">Used / Max</th>
                <th className="px-6 py-3">Expires</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {promos.map(p => {
                const plan = typeof p.grantsPlanId === 'object' ? p.grantsPlanId : null
                return (
                  <tr key={p._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <button
                        onClick={() => copyCode(p.code)}
                        className="font-mono text-sm font-bold text-purple-700 hover:underline flex items-center gap-2"
                      >
                        {p.code}
                        {copiedCode === p.code ? (
                          <Check className="w-4 h-4 text-green-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5 text-gray-400" />
                        )}
                      </button>
                      {p.description && <div className="text-xs text-gray-500 mt-1">{p.description}</div>}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">{plan?.displayName || plan?.name || '—'}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{p.trialDays} days</td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {p.usedCount} / {p.maxRedemptions ?? '∞'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {p.expiresAt ? new Date(p.expiresAt).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        p.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {p.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right flex items-center justify-end gap-1">
                      <button
                        onClick={() => setEditPromo(p)}
                        className="p-2 rounded-lg text-purple-600 hover:bg-purple-50"
                        title="Edit"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => toggleActive(p)}
                        className={`p-2 rounded-lg ${
                          p.isActive
                            ? 'text-red-600 hover:bg-red-50'
                            : 'text-green-600 hover:bg-green-50'
                        }`}
                        title={p.isActive ? 'Deactivate' : 'Activate'}
                      >
                        {p.isActive ? <PowerOff className="w-5 h-5" /> : <Power className="w-5 h-5" />}
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {showCreate && (
        <CreatePromoModal
          onClose={() => setShowCreate(false)}
          onSuccess={() => { setShowCreate(false); fetchPromos() }}
        />
      )}

      {editPromo && (
        <EditPromoModal
          promo={editPromo}
          onClose={() => setEditPromo(null)}
          onSuccess={() => { setEditPromo(null); fetchPromos() }}
        />
      )}
    </div>
  )
}

function EditPromoModal({ promo, onClose, onSuccess }: { promo: Promo; onClose: () => void; onSuccess: () => void }) {
  const [description, setDescription] = useState(promo.description || '')
  const [trialDays, setTrialDays] = useState(promo.trialDays)
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>(promo.billingCycle)
  const [maxRedemptions, setMaxRedemptions] = useState<string>(promo.maxRedemptions != null ? String(promo.maxRedemptions) : '')
  const [expiresAt, setExpiresAt] = useState<string>(promo.expiresAt ? promo.expiresAt.slice(0, 10) : '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      await api.patch(`/sales/promos/${promo._id}`, {
        description,
        trialDays: Number(trialDays),
        billingCycle,
        maxRedemptions: maxRedemptions ? Number(maxRedemptions) : null,
        expiresAt: expiresAt || null,
      })
      onSuccess()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update promo')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="bg-gradient-to-r from-purple-600 to-fuchsia-600 p-6 rounded-t-2xl">
          <h2 className="text-2xl font-bold text-white">Edit Promo Code</h2>
          <p className="text-white/80 text-sm mt-1 font-mono">{promo.code}</p>
        </div>

        <form onSubmit={submit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg text-sm text-red-700">{error}</div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Description (optional)</label>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Free Professional plan for new firms in Q3"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Trial Days (1–365)</label>
              <input
                type="number"
                min={1}
                max={365}
                value={trialDays}
                onChange={(e) => setTrialDays(Number(e.target.value))}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Billing Cycle</label>
              <select
                value={billingCycle}
                onChange={(e) => setBillingCycle(e.target.value as 'monthly' | 'yearly')}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none"
              >
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Max Redemptions <span className="font-normal text-gray-500">(blank = unlimited)</span>
              </label>
              <input
                type="number"
                min={1}
                value={maxRedemptions}
                onChange={(e) => setMaxRedemptions(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Expires <span className="font-normal text-gray-500">(blank = never)</span>
              </label>
              <input
                type="date"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl font-semibold hover:bg-gray-50"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-700 hover:to-fuchsia-700 text-white rounded-xl font-semibold disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function CreatePromoModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [code, setCode] = useState('')
  const [description, setDescription] = useState('')
  const [grantsPlanId, setGrantsPlanId] = useState('')
  const [trialDays, setTrialDays] = useState(90)
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly')
  const [maxRedemptions, setMaxRedemptions] = useState<string>('')
  const [expiresAt, setExpiresAt] = useState<string>('')
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/sales/subscriptions/plans')
      .then(res => { if (res.data?.success) setPlans(res.data.data.plans || []) })
      .catch(() => {})
  }, [])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!code || !grantsPlanId) { setError('Code and plan are required'); return }
    setLoading(true); setError('')
    try {
      await api.post('/sales/promos', {
        code,
        description,
        grantsPlanId,
        trialDays: Number(trialDays),
        billingCycle,
        maxRedemptions: maxRedemptions ? Number(maxRedemptions) : null,
        expiresAt: expiresAt || null,
      })
      onSuccess()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create promo')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="bg-gradient-to-r from-purple-600 to-fuchsia-600 p-6 rounded-t-2xl">
          <h2 className="text-2xl font-bold text-white">New Promo Code</h2>
          <p className="text-white/80 text-sm mt-1">Tenants redeem this at signup for a free trial.</p>
        </div>

        <form onSubmit={submit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg text-sm text-red-700">{error}</div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Code</label>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, ''))}
              placeholder="PRO90"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl font-mono uppercase focus:border-purple-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Description (optional)</label>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Free Professional plan for new firms in Q3"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Grants Plan</label>
            <select
              value={grantsPlanId}
              onChange={(e) => setGrantsPlanId(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none"
              required
            >
              <option value="">Select a plan</option>
              {plans.map(p => (
                <option key={p._id} value={p._id}>{p.displayName || p.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Trial Days (1–365)</label>
              <input
                type="number"
                min={1}
                max={365}
                value={trialDays}
                onChange={(e) => setTrialDays(Number(e.target.value))}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Billing Cycle</label>
              <select
                value={billingCycle}
                onChange={(e) => setBillingCycle(e.target.value as 'monthly' | 'yearly')}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none"
              >
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Max Redemptions <span className="font-normal text-gray-500">(blank = unlimited)</span>
              </label>
              <input
                type="number"
                min={1}
                value={maxRedemptions}
                onChange={(e) => setMaxRedemptions(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Expires <span className="font-normal text-gray-500">(blank = never)</span>
              </label>
              <input
                type="date"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl font-semibold hover:bg-gray-50"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-700 hover:to-fuchsia-700 text-white rounded-xl font-semibold disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Creating…' : 'Create Code'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
