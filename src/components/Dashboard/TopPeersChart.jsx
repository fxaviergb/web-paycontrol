import { useState, useMemo } from 'react';

// Color Palette for Pie Slices
const COLORS = [
    '#6366f1', // Indigo (Primary)
    '#10b981', // Emerald (Success)
    '#f59e0b', // Amber (Warning)
    '#ef4444', // Red (Danger)
    '#8b5cf6', // Violet
    '#ec4899'  // Pink
];

export default function TopPeersChart({ debts }) {
    const [view, setView] = useState('lent'); // 'lent' or 'borrowed'
    const [metric, setMetric] = useState('pending'); // 'amount', 'paid', 'pending'

    const chartData = useMemo(() => {
        const activeDeps = debts.filter(d => d.status === 'active' && d.type === view);

        // Group by person
        const grouped = activeDeps.reduce((acc, curr) => {
            const key = curr.counterparty;
            if (!acc[key]) acc[key] = { amount: 0, paid: 0, pending: 0 };

            acc[key].amount += curr.amount;
            acc[key].paid += curr.paidAmount;
            acc[key].pending += (curr.amount - curr.paidAmount);

            return acc;
        }, {});

        // Convert to array and filter by the selected metric
        const list = Object.keys(grouped).map(name => ({
            name,
            value: grouped[name][metric]
        })).filter(item => item.value > 0)
            .sort((a, b) => b.value - a.value)
            .slice(0, 5); // Top 5

        const total = list.reduce((sum, item) => sum + item.value, 0);

        // Calculate Pie Slices
        let currentAngle = 0;
        const slices = list.map((item, index) => {
            const percentage = total > 0 ? item.value / total : 0;
            const angle = percentage * 360;
            const startAngle = currentAngle;
            const endAngle = currentAngle + angle;
            currentAngle += angle;

            return {
                ...item,
                percentage,
                startAngle,
                endAngle,
                color: COLORS[index % COLORS.length]
            };
        });

        return { slices, total };
    }, [debts, view, metric]);

    // Helper to create SVG Arc Path
    const getCoordinatesForPercent = (percent) => {
        const x = Math.cos(2 * Math.PI * percent);
        const y = Math.sin(2 * Math.PI * percent);
        return [x, y];
    }

    const getPiePath = (startAngle, endAngle) => {
        const start = getCoordinatesForPercent(startAngle / 360);
        const end = getCoordinatesForPercent(endAngle / 360);
        const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;

        return [
            `M 0 0`,
            `L ${start[0]} ${start[1]}`,
            `A 1 1 0 ${largeArcFlag} 1 ${end[0]} ${end[1]}`,
            `L 0 0`,
        ].join(' ');
    };

    const getMetricLabel = () => {
        if (metric === 'amount') return 'Monto Inicial';
        if (metric === 'paid') return 'Valor Pagado';
        return 'Valor Pendiente';
    };

    return (
        <div className="card chart-card fade-in" style={{ animationDelay: '0.4s' }}>
            <div className="chart-header-container">
                <div className="chart-header-top">
                    <h3 className="chart-title">Top Personas</h3>

                    {/* Primary Switcher (View) */}
                    <div className="chart-switcher primary">
                        <button
                            className={`switcher-btn ${view === 'lent' ? 'active' : ''}`}
                            onClick={() => setView('lent')}
                        >
                            Más me deben
                        </button>
                        <button
                            className={`switcher-btn ${view === 'borrowed' ? 'active' : ''}`}
                            onClick={() => setView('borrowed')}
                        >
                            Más debo
                        </button>
                    </div>
                </div>

                {/* Secondary Switcher (Metric) */}
                <div className="chart-switcher-row secondary">
                    <button
                        className={`sub-switcher-btn ${metric === 'amount' ? 'active' : ''}`}
                        onClick={() => setMetric('amount')}
                    >
                        Inicial
                    </button>
                    <button
                        className={`sub-switcher-btn ${metric === 'paid' ? 'active' : ''}`}
                        onClick={() => setMetric('paid')}
                    >
                        Pagado
                    </button>
                    <button
                        className={`sub-switcher-btn ${metric === 'pending' ? 'active' : ''}`}
                        onClick={() => setMetric('pending')}
                    >
                        Pendiente
                    </button>
                </div>
            </div>

            <div className="chart-wrapper-vertical">
                {chartData.slices.length === 0 ? (
                    <div className="text-muted" style={{ padding: '60px', textAlign: 'center' }}>
                        No hay datos para esta vista
                    </div>
                ) : (
                    <>
                        <div className="chart-svg-container">
                            <div className="chart-svg-wrapper">
                                <svg viewBox="-1 -1 2 2" style={{ transform: 'rotate(-90deg)', overflow: 'visible' }}>
                                    {chartData.slices.map((slice, i) => (
                                        <path
                                            key={slice.name}
                                            d={getPiePath(slice.startAngle, slice.endAngle)}
                                            fill={slice.color}
                                            stroke="var(--bg-card)"
                                            strokeWidth="0.02"
                                            style={{ transition: 'all 0.3s ease', cursor: 'pointer' }}
                                        />
                                    ))}
                                </svg>
                                <div className="chart-center-hole">
                                    <div style={{ textAlign: 'center' }}>
                                        <span className="hole-number">{chartData.slices.length}</span>
                                        <span className="hole-label">Personas</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="chart-legend-bottom">
                            <div className="legend-header-metric">{getMetricLabel()}</div>
                            {chartData.slices.map((slice) => (
                                <div key={slice.name} className="legend-item">
                                    <div className="legend-left">
                                        <div className="legend-dot" style={{ backgroundColor: slice.color }}></div>
                                        <span className="legend-name">{slice.name}</span>
                                    </div>
                                    <span className="legend-value">${slice.value.toFixed(2)}</span>
                                </div>
                            ))}
                            <div className="legend-footer">
                                <span className="legend-total-label">Subtotal</span>
                                <span className="legend-total-value">${chartData.total.toFixed(2)}</span>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
