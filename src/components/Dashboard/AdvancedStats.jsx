import { Users, Calendar, TrendingUp } from 'lucide-react';

export default function AdvancedStats({ debts }) {
    // Logic to calculate stats
    const topDebtors = {};
    const topCreditors = {};
    let recoveredMonth = 0;

    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM

    debts.forEach(d => {
        if (d.type === 'lent') {
            // Top Debtors (Who owes me)
            if (d.status === 'active') {
                const remaining = d.amount - d.paidAmount;
                topDebtors[d.counterparty] = (topDebtors[d.counterparty] || 0) + remaining;
            }

            // Recovered this month
            // Check payments history
            if (d.payments) {
                d.payments.forEach(p => {
                    if (p.date.startsWith(currentMonth)) {
                        recoveredMonth += p.amount;
                    }
                });
            }
        } else {
            // Top Creditors (Who I owe)
            if (d.status === 'active') {
                const remaining = d.amount - d.paidAmount;
                topCreditors[d.counterparty] = (topCreditors[d.counterparty] || 0) + remaining;
            }
        }
    });

    // Sort and take top 2
    const sortedDebtors = Object.entries(topDebtors).sort((a, b) => b[1] - a[1]).slice(0, 3);
    const sortedCreditors = Object.entries(topCreditors).sort((a, b) => b[1] - a[1]).slice(0, 3);

    return (
        <div className="summary-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginTop: '24px' }}>
            <div className="card summary-card" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px' }}>
                    <Users size={16} className="text-secondary" />
                    <span className="summary-label">Más te deben</span>
                </div>
                <ul style={{ listStyle: 'none', width: '100%' }}>
                    {sortedDebtors.length > 0 ? sortedDebtors.map(([name, amount]) => (
                        <li key={name} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '13px' }}>
                            <span>{name}</span>
                            <strong style={{ color: 'var(--color-success)' }}>${amount.toFixed(2)}</strong>
                        </li>
                    )) : <li style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Nadie te debe nada</li>}
                </ul>
            </div>

            <div className="card summary-card" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px' }}>
                    <Users size={16} className="text-secondary" />
                    <span className="summary-label">Más debes a</span>
                </div>
                <ul style={{ listStyle: 'none', width: '100%' }}>
                    {sortedCreditors.length > 0 ? sortedCreditors.map(([name, amount]) => (
                        <li key={name} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '13px' }}>
                            <span>{name}</span>
                            <strong style={{ color: 'var(--color-danger)' }}>${amount.toFixed(2)}</strong>
                        </li>
                    )) : <li style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Estás libre de deudas</li>}
                </ul>
            </div>

            <div className="card summary-card" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px' }}>
                    <Calendar size={16} className="text-secondary" />
                    <span className="summary-label">Recuperado este mes</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: 'auto' }}>
                    <TrendingUp size={32} color="var(--color-success)" />
                    <h3 className="summary-value" style={{ fontSize: '28px' }}>${recoveredMonth.toFixed(2)}</h3>
                </div>
            </div>
        </div>
    );
}
