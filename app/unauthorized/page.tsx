'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Home, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function UnauthorizedPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-destructive/20 rounded-full flex items-center justify-center">
            <Shield className="h-8 w-8 text-destructive" />
          </div>
          <CardTitle className="text-2xl">Acesso Negado</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            Você não tem permissão para acessar esta área. 
            Apenas administradores e moderadores podem acessar o painel administrativo.
          </p>
          
          <div className="space-y-2">
            <Link href="/" className="block">
              <Button className="w-full">
                <Home className="mr-2 h-4 w-4" />
                Voltar ao App
              </Button>
            </Link>
            <Button 
              variant="outline" 
              onClick={() => router.back()}
              className="w-full"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}