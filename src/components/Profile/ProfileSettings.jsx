import { useState } from 'react';
import { Camera } from 'lucide-react';
import { currentUser } from '../../data/mock';
import './profile.css';

export default function ProfileSettings() {
    const [user, setUser] = useState(currentUser);

    return (
        <div className="profile-container fade-in">
            <div className="profile-header-card card">
                <div className="profile-cover"></div>
                <div className="profile-avatar-wrapper">
                    <img src={user.avatar} alt="Profile" className="profile-avatar-lg" />
                    <button className="edit-avatar-btn">
                        <Camera size={16} />
                    </button>
                </div>

                <div className="profile-identity">
                    <h2>{user.firstName} {user.lastName}</h2>
                    <span className="profile-role">Plan Premium</span>
                </div>
            </div>

            <div className="profile-grid">
                <div className="card profile-form-card">
                    <div className="card-header">
                        <h3>Información Personal</h3>
                        <p>Actualiza tus datos y privacidad.</p>
                    </div>

                    <form className="profile-form">
                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Nombre</label>
                                <input type="text" className="form-input" defaultValue={user.firstName} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Apellido</label>
                                <input type="text" className="form-input" defaultValue={user.lastName} />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Correo Electrónico</label>
                            <input type="email" className="form-input" defaultValue={user.email} />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Ubicación</label>
                            <input type="text" className="form-input" defaultValue={user.location} />
                        </div>

                        <div className="form-actions">
                            <button type="button" className="btn-secondary" style={{ marginRight: '12px' }}>Cancelar</button>
                            <button type="button" className="btn-primary" style={{ width: 'auto' }}>Guardar Cambios</button>
                        </div>
                    </form>
                </div>

                <div className="card profile-stats-card">
                    <h3>Estadísticas de Uso</h3>
                    <div className="stat-row">
                        <span>Miembro desde</span>
                        <strong>Oct 2024</strong>
                    </div>
                    <div className="stat-row">
                        <span>Moneda Principal</span>
                        <strong>USD ($)</strong>
                    </div>
                    <div className="stat-row">
                        <span>Estado de Cuenta</span>
                        <span className="badge success">Verificado</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
