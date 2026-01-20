import { useState } from 'react';
import { ArrowUpRight, ArrowDownLeft, Clock, Eye, ArrowUpDown, ArrowUp, ArrowDown, Wallet, User, ArrowLeft } from 'lucide-react';
import './dashboard.css';

export default function ActiveDebts({ debts, onDebtClick, onPayClick, onViewAll }) {
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5);

    // Only show active debts
    const activeDebts = debts.filter(d => d.status === 'active');

    const handleSort = (key) => {
        let direction = 'asc';
        let nextKey = key;

        if (sortConfig.key === key) {
            if (sortConfig.direction === 'asc') {
                direction = 'desc';
            } else {
                // Third click: Reset to no sorting
                nextKey = null;
            }
        }

        setSortConfig({ key: nextKey, direction });
        setCurrentPage(1); // Reset to first page on sort
    };

    const handleItemsPerPageChange = (e) => {
        setItemsPerPage(Number(e.target.value));
        setCurrentPage(1);
    };

    const [viewMode, setViewMode] = useState('individual'); // 'individual' | 'consolidated'
    const [selectedPerson, setSelectedPerson] = useState(null);

    // Consolidated Grouping Logic
    const consolidatedGroups = activeDebts.reduce((acc, debt) => {
        const personName = debt.counterparty;
        if (!acc[personName]) {
            acc[personName] = {
                id: personName, // Use name as ID for grouping
                counterparty: personName,
                totalOriginal: 0,
                totalPaid: 0,
                totalPending: 0,
                netBalance: 0,
                count: 0,
                debts: []
            };
        }

        const group = acc[personName];
        group.count += 1;
        group.debts.push(debt);

        group.totalOriginal += debt.amount;
        group.totalPaid += debt.paidAmount;

        const pending = debt.amount - debt.paidAmount;
        group.totalPending += pending;

        if (debt.type === 'lent') {
            group.netBalance += pending;
        } else {
            group.netBalance -= pending;
        }

        return acc;
    }, {});

    const sortedConsolidated = Object.values(consolidatedGroups).sort((a, b) => {
        const { key, direction } = sortConfig;

        // If sorting is reset (null key), use the default magnitude sort
        if (!key) {
            const balanceA = Math.abs(a.netBalance);
            const balanceB = Math.abs(b.netBalance);
            return balanceB - balanceA;
        }

        let comparison = 0;
        if (key === 'counterparty') {
            comparison = a.counterparty.localeCompare(b.counterparty);
        } else if (key === 'totalOriginal') {
            comparison = a.totalOriginal - b.totalOriginal;
        } else if (key === 'totalPaid') {
            comparison = a.totalPaid - b.totalPaid;
        } else if (key === 'pending' || key === 'totalPending') {
            comparison = a.totalPending - b.totalPending;
        }

        return direction === 'asc' ? comparison : -comparison;
    });

    // Filter active debts if a person is selected
    const filteredActiveDebts = selectedPerson
        ? activeDebts.filter(d => d.counterparty === selectedPerson)
        : activeDebts;

    const sortedDebts = [...filteredActiveDebts].sort((a, b) => {
        if (!sortConfig.key) return 0; // Return to original order

        if (sortConfig.key === 'date') {
            return sortConfig.direction === 'asc'
                ? new Date(a.date) - new Date(b.date)
                : new Date(b.date) - new Date(a.date);
        }
        if (sortConfig.key === 'counterparty') {
            return sortConfig.direction === 'asc'
                ? a.counterparty.localeCompare(b.counterparty)
                : b.counterparty.localeCompare(a.counterparty);
        }
        if (sortConfig.key === 'amount') {
            return sortConfig.direction === 'asc'
                ? a.amount - b.amount
                : b.amount - a.amount;
        }
        if (sortConfig.key === 'paidAmount') {
            return sortConfig.direction === 'asc'
                ? a.paidAmount - b.paidAmount
                : b.paidAmount - a.paidAmount;
        }
        if (sortConfig.key === 'pending') {
            const pendingA = a.amount - a.paidAmount;
            const pendingB = b.amount - b.paidAmount;
            return sortConfig.direction === 'asc'
                ? pendingA - pendingB
                : pendingB - pendingA;
        }
        return 0;
    });

    // Unified Pagination Logic based on View Mode
    const itemsToDisplay = viewMode === 'individual' ? sortedDebts : sortedConsolidated;

    // Pagination Calculations
    const totalPages = Math.ceil(itemsToDisplay.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = itemsToDisplay.slice(indexOfFirstItem, indexOfLastItem);

    // Generate page numbers array
    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
    }

    const getSortIcon = (key) => {
        if (sortConfig.key !== key) return null;
        return sortConfig.direction === 'asc'
            ? <ArrowUp size={14} className="sort-icon-active" />
            : <ArrowDown size={14} className="sort-icon-active" />;
    };

    const SortableHeader = ({ label, sortKey, align = 'left', className = '' }) => (
        <div
            className={`sortable-header ${className}`}
            onClick={() => handleSort(sortKey)}
            style={{ justifyContent: align === 'center' ? 'center' : 'flex-start' }}
        >
            {label}
            {getSortIcon(sortKey)}
        </div>
    );

    const handleViewDetails = (personName) => {
        setSelectedPerson(personName);
        setViewMode('individual');
        setCurrentPage(1);
    };

    const clearSelection = () => {
        setSelectedPerson(null);
        setViewMode('consolidated'); // Go back to consolidated list usually makes sense
    };

    return (
        <div className="card debts-container fade-in" style={{ animationDelay: '0.3s' }}>
            <div className="debts-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {selectedPerson && (
                        <button className="btn-back-filter" onClick={clearSelection} title="Volver a lista consolidada">
                            <ArrowLeft size={18} />
                        </button>
                    )}
                    <h2>
                        {selectedPerson ? `Deudas de ${selectedPerson}` : 'Deudas Activas'}
                        <span style={{ fontSize: '0.8em', opacity: 0.7, marginLeft: '8px' }}>
                            ({viewMode === 'individual' ? filteredActiveDebts.length : Object.keys(consolidatedGroups).length})
                        </span>
                    </h2>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <div className="view-toggle">
                        <button
                            className={`toggle-btn ${viewMode === 'individual' ? 'active' : ''}`}
                            onClick={() => { setViewMode('individual'); setCurrentPage(1); }}
                        >
                            Individual
                        </button>
                        <button
                            className={`toggle-btn ${viewMode === 'consolidated' ? 'active' : ''}`}
                            onClick={() => { setViewMode('consolidated'); setCurrentPage(1); }}
                        >
                            Consolidado
                        </button>
                    </div>
                    <button className="btn-secondary" onClick={onViewAll}>Ver Todo</button>
                </div>
            </div>

            <div className="debts-list">
                {activeDebts.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                        ¡No tienes deudas activas! ✨
                    </div>
                ) : (
                    <>
                        {/* Table Header Row */}
                        <div className={`debt-grid doc-header hide-mobile ${viewMode === 'individual' ? 'grid-individual' : 'grid-consolidated'}`}>
                            {viewMode === 'individual' ? (
                                <>
                                    <div></div>
                                    <SortableHeader label="DEUDA" sortKey="counterparty" />
                                    <SortableHeader label="SOLICITADO" sortKey="date" />
                                    <SortableHeader label="INICIAL" sortKey="amount" />
                                    <SortableHeader label="PAGADO" sortKey="paidAmount" />
                                    <SortableHeader label="PENDIENTE" sortKey="pending" />
                                    <div style={{ textAlign: 'center' }}>ACCIONES</div>
                                </>
                            ) : (
                                <>
                                    <div></div>
                                    <SortableHeader label="PERSONA" sortKey="counterparty" />
                                    <SortableHeader label="TOTAL" sortKey="totalOriginal" />
                                    <SortableHeader label="PAGADO" sortKey="totalPaid" />
                                    <SortableHeader label="PENDIENTE" sortKey="totalPending" />
                                    <div style={{ textAlign: 'center' }}>ACCIONES</div>
                                </>
                            )}
                        </div>

                        {viewMode === 'individual' ? (
                            /* INDIVIDUAL VIEW */
                            currentItems.map((debt) => {
                                const pendingAmount = debt.amount - debt.paidAmount;

                                return (
                                    <div key={debt.id} className="debt-item-minimal debt-grid grid-individual">
                                        <div className={`debt-icon ${debt.type}`}>
                                            {debt.type === 'lent' ? <ArrowUpRight size={20} /> : <ArrowDownLeft size={20} />}
                                        </div>

                                        <div className="debt-info">
                                            <div className="mobile-debt-row">
                                                <div className="mobile-debt-left">
                                                    <h4 className="debt-counterparty-name">{debt.counterparty}</h4>
                                                    <div className="debt-reason-text">{debt.reason}</div>
                                                    <div className="show-mobile mobile-flex-col" style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px', gap: '1px', alignItems: 'flex-start' }}>
                                                        <span style={{ fontWeight: '500' }}>Total: ${debt.amount.toFixed(0)}</span>
                                                        <span style={{ opacity: 0.7, fontSize: '10px' }}>{debt.date?.split('T')[0]}</span>
                                                    </div>
                                                </div>

                                                <div className="mobile-debt-right show-mobile" style={{ gap: '6px' }}>
                                                    <div className="amount-progress-badge">
                                                        <div
                                                            className="amount-progress-fill"
                                                            style={{
                                                                width: `${Math.min((debt.paidAmount / debt.amount) * 100, 100)}%`,
                                                                backgroundColor: (debt.paidAmount / debt.amount) >= 0.8 ? 'var(--color-success)' :
                                                                    (debt.paidAmount / debt.amount) > 0.1 ? 'var(--color-warning)' : 'var(--color-danger)'
                                                            }}
                                                        ></div>
                                                        <div className="amount-progress-text">
                                                            ${pendingAmount.toFixed(0)}
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); onPayClick(debt); }}
                                                        className="btn-pay-minimal"
                                                    >
                                                        Pagar
                                                    </button>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); onDebtClick(debt); }}
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
                                            ${pendingAmount.toFixed(2)}
                                        </div>

                                        <div className="debt-actions-area hide-mobile">
                                            <button
                                                className="action-pill-compact"
                                                onClick={(e) => { e.stopPropagation(); onPayClick(debt); }}
                                            >
                                                Pagar
                                            </button>
                                            <button
                                                className="action-icon-eye"
                                                onClick={(e) => { e.stopPropagation(); onDebtClick(debt); }}
                                            >
                                                <Eye size={18} />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            /* CONSOLIDATED VIEW */
                            currentItems.map((group) => {
                                const netBalance = group.netBalance;
                                const isPositive = netBalance >= 0;

                                return (
                                    <div key={group.id} className="debt-item-minimal debt-grid grid-consolidated">
                                        <div className={`debt-icon ${isPositive ? 'lent' : 'borrowed'}`}>
                                            {isPositive ? <ArrowUpRight size={20} /> : <ArrowDownLeft size={20} />}
                                        </div>

                                        <div className="debt-info">
                                            <div className="mobile-debt-row-consolidated">
                                                <div className="mobile-debt-left">
                                                    <h4 className="debt-counterparty-name">{group.counterparty}</h4>
                                                    <div className="debt-reason-text">{group.count} deudas</div>

                                                    {/* Button moved here for better mobile balance */}
                                                    <div className="show-mobile" style={{ marginTop: '8px' }}>
                                                        <button
                                                            className="btn-view-minimal compact"
                                                            onClick={() => handleViewDetails(group.counterparty)}
                                                        >
                                                            DETALLES
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="mobile-debt-middle show-mobile">
                                                    <div className="vertical-badges-stack">
                                                        <div className="badge-item total">
                                                            <span className="badge-label">Total</span>
                                                            <span className="badge-value">${group.totalOriginal.toFixed(0)}</span>
                                                        </div>
                                                        <div className="badge-item paid">
                                                            <span className="badge-label">Pagado</span>
                                                            <span className="badge-value">${group.totalPaid.toFixed(0)}</span>
                                                        </div>
                                                        <div className="badge-item pending">
                                                            <span className="badge-label">Pendiente</span>
                                                            <span className="badge-value">${group.totalPending.toFixed(0)}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Desktop Columns for Consolidated */}
                                        <div className="hide-mobile desktop-col-amount" style={{ color: 'var(--text-primary)' }}>
                                            ${group.totalOriginal.toFixed(2)}
                                        </div>
                                        <div className="hide-mobile desktop-col-paid">
                                            ${group.totalPaid.toFixed(2)}
                                        </div>
                                        <div className="hide-mobile desktop-col-pending">
                                            ${group.totalPending.toFixed(2)}
                                        </div>

                                        <div className="debt-actions-area hide-mobile">
                                            {/* Detail View Button (Desktop) */}
                                            <button
                                                className="btn-view-minimal"
                                                onClick={() => handleViewDetails(group.counterparty)}
                                            >
                                                Ver Detalles
                                            </button>
                                        </div>
                                    </div>
                                );
                            })
                        )}

                        {/* Pagination Footer */}
                        {itemsToDisplay.length > 0 && (
                            <div className="pagination-controls">
                                <div className="items-per-page-selector">
                                    <span className="pagination-label">Mostrar:</span>
                                    <select
                                        value={itemsPerPage}
                                        onChange={handleItemsPerPageChange}
                                        className="rows-select"
                                    >
                                        <option value={3}>3</option>
                                        <option value={4}>4</option>
                                        <option value={5}>5</option>
                                        <option value={10}>10</option>
                                        <option value={20}>20</option>
                                        <option value={50}>50</option>
                                    </select>
                                </div>

                                {totalPages > 1 && (
                                    <div className="pagination-buttons">
                                        <button
                                            className="pagination-btn arrow"
                                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                            disabled={currentPage === 1}
                                        >
                                            &lt;
                                        </button>

                                        {pageNumbers.map(number => (
                                            <button
                                                key={number}
                                                onClick={() => setCurrentPage(number)}
                                                className={`pagination-btn page-number ${currentPage === number ? 'active' : ''}`}
                                            >
                                                {number}
                                            </button>
                                        ))}

                                        <button
                                            className="pagination-btn arrow"
                                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                            disabled={currentPage === totalPages}
                                        >
                                            &gt;
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
