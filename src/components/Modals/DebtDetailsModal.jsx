import { useState } from 'react';
import { Calendar, CreditCard, FileText } from 'lucide-react';

export default function DebtDetailsModal({ isOpen, onClose, debt, onPayClick }) {
    if (!debt) return null;

    const remaining = debt.amount - debt.paidAmount;

    return (
        <div className="debt-details-container">
            <div className="details-header" style={{ marginBottom: '24px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <h3 style={{ fontSize: '20px', marginBottom: '4px' }}>{debt.counterparty}</h3>
                        <p style={{ color: 'var(--text-secondary)' }}>{debt.reason}</p>
                    </div>
                    <div className={`badge ${debt.status === 'active' ? 'warning' : 'success'}`}>
                        {debt.status === 'active' ? 'Pendiente' : 'Saldado'}
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginTop: '16px' }}>
                    <div>
                        <span className="text-muted text-xs">Monto Inicial</span>
                        <div className="text-lg font-bold">${debt.amount.toFixed(2)}</div>
                    </div>
                    <div>
                        <span className="text-muted text-xs">Total Pagado</span>
                        <div className="text-lg font-bold text-success">${debt.paidAmount.toFixed(2)}</div>
                    </div>
                    <div>
                        <span className="text-muted text-xs">Restante</span>
                        <div className="text-lg font-bold text-warning">${remaining.toFixed(2)}</div>
                    </div>
                </div>
            </div>

            <div className="installments-section">
                <h4 style={{ fontSize: '16px', marginBottom: '12px' }}>Historial de Cuotas</h4>

                {(!debt.payments || debt.payments.length === 0) ? (
                    <div className="text-muted text-center py-4">No hay pagos registrados aún.</div>
                ) : (
                    <div className="installments-list" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {debt.payments.map((payment) => (
                            <div key={payment.id} className="installment-item" style={{ background: 'var(--bg-surface-hover)', padding: '12px', borderRadius: '8px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                    <span style={{ fontWeight: '600' }}>${payment.amount.toFixed(2)}</span>
                                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{payment.date}</span>
                                </div>
                                <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                                    {payment.medium && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <CreditCard size={12} /> {payment.medium}
                                        </div>
                                    )}
                                    {payment.note && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <FileText size={12} /> {payment.note}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {debt.status === 'active' && (
                <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
                    <button onClick={onPayClick} className="btn-primary" style={{ width: '100%' }}>
                        Registrar Nuevo Pago
                    </button>
                </div>
            )}
        </div>
    );
}
