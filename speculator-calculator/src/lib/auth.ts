import { type NextAuthOptions } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from './prisma';
import bcrypt from 'bcrypt';
import type { Adapter } from 'next-auth/adapters';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as Adapter,
  session: { strategy: 'jwt' },
  pages: {},
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const user = await prisma.user.findUnique({ where: { email: credentials.email } });
        if (!user?.passwordHash) return null;
        const ok = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!ok) return null;
        return { id: user.id, email: user.email ?? undefined, name: user.name ?? undefined, image: user.image ?? undefined, role: user.role } as unknown as {
          id: string; email?: string; name?: string; image?: string; role: string;
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      // attach role if present on user
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const u = user as any;
      if (u && typeof u === 'object' && 'role' in u) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (token as any).role = u.role ?? 'USER';
      }
      return token;
    },
    async session({ session, token }) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (session.user as any).role = (token as any).role ?? 'USER';
      return session;
    }
  }
};
