import NextAuth from 'next-auth';
import type { NextAuthOptions } from 'next-auth';
import type { JWT } from 'next-auth/jwt';
import type { Session, User } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
        CredentialsProvider({
            name: 'credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error('Email dhe passwordi janë të detyrueshëm');
                }

                try {
                    const { data, error } = await supabase.auth.signInWithPassword({
                        email: credentials.email,
                        password: credentials.password,
                    });

                    if (error || !data.user) {
                        throw new Error('Email ose passwordi është i gabuar');
                    }

                    return {
                        id: data.user.id,
                        email: data.user.email,
                        name: data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || 'User',
                    };
                } catch (error) {
                    console.error('Auth error:', error);
                    throw new Error('Email ose passwordi është i gabuar');
                }
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }: { token: JWT; user?: User }) {
            if (user) {
                token.id = user.id;
            }
            return token;
        },
        async session({ session, token }: { session: Session; token: JWT }) {
            if (session?.user) {
                session.user.id = token.id as string;

                // Get fresh session from Supabase
                try {
                    const { data: { session: supabaseSession } } = await supabase.auth.getSession();
                    if (supabaseSession?.user) {
                        session.user.name = supabaseSession.user.user_metadata?.full_name || session.user.name;
                    }
                } catch (error) {
                    console.error('Error fetching Supabase session:', error);
                }
            }
            return session;
        },
    },
    pages: {
        signIn: '/auth/signin',
        error: '/auth/error',
    },
    session: {
        strategy: 'jwt',
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    jwt: {
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };