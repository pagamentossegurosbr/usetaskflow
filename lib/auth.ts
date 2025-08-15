import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import GitHubProvider from "next-auth/providers/github"
import { prisma } from "./prisma"
import bcrypt from "bcryptjs"
// Role enum local para compatibilidade
enum Role {
  USER = "USER",
  ADMIN = "ADMIN", 
  OWNER = "OWNER"
}

export const authOptions: NextAuthOptions = {
  // Adapter removido para simplificar
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
            role: true
          }
        })

        if (!user) {
          throw new Error("Usuário não encontrado")
        }

        // Verificação de ban removida para schema simples

        // Verificar se o usuário tem senha
        if (!user.password) {
          throw new Error("Conta criada com OAuth. Use login social.")
        }

        // Verificar senha
        const isPasswordValid = await bcrypt.compare(credentials.password, user.password)
        
        if (!isPasswordValid) {
          throw new Error("Senha inválida")
        }

        // Atualização de último login removida para schema simples

        // Log do login (removido para schema minimalista)
        console.log('User login:', user.email);

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: null,
          role: user.role as any
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
        session.user.role = token.role as string
        // Adicionar apenas dados essenciais na sessão
        if (token.level) session.user.level = token.level as number
        if (token.xp) session.user.xp = token.xp as number
      }
      return session
    },
        async signIn({ user, account, profile }) {
      // SignIn simplificado - sempre retorna true
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