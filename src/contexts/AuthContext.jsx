import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../services/supabase';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [organization, setOrganization] = useState(null);
    const [loading, setLoading] = useState(true);

    // Fetch user profile and organization
    const fetchProfile = async (userId) => {
        try {
            const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('*, organizations(*)')
                .eq('id', userId)
                .single();

            if (profileError) {
                console.error('Error fetching profile:', profileError);
                return null;
            }

            setProfile(profileData);
            setOrganization(profileData?.organizations || null);
            return profileData;
        } catch (error) {
            console.error('Error in fetchProfile:', error);
            return null;
        }
    };

    useEffect(() => {
        // Check active session
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            const currentUser = session?.user ?? null;
            setUser(currentUser);

            if (currentUser) {
                await fetchProfile(currentUser.id);
            }

            setLoading(false);
        };

        checkSession();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            const currentUser = session?.user ?? null;
            setUser(currentUser);

            if (currentUser) {
                await fetchProfile(currentUser.id);
            } else {
                setProfile(null);
                setOrganization(null);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    // Sign in with email and password
    const signIn = async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });
        return { data, error };
    };

    // Sign out
    const signOut = async () => {
        const { error } = await supabase.auth.signOut();
        if (!error) {
            setUser(null);
            setProfile(null);
            setOrganization(null);
        }
        return { error };
    };

    // Helper functions for role checks
    const isSuperAdmin = () => profile?.role === 'super_admin';
    const isOrgAdmin = () => profile?.role === 'org_admin';
    const isStaff = () => profile?.role === 'staff';

    return (
        <AuthContext.Provider value={{
            user,
            profile,
            organization,
            loading,
            signIn,
            signOut,
            isAuthenticated: !!user,
            isSuperAdmin,
            isOrgAdmin,
            isStaff,
            refreshProfile: () => user && fetchProfile(user.id)
        }}>
            {children}
        </AuthContext.Provider>
    );
};
