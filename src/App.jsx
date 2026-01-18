import { useState, useMemo } from 'react';
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
import { currentUser, initialDebts, initialPersons } from './data/mock';
import { Plus, Menu, UserPlus, Receipt, ArrowUpRight, ArrowDownLeft, Clock, Eye, LayoutDashboard, User, Settings, LogOut } from 'lucide-react';
import './app.css';
import './components/Dashboard/dashboard.css';

export default function App() {
  const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard' | 'profile'
  const [debts, setDebts] = useState(initialDebts);
  const [persons, setPersons] = useState(initialPersons);
  const [lastCreatedPerson, setLastCreatedPerson] = useState(null); // Track for auto-select

  const [isDebtModalOpen, setIsDebtModalOpen] = useState(false);

  // Person Management State
  const [isPersonListModalOpen, setIsPersonListModalOpen] = useState(false);
  const [isPersonFormModalOpen, setIsPersonFormModalOpen] = useState(false);
  const [personToEdit, setPersonToEdit] = useState(null);

  const [selectedDebtDetails, setSelectedDebtDetails] = useState(null); // For viewing details
  const [selectedDebtToPay, setSelectedDebtToPay] = useState(null); // For paying
  const [selectedDebt, setSelectedDebt] = useState(null); // Replacing this legacy state with explicit ones to avoid confusion
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  const handleAddDebt = (newDebt) => {
    // Ensure we store person details if provided
    setDebts([newDebt, ...debts]);
  };

  const handleAddPerson = (newPerson) => {
    setPersons([...persons, newPerson]);
    setLastCreatedPerson(newPerson); // Auto-select trigger
    setIsPersonFormModalOpen(false);
  };

  const handleEditPerson = (updatedPerson) => {
    setPersons(persons.map(p => p.id === updatedPerson.id ? updatedPerson : p));
    setIsPersonFormModalOpen(false);
    setPersonToEdit(null);
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

  const handlePayment = (debtId, paymentData) => {
    setDebts(debts.map(d => {
      if (d.id !== debtId) return d;

      // CA-02: Store payment history
      const newPayment = {
        id: Date.now().toString(),
        amount: paymentData.amount,
        medium: paymentData.medium,
        note: paymentData.note,
        date: paymentData.date || new Date().toLocaleString('sv').slice(0, 16).replace(' ', 'T'),
        evidence: paymentData.evidence
      };

      const updatedPayments = [...(d.payments || []), newPayment];
      const newPaidTotal = updatedPayments.reduce((sum, p) => sum + p.amount, 0); // Recalculate from history

      // CA-03: Auto-settle
      const isSettled = newPaidTotal >= d.amount;

      return {
        ...d,
        paidAmount: newPaidTotal,
        payments: updatedPayments,
        status: isSettled ? 'settled' : 'active'
      };
    }));
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

  return (
    <div className="app-container">
      <div className={`sidebar-wrapper ${isMobileMenuOpen ? 'open' : ''}`}>
        <Sidebar currentView={currentView} onNavigate={navigate} />
        <div className="sidebar-overlay" onClick={() => setIsMobileMenuOpen(false)}></div>
      </div>

      <main className="main-content">
        <header className="top-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button className="menu-btn" onClick={() => setIsMobileMenuOpen(true)}>
              <Menu size={24} />
            </button>
            <div>
              <h2 className="page-title">{getPageTitle()}</h2>
              <p className="page-subtitle">Hola de nuevo, {currentUser.firstName} ✨</p>
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
                <span className="user-name">{currentUser.firstName} {currentUser.lastName}</span>
                <span className="user-role">Plan Premium</span>
              </div>
              <img src={currentUser.avatar} alt="Profile" className="avatar" />
            </div>
          </div>
        </header>

        <div className="dashboard-content">
          {currentView === 'dashboard' && (
            <>
              <SummaryCards stats={stats} />
              <div className="dashboard-grid-split">
                <ActiveDebts
                  debts={debts}
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

                {debts.map((debt) => (
                  <div key={debt.id} className="debt-item-minimal debt-grid">
                    <div className={`debt-icon ${debt.type}`}>
                      {debt.type === 'lent' ? <ArrowUpRight size={20} /> : <ArrowDownLeft size={20} />}
                    </div>
                    <div className="debt-info">
                      <h4 className="debt-counterparty-name">{debt.counterparty}</h4>
                      <div className="debt-reason-text">{debt.reason}</div>

                      {/* Ultra-compact Mobile Meta (Sync with ActiveDebts) */}
                      <div className="show-mobile mobile-meta-compact">
                        <div className="m-row-stats">
                          <span className="m-val-total">${debt.amount.toFixed(2)}</span>
                          <span className="m-dot">•</span>
                          <span className="m-val-date">{debt.date?.split('T')[0]}</span>
                        </div>
                        <div className="m-val-pending">
                          {debt.status === 'active'
                            ? `Pendiente: $${(debt.amount - debt.paidAmount).toFixed(2)}`
                            : 'Totalmente Pagado ✨'}
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
                      <span className={`badge ${debt.status === 'active' ? 'warning' : 'success'}`}>
                        {debt.status === 'active' ? <Clock size={12} /> : null}
                        {debt.status === 'active' ? ' Pendiente' : ' Pagado'}
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
            <ProfileSettings />
          )}
        </div>

        <Modal
          isOpen={isDebtModalOpen}
          onClose={() => setIsDebtModalOpen(false)}
          title="Registrar Deuda"
        >
          <DebtFormModal
            isOpen={isDebtModalOpen}
            onClose={() => setIsDebtModalOpen(false)}
            onAdd={handleAddDebt}
            persons={persons} // Pass persons list
            lastCreatedPerson={lastCreatedPerson} // For auto-select
            onAddPerson={() => {
              // When adding from debt flow, we still open the modal directly
              openCreatePerson();
            }}
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
          <DebtDetailsModal
            isOpen={!!selectedDebtDetails}
            debt={selectedDebtDetails}
            onClose={() => setSelectedDebtDetails(null)}
            onPayClick={() => {
              setSelectedDebtToPay(selectedDebtDetails);
              setSelectedDebtDetails(null); // Optional: Close details or keep open? User flow suggestion: close details to focus on pay
            }}
          />
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

      </main>
    </div>
  );
}
