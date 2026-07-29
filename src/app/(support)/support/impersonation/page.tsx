'use client'

import { useState, useEffect } from 'react'

export default function SafeImpersonationPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Safe Impersonation</h1>
          <p className="text-gray-600 mt-1">
            Securely impersonate users for support purposes with full audit trail
          </p>
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 text-center">
          <div className="text-5xl">🔒</div>
          <h2 className="text-xl font-semibold text-gray-700">Safe Impersonation</h2>
          <p className="text-gray-500 max-w-md text-sm">
            This feature allows support agents to securely view a tenant's account context without accessing credentials. Available in an upcoming release.
          </p>
        </div>
      </div>
    </div>
  )
}