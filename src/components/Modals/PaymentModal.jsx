import { useState, useEffect } from 'react';

export default function PaymentModal({ isOpen, onClose, debt, onPay }) {
    const [amount, setAmount] = useState('');
    const [dateOnly, setDateOnly] = useState(new Date().toISOString().split('T')[0]);
    const [timeOnly, setTimeOnly] = useState('00:00');
    const [medium, setMedium] = useState('Transferencia');
    const [note, setNote] = useState('');

    useEffect(() => {
        if (isOpen) {
            setAmount('');
            setDateOnly(new Date().toISOString().split('T')[0]);
            setTimeOnly('00:00');
            setMedium('Transferencia');
            setNote('');
        }
    }, [isOpen]);

    // Helper to merge date and time into ISO string
    const mergeDateTime = (date, time) => {
        if (!date) return new Date().toISOString();
        const timeValue = time || '00:00';
        return new Date(`${date}T${timeValue}:00`).toISOString();
    };

    if (!debt) return null;

    const remaining = debt.amount - debt.paidAmount;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!amount || parseFloat(amount) <= 0) return;

        onPay(debt.id, {
            amount: parseFloat(amount),
            medium,
            note,
            date: mergeDateTime(dateOnly, timeOnly),
            evidence: null
        });
        onClose();
    };

    return (
        <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '24px', textAlign: 'center' }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                    Registrando pago para
                    <strong style={{ color: 'var(--text-primary)', marginLeft: '4px' }}>{debt.reason}</strong>
                </p>
                <h2 style={{ fontSize: '32px', marginTop: '8px' }}>
                    ${remaining.toFixed(2)}
                    <span style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: 'normal' }}> restante</span>
                </h2>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginBottom: '14px' }}>
                <div style={{ flex: '2' }}>
                    <label className="form-label">Fecha</label>
                    <div className="input-group-unified" style={{
                        display: 'flex',
                        alignItems: 'center',
                        backgroundColor: 'rgba(30, 41, 59, 0.5)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '12px',
                        padding: '2px 14px',
                        transition: 'all 0.2s ease'
                    }}>
                        <input
                            type="date"
                            value={dateOnly}
                            onChange={(e) => setDateOnly(e.target.value)}
                            required
                            style={{
                                width: '100%',
                                background: 'transparent',
                                border: 'none',
                                color: 'var(--text-primary)',
                                padding: '12px 0',
                                outline: 'none',
                                fontSize: '14px',
                                cursor: 'pointer'
                            }}
                        />
                    </div>
                </div>
                <div style={{ flex: '1' }}>
                    <label className="form-label">Hora</label>
                    <div className="input-group-unified" style={{
                        display: 'flex',
                        alignItems: 'center',
                        backgroundColor: 'rgba(30, 41, 59, 0.5)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '12px',
                        padding: '2px 14px',
                        transition: 'all 0.2s ease'
                    }}>
                        <input
                            type="time"
                            value={timeOnly}
                            onChange={(e) => setTimeOnly(e.target.value)}
                            style={{
                                width: '100%',
                                background: 'transparent',
                                border: 'none',
                                color: 'var(--text-primary)',
                                padding: '12px 0',
                                outline: 'none',
                                fontSize: '14px',
                                cursor: 'pointer'
                            }}
                        />
                    </div>
                </div>
            </div>

            <div className="form-group">
                <label className="form-label">Monto del Pago</label>
                <div className="input-group-unified" style={{
                    display: 'flex',
                    alignItems: 'center',
                    backgroundColor: 'rgba(30, 41, 59, 0.5)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '12px',
                    padding: '2px 14px',
                    transition: 'all 0.2s ease'
                }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '14px', marginRight: '8px' }}>$</span>
                    <input
                        type="number"
                        placeholder="0.00"
                        style={{
                            width: '100%',
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--text-primary)',
                            padding: '12px 0',
                            outline: 'none',
                            fontSize: '18px',
                            fontWeight: '500'
                        }}
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        max={remaining}
                        step="0.01"
                        required
                        autoFocus
                    />
                </div>
                <div style={{ marginTop: '8px', display: 'flex', gap: '8px' }}>
                    <button
                        type="button"
                        className="badge"
                        style={{ background: 'var(--bg-surface-hover)', cursor: 'pointer', border: 'none', color: 'var(--text-secondary)' }}
                        onClick={() => setAmount((remaining / 2).toFixed(2))}
                    >
                        50%
                    </button>
                    <button
                        type="button"
                        className="badge"
                        style={{ background: 'var(--bg-surface-hover)', cursor: 'pointer', border: 'none', color: 'var(--text-secondary)' }}
                        onClick={() => setAmount(remaining.toFixed(2))}
                    >
                        Todo
                    </button>
                </div>
            </div>

            <div className="form-group">
                <label className="form-label">Medio de Pago</label>
                <div className="input-group-unified" style={{
                    display: 'flex',
                    alignItems: 'center',
                    backgroundColor: 'rgba(30, 41, 59, 0.5)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '12px',
                    padding: '2px 14px',
                    transition: 'all 0.2s ease'
                }}>
                    <select
                        value={medium}
                        onChange={(e) => setMedium(e.target.value)}
                        style={{
                            width: '100%',
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--text-primary)',
                            padding: '12px 0',
                            outline: 'none',
                            fontSize: '14px',
                            cursor: 'pointer'
                        }}
                    >
                        <option value="Transferencia" style={{ background: '#1e293b' }}>Transferencia</option>
                        <option value="Efectivo" style={{ background: '#1e293b' }}>Efectivo</option>
                        <option value="Tarjeta" style={{ background: '#1e293b' }}>Tarjeta</option>
                        <option value="Otro" style={{ background: '#1e293b' }}>Otro</option>
                    </select>
                </div>
            </div>

            <div className="form-group">
                <label className="form-label">Observaciones</label>
                <div className="input-group-unified" style={{
                    display: 'flex',
                    alignItems: 'center',
                    backgroundColor: 'rgba(30, 41, 59, 0.5)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '12px',
                    padding: '2px 14px',
                    transition: 'all 0.2s ease'
                }}>
                    <input
                        type="text"
                        placeholder="Ej: Pago parcial..."
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        style={{
                            width: '100%',
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--text-primary)',
                            padding: '12px 0',
                            outline: 'none',
                            fontSize: '14px'
                        }}
                    />
                </div>
            </div>


            <button type="submit" className="btn-primary" style={{ backgroundColor: 'var(--color-success)' }}>
                Confirmar Pago
            </button>
        </form >
    );
}
