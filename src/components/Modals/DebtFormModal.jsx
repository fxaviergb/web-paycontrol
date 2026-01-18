import { useState, useEffect, useRef } from 'react';
import { initialDebts } from '../../data/mock';
import { Search } from 'lucide-react';


export default function DebtFormModal({ isOpen, onClose, onAdd, persons, lastCreatedPerson, onAddPerson }) {
    const [formData, setFormData] = useState({
        type: 'lent', // or 'borrowed'
        personId: '',
        counterparty: '', // Display name (backup)
        amount: '',
        reason: '',
        medium: 'Transferencia',
        evidence: null,
        // Initialize with local simplified ISO format (YYYY-MM-DDTHH:mm)
        date: new Date().toLocaleString('sv').slice(0, 16).replace(' ', 'T')
    });

    // Search & Autocomplete State
    const [searchTerm, setSearchTerm] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);

    // Auto-select newly created person
    useEffect(() => {
        if (isOpen && lastCreatedPerson) {
            setFormData(prev => ({ ...prev, personId: lastCreatedPerson.id }));
            setSearchTerm(`${lastCreatedPerson.firstName} ${lastCreatedPerson.lastName}`);
        }
    }, [lastCreatedPerson, isOpen]);

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

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.personId || !formData.amount) return;

        // Find person name
        const person = persons.find(p => p.id === formData.personId);
        const counterpartyName = person ? `${person.firstName} ${person.lastName}` : 'Unknown';

        onAdd({
            ...formData,
            counterparty: counterpartyName, // Ensuring display compatibility
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
            personId: '',
            counterparty: '',
            amount: '',
            reason: '',
            date: new Date().toLocaleString('sv').slice(0, 16).replace(' ', 'T')
        });
        setSearchTerm('');
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
                        <Search size={16} style={{ position: 'absolute', right: '12px', top: '12px', color: 'var(--text-muted)' }} />

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
