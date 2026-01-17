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

import { currentUser, initialDebts } from './data/mock';
import { Plus, Menu } from 'lucide-react';
import './app.css';
import './components/Dashboard/dashboard.css';

export default function App() {
  const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard' | 'profile'
  const [debts, setDebts] = useState(initialDebts);
  const [isDebtModalOpen, setIsDebtModalOpen] = useState(false);
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
    setDebts([newDebt, ...debts]);
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
        date: new Date().toISOString().split('T')[0],
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
              <h2 className="page-title">
                {currentView === 'dashboard' ? 'Panel Principal' : 'Mi Perfil'}
              </h2>
              <p className="page-subtitle">Hola de nuevo, {currentUser.firstName} ✨</p>
            </div>
          </div>

          {currentView === 'dashboard' && (
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => setIsDebtModalOpen(true)}>
                <Plus size={18} />
                Nueva Deuda
              </button>
              <div className="user-profile">
                <div className="user-info">
                  <span className="user-name">{currentUser.firstName} {currentUser.lastName}</span>
                  <span className="user-role">Plan Premium</span>
                </div>
                <img src={currentUser.avatar} alt="Profile" className="avatar" />
              </div>
            </div>
          )}
        </header>

        <div className="dashboard-content">
          {currentView === 'dashboard' ? (
            <>
              <SummaryCards stats={stats} />
              <div className="dashboard-grid-slpit">
                <ActiveDebts
                  debts={debts}
                  onDebtClick={setSelectedDebtDetails}
                  onPayClick={setSelectedDebtToPay}
                />
                <TopPeersChart debts={debts} />
              </div>
              <AdvancedStats debts={debts} />
            </>
          ) : (
            <ProfileSettings />
          )}
        </div>

        {/* Modals */}
        <Modal
          isOpen={isDebtModalOpen}
          onClose={() => setIsDebtModalOpen(false)}
          title="Registrar Deuda"
        >
          <DebtFormModal
            isOpen={isDebtModalOpen}
            onClose={() => setIsDebtModalOpen(false)}
            onAdd={handleAddDebt}
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
