'use client'

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
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
  User, 
  ArrowLeft, 
  Eye, 
  EyeOff, 
  CheckCircle,
  Users,
  Rocket,
  Gamepad2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Crown
} from "lucide-react"
import { toast } from "sonner"

export default function SignUpPage() {
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const router = useRouter()

  // Slides do carrossel para cadastro
  const slides = [
    {
      icon: <Users className="h-8 w-8 text-blue-400" />,
      title: "Junte-se à Comunidade",
      description: "Milhares de usuários já organizam suas vidas com o TaskFlow",
      badge: "Comunidade"
    },
    {
      icon: <Rocket className="h-8 w-8 text-green-400" />,
      title: "Comece Gratuitamente",
      description: "Acesso completo ao plano gratuito, sem cartão de crédito",
      badge: "Gratuito"
    },
    {
      icon: <Gamepad2 className="h-8 w-8 text-purple-400" />,
      title: "Gamificação Divertida",
      description: "Transforme sua produtividade em um jogo viciante",
      badge: "Diversão"
    }
  ]

  // Auto-avançar carrossel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [slides.length])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = "Nome é obrigatório"
    } else if (formData.name.length < 2) {
      newErrors.name = "Nome deve ter pelo menos 2 caracteres"
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email é obrigatório"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email inválido"
    }

    if (!formData.password) {
      newErrors.password = "Senha é obrigatória"
    } else if (formData.password.length < 6) {
      newErrors.password = "Senha deve ter pelo menos 6 caracteres"
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Confirmação de senha é obrigatória"
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Senhas não coincidem"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success("Conta criada com sucesso! Fazendo login automaticamente...")
        
        // Fazer login automático após cadastro bem-sucedido
        const loginResult = await signIn("credentials", {
          email: formData.email,
          password: formData.password,
          redirect: false,
        })

        if (loginResult?.ok) {
          // Redirecionar para onboarding
          router.push("/onboarding")
        } else {
          toast.error("Conta criada, mas erro no login. Tente fazer login manualmente.")
          router.push("/auth/signin")
        }
      } else {
        if (data.details && Array.isArray(data.details)) {
          // Erros de validação específicos
          const fieldErrors: Record<string, string> = {}
          data.details.forEach((error: any) => {
            fieldErrors[error.field] = error.message
          })
          setErrors(fieldErrors)
        } else {
          toast.error(data.error || "Erro ao criar conta")
        }
      }
    } catch (error) {
      console.error("Erro no cadastro:", error)
      toast.error("Erro interno. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value })
    // Limpar erro do campo quando o usuário começar a digitar
    if (errors[field]) {
      setErrors({ ...errors, [field]: "" })
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 via-black to-purple-900/5"></div>
      
      {/* Floating Elements */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-purple-400/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
      
      {/* Main Container */}
      <div className="w-full max-w-6xl relative z-10">
        <Card className="bg-gray-900/50 border border-purple-500/20 backdrop-blur-xl rounded-3xl overflow-hidden shadow-2xl">
          <div className="flex min-h-[700px]">
            {/* Left Side - Registration Form */}
            <div className="flex-1 p-12 flex flex-col justify-center bg-black/20">
              <div className="max-w-md mx-auto w-full">
                {/* Form Header */}
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-600 to-purple-800 rounded-2xl mb-4">
                    <Shield className="h-8 w-8 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-2">Criar Conta</h2>
                  <p className="text-purple-300/70">Junte-se ao TaskFlow e organize sua vida</p>
                </div>

                {/* Registration Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Nome */}
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-white font-medium">Nome completo</Label>
                    <div className="relative group">
                      <User className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-purple-400/60" />
                      <Input
                        id="name"
                        type="text"
                        placeholder="Seu nome completo"
                        value={formData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        className={`pl-12 h-12 bg-gray-900/50 border border-purple-500/20 text-white placeholder:text-purple-400/50 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 rounded-xl transition-all duration-300 ${errors.name ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : ""}`}
                        disabled={loading}
                      />
                    </div>
                    {errors.name && (
                      <p className="text-sm text-red-400 flex items-center gap-1">
                        <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                        {errors.name}
                      </p>
                    )}
                  </div>

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
                        className={`pl-12 h-12 bg-gray-900/50 border border-purple-500/20 text-white placeholder:text-purple-400/50 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 rounded-xl transition-all duration-300 ${errors.email ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : ""}`}
                        disabled={loading}
                      />
                    </div>
                    {errors.email && (
                      <p className="text-sm text-red-400 flex items-center gap-1">
                        <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                        {errors.email}
                      </p>
                    )}
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
                        className={`pl-12 pr-12 h-12 bg-gray-900/50 border border-purple-500/20 text-white placeholder:text-purple-400/50 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 rounded-xl transition-all duration-300 ${errors.password ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : ""}`}
                        disabled={loading}
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
                    {errors.password && (
                      <p className="text-sm text-red-400 flex items-center gap-1">
                        <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                        {errors.password}
                      </p>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-white font-medium">Confirmar senha</Label>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-purple-400/60" />
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirme sua senha"
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                        className={`pl-12 pr-12 h-12 bg-gray-900/50 border border-purple-500/20 text-white placeholder:text-purple-400/50 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 rounded-xl transition-all duration-300 ${errors.confirmPassword ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : ""}`}
                        disabled={loading}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-purple-600/20 text-purple-400 hover:text-purple-300"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        disabled={loading}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-sm text-red-400 flex items-center gap-1">
                        <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                        {errors.confirmPassword}
                      </p>
                    )}
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
                        Criando conta...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5" />
                        Criar conta gratuita
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
                    <span className="px-4 bg-black text-purple-400/70">Já tem uma conta?</span>
                  </div>
                </div>

                {/* Login Link */}
                <Link href="/auth/signin">
                  <Button 
                    variant="outline" 
                    className="w-full h-12 border-purple-500/30 text-purple-300 hover:bg-purple-600/10 hover:border-purple-400 hover:text-white transition-all duration-300 rounded-xl"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Fazer login
                  </Button>
                </Link>

                {/* Footer */}
                <p className="text-center text-xs text-purple-400/50 mt-8">
                  Ao criar uma conta, você concorda com nossos{" "}
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

            {/* Right Side - Benefits Carousel */}
            <div className="flex-1 bg-gradient-to-br from-purple-900/20 to-black p-12 flex flex-col justify-center relative">
              {/* Header */}
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Bem-vindo ao TaskFlow</h1>
                <p className="text-purple-300/70">Sua nova ferramenta de produtividade</p>
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

              {/* Benefits List */}
              <div className="mt-8 space-y-3">
                <div className="flex items-center gap-3 text-purple-200/80">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  <span>100% gratuito para começar</span>
                </div>
                <div className="flex items-center gap-3 text-purple-200/80">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  <span>Sistema de gamificação único</span>
                </div>
                <div className="flex items-center gap-3 text-purple-200/80">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  <span>Interface intuitiva e moderna</span>
                </div>
              </div>

              {/* Premium Badge */}
              <div className="flex flex-wrap justify-center gap-2 mt-8">
                <Badge variant="outline" className="border-purple-500/30 text-purple-300">
                  <Crown className="h-3 w-3 mr-1" />
                  Planos Premium
                </Badge>
                <Badge variant="outline" className="border-purple-500/30 text-purple-300">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Recursos Exclusivos
                </Badge>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}