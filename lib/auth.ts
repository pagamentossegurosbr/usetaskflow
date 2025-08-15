import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import GitHubProvider from "next-auth/providers/github"
import { prisma } from "./prisma"
import bcrypt from "bcryptjs"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log("❌ Credenciais ausentes")
          return null
        }

        try {
          console.log("=== AUTHORIZE CREDENTIALS ===")
          console.log("Email:", credentials.email)

          const user = await prisma.user.findUnique({
            where: {
              email: credentials.email
            },
            select: {
              id: true,
              email: true,
              name: true,
              password: true,
              role: true
            }
          })

          if (!user) {
            console.log("❌ Usuário não encontrado")
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

          console.log("✅ Credenciais válidas")

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role
          }
        } catch (error) {
          console.error("❌ Erro na autenticação:", error)
          return null
        }
      }
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google" || account?.provider === "github") {
        try {
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
          }
        } catch (error) {
          console.error("❌ Erro ao criar usuário OAuth:", error)
          return false
        }
      }
      return true
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!
        session.user.role = token.role as string
      }
      return session
    }
  },
  pages: {
    signIn: "/auth/signin",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
}

// Função helper para verificar permissões
export async function hasPermission(userId: string, requiredRoles: string[]) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true }
  })

  if (!user) {
    return false
  }

  return requiredRoles.includes(user.role)
}

// Função para verificar se é admin (OWNER ou ADMIN)
export async function isAdmin(userId: string) {
  return hasPermission(userId, ['OWNER', 'ADMIN'])
}

// Função para verificar se é owner
export async function isOwner(userId: string) {
  return hasPermission(userId, ['OWNER'])
}