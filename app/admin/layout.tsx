'use client'

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
// Enum local para compatibilidade
enum Role {
  USER = "USER",
  ADMIN = "ADMIN",
  MODERATOR = "MODERATOR",
  OWNER = "OWNER"
}
import { 
  Users, 
  CheckSquare, 
  BarChart3, 
  Trophy, 
  Activity,
  Settings,
  Home,
  Shield,
  LogOut,
  Target
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { signOut } from "next-auth/react"

interface AdminLayoutProps {
  children: React.ReactNode
}

const navigation = [
  {
    name: "Dashboard",
    href: "/admin",
    icon: BarChart3,
    description: "Visão geral do sistema"
  },
  {
    name: "Monitoramento",
    href: "/admin/monitoring",
    icon: Activity,
    description: "Status em tempo real do sistema"
  },
  {
    name: "Usuários",
    href: "/admin/users",
    icon: Users,
    description: "Gerenciar usuários e permissões"
  },
  {
    name: "Tarefas",
    href: "/admin/tasks",
    icon: CheckSquare,
    description: "Monitorar tarefas dos usuários"
  },
  {
    name: "Conquistas",
    href: "/admin/achievements",
    icon: Trophy,
    description: "Gerenciar sistema de conquistas"
  },
  {
    name: "Logs",
    href: "/admin/logs",
    icon: Activity,
    description: "Logs de atividade do sistema"
  },
  {
    name: "CRM",
    href: "/admin/crm",
    icon: Target,
    description: "Gestão de leads e métricas"
  },
  {
    name: "Configurações",
    href: "/admin/settings",
    icon: Settings,
    description: "Configurações do sistema"
  },
]

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === "loading") return

    if (!session) {
      router.push("/auth/signin")
      return
    }

    const userRole = session.user.role as Role
    if (userRole !== Role.OWNER && userRole !== Role.MODERATOR) {
      router.push("/unauthorized")
      return
    }

    setIsLoading(false)
  }, [session, status, router])

  if (isLoading || status === "loading") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!session) return null

  const userRole = session.user.role as Role

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-card border-r border-border min-h-screen">
          <div className="p-6">
            <div className="flex items-center gap-2 mb-8">
              <Shield className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-xl font-bold text-foreground">Admin Panel</h1>
                <p className="text-sm text-muted-foreground">TaskFlow Notch</p>
              </div>
            </div>

            {/* User Info */}
            <Card className="p-4 mb-6 bg-muted/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">{session.user.name}</p>
                  <div className="flex items-center gap-2">
                    <Badge variant={userRole === Role.OWNER ? "default" : "secondary"} className="text-xs">
                      {userRole === Role.OWNER ? "Owner" : "Moderador"}
                    </Badge>
                  </div>
                </div>
              </div>
            </Card>

            {/* Navigation */}
            <nav className="space-y-2">
              {navigation.map((item) => (
                <Link key={item.name} href={item.href}>
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 h-auto p-3 hover:bg-primary/10"
                  >
                    <item.icon className="h-5 w-5" />
                    <div className="text-left">
                      <div className="font-medium">{item.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {item.description}
                      </div>
                    </div>
                  </Button>
                </Link>
              ))}
            </nav>

            {/* Actions */}
            <div className="mt-8 pt-6 border-t border-border space-y-2">
              <Link href="/">
                <Button variant="outline" className="w-full justify-start gap-3">
                  <Home className="h-4 w-4" />
                  Voltar ao App
                </Button>
              </Link>
              <Button
                variant="outline"
                onClick={() => signOut()}
                className="w-full justify-start gap-3 text-destructive hover:text-destructive"
              >
                <LogOut className="h-4 w-4" />
                Sair
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <div className="p-8">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}