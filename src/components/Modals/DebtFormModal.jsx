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
        // Initialize with local simplified ISO format (YYYY-MM-DDTHH:mm)
        date: new Date().toLocaleString('sv').slice(0, 16).replace(' ', 'T')
    });

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

    // Helper to format date for datetime-local input (YYYY-MM-DDTHH:mm)
    const formatDateForInput = (dateValue) => {
        if (!dateValue) return '';
        const d = new Date(dateValue);
        return d.toLocaleString('sv').slice(0, 16).replace(' ', 'T');
    };

    // Populate data when editing
    useEffect(() => {
        if (isOpen && debtToEdit) {
            setFormData({
                ...debtToEdit,
                date: formatDateForInput(debtToEdit.date)
            });
            setSearchTerm(debtToEdit.counterparty || '');
            setShowOptional(!!(debtToEdit.observations || debtToEdit.dueDate || debtToEdit.medium !== 'Transferencia' || debtToEdit.evidence));
        } else if (isOpen) {
            // Reset form for new debt
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
                date: formatDateForInput(new Date())
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
                currency: debtToEdit.currency || '$'
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
                currency: '$'
            });
        }

        // Reset and close
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
                <label className="form-label">Fecha y Hora</label>
                <input
                    type="datetime-local"
                    className="form-input"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                />
            </div>

            <div className="form-group">
                <label className="form-label">¿Con quién?</label>
                <div style={{ display: 'flex', gap: '8px', position: 'relative' }} ref={dropdownRef}>
                    <div style={{ width: '100%', position: 'relative' }}>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="Buscar persona..."
                            value={searchTerm}
                            onClick={() => setShowDropdown(true)}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setFormData({ ...formData, personId: '' }); // Clear selection on edit
                                setShowDropdown(true);
                            }}
                            required
                        />
                        <Search size={16} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />

                        {showDropdown && (
                            <div className="searchable-dropdown">
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

                    <button
                        type="button"
                        className="btn-primary"
                        style={{ width: 'auto', marginTop: 0, padding: '0 12px' }}
                        onClick={(e) => { e.preventDefault(); onAddPerson(); }}
                    >
                        +
                    </button>
                </div>
            </div>

            <div className="form-group">
                <label className="form-label">¿Cuánto?</label>
                <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>$</span>
                    <input
                        type="number"
                        className={`form-input ${isAmountInvalid ? 'error' : ''}`}
                        placeholder="0.00"
                        style={{
                            paddingLeft: '24px',
                            borderColor: isAmountInvalid ? '#ef4444' : ''
                        }}
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        required
                        step="0.01"
                    />
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
            </div>

            <div className="form-group">
                <label className="form-label">¿Por qué? (Concepto)</label>
                <input
                    type="text"
                    className="form-input"
                    placeholder="Ej: Cena, Alquiler..."
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    required
                />
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

            {showOptional && (
                <div className="slide-up">
                    <div className="form-group">
                        <label className="form-label">Observaciones adicionales</label>
                        <textarea
                            className="form-input"
                            placeholder="Detalles extras, recordatorios, etc..."
                            style={{ height: '80px', resize: 'none' }}
                            value={formData.observations}
                            onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Fecha estimada de devolución</label>
                        <input
                            type="date"
                            className="form-input"
                            value={formData.dueDate}
                            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                        />
                    </div>

                    <div className="form-group">
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
                </div>
            )}

            <button type="submit" className="btn-primary">
                {debtToEdit ? 'Guardar Cambios' : 'Crear Registro'}
            </button>
        </form>
    );
}
