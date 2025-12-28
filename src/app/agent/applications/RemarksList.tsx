'use client'

import React, { useState, useEffect } from 'react'
import { MessageCircle, Send, Calendar } from 'lucide-react'
import { supabase } from '@/config/supabase'

interface Remark {
  id: string
  application_id: string
  agent_user_id: string
  remark: string
  created_at: string
  metadata?: any
}

export default function RemarksList({ applicationId }: { applicationId: string }) {
  const [remarks, setRemarks] = useState<Remark[]>([])
  const [newRemark, setNewRemark] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchRemarks()
  }, [applicationId])

  const fetchRemarks = async () => {
    setLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token

      const res = await fetch(`/api/agent/applications/${applicationId}/remark`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      })

      if (res.ok) {
        const json = await res.json()
        setRemarks(json.data || [])
      }
    } catch (err) {
      console.error('Failed to fetch remarks:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleAddRemark = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newRemark.trim()) return

    setSubmitting(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token

      const res = await fetch(`/api/agent/applications/${applicationId}/remark`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ remark: newRemark })
      })

      if (res.ok) {
        const json = await res.json()
        setRemarks([json.data, ...remarks])
        setNewRemark('')
      } else {
        alert('Failed to add remark')
      }
    } catch (err) {
      alert('Error: ' + (err as Error).message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="border-t border-slate-200 pt-4 mt-4">
      <div className="flex items-center gap-2 mb-4">
        <MessageCircle size={16} className="text-blue-600" />
        <h4 className="text-sm font-bold text-slate-900">Remarks Timeline</h4>
      </div>

      {/* Remark Input */}
      <form onSubmit={handleAddRemark} className="bg-slate-50 rounded-lg p-4 mb-4 border border-slate-200">
        <div className="flex flex-col gap-3">
          <textarea
            value={newRemark}
            onChange={(e) => setNewRemark(e.target.value)}
            placeholder="Add a remark about this application..."
            rows={3}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
          />
          <button
            type="submit"
            disabled={submitting || !newRemark.trim()}
            className="self-end flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <Send size={14} /> Post Remark
          </button>
        </div>
      </form>

      {/* Remarks List */}
      <div className="space-y-3">
        {remarks.length === 0 ? (
          <p className="text-sm text-slate-500 italic text-center py-4">No remarks yet. Add one to get started.</p>
        ) : (
          remarks.map((remark) => (
            <div key={remark.id} className="bg-white border border-slate-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <p className="text-xs font-semibold text-slate-500 uppercase">You</p>
                <div className="flex items-center gap-1 text-xs text-slate-500">
                  <Calendar size={12} />
                  {new Date(remark.created_at).toLocaleDateString()} {new Date(remark.created_at).toLocaleTimeString()}
                </div>
              </div>
              <p className="text-sm text-slate-800 leading-relaxed">{remark.remark}</p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
