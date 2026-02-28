import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { SupabaseAdapter } from '@auth/supabase-adapter';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase admin client for database operations
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
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
                        name: profile?.full_name || data.user.email?.split('@')[0] || 'User',
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
        async jwt({ token, user }) {
            // Initial sign in
            if (user) {
                token.id = user.id; // Store user ID in token.id
                token.email = user.email;
                token.name = user.name;
                token.picture = user.image;
            }
            return token;
        },
        async session({ session, token }) {
            if (session?.user) {
                // Use token.id consistently
                session.user.id = token.id as string;
                session.user.email = token.email as string;
                session.user.name = token.name as string;
                session.user.image = token.picture as string;

                // Get fresh user data from database (optional - removes need for extra query)
                try {
                    const { data: profile } = await supabaseAdmin
                        .from('profiles')
                        .select('*')
                        .eq('id', token.id as string)
                        .single();

                    if (profile) {
                        session.user.name = profile.full_name || session.user.name;
                        session.user.image = profile.avatar_url || session.user.image;
                    }
                } catch (error) {
                    console.error('Error fetching profile in session:', error);
                    // Continue with token data if profile fetch fails
                }
            }
            return session;
        },
        async signIn({ user, account }) {
            if (account?.provider === 'google') {
                try {
                    // Check if user exists in profiles table
                    const { data: existingProfile } = await supabaseAdmin
                        .from('profiles')
                        .select('id')
                        .eq('id', user.id)
                        .single();

                    if (!existingProfile) {
                        // Create profile for Google user
                        const { error: insertError } = await supabaseAdmin
                            .from('profiles')
                            .insert({
                                id: user.id,
                                email: user.email!,
                                full_name: user.name,
                                avatar_url: user.image,
                            });

                        if (insertError) {
                            console.error('Error creating profile for Google user:', insertError);
                            // Still allow sign in even if profile creation fails
                        }
                    }
                } catch (error) {
                    console.error('Error in Google signIn callback:', error);
                    // Allow sign in even if there's an error
                }
            }
            return true;
        },
    },
    pages: {
        signIn: '/auth/signin',
        error: '/auth/error',
        verifyRequest: '/auth/verify',
        newUser: '/profile', // Redirect to profile after first sign in
    },
    session: {
        strategy: 'jwt',
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    jwt: {
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    secret: process.env.NEXTAUTH_SECRET,
    debug: process.env.NODE_ENV === 'development', // Enable debug logs in development
};