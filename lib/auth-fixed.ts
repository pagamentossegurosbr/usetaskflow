import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import GitHubProvider from "next-auth/providers/github"
import { prisma } from "./prisma"
import bcrypt from "bcryptjs"

export const authOptionsFixed: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        console.log("🔐 Iniciando autorização de credenciais")
        
        if (!credentials?.email || !credentials?.password) {
          console.log("❌ Credenciais ausentes")
          return null
        }

        try {
          console.log("📧 Email:", credentials.email)

          // Verificar conexão com banco de dados
          await prisma.$connect()
          console.log("✅ Conexão com banco estabelecida")

          const user = await prisma.user.findUnique({
            where: {
              email: credentials.email
            },
            select: {
              id: true,
              email: true,
              name: true,
              password: true,
              role: true,
              isBanned: true
            }
          })

          if (!user) {
            console.log("❌ Usuário não encontrado")
            return null
          }

          if (user.isBanned) {
            console.log("❌ Usuário banido")
            return null
          }

          if (!user.password) {
            console.log("❌ Usuário sem senha (OAuth)")
            return null
          }

          const isPasswordValid = await bcrypt.compare(credentials.password, user.password)
          
          if (!isPasswordValid) {
            console.log("❌ Senha inválida")
            return null
          }

          console.log("✅ Credenciais válidas - Usuário autorizado")

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role
          }
        } catch (error) {
          console.error("❌ Erro na autenticação:", error)
          
          // Verificar se é erro de conexão com banco
          if (error instanceof Error && error.message.includes('connect')) {
            console.error("❌ Erro de conexão com banco de dados")
          }
          
          return null
        } finally {
          await prisma.$disconnect()
        }
      }
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      console.log("🔐 Callback signIn executado")
      
      if (account?.provider === "google" || account?.provider === "github") {
        try {
          await prisma.$connect()
          
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email! },
            select: { id: true, email: true, name: true, role: true }
          })

          if (!existingUser) {
            const newUser = await prisma.user.create({
              data: {
                email: user.email!,
                name: user.name!,
                role: "USER"
              },
              select: {
                id: true,
                email: true,
                name: true,
                role: true
              }
            })
            console.log("✅ Novo usuário OAuth criado:", newUser.id)
          } else {
            console.log("✅ Usuário OAuth existente encontrado:", existingUser.id)
          }
        } catch (error) {
          console.error("❌ Erro ao processar usuário OAuth:", error)
          return false
        } finally {
          await prisma.$disconnect()
        }
      }
      return true
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        console.log("🔐 JWT atualizado com role:", user.role)
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!
        session.user.role = token.role as string
        console.log("🔐 Sessão atualizada para usuário:", token.sub)
      }
      return session
    }
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 dias
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
  logger: {
    error(code, ...message) {
      console.error(`❌ NextAuth Error [${code}]:`, ...message)
    },
    warn(code, ...message) {
      console.warn(`⚠️ NextAuth Warning [${code}]:`, ...message)
    },
    debug(code, ...message) {
      console.log(`🔍 NextAuth Debug [${code}]:`, ...message)
    }
  }
}
