'use client'

import { useEffect, useRef, useState } from 'react'

// Sticky visibility based on scroll
// - Shows after triggerAfter px
// - Hides near footer (within bottomOffset px of document end)
// - Prefers showing when user scrolls up
export default function useSticky({ triggerAfter = 300, bottomOffset = 200 } = {}) {
  const lastY = useRef(0)
  const [scrollY, setScrollY] = useState(0)
  const [direction, setDirection] = useState('down')
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    let ticking = false
    const onScroll = () => {
      if (ticking) return
      ticking = true
      window.requestAnimationFrame(() => {
        const y = window.scrollY || window.pageYOffset
        setScrollY(y)
        const dir = y < lastY.current ? 'up' : 'down'
        setDirection(dir)

        const doc = document.documentElement
        const scrollHeight = doc.scrollHeight
        const viewportHeight = window.innerHeight
        const nearFooter = y + viewportHeight > scrollHeight - bottomOffset

        // Visibility logic
        const beyondTrigger = y > triggerAfter
        const shouldShow = (beyondTrigger && !nearFooter) || dir === 'up'
        setIsVisible(shouldShow)

        lastY.current = y
        ticking = false
      })
    }

    onScroll() // Initialize
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [triggerAfter, bottomOffset])

  const isNearFooter = typeof window !== 'undefined'
    ? (window.scrollY + window.innerHeight > document.documentElement.scrollHeight - bottomOffset)
    : false

  return { isVisible, isNearFooter, scrollY, direction }
}
