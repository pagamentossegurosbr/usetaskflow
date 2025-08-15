'use client'

import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, ArrowLeft } from "lucide-react"
import Link from "next/link"

const errorMessages = {
  Configuration: "Erro de configuração do servidor.",
  AccessDenied: "Acesso negado. Você não tem permissão para acessar este recurso.",
  Verification: "Erro de verificação. O token pode ter expirado.",
  Default: "Ocorreu um erro durante a autenticação."
}

export default function AuthErrorPage() {
  const searchParams = useSearchParams()
  const error = searchParams.get("error") as keyof typeof errorMessages
  
  const errorMessage = errorMessages[error] || errorMessages.Default

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-destructive/20 rounded-full flex items-center justify-center">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
          <CardTitle className="text-2xl">Erro de Autenticação</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            {errorMessage}
          </p>
          
          <div className="space-y-2">
            <Link href="/auth/signin" className="block">
              <Button className="w-full">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Tentar Novamente
              </Button>
            </Link>
            <Link href="/" className="block">
              <Button variant="outline" className="w-full">
                Voltar ao Início
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}