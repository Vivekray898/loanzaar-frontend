"use client"

import React, { useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'
import PullToRefresh from 'react-simple-pull-to-refresh'
import { motion, AnimatePresence } from 'framer-motion'
import { RefreshCw } from 'lucide-react'

export default function PullToRefreshWrapper({ children, pullThreshold = 60, onRefresh }) {
  const router = useRouter()
  const [refreshing, setRefreshing] = useState(false)

  const handleRefresh = useCallback(async () => {
    setRefreshing(true)
    try {
      if (typeof onRefresh === 'function') {
        await onRefresh()
      } else {
        // Revalidate server components for the current route
        router.refresh()
      }
      // keep animation visible briefly
      await new Promise((res) => setTimeout(res, 1100))
    } finally {
      setRefreshing(false)
    }
    return true
  }, [onRefresh, router])

  return (
    <PullToRefresh onRefresh={handleRefresh} pullDownThreshold={pullThreshold} resistance={2.5}>
      <div className="min-h-screen">
        <AnimatePresence>
          {refreshing && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="fixed top-4 left-1/2 -translate-x-1/2 z-[1500]"
            >
              <div className="flex items-center gap-2 px-3 py-2 bg-white/90 dark:bg-slate-900/80 rounded-full shadow">
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.9, ease: 'linear' }}>
                  <RefreshCw className="h-5 w-5 text-sky-600" />
                </motion.div>
                <span className="text-sm font-medium text-slate-800 dark:text-slate-100">Refreshing…</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {children}
      </div>
    </PullToRefresh>
  )
}
