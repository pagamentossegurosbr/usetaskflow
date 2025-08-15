'use client'

import { useState, useEffect, useCallback } from "react"
import { signIn, getSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Shield, 
  Mail, 
  Lock, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  Zap, 
  Trophy, 
  Target, 
  ChevronLeft,
  ChevronRight,
  Star
} from "lucide-react"
import { toast } from "sonner"

export default function SignInPage() {
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const router = useRouter()
  const searchParams = useSearchParams()

  // Slides do carrossel
  const slides = [
    {
      icon: <Zap className="h-8 w-8 text-purple-400" />,
      title: "Produtividade Máxima",
      description: "Organize suas tarefas e alcance seus objetivos com eficiência",
      badge: "Foco"
    },
    {
      icon: <Trophy className="h-8 w-8 text-yellow-400" />,
      title: "Sistema de Conquistas",
      description: "Ganhe XP, suba de nível e desbloqueie novas funcionalidades",
      badge: "Gamificação"
    },
    {
      icon: <Target className="h-8 w-8 text-green-400" />,
      title: "Metas Inteligentes",
      description: "Defina objetivos claros e acompanhe seu progresso em tempo real",
      badge: "Objetivos"
    }
  ]

  // Auto-avançar carrossel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [slides.length])

  // Verificar se o usuário foi banido
  useEffect(() => {
    const banned = searchParams.get('banned')
    const reason = searchParams.get('reason')
    
    if (banned === 'true') {
      toast.error(`Conta suspensa: ${reason || 'Violação dos termos de uso'}`)
    }
  }, [searchParams])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      })

      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success("Login realizado com sucesso!")
        
        // Verificar se usuário precisa fazer onboarding
        const getStorageKey = (key: string) => {
          if (typeof window === 'undefined') return key;
          const domain = window.location.hostname;
          return `${domain}-${key}`;
        };

        const onboardingCompleted = localStorage.getItem(getStorageKey('onboarding-completed'));
        const hasProfile = localStorage.getItem(getStorageKey('user-profile'));
        
        if (!onboardingCompleted && !hasProfile) {
          router.push("/onboarding")
        } else {
          router.push("/")
        }
      }
    } catch (error) {
      toast.error("Erro ao fazer login")
    } finally {
      setLoading(false)
    }
  }, [formData, router])



  const handleInputChange = useCallback((field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }, [])

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 via-black to-purple-900/5"></div>
      
      {/* Floating Elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-400/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
      
      {/* Main Container */}
      <div className="w-full max-w-6xl relative z-10">
        <Card className="bg-gray-900/50 border border-purple-500/20 backdrop-blur-xl rounded-3xl overflow-hidden shadow-2xl">
          <div className="flex min-h-[600px]">
            {/* Left Side - Carousel */}
            <div className="flex-1 bg-gradient-to-br from-purple-900/20 to-black p-12 flex flex-col justify-center relative">
              {/* Header */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-600 to-purple-800 rounded-2xl mb-4">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-white mb-2">TaskFlow Notch</h1>
                <p className="text-purple-300/70">Sua produtividade em outro nível</p>
              </div>

              {/* Carousel */}
              <div className="relative">
                <div className="text-center mb-8">
                  <Badge className="mb-4 bg-purple-600/20 text-purple-300 border-purple-500/30">
                    {slides[currentSlide].badge}
                  </Badge>
                  
                  <div className="flex justify-center mb-6">
                    {slides[currentSlide].icon}
                  </div>
                  
                  <h2 className="text-2xl font-bold text-white mb-4">
                    {slides[currentSlide].title}
                  </h2>
                  
                  <p className="text-purple-200/70 text-lg leading-relaxed">
                    {slides[currentSlide].description}
                  </p>
                </div>

                {/* Carousel Controls */}
                <div className="flex justify-center items-center gap-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={prevSlide}
                    className="text-purple-300 hover:text-white hover:bg-purple-600/20"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  
                  <div className="flex gap-2">
                    {slides.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentSlide(index)}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${
                          index === currentSlide 
                            ? 'bg-purple-500 w-6' 
                            : 'bg-purple-500/30'
                        }`}
                      />
                    ))}
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={nextSlide}
                    className="text-purple-300 hover:text-white hover:bg-purple-600/20"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              {/* Features Badges */}
              <div className="flex flex-wrap justify-center gap-2 mt-8">
                <Badge variant="outline" className="border-purple-500/30 text-purple-300">
                  <Star className="h-3 w-3 mr-1" />
                  Gamificação
                </Badge>
                <Badge variant="outline" className="border-purple-500/30 text-purple-300">
                  <Zap className="h-3 w-3 mr-1" />
                  Produtividade
                </Badge>
                <Badge variant="outline" className="border-purple-500/30 text-purple-300">
                  <Trophy className="h-3 w-3 mr-1" />
                  Conquistas
                </Badge>
              </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="flex-1 p-12 flex flex-col justify-center bg-black/20">
              <div className="max-w-md mx-auto w-full">
                {/* Form Header */}
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-white mb-2">Bem-vindo de volta</h2>
                  <p className="text-purple-300/70">Entre na sua conta para continuar</p>
                </div>

                {/* Login Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-white font-medium">Email</Label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-purple-400/60" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="seu@email.com"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        className="pl-12 h-12 bg-gray-900/50 border border-purple-500/20 text-white placeholder:text-purple-400/50 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 rounded-xl transition-all duration-300"
                        disabled={loading}
                        required
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-white font-medium">Senha</Label>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-purple-400/60" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Sua senha"
                        value={formData.password}
                        onChange={(e) => handleInputChange("password", e.target.value)}
                        className="pl-12 pr-12 h-12 bg-gray-900/50 border border-purple-500/20 text-white placeholder:text-purple-400/50 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 rounded-xl transition-all duration-300"
                        disabled={loading}
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-purple-600/20 text-purple-400 hover:text-purple-300"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={loading}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <Button 
                    type="submit" 
                    className="w-full h-12 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300" 
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Entrando...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <ArrowRight className="h-5 w-5" />
                        Entrar
                      </div>
                    )}
                  </Button>
                </form>

                {/* Divider */}
                <div className="relative my-8">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-purple-500/20"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-black text-purple-400/70">Não tem uma conta?</span>
                  </div>
                </div>

                {/* Signup Link */}
                <Link href="/auth/signup">
                  <Button 
                    variant="outline" 
                    className="w-full h-12 border-purple-500/30 text-purple-300 hover:bg-purple-600/10 hover:border-purple-400 hover:text-white transition-all duration-300 rounded-xl"
                  >
                    Criar nova conta
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>

                {/* Footer */}
                <p className="text-center text-xs text-purple-400/50 mt-8">
                  Ao entrar, você concorda com nossos{" "}
                  <Link href="/terms" className="underline hover:text-purple-300 transition-colors">
                    Termos
                  </Link>{" "}
                  e{" "}
                  <Link href="/privacy" className="underline hover:text-purple-300 transition-colors">
                    Privacidade
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}