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
import { Plus, Menu, UserPlus, Receipt, ArrowUpRight, ArrowDownLeft, Clock, Eye, Archive, LayoutDashboard, User, Settings, LogOut, ArrowUp, ArrowDown, ArrowUpDown, Wallet, Search } from 'lucide-react';
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 1024);

  // History View State
  const [historySortConfig, setHistorySortConfig] = useState({ key: 'date', direction: 'desc' });
  const [historyCurrentPage, setHistoryCurrentPage] = useState(1);
  const [historyItemsPerPage, setHistoryItemsPerPage] = useState(10);
  const [historySearchTerm, setHistorySearchTerm] = useState('');

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
    if (window.innerWidth <= 1024) {
      setIsSidebarOpen(false); // Close mobile menu on navigate if on mobile/tablet
    }
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

  // --- History View Logic ---
  const handleHistorySort = (key) => {
    let direction = 'asc';
    if (historySortConfig.key === key && historySortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setHistorySortConfig({ key, direction });
    setHistoryCurrentPage(1);
  };

  const handleHistoryItemsPerPageChange = (e) => {
    setHistoryItemsPerPage(Number(e.target.value));
    setHistoryCurrentPage(1);
  };

  const sortedHistoryDebts = useMemo(() => {
    const filtered = debts.filter(debt =>
      debt.counterparty.toLowerCase().includes(historySearchTerm.toLowerCase())
    );

    const sorted = [...filtered].sort((a, b) => {
      // Primary sort: Status priority (Active > Settled > Archived)
      const rank = { active: 0, settled: 1, archived: 2 };
      if (rank[a.status] !== rank[b.status]) {
        return rank[a.status] - rank[b.status];
      }

      // Secondary sort: User selected column

      if (historySortConfig.key === 'date') {
        return historySortConfig.direction === 'asc'
          ? new Date(a.date) - new Date(b.date)
          : new Date(b.date) - new Date(a.date);
      }
      if (historySortConfig.key === 'counterparty') {
        return historySortConfig.direction === 'asc'
          ? a.counterparty.localeCompare(b.counterparty)
          : b.counterparty.localeCompare(a.counterparty);
      }
      if (historySortConfig.key === 'amount') {
        return historySortConfig.direction === 'asc'
          ? a.amount - b.amount
          : b.amount - a.amount;
      }
      if (historySortConfig.key === 'paidAmount') {
        return historySortConfig.direction === 'asc'
          ? a.paidAmount - b.paidAmount
          : b.paidAmount - a.paidAmount;
      }
      if (historySortConfig.key === 'pending') {
        const pendingA = a.amount - a.paidAmount;
        const pendingB = b.amount - b.paidAmount;
        return historySortConfig.direction === 'asc'
          ? pendingA - pendingB
          : pendingB - pendingA;
      }
      return 0;
    });
    return sorted;
  }, [debts, historySortConfig, historySearchTerm]);

  const historyIndexOfLastItem = historyCurrentPage * historyItemsPerPage;
  const historyIndexOfFirstItem = historyIndexOfLastItem - historyItemsPerPage;
  const currentHistoryItems = sortedHistoryDebts.slice(historyIndexOfFirstItem, historyIndexOfLastItem);
  const historyTotalPages = Math.ceil(sortedHistoryDebts.length / historyItemsPerPage);

  const historyPageNumbers = [];
  for (let i = 1; i <= historyTotalPages; i++) {
    historyPageNumbers.push(i);
  }

  const getSortIcon = (key) => {
    if (historySortConfig.key !== key) return <ArrowUpDown size={14} className="sort-icon-inactive" />;
    return historySortConfig.direction === 'asc'
      ? <ArrowUp size={14} className="sort-icon-active" />
      : <ArrowDown size={14} className="sort-icon-active" />;
  };

  const HistorySortableHeader = ({ label, sortKey, align = 'left', className = '' }) => (
    <div
      className={`sortable-header ${className}`}
      onClick={() => handleHistorySort(sortKey)}
      style={{ justifyContent: align === 'center' ? 'center' : 'flex-start' }}
    >
      {label}
      {getSortIcon(sortKey)}
    </div>
  );
  // --- End History View Logic ---

  if (!user || isPasswordRecovery) return <LoginView />;

  return (
    <div className={`app-container ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      <div className="sidebar-wrapper">
        <Sidebar
          currentView={currentView}
          onNavigate={navigate}
          onLogout={signOut}
          isOpen={isSidebarOpen}
          onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        />
        <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)}></div>
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
                {!isSidebarOpen && (
                  <button className="floating-menu-btn" onClick={() => setIsSidebarOpen(true)}>
                    <Menu size={20} />
                  </button>
                )}
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
                    <span className="user-role">Teamdroid Tech</span>
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
                  <div className="debts-header">
                    <h2 className="debts-title">Historial Completo ({sortedHistoryDebts.length})</h2>

                    <div className="debts-actions-container">
                      {/* Search Input */}
                      <div className="debts-search-container">
                        <Search size={16} className="search-icon" />
                        <input
                          type="text"
                          placeholder="Buscar por nombre..."
                          value={historySearchTerm}
                          onChange={(e) => {
                            setHistorySearchTerm(e.target.value);
                            setHistoryCurrentPage(1);
                          }}
                          className="search-input"
                        />
                      </div>
                      <button className="btn-secondary" onClick={() => setCurrentView('dashboard')}>Panel principal</button>
                    </div>
                  </div>

                  <div className="debts-list">
                    <div className="debt-grid history-view doc-header hide-mobile" style={{ marginBottom: '8px', paddingBottom: '4px' }}>
                      <div></div>
                      <HistorySortableHeader label="DEUDA" sortKey="counterparty" />
                      <HistorySortableHeader label="FECHA" sortKey="date" />
                      <HistorySortableHeader label="INICIAL" sortKey="amount" />
                      <HistorySortableHeader label="PAGADO" sortKey="paidAmount" />
                      <HistorySortableHeader label="PENDIENTE" sortKey="pending" />
                      <div style={{ textAlign: 'center' }}>ESTADO</div>
                      <div style={{ textAlign: 'center' }}>ACCIONES</div>
                    </div>

                    {currentHistoryItems.map((debt, index) => (
                      <div key={debt.id} className="debt-item-minimal fade-in" style={{ animationDelay: `${index * 0.05}s` }}>
                        <div className="debt-grid history-view">
                          <div className="debt-icon-container">
                            <div className={`debt-icon ${debt.type}`}>
                              {debt.type === 'lent' ? <ArrowUpRight size={20} /> : <ArrowDownLeft size={20} />}
                            </div>
                          </div>
                          <div className="debt-info">
                            <div className="mobile-debt-row">
                              <div className="mobile-debt-left">
                                <div className="debt-counterparty-name">{debt.counterparty}</div>
                                <div className="debt-reason-text">{debt.reason}</div>
                                <div className="show-mobile mobile-flex-col" style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px', gap: '1px', alignItems: 'flex-start' }}>
                                  <span style={{ fontWeight: '500' }}>Total: ${debt.amount.toFixed(0)}</span>
                                  <span style={{ opacity: 0.7, fontSize: '10px' }}>{debt.date?.split('T')[0]}</span>
                                </div>
                              </div>

                              <div className="mobile-debt-right show-mobile" style={{ gap: '6px' }}>
                                {/* Progress Badge */}
                                <div className="amount-progress-badge">
                                  <div
                                    className="amount-progress-fill"
                                    style={{
                                      width: `${Math.min((debt.paidAmount / debt.amount) * 100, 100)}%`,
                                      backgroundColor: debt.status === 'active' ? 'var(--color-warning)' : 'var(--color-success)'
                                    }}
                                  ></div>
                                  <div className="amount-progress-text">
                                    ${(debt.status === 'active' ? (debt.amount - debt.paidAmount) : debt.amount).toFixed(0)}
                                  </div>
                                </div>

                                {debt.status === 'active' ? (
                                  <button
                                    onClick={(e) => { e.stopPropagation(); setSelectedDebtToPay(debt); }}
                                    className="btn-pay-minimal"
                                  >
                                    Pagar
                                  </button>
                                ) : (
                                  <span className={`badge ${debt.status === 'archived' ? 'secondary' : 'success'}`} style={{ fontSize: '9px', padding: '4px 8px', height: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '70px' }}>
                                    {debt.status === 'archived' ? 'ARCH' : 'PAGADO'}
                                  </span>
                                )}
                                <button
                                  onClick={(e) => { e.stopPropagation(); setSelectedDebtDetails(debt); }}
                                  className="btn-view-minimal"
                                >
                                  Ver
                                </button>
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
                          <div className="debt-actions-area hide-mobile">
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

                  {/* Pagination Footer */}
                  {debts.length > 0 && (
                    <div className="pagination-controls">
                      <div className="items-per-page-selector">
                        <span className="pagination-label">Mostrar:</span>
                        <select
                          value={historyItemsPerPage}
                          onChange={handleHistoryItemsPerPageChange}
                          className="rows-select"
                        >
                          <option value={5}>5</option>
                          <option value={10}>10</option>
                          <option value={20}>20</option>
                          <option value={50}>50</option>
                        </select>
                      </div>

                      {historyTotalPages > 1 && (
                        <div className="pagination-buttons">
                          <button
                            className="pagination-btn arrow"
                            onClick={() => setHistoryCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={historyCurrentPage === 1}
                          >
                            &lt;
                          </button>

                          {historyPageNumbers.map(number => (
                            <button
                              key={number}
                              onClick={() => setHistoryCurrentPage(number)}
                              className={`pagination-btn page-number ${historyCurrentPage === number ? 'active' : ''}`}
                            >
                              {number}
                            </button>
                          ))}

                          <button
                            className="pagination-btn arrow"
                            onClick={() => setHistoryCurrentPage(prev => Math.min(prev + 1, historyTotalPages))}
                            disabled={historyCurrentPage === historyTotalPages}
                          >
                            &gt;
                          </button>
                        </div>
                      )}
                    </div>
                  )}

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
                <ProfileSettings
                  profile={userProfile}
                  onUpdateProfile={handleUpdateProfile}
                  onLogout={signOut}
                />
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
