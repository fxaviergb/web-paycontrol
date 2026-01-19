import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { api } from '../services/api';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);

    const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);

    useEffect(() => {
        // Check active sessions and sets the user
        const setData = async () => {
            const { data: { session }, error } = await supabase.auth.getSession();
            if (error) throw error;
            setSession(session);
            setUser(session?.user);
            setLoading(false);
        };

        const provider = import.meta.env.VITE_DATA_PROVIDER || 'mock';
        if (provider === 'mock' && !localStorage.getItem('paycontrol_mock_user')) {
            setLoading(false);
            return;
        } else if (provider === 'mock') {
            setUser(JSON.parse(localStorage.getItem('paycontrol_mock_user')));
            setLoading(false);
            return;
        }

        setData();

        // Listen for changes on auth state (logged in, signed out, etc.)
        const { data: { listener } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'PASSWORD_RECOVERY') {
                setIsPasswordRecovery(true);
            }
            setSession(session);
            setUser(session?.user);
            setLoading(false);
        });

        return () => {
            listener?.subscription.unsubscribe();
        };
    }, []);

    const value = {
        signUp: async (email, password) => {
            const data = await api.signUp(email, password);
            if ((import.meta.env.VITE_DATA_PROVIDER || 'mock') === 'mock') {
                setUser(data.user);
            }
            return data;
        },
        signIn: async (email, password) => {
            const data = await api.signIn(email, password);
            if ((import.meta.env.VITE_DATA_PROVIDER || 'mock') === 'mock') {
                setUser(data.user);
            }
            return data;
        },
        signOut: async () => {
            await api.signOut();
            if ((import.meta.env.VITE_DATA_PROVIDER || 'mock') === 'mock') {
                setUser(null);
            }
        },
        resetPassword: (email) => api.resetPassword(email),
        updatePassword: (password) => api.updatePassword(password),
        user,
        session,
        loading,
        isPasswordRecovery,
        setIsPasswordRecovery
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};
