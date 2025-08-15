'use client'

import { Suspense } from 'react'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      {children}
    </Suspense>
  )
} 