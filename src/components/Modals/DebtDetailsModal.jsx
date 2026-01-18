import { useState } from 'react';
import {
    Calendar,
    CreditCard,
    FileText,
    DollarSign,
    TrendingUp,
    Wallet,
    ArrowRight,
    CheckCircle2,
    Clock
} from 'lucide-react';

export default function DebtDetailsModal({ isOpen, onClose, debt, onPayClick }) {
    if (!debt) return null;

    const remaining = debt.amount - debt.paidAmount;

    return (
        <div className="debt-details-container fade-in">
            {/* Header: Name & Status */}
            <div className="details-header-premium" style={{ marginBottom: '28px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <h3 style={{ fontSize: '22px', fontWeight: '700', letterSpacing: '-0.02em' }}>{debt.counterparty}</h3>
                    <span className={`badge ${debt.status === 'active' ? 'warning' : 'success'}`} style={{ padding: '4px 12px', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase' }}>
                        {debt.status === 'active' ? 'Pendiente' : 'Saldado'}
                    </span>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FileText size={14} style={{ opacity: 0.6 }} /> {debt.reason}
                </p>
            </div>

            {/* Quick Stats: Ultra-Vibrant & Alive */}
            <div className="details-stats-grid" style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                gap: '12px',
                marginBottom: '32px'
            }}>
                {/* Inicial - Blue/Indigo Gradient */}
                <div style={{
                    background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.2) 0%, rgba(79, 70, 229, 0.05) 100%)',
                    padding: '20px 12px',
                    borderRadius: '20px',
                    border: '1px solid rgba(79, 70, 229, 0.3)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '10px',
                    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)'
                }}>
                    <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '12px',
                        background: '#4f46e5',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        boxShadow: '0 4px 10px rgba(79, 70, 229, 0.4)'
                    }}>
                        <DollarSign size={20} />
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '11px', fontWeight: '700', color: '#a5b4fc', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '2px' }}>Inicial</div>
                        <div style={{ fontSize: '20px', fontWeight: '900', color: '#fff' }}>${debt.amount.toFixed(0)}</div>
                    </div>
                </div>

                {/* Pagado - Green/Emerald Gradient */}
                <div style={{
                    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(16, 185, 129, 0.05) 100%)',
                    padding: '20px 12px',
                    borderRadius: '20px',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '10px',
                    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)'
                }}>
                    <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '12px',
                        background: '#10b981',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        boxShadow: '0 4px 10px rgba(16, 185, 129, 0.4)'
                    }}>
                        <TrendingUp size={20} />
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '11px', fontWeight: '700', color: '#6ee7b7', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '2px' }}>Pagado</div>
                        <div style={{ fontSize: '20px', fontWeight: '900', color: '#34d399' }}>${debt.paidAmount.toFixed(0)}</div>
                    </div>
                </div>

                {/* Restante - Orange/Amber Gradient */}
                <div style={{
                    background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.25) 0%, rgba(245, 158, 11, 0.05) 100%)',
                    padding: '20px 12px',
                    borderRadius: '20px',
                    border: '1px solid rgba(245, 158, 11, 0.4)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '10px',
                    boxShadow: '0 10px 20px rgba(245, 158, 11, 0.15)',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '12px',
                        background: '#f59e0b',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        boxShadow: '0 4px 10px rgba(245, 158, 11, 0.5)'
                    }}>
                        <Wallet size={20} />
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '11px', fontWeight: '700', color: '#fcd34d', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '2px' }}>Pendiente</div>
                        <div style={{ fontSize: '22px', fontWeight: '900', color: '#fbbf24' }}>${remaining.toFixed(0)}</div>
                    </div>
                </div>
            </div>

            {/* Timeline Section */}
            <div className="history-section">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h4 style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-secondary)' }}>Historial de Pagos</h4>
                    <span style={{ fontSize: '11px', background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: '10px', color: 'var(--text-muted)' }}>
                        {debt.payments?.length || 0} movimientos
                    </span>
                </div>

                {(!debt.payments || debt.payments.length === 0) ? (
                    <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '12px', border: '1px dashed var(--border-subtle)' }}>
                        <Clock size={24} style={{ marginBottom: '8px', opacity: 0.3 }} />
                        <div style={{ fontSize: '13px' }}>Aún no hay pagos registrados</div>
                    </div>
                ) : (
                    <div className="premium-timeline" style={{ paddingLeft: '12px', position: 'relative' }}>
                        <div style={{ position: 'absolute', left: '16px', top: '8px', bottom: '8px', width: '2px', background: 'linear-gradient(to bottom, var(--success), transparent)' }}></div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            {debt.payments.map((payment, index) => (
                                <div key={payment.id} className="timeline-event" style={{ position: 'relative', paddingLeft: '24px' }}>
                                    <div style={{
                                        position: 'absolute',
                                        left: '-4px',
                                        top: '4px',
                                        width: '10px',
                                        height: '10px',
                                        borderRadius: '50%',
                                        background: 'var(--bg-surface)',
                                        border: '2px solid var(--success)',
                                        zIndex: 1
                                    }}></div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <div style={{ fontSize: '15px', fontWeight: '700' }}>${payment.amount.toFixed(2)}</div>
                                            <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <Calendar size={10} /> {payment.date}
                                                {payment.medium && <><span style={{ opacity: 0.3 }}>•</span> <CreditCard size={10} /> {payment.medium}</>}
                                            </div>
                                        </div>
                                        {payment.note && (
                                            <div title={payment.note} style={{ color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.05)', padding: '6px', borderRadius: '6px' }}>
                                                <FileText size={14} />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Action Area */}
            {debt.status === 'active' && (
                <div style={{ marginTop: '32px' }}>
                    <button
                        onClick={onPayClick}
                        className="btn-primary"
                        style={{
                            width: '100%',
                            padding: '16px',
                            borderRadius: '14px',
                            fontWeight: '600',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            boxShadow: '0 8px 24px rgba(79, 70, 229, 0.2)'
                        }}
                    >
                        Registrar Pago <ArrowRight size={18} />
                    </button>
                </div>
            )}
        </div>
    );
}
