import { useState, useEffect, useRef } from 'react';
import { initialDebts } from '../../data/mock';
import { Search, ChevronDown } from 'lucide-react';


export default function DebtFormModal({ isOpen, onClose, onAdd, onEdit, debtToEdit, persons, lastCreatedPerson, onAddPerson }) {
    const [formData, setFormData] = useState({
        type: 'lent', // or 'borrowed'
        personId: '',
        counterparty: '', // Display name (backup)
        amount: '',
        reason: '',
        medium: 'Transferencia',
        evidence: null,
        observations: '',
        dueDate: '',
        date: new Date().toISOString() // Store as ISO string
    });

    // Separate UI state for date and time
    const [dateOnly, setDateOnly] = useState(new Date().toISOString().split('T')[0]);
    const [timeOnly, setTimeOnly] = useState('00:00');

    // Search & Autocomplete State
    const [searchTerm, setSearchTerm] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);
    const [showOptional, setShowOptional] = useState(false);
    const dropdownRef = useRef(null);

    // Auto-select newly created person
    useEffect(() => {
        if (isOpen && lastCreatedPerson) {
            setFormData(prev => ({ ...prev, personId: lastCreatedPerson.id }));
            setSearchTerm(`${lastCreatedPerson.firstName} ${lastCreatedPerson.lastName}`);
        }
    }, [lastCreatedPerson, isOpen]);

    // Helper to split datetime into date and time
    const splitDateTime = (isoString) => {
        if (!isoString) return { date: '', time: '' };
        const dt = new Date(isoString);
        const date = dt.toISOString().split('T')[0];
        const time = dt.toTimeString().slice(0, 5);
        return { date, time };
    };

    // Helper to merge date and time into ISO string (Always 00:00 as per request)
    const mergeDateTime = (date, time) => {
        if (!date) return new Date().toISOString();
        // Force 00:00 time
        return new Date(`${date}T00:00:00`).toISOString();
    };

    // Populate data when editing
    useEffect(() => {
        if (isOpen && debtToEdit) {
            const { date, time } = splitDateTime(debtToEdit.date);
            setDateOnly(date);
            setTimeOnly(time || '00:00');
            setFormData({
                ...debtToEdit,
                date: debtToEdit.date // Keep original ISO format
            });
            setSearchTerm(debtToEdit.counterparty || '');
            setShowOptional(!!(debtToEdit.observations || debtToEdit.dueDate || debtToEdit.medium !== 'Transferencia' || debtToEdit.evidence));
        } else if (isOpen) {
            // Reset form for new debt
            const now = new Date();
            setDateOnly(now.toISOString().split('T')[0]);
            setTimeOnly('00:00');
            setFormData({
                type: 'lent',
                personId: '',
                counterparty: '',
                amount: '',
                reason: '',
                medium: 'Transferencia',
                evidence: null,
                observations: '',
                dueDate: '',
                date: now.toISOString()
            });
            setSearchTerm('');
        }
    }, [debtToEdit, isOpen]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Filter persons
    const filteredPersons = persons ? persons.filter(p => {
        const fullName = `${p.firstName} ${p.lastName}`.toLowerCase();
        return fullName.includes(searchTerm.toLowerCase()) || p.docNumber.includes(searchTerm);
    }) : [];

    const handleSelectPerson = (person) => {
        setFormData({ ...formData, personId: person.id });
        setSearchTerm(`${person.firstName} ${person.lastName}`);
        setShowDropdown(false);
    };

    const isAmountInvalid = debtToEdit && formData.amount && parseFloat(formData.amount) < (debtToEdit.paidAmount || 0);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.personId || !formData.amount || isAmountInvalid) return;

        // Find person name
        const person = persons.find(p => p.id === formData.personId);
        const counterpartyName = person ? `${person.firstName} ${person.lastName}` : 'Unknown';

        const finalAmount = parseFloat(formData.amount);

        if (debtToEdit) {
            const newPaidTotal = debtToEdit.paidAmount || 0;
            const isSettled = newPaidTotal >= finalAmount;

            onEdit({
                ...formData,
                id: debtToEdit.id,
                counterparty: counterpartyName,
                amount: finalAmount,
                status: isSettled ? 'settled' : 'active',
                paidAmount: newPaidTotal,
                payments: debtToEdit.payments || [],
                evidence: formData.evidence ? [formData.evidence] : (debtToEdit.evidence || []),
                currency: debtToEdit.currency || '$',
                date: mergeDateTime(dateOnly, timeOnly)
            });
        } else {
            onAdd({
                ...formData,
                id: Date.now().toString(),
                counterparty: counterpartyName,
                amount: finalAmount,
                paidAmount: 0,
                status: 'active',
                payments: [],
                evidence: formData.evidence ? [formData.evidence] : [],
                currency: '$',
                date: mergeDateTime(dateOnly, timeOnly)
            });
        }

        // Reset and close
        const now = new Date();
        setDateOnly(now.toISOString().split('T')[0]);
        setTimeOnly('00:00');
        setFormData({
            type: 'lent',
            personId: '',
            counterparty: '',
            amount: '',
            reason: '',
            observations: '',
            dueDate: '',
            date: new Date().toLocaleString('sv').slice(0, 16).replace(' ', 'T')
        });
        setSearchTerm('');
        setShowOptional(false);
        onClose();
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="form-group">
                <label className="form-label">Tipo de operación</label>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                        type="button"
                        className={`type-button ${formData.type === 'lent' ? 'active' : ''}`}
                        onClick={() => setFormData({ ...formData, type: 'lent' })}
                    >
                        Presté dinero
                    </button>
                    <button
                        type="button"
                        className={`type-button ${formData.type === 'borrowed' ? 'active' : ''}`}
                        onClick={() => setFormData({ ...formData, type: 'borrowed' })}
                    >
                        Me prestaron
                    </button>
                </div>
            </div>

            <div className="form-group">
                <label className="form-label">¿Con quién?</label>
                <div style={{ position: 'relative' }} ref={dropdownRef}>
                    <div className="input-group-unified" style={{
                        display: 'flex',
                        alignItems: 'center',
                        backgroundColor: 'rgba(30, 41, 59, 0.5)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '12px',
                        padding: '2px 8px 2px 14px',
                        transition: 'all 0.2s ease'
                    }}>
                        <Search size={18} style={{ color: 'var(--text-muted)', minWidth: '18px' }} />

                        <input
                            type="text"
                            placeholder="Buscar persona..."
                            value={searchTerm}
                            onClick={() => setShowDropdown(true)}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setFormData({ ...formData, personId: '' });
                                setShowDropdown(true);
                            }}
                            style={{
                                width: '100%',
                                background: 'transparent',
                                border: 'none',
                                color: 'var(--text-primary)',
                                padding: '12px 12px',
                                outline: 'none',
                                fontSize: '14px'
                            }}
                            required
                        />

                        {/* Divider */}
                        <div style={{ width: '1px', height: '20px', backgroundColor: 'var(--border-subtle)', margin: '0 8px' }}></div>

                        <button
                            type="button"
                            onClick={(e) => { e.preventDefault(); onAddPerson(); }}
                            style={{
                                background: 'rgba(99, 102, 241, 0.1)',
                                border: 'none',
                                color: 'var(--color-accent)',
                                width: '32px',
                                height: '32px',
                                borderRadius: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                            title="Crear nueva persona"
                        >
                            <span style={{ fontSize: '18px', fontWeight: '500', lineHeight: 1 }}>+</span>
                        </button>
                    </div>

                    {showDropdown && (
                        <div className="searchable-dropdown" style={{ top: 'calc(100% + 6px)' }}>
                            {filteredPersons.length > 0 ? (
                                filteredPersons.map(p => (
                                    <div
                                        key={p.id}
                                        className="dropdown-item"
                                        onClick={() => handleSelectPerson(p)}
                                    >
                                        {p.firstName} {p.lastName}
                                        <span className="sub-text">{p.docType}: {p.docNumber}</span>
                                    </div>
                                ))
                            ) : (
                                <div className="dropdown-item" style={{ cursor: 'default', color: 'var(--text-muted)' }}>
                                    No se encontraron resultados
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <div className="form-group">
                <label className="form-label">¿Cuándo?</label>
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
                            cursor: 'pointer' // Make whole area clickable-ish
                        }}
                    />
                </div>
            </div>

            <div className="form-group">
                <label className="form-label">¿Cuánto?</label>
                <div className="input-group-unified" style={{
                    display: 'flex',
                    alignItems: 'center',
                    backgroundColor: 'rgba(30, 41, 59, 0.5)',
                    border: `1px solid ${isAmountInvalid ? '#ef4444' : 'var(--border-subtle)'}`,
                    borderRadius: '12px',
                    padding: '2px 14px',
                    transition: 'all 0.2s ease'
                }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '14px', marginRight: '8px' }}>$</span>
                    <input
                        type="number"
                        placeholder="0.00"
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        required
                        step="0.01"
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
                {isAmountInvalid && (
                    <div style={{
                        color: '#ef4444',
                        fontSize: '12px',
                        marginTop: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                    }}>
                        <span>⚠️ El monto no puede ser menor a lo ya pagado (${debtToEdit.paidAmount}). Modifica los pagos primero.</span>
                    </div>
                )}
            </div>

            <div className="form-group">
                <label className="form-label">¿Por qué? (Concepto)</label>
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
                        placeholder="Ej: Cena, Alquiler..."
                        value={formData.reason}
                        onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                        required
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

            <div style={{ marginBottom: '20px' }}>
                <button
                    type="button"
                    onClick={() => setShowOptional(!showOptional)}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--color-accent)',
                        fontSize: '14px',
                        fontWeight: 500,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: 0
                    }}
                >
                    {showOptional ? 'Ocultar detalles adicionales' : 'Agregar detalles adicionales'}
                    <ChevronDown size={16} style={{ transform: showOptional ? 'rotate(180deg)' : '0deg', transition: 'transform 0.2s' }} />
                </button>
            </div>

            {
                showOptional && (
                    <div className="slide-up">
                        <div className="form-group">
                            <label className="form-label">Observaciones adicionales</label>
                            <div className="input-group-unified" style={{
                                display: 'flex',
                                alignItems: 'flex-start', // Align to top for textarea
                                backgroundColor: 'rgba(30, 41, 59, 0.5)',
                                border: '1px solid var(--border-subtle)',
                                borderRadius: '12px',
                                padding: '2px 14px',
                                transition: 'all 0.2s ease'
                            }}>
                                <textarea
                                    placeholder="Detalles extras, recordatorios, etc..."
                                    value={formData.observations}
                                    onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
                                    style={{
                                        width: '100%',
                                        background: 'transparent',
                                        border: 'none',
                                        color: 'var(--text-primary)',
                                        padding: '12px 0',
                                        outline: 'none',
                                        fontSize: '14px',
                                        height: '80px',
                                        resize: 'none',
                                        fontFamily: 'inherit'
                                    }}
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Fecha estimada de devolución</label>
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
                                    value={formData.dueDate}
                                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
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

                        <div className="form-group">
                            <label className="form-label">Medio</label>
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
                                    value={formData.medium}
                                    onChange={(e) => setFormData({ ...formData, medium: e.target.value })}
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
                    </div>
                )
            }

            <button type="submit" className="btn-primary">
                {debtToEdit ? 'Guardar Cambios' : 'Crear Registro'}
            </button>
        </form >
    );
}
