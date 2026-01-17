import { ArrowUpRight, ArrowDownLeft, Clock, CheckCircle } from 'lucide-react';
import './dashboard.css'; // Ensure CSS is available

export default function ActiveDebts({ debts, onDebtClick, onPayClick }) {
    // Only show active debts, sorted by date (newest first)
    const activeDebts = debts.filter(d => d.status === 'active');

    return (
        <div className="card debts-container fade-in" style={{ animationDelay: '0.3s' }}>
            <div className="debts-header">
                <h2>Deudas Activas ({activeDebts.length})</h2>
                <button className="btn-secondary">Ver Todo</button>
            </div>

            <div className="debts-list">
                {activeDebts.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                        ¡No tienes deudas activas! ✨
                    </div>
                ) : (
                    <>
                        {/* Table Header Row */}
                        <div className="debt-grid doc-header">
                            <div></div> {/* Icon */}
                            <div>DEUDA</div>
                            <div className="hide-mobile">SOLICITADO</div>
                            <div className="hide-mobile">INICIAL</div>
                            <div className="hide-mobile">PAGADO</div>
                            <div className="hide-mobile">ESTADO</div>
                            <div>ACCIONES</div>
                        </div>

                        {activeDebts.map((debt) => (
                            <div key={debt.id} className="debt-item-minimal debt-grid">
                                <div className={`debt-icon ${debt.type}`}>
                                    {debt.type === 'lent' ? <ArrowUpRight size={20} /> : <ArrowDownLeft size={20} />}
                                </div>

                                <div className="debt-info">
                                    <h4 style={{ fontSize: '14px', marginBottom: '2px' }}>{debt.counterparty}</h4>
                                    <span className="debt-reason" style={{ fontSize: '13px' }}>{debt.reason}</span>
                                    {/* Mobile Only Meta */}
                                    <div className="show-mobile" style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                                        <span style={{ fontWeight: '600', color: debt.type === 'lent' ? 'var(--color-success)' : 'var(--text-primary)' }}>
                                            ${debt.amount.toFixed(2)}
                                        </span>
                                        <span style={{ margin: '0 4px' }}>•</span>
                                        <span>{debt.date}</span>
                                    </div>
                                </div>

                                <div className="hide-mobile" style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{debt.date}</div>

                                <div className="hide-mobile" style={{ fontSize: '14px', fontWeight: '600' }}>${debt.amount.toFixed(2)}</div>

                                <div className="hide-mobile" style={{ fontSize: '14px', fontWeight: '600', color: 'var(--color-success)' }}>${debt.paidAmount.toFixed(2)}</div>

                                <div className="hide-mobile">
                                    <span className="badge warning"><Clock size={12} /> Pendiente</span>
                                </div>

                                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                    <button
                                        className="btn-secondary"
                                        style={{ padding: '6px 12px', fontSize: '12px' }}
                                        onClick={(e) => { e.stopPropagation(); onPayClick(debt); }}
                                    >
                                        Pagar
                                    </button>
                                    <button
                                        className="btn-text mobile-hide-text"
                                        style={{ padding: '6px 8px', fontSize: '12px', color: 'var(--text-muted)', background: 'transparent' }}
                                        onClick={(e) => { e.stopPropagation(); onDebtClick(debt); }}
                                    >
                                        Detalles
                                    </button>
                                </div>
                            </div>
                        ))}
                    </>
                )}
            </div>
        </div>
    );
}
