import { LayoutDashboard, Receipt, Settings, User, LogOut } from 'lucide-react';

export default function Sidebar({ currentView, onNavigate, onLogout }) {
    return (
        <aside className="sidebar">
            <div className="logo-area">
                <div className="logo-icon">C</div>
                <h1 className="logo-text">PayControl</h1>
            </div>

            <nav className="nav-menu">
                <button
                    className={`nav-item ${currentView === 'dashboard' ? 'active' : ''}`}
                    onClick={() => onNavigate('dashboard')}
                >
                    <LayoutDashboard size={20} />
                    <span>Panel Principal</span>
                </button>
                <button
                    className={`nav-item ${currentView === 'history' ? 'active' : ''}`}
                    onClick={() => onNavigate('history')}
                >
                    <Receipt size={20} />
                    <span>Historial</span>
                </button>
                <button
                    className={`nav-item ${currentView === 'persons' ? 'active' : ''}`}
                    onClick={() => onNavigate('persons')}
                >
                    <User size={20} />
                    <span>Personas</span>
                </button>
                <button
                    className={`nav-item ${currentView === 'profile' ? 'active' : ''}`}
                    onClick={() => onNavigate('profile')}
                >
                    <User size={20} />
                    <span>Perfil</span>
                </button>
                <button className="nav-item">
                    <Settings size={20} />
                    <span>Configuración</span>
                </button>
            </nav>

            <div className="sidebar-footer">
                <button className="nav-item logout" onClick={onLogout}>
                    <LogOut size={20} />
                    <span>Cerrar Sesión</span>
                </button>
            </div>
        </aside>
    );
}
