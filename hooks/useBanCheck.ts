'use client'

import { useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { debug } from '@/lib/debug'
import { toast } from 'sonner'

export function useBanCheck() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading' || !session?.user?.email) return

    const checkBanStatus = async () => {
      try {
        const response = await fetch('/api/auth/check-ban')
        if (response.ok) {
          const data = await response.json()
          
          if (data.isBanned) {
            // Usuário foi banido, desconectar imediatamente
            toast.error(`Sua conta foi suspensa. Motivo: ${data.banReason || 'Violação dos termos de uso'}`)
            
            // Fazer logout forçado
            await signOut({ redirect: false })
            
            // Redirecionar para login com mensagem
            router.push(`/auth/signin?banned=true&reason=${encodeURIComponent(data.banReason || 'Conta suspensa')}`)
          }
        }
      } catch (error) {
        debug.log('Erro ao verificar status de banimento:', error)
      }
    }

    // Verificar imediatamente
    checkBanStatus()

    // Verificar a cada 10 segundos
    const interval = setInterval(checkBanStatus, 10000)

    return () => clearInterval(interval)
  }, [session, router])
}