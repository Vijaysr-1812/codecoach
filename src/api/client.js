// import { useEffect, useState } from 'react';
// import { AuthError, Session, User } from '@supabase/supabase-js';
// import { supabase, supabaseClient } from './supabase';

// interface AuthState {
//     session: Session | null;
//     user: User | null;
//     loading: boolean;
//     error: AuthError | null;
// }

// interface AuthActions {
//     signIn: (email: string, password: string) => Promise<void>;
//     signUp: (email: string, password: string, username: string) => Promise<void>;
//     signOut: () => Promise<void>;
//     resetPassword: (email: string) => Promise<void>;
// }

// export function useClient(): AuthState & AuthActions {
//     const [state, setState] = useState<AuthState>({
//         session: null,
//         user: null,
//         loading: true,
//         error: null
//     });

//     useEffect(() => {
//         // Initialize auth state
//         supabase.auth.getSession().then(({ data: { session } }) => {
//             setState(prev => ({
//                 ...prev,
//                 session,
//                 user: session?.user ?? null,
//                 loading: false
//             }));
//         });

//         // Listen for auth changes
//         const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
//             setState(prev => ({
//                 ...prev,
//                 session,
//                 user: session?.user ?? null
//             }));
//         });

//         return () => {
//             subscription.unsubscribe();
//         };
//     }, []);

//     const signIn = async (email: string, password: string) => {
//         try {
//             setState(prev => ({ ...prev, loading: true, error: null }));
//             const { error } = await supabase.auth.signInWithPassword({ email, password });
//             if (error) throw error;
//         } catch (error) {
//             setState(prev => ({ ...prev, error: error as AuthError }));
//             throw error;
//         } finally {
//             setState(prev => ({ ...prev, loading: false }));
//         }
//     };

//     const signUp = async (email: string, password: string, username: string) => {
//         try {
//             setState(prev => ({ ...prev, loading: true, error: null }));
//             const { data: { user }, error } = await supabase.auth.signUp({
//                 email,
//                 password,
//                 options: { data: { username } }
//             });

//             if (error) throw error;
//             if (user) {
//                 await supabaseClient.profiles.create(user.id, { username, email });
//             }
//         } catch (error) {
//             setState(prev => ({ ...prev, error: error as AuthError }));
//             throw error;
//         } finally {
//             setState(prev => ({ ...prev, loading: false }));
//         }
//     };

//     const signOut = async () => {
//         try {
//             setState(prev => ({ ...prev, loading: true, error: null }));
//             const { error } = await supabase.auth.signOut();
//             if (error) throw error;
//         } catch (error) {
//             setState(prev => ({ ...prev, error: error as AuthError }));
//             throw error;
//         } finally {
//             setState(prev => ({ ...prev, loading: false }));
//         }
//     };

//     const resetPassword = async (email: string) => {
//         try {
//             setState(prev => ({ ...prev, loading: true, error: null }));
//             const { error } = await supabase.auth.resetPasswordForEmail(email);
//             if (error) throw error;
//         } catch (error) {
//             setState(prev => ({ ...prev, error: error as AuthError }));
//             throw error;
//         } finally {
//             setState(prev => ({ ...prev, loading: false }));
//         }
//     };

//     return {
//         ...state,
//         signIn,
//         signUp,
//         signOut,
//         resetPassword
//     };
// }