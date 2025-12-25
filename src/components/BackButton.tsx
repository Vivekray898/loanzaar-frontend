"use client"

import React from 'react'
import { useRouter } from 'next/navigation'

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & { className?: string }

export default function BackButton({ className, children, ...props }: Props) {
  const router = useRouter()

  return (
    <button
      type="button"
      onClick={() => router.back()}
      className={className}
      {...props}
    >
      {children ?? '← Back'}
    </button>
  )
}
