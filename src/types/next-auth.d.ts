// eslint-disable-next-line @typescript-eslint/no-unused-vars
import NextAuth from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: 'DOG_OWNER' | 'FIELD_OWNER' | 'ADMIN'
      email?: string | null
      name?: string | null
      image?: string | null
    }
  }

  interface User {
    id: string
    role: 'DOG_OWNER' | 'FIELD_OWNER' | 'ADMIN'
    email?: string | null
    name?: string | null
    image?: string | null
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: 'DOG_OWNER' | 'FIELD_OWNER' | 'ADMIN'
    user?: {
      id: string
      email: string
      name?: string | null
      image?: string | null
      role: 'DOG_OWNER' | 'FIELD_OWNER' | 'ADMIN'
    }
  }
}