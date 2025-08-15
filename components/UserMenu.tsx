'use client'

import { useState } from "react"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  User, 
  LogOut, 
  Settings, 
  UserCheck, 
  Shield,
  RotateCcw,
  FileText
} from "lucide-react"
import { toast } from "sonner"
import { useUpgradeModal } from "@/hooks/useUpgradeModal"
import { Crown } from "lucide-react"

export function UserMenu() {
  const { data: session } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  
  // Hook para upgrade modal
  const { openUpgradeModal, currentPlan } = useUpgradeModal()

  if (!session?.user) return null

  const handleSignOut = async () => {
    setIsLoading(true)
    try {
      toast.success("Fazendo logout...")
      await signOut({ redirect: false })
      router.push("/auth/signin")
    } catch (error) {
      toast.error("Erro ao fazer logout")
      setIsLoading(false)
    }
  }

  const handleSwitchAccount = async () => {
    setIsLoading(true)
    try {
      await signOut({ redirect: false })
      router.push("/auth/signin")
      toast.info("Redirecionando para trocar de conta...")
    } catch (error) {
      toast.error("Erro ao trocar conta")
      setIsLoading(false)
    }
  }

  const handleResetOnboarding = () => {
    const getStorageKey = (key: string) => {
      if (typeof window === 'undefined') return key;
      const domain = window.location.hostname;
      return `${domain}-${key}`;
    };

    // Remover dados de onboarding para forçar reconfiguração
    localStorage.removeItem(getStorageKey('onboarding-completed'));
    localStorage.removeItem(getStorageKey('user-profile'));
    
    toast.success("Configurações resetadas! Redirecionando...")
    router.push("/onboarding")
  }

  const getUserInitials = (name?: string | null) => {
    if (!name) return "U"
    return name
      .split(" ")
      .map(word => word.charAt(0))
      .join("")
      .slice(0, 2)
      .toUpperCase()
  }

  const isAdmin = session.user.role === "OWNER" || session.user.role === "MODERATOR"

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2 bg-card/80 backdrop-blur-sm border-border/50 hover:bg-card/90 shadow-lg"
            disabled={isLoading}
          >
            <Avatar className="h-6 w-6">
              <AvatarImage src={session.user.image || ""} />
              <AvatarFallback className="text-xs">
                {getUserInitials(session.user.name)}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium truncate max-w-20">
              {session.user.name?.split(" ")[0] || "Usuário"}
            </span>
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent 
          side="top" 
          align="start"
          className="w-56 mb-2 bg-card/95 backdrop-blur-sm border-border/50"
        >
          {/* User Info */}
          <div className="px-3 py-2">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={session.user.image || ""} />
                <AvatarFallback className="text-xs">
                  {getUserInitials(session.user.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {session.user.name || "Usuário"}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {session.user.email}
                </p>
                {isAdmin && (
                  <div className="flex items-center gap-1 mt-1">
                    <Shield className="h-3 w-3 text-primary" />
                    <span className="text-xs text-primary font-medium">
                      {session.user.role === "OWNER" ? "Owner" : "Moderador"}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <DropdownMenuSeparator />

          {/* Admin Panel Access */}
          {isAdmin && (
            <>
              <DropdownMenuItem 
                onClick={() => router.push("/admin")}
                className="cursor-pointer"
              >
                <Shield className="mr-2 h-4 w-4" />
                Painel Admin
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}

          {/* Profile & Settings */}
          {currentPlan === 'free' && (
            <DropdownMenuItem 
              onClick={() => openUpgradeModal('executor', 'Todos os Recursos')}
              className="cursor-pointer"
            >
              <Crown className="mr-2 h-4 w-4" />
              Upgrade Plan
            </DropdownMenuItem>
          )}

          <DropdownMenuItem 
            onClick={handleResetOnboarding}
            className="cursor-pointer"
          >
            <User className="mr-2 h-4 w-4" />
            Reconfigurar Perfil
          </DropdownMenuItem>

          <DropdownMenuItem 
            onClick={() => router.push("/blog")}
            className="cursor-pointer"
          >
            <FileText className="mr-2 h-4 w-4" />
            Blog
          </DropdownMenuItem>

          <DropdownMenuItem 
            onClick={() => router.push("/settings")}
            className="cursor-pointer"
          >
            <Settings className="mr-2 h-4 w-4" />
            Configurações
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {/* Account Actions */}
          <DropdownMenuItem 
            onClick={handleSwitchAccount}
            className="cursor-pointer"
            disabled={isLoading}
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Trocar Conta
          </DropdownMenuItem>

          <DropdownMenuItem 
            onClick={handleSignOut}
            className="cursor-pointer text-destructive focus:text-destructive"
            disabled={isLoading}
          >
            <LogOut className="mr-2 h-4 w-4" />
            {isLoading ? "Saindo..." : "Sair"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}