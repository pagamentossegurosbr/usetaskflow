import { NextAuthOptions } from "next-auth"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import GitHubProvider from "next-auth/providers/github"
import { prisma } from "./prisma"
import bcrypt from "bcryptjs"
import { Role } from "@prisma/client"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email e senha são obrigatórios")
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email
          },
          select: {
            id: true,
            email: true,
            name: true,
            password: true,
            avatar: true,
            role: true,
            level: true,
            xp: true,
            isBanned: true
          }
        })

        if (!user) {
          throw new Error("Usuário não encontrado")
        }

        if (user.isBanned) {
          throw new Error("Usuário banido do sistema")
        }

        // Para este exemplo, vamos assumir que a senha está hasheada
        // Em produção, você deve implementar o hash de senha adequadamente
        const isPasswordValid = await bcrypt.compare(credentials.password, user.password || "")
        
        if (!isPasswordValid) {
          throw new Error("Senha inválida")
        }

        // Atualizar último login
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() }
        })

        // Log do login (removido para schema minimalista)
        console.log('User login:', user.email);

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.avatar,
          role: user.role as any,
          level: user.level,
          xp: user.xp,
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
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24, // 24 horas
  },
  jwt: {
    maxAge: 60 * 60 * 24, // 24 horas
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // Manter apenas dados essenciais no token
        token.role = user.role
        token.id = user.id
        // Remover dados desnecessários para reduzir tamanho
        delete token.picture
        delete token.family_name
        delete token.given_name
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!
        session.user.role = token.role as Role
        // Adicionar apenas dados essenciais na sessão
        if (token.level) session.user.level = token.level as number
        if (token.xp) session.user.xp = token.xp as number
      }
      return session
    },
    async signIn({ user, account, profile }) {
      if (account?.provider === "google" || account?.provider === "github") {
        try {
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email! },
            select: {
              id: true,
              email: true,
              isBanned: true
            }
          })

          if (existingUser?.isBanned) {
            return false
          }

          // Se o usuário não existe, será criado automaticamente pelo adapter
          // Mas podemos definir valores padrão aqui
          if (!existingUser) {
            await prisma.user.upsert({
              where: { email: user.email! },
              update: {},
              create: {
                email: user.email!,
                name: user.name || '',
                image: user.image,
                role: Role.USER,
                level: 1,
                xp: 0,
              }
            })
          }

          return true
        } catch (error) {
          console.error("Erro durante o sign-in:", error)
          return false
        }
      }
      return true
    }
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  // Configurações para evitar problemas com cookies grandes
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24, // 24 horas
      }
    }
  }
}

// Função helper para verificar permissões
export async function hasPermission(userId: string, requiredRoles: Role[]) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true, isBanned: true }
  })

  if (!user || user.isBanned) {
    return false
  }

  return requiredRoles.includes(user.role)
}

// Função para verificar se é admin (OWNER ou MODERATOR)
export async function isAdmin(userId: string) {
  return hasPermission(userId, [Role.OWNER, Role.MODERATOR])
}

// Função para verificar se é owner
export async function isOwner(userId: string) {
  return hasPermission(userId, [Role.OWNER])
}