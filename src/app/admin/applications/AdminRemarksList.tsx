'use client'

import React, { useEffect, useState } from 'react'
import { MessageSquare, Calendar } from 'lucide-react'
import { supabase } from '@/config/supabase'

interface Remark {
  id: string
  application_id: string
  agent_user_id: string
  remark: string
  created_at: string
  metadata?: any
  agent?: {
    user_id?: string
    full_name?: string
    email?: string
  }
}

export default function AdminRemarksList({ applicationId }: { applicationId: string }) {
  const [remarks, setRemarks] = useState<Remark[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchRemarks()
  }, [applicationId])

  const fetchRemarks = async () => {
    setLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token

      const res = await fetch(`/api/admin/applications/${applicationId}/remarks`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      })

      if (res.ok) {
        const json = await res.json()
        const remarksData: Remark[] = json.data || []

        // Fetch agent profiles for display
        const agentIds = Array.from(new Set(remarksData.map(r => r.agent_user_id)))
        if (agentIds.length > 0) {
          const { data: { session } } = await supabase.auth.getSession()
          const token = session?.access_token
          const profilesRes = await fetch('/api/admin/users', {
            headers: {
              ...(token ? { Authorization: `Bearer ${token}` } : {})
            }
          })
          if (profilesRes.ok) {
            const profilesJson = await profilesRes.json()
            const profiles = profilesJson.data || []
            const byId = Object.fromEntries(profiles.map((p: any) => [p.user_id, p]))
            setRemarks(remarksData.map(r => ({ ...r, agent: byId[r.agent_user_id] || undefined })))
          } else {
            setRemarks(remarksData)
          }
        } else {
          setRemarks(remarksData)
        }
      }
    } catch (err) {
      console.error('Failed to fetch admin remarks:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="border-t border-slate-200 pt-4 mt-4">
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare size={16} className="text-slate-600" />
        <h4 className="text-sm font-bold text-slate-900">Agent Remarks</h4>
      </div>

      {loading ? (
        <p className="text-sm text-slate-500">Loading remarks…</p>
      ) : remarks.length === 0 ? (
        <p className="text-sm text-slate-500 italic">No remarks yet.</p>
      ) : (
        <div className="space-y-3">
          {remarks.map(r => (
            <div key={r.id} className="bg-white border border-slate-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase">{r.agent?.full_name || r.agent_user_id}</p>
                  <div className="text-xs text-slate-400">
                    <Calendar size={12} /> {new Date(r.created_at).toLocaleString()}
                  </div>
                </div>
              </div>
              <p className="text-sm text-slate-800 leading-relaxed">{r.remark}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
