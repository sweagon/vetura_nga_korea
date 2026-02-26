import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { SupabaseAdapter } from '@auth/supabase-adapter';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

// Initialize Supabase admin client for database operations
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! // You'll need to add this to .env.local
);

export const authOptions: NextAuthOptions = {
    adapter: SupabaseAdapter({
        url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
        secret: process.env.SUPABASE_SERVICE_ROLE_KEY!,
    }),
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            profile(profile) {
                return {
                    id: profile.sub,
                    name: profile.name,
                    email: profile.email,
                    image: profile.picture,
                };
            },
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
                    // Sign in with Supabase
                    const { data, error } = await supabaseAdmin.auth.signInWithPassword({
                        email: credentials.email,
                        password: credentials.password,
                    });

                    if (error || !data.user) {
                        throw new Error('Email ose passwordi është i gabuar');
                    }

                    // Get user profile
                    const { data: profile } = await supabaseAdmin
                        .from('profiles')
                        .select('*')
                        .eq('id', data.user.id)
                        .single();

                    return {
                        id: data.user.id,
                        email: data.user.email,
                        name: profile?.full_name || data.user.email?.split('@')[0],
                        image: profile?.avatar_url,
                    };
                } catch (error) {
                    console.error('Auth error:', error);
                    throw new Error('Email ose passwordi është i gabuar');
                }
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user, account }) {
            // Initial sign in
            if (account && user) {
                return {
                    ...token,
                    accessToken: account.access_token,
                    userId: user.id,
                };
            }
            return token;
        },
        async session({ session, token }) {
            if (session?.user) {
                session.user.id = token.userId as string;

                // Get fresh user data from database
                const { data: profile } = await supabaseAdmin
                    .from('profiles')
                    .select('*')
                    .eq('id', token.userId as string)
                    .single();

                if (profile) {
                    session.user.name = profile.full_name || session.user.name;
                    session.user.image = profile.avatar_url || session.user.image;
                }
            }
            return session;
        },
        async signIn({ user, account, profile }) {
            if (account?.provider === 'google') {
                // Check if user exists in profiles table
                const { data: existingProfile } = await supabaseAdmin
                    .from('profiles')
                    .select('id')
                    .eq('id', user.id)
                    .single();

                if (!existingProfile) {
                    // Create profile for Google user
                    await supabaseAdmin.from('profiles').insert({
                        id: user.id,
                        email: user.email!,
                        full_name: user.name,
                        avatar_url: user.image,
                    });
                }
            }
            return true;
        },
    },
    pages: {
        signIn: '/auth/signin',
        error: '/auth/error',
        verifyRequest: '/auth/verify',
        newUser: '/auth/welcome',
        // signUp is not a valid option - removed
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