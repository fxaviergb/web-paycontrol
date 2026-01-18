import { ArrowUpRight, ArrowDownLeft, Clock, Eye } from 'lucide-react';
import './dashboard.css';

export default function ActiveDebts({ debts, onDebtClick, onPayClick, onViewAll }) {
    // Only show active debts, sorted by date (newest first)
    const activeDebts = debts.filter(d => d.status === 'active');

    return (
        <div className="card debts-container fade-in" style={{ animationDelay: '0.3s' }}>
            <div className="debts-header">
                <h2>Deudas Activas ({activeDebts.length})</h2>
                <button className="btn-secondary" onClick={onViewAll}>Ver Todo</button>
            </div>

            <div className="debts-list">
                {activeDebts.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                        ¡No tienes deudas activas! ✨
                    </div>
                ) : (
                    <>
                        {/* Table Header Row - Hidden on Mobile */}
                        <div className="debt-grid doc-header hide-mobile">
                            <div></div> {/* Icon */}
                            <div>DEUDA</div>
                            <div>SOLICITADO</div>
                            <div>INICIAL</div>
                            <div>PAGADO</div>
                            <div>PENDIENTE</div>
                            <div style={{ textAlign: 'center' }}>ESTADO</div>
                            <div style={{ textAlign: 'center' }}>ACCIONES</div>
                        </div>

                        {activeDebts.map((debt) => {
                            const pendingAmount = debt.amount - debt.paidAmount;

                            return (
                                <div key={debt.id} className="debt-item-minimal debt-grid">
                                    <div className={`debt-icon ${debt.type}`}>
                                        {debt.type === 'lent' ? <ArrowUpRight size={20} /> : <ArrowDownLeft size={20} />}
                                    </div>

                                    <div className="debt-info">
                                        <h4 className="debt-counterparty-name">{debt.counterparty}</h4>
                                        <div className="debt-reason-text">{debt.reason}</div>

                                        {/* Ultra-compact Mobile Meta (User preferred) */}
                                        <div className="show-mobile mobile-meta-compact">
                                            <div className="m-row-stats">
                                                <span className="m-val-total">${debt.amount.toFixed(2)}</span>
                                                <span className="m-dot">•</span>
                                                <span className="m-val-date">{debt.date?.split('T')[0]}</span>
                                            </div>
                                            <div className="m-val-pending">
                                                Pendiente: ${pendingAmount.toFixed(2)}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Desktop View Columns */}
                                    <div className="hide-mobile desktop-col-date">
                                        {debt.date?.split('T')[0]}
                                    </div>

                                    <div className="hide-mobile desktop-col-amount">
                                        ${debt.amount.toFixed(2)}
                                    </div>

                                    <div className="hide-mobile desktop-col-paid">
                                        ${debt.paidAmount.toFixed(2)}
                                    </div>

                                    <div className="hide-mobile desktop-col-pending">
                                        ${pendingAmount.toFixed(2)}
                                    </div>

                                    <div className="hide-mobile desktop-col-status">
                                        <span className="badge warning"><Clock size={12} /> Pendiente</span>
                                    </div>

                                    <div className="debt-actions-area">
                                        <button
                                            className="action-pill-compact"
                                            onClick={(e) => { e.stopPropagation(); onPayClick(debt); }}
                                        >
                                            Pagar
                                        </button>
                                        <button
                                            className="action-icon-eye"
                                            onClick={(e) => { e.stopPropagation(); onDebtClick(debt); }}
                                        >
                                            <Eye size={18} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </>
                )}
            </div>
        </div>
    );
}
