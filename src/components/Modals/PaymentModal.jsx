import { useState, useEffect } from 'react';

export default function PaymentModal({ isOpen, onClose, debt, onPay }) {
    const [amount, setAmount] = useState('');
    const [date, setDate] = useState(new Date().toLocaleString('sv').slice(0, 16).replace(' ', 'T'));
    const [medium, setMedium] = useState('Transferencia');
    const [note, setNote] = useState('');

    useEffect(() => {
        if (isOpen) {
            setAmount('');
            setMedium('Transferencia');
            setNote('');
            setDate(new Date().toLocaleString('sv').slice(0, 16).replace(' ', 'T'));
        }
    }, [isOpen]);

    if (!debt) return null;

    const remaining = debt.amount - debt.paidAmount;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!amount || parseFloat(amount) <= 0) return;

        onPay(debt.id, {
            amount: parseFloat(amount),
            medium,
            note,
            date,
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

            <div className="form-group">
                <label className="form-label">Fecha y Hora</label>
                <input
                    type="datetime-local"
                    className="form-input"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                />
            </div>

            <div className="form-group">
                <label className="form-label">Monto del Pago</label>
                <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>$</span>
                    <input
                        type="number"
                        className="form-input"
                        placeholder="0.00"
                        style={{ paddingLeft: '24px', fontSize: '18px' }}
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
                <select
                    className="form-select"
                    value={medium}
                    onChange={(e) => setMedium(e.target.value)}
                >
                    <option value="Transferencia">Transferencia</option>
                    <option value="Efectivo">Efectivo</option>
                    <option value="Tarjeta">Tarjeta</option>
                    <option value="Otro">Otro</option>
                </select>
            </div>

            <div className="form-group">
                <label className="form-label">Observaciones</label>
                <input
                    type="text"
                    className="form-input"
                    placeholder="Ej: Pago parcial..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                />
            </div>


            <button type="submit" className="btn-primary" style={{ backgroundColor: 'var(--color-success)' }}>
                Confirmar Pago
            </button>
        </form >
    );
}
