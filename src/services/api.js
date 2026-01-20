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
        let { data: { user } } = await supabase.auth.getUser();

        // Fallback to local session if getUser fails (common in race conditions)
        if (!user) {
            const { data: { session } } = await supabase.auth.getSession();
            user = session?.user;
        }

        if (!user) {
            console.warn("getProfile: No user session found in any source");
            return null;
        }

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
                persons (id, first_name, last_name, doc_type, doc_number),
                payments (*)
            `)
            .order('date', { ascending: false });
        if (error) throw error;

        return data.map(d => ({
            id: d.id,
            type: d.type,
            personId: d.person_id,
            amount: d.amount,
            paidAmount: d.paid_amount,
            currency: d.currency,
            reason: d.reason,
            medium: d.medium,
            status: d.status,
            dueDate: d.due_date,
            date: d.date,
            observations: d.observations,
            evidence: d.evidence,
            counterparty: d.persons ? `${d.persons.first_name} ${d.persons.last_name}` : 'Unknown',
            person: d.persons ? {
                id: d.persons.id,
                firstName: d.persons.first_name,
                lastName: d.persons.last_name,
                docType: d.persons.doc_type,
                docNumber: d.persons.doc_number
            } : null,
            payments: d.payments || []
        }));
    }

    async getPersons() {
        const { data, error } = await supabase
            .from('persons')
            .select('*')
            .order('first_name');
        if (error) throw error;
        return data.map(p => ({
            id: p.id,
            firstName: p.first_name,
            lastName: p.last_name,
            docType: p.doc_type,
            docNumber: p.doc_number,
            phone: p.phone,
            email: p.email
        }));
    }

    async addDebt(debt) {
        const { data, error } = await supabase
            .from('debts')
            .insert([{
                user_id: (await supabase.auth.getUser()).data.user?.id || MOCK_USER_ID,
                person_id: debt.personId,
                type: debt.type,
                amount: debt.amount,
                paid_amount: debt.paidAmount || 0,
                currency: debt.currency || '$',
                reason: debt.reason,
                medium: debt.medium,
                status: debt.status || 'active',
                due_date: debt.dueDate || null,
                date: debt.date || new Date().toISOString(),
                observations: debt.observations || '',
                evidence: debt.evidence || null
            }])
            .select(`
                *,
                persons (id, first_name, last_name, doc_type, doc_number),
                payments (*)
            `)
            .single();
        if (error) throw error;

        return {
            id: data.id,
            type: data.type,
            personId: data.person_id,
            amount: data.amount,
            paidAmount: data.paid_amount,
            currency: data.currency,
            reason: data.reason,
            medium: data.medium,
            status: data.status,
            dueDate: data.due_date,
            date: data.date,
            observations: data.observations,
            evidence: data.evidence,
            counterparty: data.persons ? `${data.persons.first_name} ${data.persons.last_name}` : 'Unknown',
            person: data.persons ? {
                id: data.persons.id,
                firstName: data.persons.first_name,
                lastName: data.persons.last_name,
                docType: data.persons.doc_type,
                docNumber: data.persons.doc_number
            } : null,
            payments: data.payments || []
        };
    }

    async updateDebt(debt) {
        const { data, error } = await supabase
            .from('debts')
            .update({
                person_id: debt.personId,
                type: debt.type,
                amount: debt.amount,
                paid_amount: debt.paidAmount,
                currency: debt.currency,
                reason: debt.reason,
                medium: debt.medium,
                status: debt.status,
                due_date: debt.dueDate,
                date: debt.date,
                observations: debt.observations,
                evidence: debt.evidence
            })
            .eq('id', debt.id)
            .select(`
                *,
                persons (id, first_name, last_name, doc_type, doc_number),
                payments (*)
            `)
            .single();
        if (error) throw error;

        return {
            id: data.id,
            type: data.type,
            personId: data.person_id,
            amount: data.amount,
            paidAmount: data.paid_amount,
            currency: data.currency,
            reason: data.reason,
            medium: data.medium,
            status: data.status,
            dueDate: data.due_date,
            date: data.date,
            observations: data.observations,
            evidence: data.evidence,
            counterparty: data.persons ? `${data.persons.first_name} ${data.persons.last_name}` : 'Unknown',
            person: data.persons ? {
                id: data.persons.id,
                firstName: data.persons.first_name,
                lastName: data.persons.last_name,
                docType: data.persons.doc_type,
                docNumber: data.persons.doc_number
            } : null,
            payments: data.payments || []
        };
    }

    async addPerson(person) {
        const { data, error } = await supabase
            .from('persons')
            .insert([{
                first_name: person.firstName,
                last_name: person.lastName,
                doc_type: person.docType,
                doc_number: person.docNumber,
                phone: person.phone,
                email: person.email,
                user_id: (await supabase.auth.getUser()).data.user?.id || MOCK_USER_ID
            }])
            .select()
            .single();
        if (error) throw error;
        return {
            id: data.id,
            firstName: data.first_name,
            lastName: data.last_name,
            docType: data.doc_type,
            docNumber: data.doc_number,
            phone: data.phone,
            email: data.email
        };
    }

    async updatePerson(person) {
        const { data, error } = await supabase
            .from('persons')
            .update({
                first_name: person.firstName,
                last_name: person.lastName,
                doc_type: person.docType,
                doc_number: person.docNumber,
                phone: person.phone,
                email: person.email
            })
            .eq('id', person.id)
            .select()
            .single();
        if (error) throw error;
        return {
            id: data.id,
            firstName: data.first_name,
            lastName: data.last_name,
            docType: data.doc_type,
            docNumber: data.doc_number,
            phone: data.phone,
            email: data.email
        };
    }

    async addPayment(debtId, payment) {
        const { data, error } = await supabase
            .from('payments')
            .insert([{
                debt_id: debtId,
                user_id: (await supabase.auth.getUser()).data.user?.id || MOCK_USER_ID,
                amount: payment.amount,
                date: payment.date,
                medium: payment.medium,
                note: payment.note,
                evidence: payment.evidence
            }])
            .select()
            .single();
        if (error) throw error;
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
