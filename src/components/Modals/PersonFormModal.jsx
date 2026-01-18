import { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import './modals.css';

export default function PersonFormModal({ isOpen, onClose, onAdd, onEdit, personToEdit }) {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        docType: 'CEDULA',
        docNumber: '',
        phone: '+593 ',
        email: ''
    });

    useEffect(() => {
        if (isOpen) {
            if (personToEdit) {
                setFormData(personToEdit);
            } else {
                setFormData({
                    firstName: '',
                    lastName: '',
                    docType: 'CEDULA',
                    docNumber: '',
                    phone: '+593 ',
                    email: ''
                });
            }
        }
    }, [isOpen, personToEdit]);

    const [showOptional, setShowOptional] = useState(false);

    // Auto-expand if editing an existing person who has optional data
    useEffect(() => {
        if (personToEdit) {
            setShowOptional(true);
        } else {
            setShowOptional(false);
        }
    }, [personToEdit, isOpen]);

    const handleSubmit = (e) => {
        e.preventDefault();
        // Basic validation
        if (!formData.firstName || !formData.lastName) return;

        if (personToEdit) {
            onEdit(formData);
        } else {
            onAdd({
                ...formData,
                id: 'p_' + Date.now().toString()
            });
        }

        onClose();
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="form-row" style={{ display: 'flex', gap: '16px' }}>
                <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">Nombres *</label>
                    <input
                        type="text"
                        className="form-input"
                        placeholder="Ej: Juan"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        required
                        autoFocus
                    />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">Apellidos *</label>
                    <input
                        type="text"
                        className="form-input"
                        placeholder="Ej: Pérez"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        required
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

            {showOptional && (
                <div className="slide-up">
                    <div className="form-group">
                        <label className="form-label">Identificación</label>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <select
                                className="form-select"
                                style={{ width: '140px' }}
                                value={formData.docType}
                                onChange={(e) => setFormData({ ...formData, docType: e.target.value })}
                            >
                                <option value="CEDULA">CÉDULA</option>
                                <option value="RUC">RUC</option>
                                <option value="PASAPORTE">PASAPORTE</option>
                            </select>
                            <input
                                type="text"
                                className="form-input" // Note: validation regex can be added later
                                placeholder="Número de documento"
                                value={formData.docNumber}
                                onChange={(e) => setFormData({ ...formData, docNumber: e.target.value })}
                                style={{ flex: 1 }}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Teléfono Móvil</label>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <select
                                className="form-select"
                                style={{ width: '140px' }}
                                value={formData.phone.split(' ')[0] || '+593'}
                                onChange={(e) => {
                                    const currentNumber = formData.phone.split(' ')[1] || '';
                                    setFormData({ ...formData, phone: `${e.target.value} ${currentNumber}` });
                                }}
                            >
                                <option value="+593">+593 🇪🇨</option>
                                <option value="+1">+1 🇺🇸</option>
                                <option value="+34">+34 🇪🇸</option>
                                <option value="+57">+57 🇨🇴</option>
                                <option value="+51">+51 🇵🇪</option>
                                <option value="+52">+52 🇲🇽</option>
                                <option value="+54">+54 🇦🇷</option>
                                <option value="+56">+56 🇨🇱</option>
                            </select>
                            <input
                                type="tel"
                                className="form-input"
                                placeholder="0991234567"
                                value={formData.phone.split(' ')[1] || ''}
                                onChange={(e) => {
                                    const currentCode = formData.phone.split(' ')[0] || '+593';
                                    setFormData({ ...formData, phone: `${currentCode} ${e.target.value}` });
                                }}
                                style={{ flex: 1 }}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Correo Electrónico</label>
                        <input
                            type="email"
                            className="form-input"
                            placeholder="ejemplo@email.com"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>
                </div>
            )}

            <button type="submit" className="btn-primary">
                {personToEdit ? 'Guardar Cambios' : 'Guardar Persona'}
            </button>
        </form>
    );
}
