import { useState } from 'react';
import { ArrowUpRight, ArrowDownLeft, Clock, Eye, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import './dashboard.css';

export default function ActiveDebts({ debts, onDebtClick, onPayClick, onViewAll }) {
    const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'asc' });

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5);

    // Only show active debts
    const activeDebts = debts.filter(d => d.status === 'active');

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
        setCurrentPage(1); // Reset to first page on sort
    };

    const handleItemsPerPageChange = (e) => {
        setItemsPerPage(Number(e.target.value));
        setCurrentPage(1);
    };

    const sortedDebts = [...activeDebts].sort((a, b) => {
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

    // Pagination Logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = sortedDebts.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(sortedDebts.length / itemsPerPage);

    // Generate page numbers array
    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
    }

    const getSortIcon = (key) => {
        if (sortConfig.key !== key) return <ArrowUpDown size={14} className="sort-icon-inactive" />;
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

    return (
        <div className="card debts-container fade-in" style={{ animationDelay: '0.3s' }}>
            <div className="debts-header">
                <h2>Deudas Activas ({activeDebts.length})</h2>
                <button className="btn-secondary" onClick={onViewAll}>Ver Todo ({activeDebts.length})</button>
            </div>

            <div className="debts-list">
                {activeDebts.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                        ¡No tienes deudas activas! ✨
                    </div>
                ) : (
                    <>
                        {/* Table Header Row - Hidden on Mobile */}
                        <div className="debt-grid doc-header hide-mobile">
                            <div></div> {/* Icon */}
                            <SortableHeader label="DEUDA" sortKey="counterparty" />
                            <SortableHeader label="SOLICITADO" sortKey="date" />
                            <SortableHeader label="INICIAL" sortKey="amount" />
                            <SortableHeader label="PAGADO" sortKey="paidAmount" />
                            <SortableHeader label="PENDIENTE" sortKey="pending" />
                            {/* <div>ESTADO</div> - Hidden by user request */}
                            <div style={{ textAlign: 'center' }}>ACCIONES</div>
                        </div>

                        {currentItems.map((debt) => {
                            const pendingAmount = debt.amount - debt.paidAmount;

                            return (
                                <div key={debt.id} className="debt-item-minimal debt-grid">
                                    <div className={`debt-icon ${debt.type}`}>
                                        {debt.type === 'lent' ? <ArrowUpRight size={20} /> : <ArrowDownLeft size={20} />}
                                    </div>

                                    <div className="debt-info">
                                        <h4 className="debt-counterparty-name">{debt.counterparty}</h4>
                                        <div className="debt-reason-text">{debt.reason}</div>

                                        {/* Ultra-compact Mobile Meta (User preferred) */}
                                        <div className="show-mobile mobile-meta-compact">
                                            <div className="m-row-stats">
                                                <span className="m-val-total">${debt.amount.toFixed(0)}</span>
                                                <span className="m-dot">•</span>
                                                <span className="m-val-date">{debt.date?.split('T')[0]}</span>
                                            </div>
                                            <div style={{ marginTop: '4px' }}>
                                                <div className="m-val-paid" style={{ color: '#10b981', fontSize: '11px', fontWeight: '700' }}>
                                                    Pagado: ${debt.paidAmount.toFixed(0)}
                                                </div>
                                                <div className="m-val-pending">
                                                    Pendiente: ${pendingAmount.toFixed(0)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Desktop View Columns */}
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

                                    {/* <div className="hide-mobile desktop-col-status">
                                        <span className="badge warning"><Clock size={12} /> Pendiente</span>
                                    </div> - Hidden by user request */}

                                    <div className="debt-actions-area">
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
                        })}

                        {/* Pagination Footer */}
                        {activeDebts.length > 0 && (
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
