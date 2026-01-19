import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Mail, Lock, LogIn, UserPlus, CreditCard, ShieldCheck, PieChart } from 'lucide-react';
import './auth.css';

export default function LoginView() {
    const [view, setView] = useState('login'); // 'login' | 'signup' | 'forgot' | 'update'
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [info, setInfo] = useState(null);
    const { signIn, signUp, resetPassword, updatePassword, isPasswordRecovery, setIsPasswordRecovery } = useAuth();
    const isMock = (import.meta.env.VITE_DATA_PROVIDER || 'mock') === 'mock';

    // Effect to handle recovery state from AuthContext
    useEffect(() => {
        if (isPasswordRecovery) {
            setView('update');
        }
    }, [isPasswordRecovery]);

    const handleDemoLogin = async () => {
        setLoading(true);
        try {
            await signIn('demo@paycontrol.io', 'demo123');
        } catch (err) {
            setError('Error en acceso demo');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);
        setInfo(null);
        try {
            if (view === 'login') {
                await signIn(email, password);
            } else if (view === 'signup') {
                await signUp(email, password);
                setSuccess('¡Registro exitoso! Por favor revisa tu email para confirmar tu cuenta.');
            } else if (view === 'forgot') {
                await resetPassword(email);
                setSuccess('Enlace de recuperación enviado a tu email.');
            } else if (view === 'update') {
                await updatePassword(newPassword);
                setSuccess('Contraseña actualizada con éxito. Ya puedes ingresar.');
                setIsPasswordRecovery(false);
                setTimeout(() => setView('login'), 2000);
            }
        } catch (err) {
            setError(err.message || 'Error al procesar solicitud');
        } finally {
            setLoading(false);
        }
    };

    const getTitle = () => {
        if (view === 'login') return 'Bienvenido de nuevo';
        if (view === 'signup') return 'Crea tu cuenta premium';
        if (view === 'forgot') return 'Recuperar contraseña';
        if (view === 'update') return 'Nueva contraseña';
    };

    return (
        <div className="auth-page">
            <div className="auth-background">
                <div className="blob blob-1"></div>
                <div className="blob blob-2"></div>
                <div className="blob blob-3"></div>
            </div>

            <div className="auth-container card">
                <div className="auth-header">
                    <div className="logo-section">
                        <div className="logo-icon">
                            <CreditCard size={24} />
                        </div>
                        <h1 className="logo-text">PayControl</h1>
                    </div>
                    <p className="auth-subtitle">{getTitle()}</p>
                    {isMock && (
                        <div className="mock-badge">Modo Demo Activo</div>
                    )}
                </div>

                {(error || success || info) && (
                    <div className={`auth-alert ${success ? 'success' : error ? 'error' : 'info'}`}>
                        {error || success || info}
                    </div>
                )}

                <form className="auth-form" onSubmit={handleSubmit}>
                    {(view === 'login' || view === 'signup' || view === 'forgot') && (
                        <div className="form-group">
                            <label className="form-label">Email</label>
                            <div className="input-wrapper">
                                <Mail className="input-icon" size={18} />
                                <input
                                    type="email"
                                    className="form-input"
                                    placeholder="tu@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                    )}

                    {(view === 'login' || view === 'signup') && (
                        <div className="form-group">
                            <div className="label-row" style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <label className="form-label">Contraseña</label>
                                {view === 'login' && (
                                    <button
                                        type="button"
                                        className="text-btn"
                                        onClick={() => setView('forgot')}
                                        style={{ fontSize: '12px', color: 'var(--color-accent)', background: 'none', border: 'none', cursor: 'pointer' }}
                                    >
                                        ¿Olvidaste tu contraseña?
                                    </button>
                                )}
                            </div>
                            <div className="input-wrapper">
                                <Lock className="input-icon" size={18} />
                                <input
                                    type="password"
                                    className="form-input"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                    )}

                    {view === 'update' && (
                        <div className="form-group">
                            <label className="form-label">Nueva Contraseña</label>
                            <div className="input-wrapper">
                                <Lock className="input-icon" size={18} />
                                <input
                                    type="password"
                                    className="form-input"
                                    placeholder="Nueva contraseña"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                    )}

                    <button type="submit" className="btn-primary auth-submit" disabled={loading}>
                        {loading ? 'Procesando...' :
                            view === 'login' ? <>Identificarse <LogIn size={18} /></> :
                                view === 'signup' ? <>Registrarse <UserPlus size={18} /></> :
                                    view === 'forgot' ? <>Enviar Enlace <Mail size={18} /></> :
                                        <>Actualizar Contraseña <ShieldCheck size={18} /></>
                        }
                    </button>

                    {isMock && view === 'login' && (
                        <button
                            type="button"
                            className="btn-secondary demo-submit"
                            onClick={handleDemoLogin}
                            disabled={loading}
                        >
                            Ingresar como Invitado
                        </button>
                    )}
                </form>

                <div className="auth-footer">
                    {view === 'login' && (
                        <button
                            type="button"
                            className="auth-toggle"
                            onClick={() => {
                                setError(null);
                                setSuccess(null);
                                setInfo('Envía un mensaje a fxaviergb@gmail.com solicitando acceso a PayControl.');
                                setTimeout(() => setInfo(null), 5000);
                            }}
                        >
                            ¿No tienes cuenta? Regístrate
                        </button>
                    )}
                    {(view === 'forgot' || view === 'update') && (
                        <button className="auth-toggle" onClick={() => {
                            setView('login');
                            setIsPasswordRecovery(false);
                        }}>
                            Volver al inicio de sesión
                        </button>
                    )}
                </div>

                <div className="auth-features">
                    <div className="feature-item">
                        <ShieldCheck size={14} /> <span>Seguridad Supabase</span>
                    </div>
                    <div className="feature-item">
                        <PieChart size={14} /> <span>Análisis Detallado</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
