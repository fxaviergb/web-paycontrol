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
        <div className="summary-grid mini-stats-grid">
            <div className="card stat-box">
                <div className="stat-box-header">
                    <Users size={16} className="text-secondary" />
                    <span className="stat-box-title">Más te deben</span>
                </div>
                <ul className="stat-list">
                    {sortedDebtors.length > 0 ? sortedDebtors.map(([name, amount]) => (
                        <li key={name} className="stat-list-item">
                            <span>{name}</span>
                            <strong className="stat-amount" style={{ color: 'var(--color-success)' }}>${amount.toFixed(2)}</strong>
                        </li>
                    )) : <li style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Nadie te debe nada</li>}
                </ul>
            </div>

            <div className="card stat-box">
                <div className="stat-box-header">
                    <Users size={16} className="text-secondary" />
                    <span className="stat-box-title">Más debes a</span>
                </div>
                <ul className="stat-list">
                    {sortedCreditors.length > 0 ? sortedCreditors.map(([name, amount]) => (
                        <li key={name} className="stat-list-item">
                            <span>{name}</span>
                            <strong className="stat-amount" style={{ color: 'var(--color-danger)' }}>${amount.toFixed(2)}</strong>
                        </li>
                    )) : <li style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Estás libre de deudas</li>}
                </ul>
            </div>

            <div className="card stat-box">
                <div className="stat-box-header">
                    <Calendar size={16} className="text-secondary" />
                    <span className="stat-box-title">Recuperado este mes</span>
                </div>
                <div className="stat-total-display">
                    <TrendingUp size={24} color="var(--color-success)" />
                    <h3 className="stat-total-value">${recoveredMonth.toFixed(2)}</h3>
                </div>
            </div>
        </div>
    );
}
