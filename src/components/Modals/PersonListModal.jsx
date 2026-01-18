import { Edit2, Plus, Search } from 'lucide-react';
import { useState } from 'react';
import './modals.css';

export default function PersonListModal({ isOpen, onClose, persons, onAddPerson, onEditPerson }) {
    const [searchTerm, setSearchTerm] = useState('');

    const safePersons = persons || [];
    const filteredPersons = safePersons.filter(p => {
        const fullName = `${p.firstName} ${p.lastName}`.toLowerCase();
        return fullName.includes(searchTerm.toLowerCase()) ||
            (p.docNumber && p.docNumber.includes(searchTerm));
    });

    const getAvatarStyle = (name) => {
        const gradients = [
            'linear-gradient(135deg, #6366f1, #818cf8)', // Indigo
            'linear-gradient(135deg, #3b82f6, #60a5fa)', // Blue
            'linear-gradient(135deg, #ec4899, #f472b6)', // Pink
            'linear-gradient(135deg, #8b5cf6, #a78bfa)', // Violet
            'linear-gradient(135deg, #10b981, #34d399)', // Emerald
            'linear-gradient(135deg, #f59e0b, #fbbf24)', // Amber
            'linear-gradient(135deg, #ef4444, #f87171)', // Red
            'linear-gradient(135deg, #06b6d4, #22d3ee)'  // Cyan
        ];
        let hash = 0;
        const safeName = name || 'User';
        for (let i = 0; i < safeName.length; i++) {
            hash = safeName.charCodeAt(i) + ((hash << 5) - hash);
        }
        const index = Math.abs(hash) % gradients.length;
        return { background: gradients[index] };
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Header / Actions */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                    <input
                        type="text"
                        className="form-input"
                        placeholder="Buscar persona..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ paddingLeft: '32px' }}
                    />
                    <Search size={16} style={{ position: 'absolute', left: '10px', top: '12px', color: 'var(--text-muted)' }} />
                </div>
                <button className="btn-primary" style={{ whiteSpace: 'nowrap', width: 'auto', margin: 0 }} onClick={onAddPerson}>
                    <Plus size={16} style={{ marginRight: '6px' }} />
                    Nueva Persona
                </button>
            </div>

            {/* List */}
            <div style={{ flex: 1, overflowY: 'auto' }}>
                {filteredPersons.length === 0 ? (
                    <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', border: '1px solid var(--border-subtle)', borderRadius: '8px' }}>
                        No se encontraron personas
                    </div>
                ) : (
                    <div className="person-list-grid">
                        {filteredPersons.map(p => (
                            <div className="person-card" key={p.id}>
                                <button className="person-card-action" onClick={() => onEditPerson(p)}>
                                    <Edit2 size={18} />
                                </button>
                                <div className="person-card-header">
                                    <div className="person-card-avatar" style={getAvatarStyle(p.firstName + p.lastName)}>
                                        {p.firstName?.charAt(0)}{p.lastName?.charAt(0)}
                                    </div>
                                    <div className="person-card-info">
                                        <div className="person-card-name">{p.firstName} {p.lastName}</div>
                                        <div className="person-card-email">{p.email}</div>
                                    </div>
                                </div>
                                <div className="person-card-details-grid">
                                    <div className="person-card-detail">
                                        <span className="person-card-label">ID Documento</span>
                                        <span className="person-card-value">{p.docNumber || '-'}</span>
                                    </div>
                                    <div className="person-card-detail">
                                        <span className="person-card-label">Teléfono</span>
                                        <span className="person-card-value">{p.phone || '-'}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
