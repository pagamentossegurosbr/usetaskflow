import NextAuth from "next-auth"
import { authOptionsFixed } from "@/lib/auth-fixed"

const handler = NextAuth(authOptionsFixed)

export { handler as GET, handler as POST }