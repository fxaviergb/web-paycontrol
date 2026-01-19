import { useState } from 'react';
import { Camera, Check, AlertCircle } from 'lucide-react';
import './profile.css';

export default function ProfileSettings({ profile, onUpdateProfile }) {
    const [formData, setFormData] = useState({
        firstName: profile?.firstName || '',
        lastName: profile?.lastName || '',
        email: profile?.email || '',
        location: profile?.location || '',
        avatar: profile?.avatar || `https://ui-avatars.com/api/?name=${profile?.email}&background=6366f1&color=fff`,
        currency: profile?.currency || 'USD ($)'
    });
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState(null); // { type: 'success' | 'error', message: string }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatus(null);
        try {
            await onUpdateProfile(formData);
            setStatus({ type: 'success', message: '¡Perfil actualizado con éxito!' });
            setTimeout(() => setStatus(null), 3000);
        } catch (err) {
            setStatus({ type: 'error', message: 'Error al actualizar perfil' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="profile-container fade-in">
            <div className="profile-header-card card">
                <div className="profile-cover"></div>
                <div className="profile-avatar-wrapper">
                    <img src={formData.avatar} alt="Profile" className="profile-avatar-lg" />
                    <button className="edit-avatar-btn">
                        <Camera size={16} />
                    </button>
                </div>

                <div className="profile-identity">
                    <h2>{formData.firstName || 'Usuario'} {formData.lastName || ''}</h2>
                    <span className="profile-role">Plan Premium</span>
                </div>
            </div>

            <div className="profile-grid">
                <div className="card profile-form-card">
                    <div className="card-header">
                        <h3>Información Personal</h3>
                        <p>Actualiza tus datos y privacidad.</p>
                    </div>

                    {status && (
                        <div className={`status-alert ${status.type}`}>
                            {status.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
                            {status.message}
                        </div>
                    )}

                    <form className="profile-form" onSubmit={handleSubmit}>
                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Nombre</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={formData.firstName}
                                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Apellido</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={formData.lastName}
                                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Correo Electrónico</label>
                            <input
                                type="email"
                                className="form-input disabled"
                                value={formData.email}
                                disabled
                                title="El email se gestiona desde la configuración de cuenta"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Ubicación</label>
                            <input
                                type="text"
                                className="form-input"
                                value={formData.location}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            />
                        </div>

                        <div className="form-actions">
                            <button type="submit" className="btn-primary" disabled={loading}>
                                {loading ? 'Guardando...' : 'Guardar Cambios'}
                            </button>
                        </div>
                    </form>
                </div>

                <div className="card profile-stats-card">
                    <h3>Configuración de Aplicación</h3>
                    <div className="stat-row">
                        <span>Moneda Principal</span>
                        <strong>{formData.currency}</strong>
                    </div>
                    <div className="stat-row">
                        <span>Plan Actual</span>
                        <strong style={{ color: 'var(--color-premium)' }}>Premium Gold</strong>
                    </div>
                </div>
            </div>
        </div>
    );
}
