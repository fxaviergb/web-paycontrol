import { useState } from 'react';
import { initialDebts } from '../../data/mock';

export default function DebtFormModal({ isOpen, onClose, onAdd }) {
    const [formData, setFormData] = useState({
        type: 'lent', // or 'borrowed'
        counterparty: '',
        amount: '',
        reason: '',
        medium: 'Transferencia',
        evidence: null,
        date: new Date().toISOString().split('T')[0]
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.counterparty || !formData.amount) return;

        onAdd({
            ...formData,
            amount: parseFloat(formData.amount),
            id: Date.now().toString(), // Simple ID generation
            status: 'active',
            paidAmount: 0,
            payments: [],
            evidence: formData.evidence ? [formData.evidence] : [],
            currency: '$'
        });

        // Reset and close
        setFormData({
            type: 'lent',
            counterparty: '',
            amount: '',
            reason: '',
            date: new Date().toISOString().split('T')[0]
        });
        onClose();
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="form-group">
                <label className="form-label">Tipo de operación</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                        type="button"
                        className={`form - input ${formData.type === 'lent' ? 'active-type' : ''} `}
                        style={{
                            backgroundColor: formData.type === 'lent' ? 'rgba(99, 102, 241, 0.2)' : '',
                            borderColor: formData.type === 'lent' ? 'var(--color-accent)' : '',
                            textAlign: 'center',
                            cursor: 'pointer'
                        }}
                        onClick={() => setFormData({ ...formData, type: 'lent' })}
                    >
                        Presté dinero
                    </button>
                    <button
                        type="button"
                        className={`form - input ${formData.type === 'borrowed' ? 'active-type' : ''} `}
                        style={{
                            backgroundColor: formData.type === 'borrowed' ? 'rgba(99, 102, 241, 0.2)' : '',
                            borderColor: formData.type === 'borrowed' ? 'var(--color-accent)' : '',
                            textAlign: 'center',
                            cursor: 'pointer'
                        }}
                        onClick={() => setFormData({ ...formData, type: 'borrowed' })}
                    >
                        Me prestaron
                    </button>
                </div>
            </div>

            <div className="form-group">
                <label className="form-label">¿Con quién?</label>
                <input
                    type="text"
                    className="form-input"
                    placeholder="Nombre de la persona"
                    value={formData.counterparty}
                    onChange={(e) => setFormData({ ...formData, counterparty: e.target.value })}
                    required
                />
            </div>

            <div className="form-group">
                <label className="form-label">¿Cuánto?</label>
                <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '12px', top: '10px', color: 'var(--text-muted)' }}>$</span>
                    <input
                        type="number"
                        className="form-input"
                        placeholder="0.00"
                        style={{ paddingLeft: '32px' }}
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        required
                        step="0.01"
                    />
                </div>
            </div>

            <div className="form-group">
                <label className="form-label">¿Por qué?</label>
                <input
                    type="text"
                    className="form-input"
                    placeholder="Ej: Cena, Alquiler..."
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                />
            </div>

            <div className="form-row" style={{ display: 'flex', gap: '16px' }}>
                <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">Medio</label>
                    <select
                        className="form-select"
                        value={formData.medium}
                        onChange={(e) => setFormData({ ...formData, medium: e.target.value })}
                    >
                        <option value="Transferencia">Transferencia</option>
                        <option value="Efectivo">Efectivo</option>
                        <option value="Tarjeta">Tarjeta</option>
                        <option value="Otro">Otro</option>
                    </select>
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">Evidencia</label>
                    <label className="form-input" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '13px' }}>
                        {formData.evidence ? 'Archivo Adjunto' : 'Adjuntar Foto/PDF'}
                        <input
                            type="file"
                            style={{ display: 'none' }}
                            onChange={(e) => setFormData({ ...formData, evidence: e.target.files[0] ? e.target.files[0].name : null })}
                        />
                    </label>
                </div>
            </div>

            <button type="submit" className="btn-primary">
                Crear Registro
            </button>
        </form>
    );
}
