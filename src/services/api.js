import { initialDebts, initialPersons } from '../data/mock';
import { supabase } from './supabaseClient';

// For MVP, we use a fixed user ID if not logged in (to match mock behavior)
const MOCK_USER_ID = '00000000-0000-0000-0000-000000000000';

class MockService {
    async getProfile() {
        return JSON.parse(localStorage.getItem('paycontrol_mock_profile')) || {
            firstName: 'Xavier',
            lastName: 'Garnica',
            email: 'demo@paycontrol.io',
            location: 'Bogotá, CO',
            avatar: `https://ui-avatars.com/api/?name=Xavier+Garnica&background=6366f1&color=fff`,
            currency: 'USD ($)',
            isComplete: true
        };
    }
    async updateProfile(profileData) {
        localStorage.setItem('paycontrol_mock_profile', JSON.stringify({ ...profileData, isComplete: true }));
        return { ...profileData, isComplete: true };
    }
    async getDebts() {
        return initialDebts;
    }
    async getPersons() {
        return initialPersons;
    }
    async addDebt(debt) { return debt; }
    async updateDebt(debt) { return debt; }
    async addPerson(person) { return person; }
    async updatePerson(person) { return person; }
    async addPayment(debtId, payment) { return payment; }
    async deletePayment(debtId, paymentId) { return true; }
    async signIn(email, password) {
        const user = { id: MOCK_USER_ID, email };
        localStorage.setItem('paycontrol_mock_user', JSON.stringify(user));
        return { user, session: {} };
    }
    async signUp(email, password) {
        const user = { id: MOCK_USER_ID, email };
        localStorage.setItem('paycontrol_mock_user', JSON.stringify(user));
        return { user, session: {} };
    }
    async signOut() {
        localStorage.removeItem('paycontrol_mock_user');
        window.location.reload(); // Force refresh to clear states
        return true;
    }
    async resetPassword(email) { return true; }
    async updatePassword(password) { return true; }
}

class SupabaseService {
    async getProfile() {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null;

        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        const defaultAvatar = `https://ui-avatars.com/api/?name=${user.email}&background=6366f1&color=fff`;

        if (error || !data) {
            return {
                id: user.id,
                email: user.email,
                firstName: '',
                lastName: '',
                avatar: defaultAvatar,
                isComplete: false
            };
        }

        return {
            id: user.id,
            email: user.email,
            firstName: data.first_name || '',
            lastName: data.last_name || '',
            location: data.location || '',
            avatar: data.avatar_url || defaultAvatar,
            currency: data.preferred_currency || 'USD ($)',
            isComplete: !!(data.first_name && data.last_name)
        };
    }

    async updateProfile(profileData) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("No user session");

        const { data, error } = await supabase
            .from('profiles')
            .upsert({
                id: user.id,
                first_name: profileData.firstName,
                last_name: profileData.lastName,
                location: profileData.location,
                avatar_url: profileData.avatar,
                preferred_currency: profileData.currency,
                updated_at: new Date()
            })
            .select()
            .single();

        if (error) throw error;
        return {
            ...profileData,
            isComplete: true
        };
    }

    async getDebts() {
        const { data, error } = await supabase
            .from('debts')
            .select(`
                *,
                persons (id, first_name, last_name),
                payments (*)
            `)
            .order('date', { ascending: false });
        if (error) throw error;

        // Map counterparty for UI compatibility
        return data.map(d => ({
            ...d,
            counterparty: d.persons ? `${d.persons.first_name} ${d.persons.last_name}` : 'Unknown'
        }));
    }

    async getPersons() {
        const { data, error } = await supabase
            .from('persons')
            .select('*')
            .order('first_name');
        if (error) throw error;
        return data;
    }

    async addDebt(debt) {
        const { data, error } = await supabase
            .from('debts')
            .insert([{
                ...debt,
                user_id: (await supabase.auth.getUser()).data.user?.id || MOCK_USER_ID
            }])
            .select()
            .single();
        if (error) throw error;
        return data;
    }

    async updateDebt(debt) {
        const { data, error } = await supabase
            .from('debts')
            .update(debt)
            .eq('id', debt.id)
            .select()
            .single();
        if (error) throw error;
        return data;
    }

    async addPerson(person) {
        const { data, error } = await supabase
            .from('persons')
            .insert([{
                ...person,
                user_id: (await supabase.auth.getUser()).data.user?.id || MOCK_USER_ID
            }])
            .select()
            .single();
        if (error) throw error;
        return data;
    }

    async updatePerson(person) {
        const { data, error } = await supabase
            .from('persons')
            .update(person)
            .eq('id', person.id)
            .select()
            .single();
        if (error) throw error;
        return data;
    }

    async addPayment(debtId, payment) {
        const { data, error } = await supabase
            .from('payments')
            .insert([{
                ...payment,
                debt_id: debtId,
                user_id: (await supabase.auth.getUser()).data.user?.id || MOCK_USER_ID
            }])
            .select()
            .single();
        if (error) throw error;

        // We also need to update the debt's paid_amount
        // This should ideally be a DB trigger or a RCP, but for now we do it here
        return data;
    }

    async deletePayment(debtId, paymentId) {
        const { error } = await supabase
            .from('payments')
            .delete()
            .eq('id', paymentId);
        if (error) throw error;
        return true;
    }

    async signIn(email, password) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        return data;
    }

    async signUp(email, password) {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        return data;
    }

    async signOut() {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        return true;
    }

    async resetPassword(email) {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/`,
        });
        if (error) throw error;
        return true;
    }

    async updatePassword(newPassword) {
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        if (error) throw error;
        return true;
    }
}

const provider = import.meta.env.VITE_DATA_PROVIDER || 'mock';
export const api = provider === 'supabase' ? new SupabaseService() : new MockService();
