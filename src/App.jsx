import { useState, useMemo, useEffect } from 'react';
import Sidebar from './components/Dashboard/Sidebar';
import SummaryCards from './components/Dashboard/SummaryCards';
import ActiveDebts from './components/Dashboard/ActiveDebts';
import Modal from './components/Modals/Modal';
import DebtFormModal from './components/Modals/DebtFormModal';
import PaymentModal from './components/Modals/PaymentModal';
import DebtDetailsModal from './components/Modals/DebtDetailsModal';
import ProfileSettings from './components/Profile/ProfileSettings';
import AdvancedStats from './components/Dashboard/AdvancedStats';
import TopPeersChart from './components/Dashboard/TopPeersChart';

import PersonFormModal from './components/Modals/PersonFormModal';
import PersonListModal from './components/Modals/PersonListModal';
import { api } from './services/api';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginView from './components/Auth/LoginView';
import { Plus, Menu, UserPlus, Receipt, ArrowUpRight, ArrowDownLeft, Clock, Eye, Archive, LayoutDashboard, User, Settings, LogOut } from 'lucide-react';
import './app.css';
import './components/Dashboard/dashboard.css';

function MainAppContent() {
  const { user, signOut, isPasswordRecovery } = useAuth();
  const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard' | 'profile'
  const [debts, setDebts] = useState([]);
  const [persons, setPersons] = useState([]);
  const [userProfile, setUserProfile] = useState({ firstName: 'User', lastName: '', avatar: '' });
  const [loading, setLoading] = useState(true);
  const [lastCreatedPerson, setLastCreatedPerson] = useState(null); // Track for auto-select

  const [isDebtModalOpen, setIsDebtModalOpen] = useState(false);

  // Person Management State
  const [isPersonListModalOpen, setIsPersonListModalOpen] = useState(false);
  const [isPersonFormModalOpen, setIsPersonFormModalOpen] = useState(false);
  const [personToEdit, setPersonToEdit] = useState(null);
  const [debtToEdit, setDebtToEdit] = useState(null);

  const [selectedDebtDetails, setSelectedDebtDetails] = useState(null); // For viewing details
  const [selectedDebtToPay, setSelectedDebtToPay] = useState(null); // For paying
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Load Initial Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [debtsData, personsData, profileData] = await Promise.all([
          api.getDebts(),
          api.getPersons(),
          api.getProfile()
        ]);
        setDebts(debtsData);
        setPersons(personsData);
        setUserProfile(profileData);

        // Force profile completion if not complete
        if (profileData && !profileData.isComplete) {
          setCurrentView('profile');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Derived Stats
  const stats = useMemo(() => {
    const active = debts.filter(d => d.status === 'active');
    return {
      totalLent: active.filter(d => d.type === 'lent')
        .reduce((acc, curr) => acc + (curr.amount - curr.paidAmount), 0),
      totalBorrowed: active.filter(d => d.type === 'borrowed')
        .reduce((acc, curr) => acc + (curr.amount - curr.paidAmount), 0),
    };
  }, [debts]);

  const handleAddDebt = async (newDebt) => {
    try {
      const addedDebt = await api.addDebt(newDebt);
      setDebts([addedDebt, ...debts]);
    } catch (error) {
      console.error('Error adding debt:', error);
    }
  };

  const handleAddPerson = async (newPerson) => {
    try {
      const addedPerson = await api.addPerson(newPerson);
      setPersons([...persons, addedPerson]);
      setLastCreatedPerson(addedPerson); // Auto-select trigger
      setIsPersonFormModalOpen(false);
    } catch (error) {
      console.error('Error adding person:', error);
    }
  };

  const handleEditDebt = async (updatedDebt) => {
    try {
      const savedDebt = await api.updateDebt(updatedDebt);
      setDebts(debts.map(d => d.id === savedDebt.id ? savedDebt : d));
      setDebtToEdit(null);
      setIsDebtModalOpen(false);
    } catch (error) {
      console.error('Error updating debt:', error);
    }
  };

  const handleEditPerson = async (updatedPerson) => {
    try {
      const savedPerson = await api.updatePerson(updatedPerson);
      setPersons(persons.map(p => p.id === savedPerson.id ? savedPerson : p));
      setIsPersonFormModalOpen(false);
      setPersonToEdit(null);
    } catch (error) {
      console.error('Error updating person:', error);
    }
  };

  // Open form for creating
  const openCreatePerson = () => {
    setPersonToEdit(null);
    setIsPersonFormModalOpen(true);
    // Optional: keep list open or close? Usually keep editing flow isolated or on top.
    // If we keep list open behind, we just stack.
  };

  // Open form for editing
  const openEditPerson = (person) => {
    setPersonToEdit(person);
    setIsPersonFormModalOpen(true);
  };

  const handlePayment = async (debtId, paymentData) => {
    try {
      const addedPayment = await api.addPayment(debtId, paymentData);

      // We update the local state by recalculating (or mirroring what api did)
      setDebts(debts.map(d => {
        if (d.id !== debtId) return d;
        const updatedPayments = [...(d.payments || []), addedPayment];
        const newPaidTotal = updatedPayments.reduce((sum, p) => sum + p.amount, 0);
        const isSettled = newPaidTotal >= d.amount;

        const updatedDebt = {
          ...d,
          paidAmount: newPaidTotal,
          payments: updatedPayments,
          status: isSettled ? 'settled' : 'active'
        };

        // Sync back to API if it's a real backend to ensure consistency
        api.updateDebt({ id: d.id, paidAmount: newPaidTotal, status: updatedDebt.status });

        return updatedDebt;
      }));
    } catch (error) {
      console.error('Error adding payment:', error);
    }
  };

  const handleDeletePayment = async (debtId, paymentId) => {
    try {
      await api.deletePayment(debtId, paymentId);
      setDebts(debts.map(d => {
        if (d.id !== debtId) return d;
        const updatedPayments = (d.payments || []).filter(p => p.id !== paymentId);
        const newPaidTotal = updatedPayments.reduce((sum, p) => sum + p.amount, 0);
        const isSettled = newPaidTotal >= d.amount;

        const updatedDebt = {
          ...d,
          paidAmount: newPaidTotal,
          payments: updatedPayments,
          status: isSettled ? 'settled' : 'active'
        };

        api.updateDebt({ id: d.id, paidAmount: newPaidTotal, status: updatedDebt.status });

        return updatedDebt;
      }));
    } catch (error) {
      console.error('Error deleting payment:', error);
    }
  };

  const handleArchiveDebt = async (debtId) => {
    try {
      await api.updateDebt({ id: debtId, status: 'archived' });
      setDebts(debts.map(d => d.id === debtId ? { ...d, status: 'archived' } : d));
      setSelectedDebtDetails(null);
    } catch (error) {
      console.error('Error archiving debt:', error);
    }
  };

  const openEditDebt = (debt) => {
    setDebtToEdit(debt);
    setSelectedDebtDetails(null);
    setIsDebtModalOpen(true);
  };

  const handleReactivateDebt = async (debtId) => {
    try {
      const debt = debts.find(d => d.id === debtId);
      const isSettled = debt.paidAmount >= debt.amount;
      const newStatus = isSettled ? 'settled' : 'active';

      await api.updateDebt({ id: debtId, status: newStatus });

      setDebts(debts.map(d => {
        if (d.id !== debtId) return d;
        return { ...d, status: newStatus };
      }));
      setSelectedDebtDetails(null);
    } catch (error) {
      console.error('Error reactivating debt:', error);
    }
  };

  const handleUpdateProfile = async (updatedData) => {
    try {
      const savedProfile = await api.updateProfile(updatedData);
      setUserProfile(savedProfile);
      return true;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  const navigate = (view) => {
    setCurrentView(view);
    setIsMobileMenuOpen(false); // Close mobile menu on navigate
  };

  const calculateStats = useMemo(() => {
    // Already defined above as stats, keeping function clean
    return stats;
  }, [stats]);

  // Helper helper to determine title
  const getPageTitle = () => {
    switch (currentView) {
      case 'dashboard': return 'Panel Principal';
      case 'profile': return 'Mi Perfil';
      case 'persons': return 'Gestionar Personas';
      default: return 'Panel Principal';
    }
  };

  if (!user || isPasswordRecovery) return <LoginView />;

  return (
    <div className="app-container">
      <div className={`sidebar-wrapper ${isMobileMenuOpen ? 'open' : ''}`}>
        <Sidebar currentView={currentView} onNavigate={navigate} onLogout={signOut} />
        <div className="sidebar-overlay" onClick={() => setIsMobileMenuOpen(false)}></div>
      </div>

      <main className="main-content">
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '16px' }}>
            <div className="spinner"></div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', fontWeight: '500' }}>Cargando tus deudas...</p>
          </div>
        ) : (
          <>
            <header className="top-bar">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button className="menu-btn" onClick={() => setIsMobileMenuOpen(true)}>
                  <Menu size={24} />
                </button>
                <div>
                  <h2 className="page-title">{getPageTitle()}</h2>
                  <p className="page-subtitle">Hola de nuevo, {userProfile.firstName} ✨</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                {/* Only show Add Debt on Dashboard, or maybe always? Let's keep it on dashboard for now */}
                {currentView === 'dashboard' && (
                  <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', width: 'auto', margin: 0 }} onClick={() => setIsDebtModalOpen(true)}>
                    <Plus size={18} />
                    <span className="hide-mobile">Deuda</span>
                  </button>
                )}
                <div className="user-profile">
                  <div className="user-info">
                    <span className="user-name">{userProfile.firstName} {userProfile.lastName}</span>
                    <span className="user-role">Plan Premium</span>
                  </div>
                  <img src={userProfile.avatar} alt="Profile" className="avatar" />
                </div>
              </div>
            </header>

            <div className="dashboard-content">
              {currentView === 'dashboard' && (
                <>
                  <SummaryCards stats={stats} />
                  <div className="dashboard-grid-split">
                    <ActiveDebts
                      debts={debts.filter(d => d.status !== 'archived')}
                      onDebtClick={setSelectedDebtDetails}
                      onPayClick={setSelectedDebtToPay}
                      onViewAll={() => setCurrentView('history')}
                    />
                    <TopPeersChart debts={debts} />
                  </div>
                  <AdvancedStats debts={debts} />
                </>
              )}

              {currentView === 'history' && (
                <div className="card" style={{ height: 'calc(100vh - 140px)', padding: '24px', overflowY: 'auto' }}>
                  <div className="debts-header" style={{ borderBottom: '1px solid var(--border-subtle)', marginBottom: '24px' }}>
                    <h2 style={{ fontSize: '20px' }}>Historial Completo ({debts.length})</h2>
                    <button className="btn-secondary" onClick={() => setCurrentView('dashboard')}>Panel principal</button>
                  </div>

                  <div className="debts-list">
                    <div className="debt-grid doc-header hide-mobile">
                      <div></div>
                      <div>DEUDA</div>
                      <div>FECHA</div>
                      <div>INICIAL</div>
                      <div>PAGADO</div>
                      <div>PENDIENTE</div>
                      <div style={{ textAlign: 'center' }}>ESTADO</div>
                      <div style={{ textAlign: 'center' }}>ACCIONES</div>
                    </div>

                    {/* Advanced Sorting: Pendiente (Oldest) > Pagado > Archivado */}
                    {[...debts].sort((a, b) => {
                      const rank = { active: 0, settled: 1, archived: 2 };
                      if (rank[a.status] !== rank[b.status]) {
                        return rank[a.status] - rank[b.status];
                      }
                      if (a.status === 'active') {
                        return new Date(a.date) - new Date(b.date); // Oldest first
                      }
                      return new Date(b.date) - new Date(a.date); // Newest first for others
                    }).map((debt, index) => (
                      <div key={debt.id} className="debt-item-minimal fade-in" style={{ animationDelay: `${index * 0.05}s` }}>
                        <div className="debt-grid">
                          <div className="debt-icon-container">
                            <div className={`debt-icon ${debt.type}`}>
                              {debt.type === 'lent' ? <ArrowUpRight size={20} /> : <ArrowDownLeft size={20} />}
                            </div>
                          </div>
                          <div className="debt-info">
                            <div className="debt-counterparty-name">{debt.counterparty}</div>
                            <div className="debt-reason-text">{debt.reason}</div>

                            {/* Mobile Only Meta */}
                            <div className="show-mobile mobile-meta-compact">
                              <div className="m-row-stats">
                                <span className="m-val-total">${debt.amount.toFixed(0)}</span>
                                <span className="m-dot">•</span>
                                <span className="m-val-date">{debt.date?.split('T')[0]}</span>
                              </div>
                              <div style={{ color: 'var(--color-success)', fontWeight: '700', fontSize: '11px', marginTop: '4px' }}>
                                Pagado: ${debt.paidAmount.toFixed(0)}
                              </div>
                              <div className="m-val-pending">
                                {debt.status === 'active'
                                  ? `Pendiente: $${(debt.amount - debt.paidAmount).toFixed(0)}`
                                  : debt.status === 'archived' ? 'Archivado' : 'Totalmente Pagado ✨'}
                              </div>
                            </div>
                          </div>
                          <div className="hide-mobile desktop-col-date">
                            {debt.date?.split('T')[0]}
                          </div>
                          <div className="hide-mobile desktop-col-amount">
                            ${debt.amount.toFixed(2)}
                          </div>
                          <div className="hide-mobile desktop-col-paid">
                            ${debt.paidAmount.toFixed(2)}
                          </div>
                          <div className="hide-mobile desktop-col-pending">
                            ${(debt.amount - debt.paidAmount).toFixed(2)}
                          </div>
                          <div className="hide-mobile desktop-col-status">
                            <span className={`badge ${debt.status === 'active' ? 'warning' :
                              debt.status === 'archived' ? 'secondary' : 'success'
                              }`}>
                              {debt.status === 'active' ? <Clock size={12} /> :
                                debt.status === 'archived' ? <Archive size={12} /> : null}
                              {debt.status === 'active' ? ' Pendiente' :
                                debt.status === 'archived' ? ' Archivado' : ' Pagado'}
                            </span>
                          </div>
                          <div className="debt-actions-area">
                            {debt.status === 'active' && (
                              <button className="action-pill-compact" onClick={() => setSelectedDebtToPay(debt)}>Pagar</button>
                            )}
                            <button className="action-icon-eye" onClick={() => setSelectedDebtDetails(debt)}>
                              <Eye size={18} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {currentView === 'persons' && (
                <div className="card" style={{ height: 'calc(100vh - 140px)', padding: '0 0 20px 0' }}>
                  {/* Reusing the Modal Content as a Page Component. added padding override */}
                  <div style={{ padding: '24px', height: '100%' }}>
                    <PersonListModal
                      isOpen={true}
                      onClose={() => { }} // No-op
                      persons={persons}
                      onAddPerson={openCreatePerson}
                      onEditPerson={openEditPerson}
                    />
                  </div>
                </div>
              )}

              {currentView === 'profile' && (
                <ProfileSettings profile={userProfile} onUpdateProfile={handleUpdateProfile} />
              )}
            </div>

            <Modal
              isOpen={isDebtModalOpen}
              onClose={() => setIsDebtModalOpen(false)}
              title="Registrar Deuda"
            >
              <DebtFormModal
                isOpen={isDebtModalOpen}
                onClose={() => {
                  setIsDebtModalOpen(false);
                  setDebtToEdit(null);
                }}
                onAdd={handleAddDebt}
                onEdit={handleEditDebt}
                debtToEdit={debtToEdit}
                persons={persons} // Pass persons list
                lastCreatedPerson={lastCreatedPerson} // For auto-select
                onAddPerson={openCreatePerson}
              />
            </Modal>

            {/* Removed PersonListModal wrapper, as it is now a page view */}

            <Modal
              isOpen={isPersonFormModalOpen}
              onClose={() => {
                setIsPersonFormModalOpen(false);
                setPersonToEdit(null);
              }}
              title={personToEdit ? "Editar Persona" : "Registrar Persona"}
            >
              <PersonFormModal
                isOpen={isPersonFormModalOpen}
                onClose={() => {
                  setIsPersonFormModalOpen(false);
                  setPersonToEdit(null);
                }}
                onAdd={handleAddPerson}
                onEdit={handleEditPerson}
                personToEdit={personToEdit}
              />
            </Modal>

            <Modal
              isOpen={!!selectedDebtDetails}
              onClose={() => setSelectedDebtDetails(null)}
              title="Detalle de Deuda"
            >
              {selectedDebtDetails && (
                <DebtDetailsModal
                  onClose={() => setSelectedDebtDetails(null)}
                  debt={debts.find(d => d.id === selectedDebtDetails.id)}
                  onPayClick={() => {
                    setSelectedDebtToPay(selectedDebtDetails);
                    setSelectedDebtDetails(null);
                  }}
                  onArchive={handleArchiveDebt}
                  onReactivate={handleReactivateDebt}
                  onDeletePayment={handleDeletePayment}
                  onEditClick={openEditDebt}
                />
              )}
            </Modal>

            <Modal
              isOpen={!!selectedDebtToPay}
              onClose={() => setSelectedDebtToPay(null)}
              title="Registrar Pago"
            >
              <PaymentModal
                isOpen={!!selectedDebtToPay}
                onClose={() => setSelectedDebtToPay(null)}
                debt={selectedDebtToPay}
                onPay={handlePayment}
              />
            </Modal>

          </>
        )}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainAppContent />
    </AuthProvider>
  );
}
