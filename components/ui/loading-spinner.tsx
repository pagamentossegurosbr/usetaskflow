import { Loader2 } from 'lucide-react'

export function LoadingSpinner({ 
  size = 'default',
  className = '' 
}: { 
  size?: 'sm' | 'default' | 'lg'
  className?: string 
}) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    default: 'h-6 w-6',
    lg: 'h-8 w-8'
  }

  return (
    <div className={`flex items-center justify-center p-8 ${className}`}>
      <Loader2 className={`${sizeClasses[size]} animate-spin text-primary`} />
    </div>
  )
} 