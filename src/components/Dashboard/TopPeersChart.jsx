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
    const [view, setView] = useState('lent'); // Default per request: 'lent' (Mas me deben)

    const chartData = useMemo(() => {
        const activeDeps = debts.filter(d => d.status === 'active');

        // Group by person
        const grouped = activeDeps.reduce((acc, curr) => {
            const key = curr.counterparty;
            if (!acc[key]) acc[key] = { lent: 0, borrowed: 0 };

            const remaining = curr.amount - curr.paidAmount;
            if (curr.type === 'lent') acc[key].lent += remaining;
            else acc[key].borrowed += remaining;

            return acc;
        }, {});

        // Convert to array and filter
        const list = Object.keys(grouped).map(name => ({
            name,
            value: view === 'lent' ? grouped[name].lent : grouped[name].borrowed
        })).filter(item => item.value > 0)
            .sort((a, b) => b.value - a.value)
            .slice(0, 5); // Top 5

        const total = list.reduce((sum, item) => sum + item.value, 0);

        // Calculate Pie Slices
        let currentAngle = 0;
        const slices = list.map((item, index) => {
            const percentage = item.value / total;
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
    }, [debts, view]);

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

        // Adjust for SVG coordinate system (y is down) and rotation (-90deg start)
        return [
            `M 0 0`,
            `L ${start[0]} ${start[1]}`, // Removed scaling here, we scale in viewBox
            `A 1 1 0 ${largeArcFlag} 1 ${end[0]} ${end[1]}`,
            `L 0 0`,
        ].join(' ');
    };

    return (
        <div className="card fade-in" style={{ animationDelay: '0.4s', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600' }}>Top Personas</h3>

                {/* Switcher */}
                <div style={{ background: 'var(--bg-surface-hover)', padding: '4px', borderRadius: '8px', display: 'flex', gap: '4px' }}>
                    <button
                        onClick={() => setView('lent')}
                        style={{
                            border: 'none',
                            background: view === 'lent' ? 'var(--bg-active)' : 'transparent',
                            color: view === 'lent' ? 'white' : 'var(--text-muted)',
                            padding: '4px 8px',
                            borderRadius: '6px',
                            fontSize: '11px',
                            cursor: 'pointer',
                            fontWeight: '500',
                            transition: 'all 0.2s'
                        }}
                    >
                        Más me deben
                    </button>
                    <button
                        onClick={() => setView('borrowed')}
                        style={{
                            border: 'none',
                            background: view === 'borrowed' ? 'var(--bg-active)' : 'transparent',
                            color: view === 'borrowed' ? 'white' : 'var(--text-muted)',
                            padding: '4px 8px',
                            borderRadius: '6px',
                            fontSize: '11px',
                            cursor: 'pointer',
                            fontWeight: '500',
                            transition: 'all 0.2s'
                        }}
                    >
                        Más debo
                    </button>
                </div>
            </div>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                {chartData.slices.length === 0 ? (
                    <div className="text-muted" style={{ fontSize: '13px' }}>No hay datos</div>
                ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '24px', width: '100%' }}>

                        {/* Values List (Legend) */}
                        <div style={{ flex: 1 }}>
                            {chartData.slices.map((slice) => (
                                <div key={slice.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', fontSize: '12px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: slice.color }}></div>
                                        <span style={{ color: 'var(--text-secondary)' }}>{slice.name}</span>
                                    </div>
                                    <span style={{ fontWeight: '600' }}>${slice.value.toFixed(2)}</span>
                                </div>
                            ))}
                            <div style={{ marginTop: '12px', paddingTop: '8px', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                                <span className="text-muted">Total</span>
                                <span style={{ fontWeight: 'bold' }}>${chartData.total.toFixed(2)}</span>
                            </div>
                        </div>

                        {/* Pie Chart SVG */}
                        <div style={{ width: '220px', height: '220px', position: 'relative', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.3))' }}>
                            <svg viewBox="-1 -1 2 2" style={{ transform: 'rotate(-90deg)', overflow: 'visible' }}>
                                {chartData.slices.map((slice, i) => (
                                    <path
                                        key={slice.name}
                                        d={getPiePath(slice.startAngle, slice.endAngle)}
                                        fill={slice.color}
                                        stroke="var(--bg-surface)"
                                        strokeWidth="0.02" // Thinner stroke for sharper look
                                        style={{ transition: 'all 0.3s ease', cursor: 'pointer' }}
                                        onMouseEnter={(e) => e.target.style.opacity = '0.8'}
                                        onMouseLeave={(e) => e.target.style.opacity = '1'}
                                    />
                                ))}
                            </svg>
                            {/* Hollow Center for Donut effect */}
                            <div style={{
                                position: 'absolute',
                                top: '20%', left: '20%',
                                width: '60%', height: '60%',
                                background: 'var(--bg-card)', // Match card bg for seamless look
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)'
                            }}>
                                <div style={{ textAlign: 'center' }}>
                                    <span style={{ fontSize: '24px', fontWeight: 'bold', display: 'block', color: 'var(--text-primary)' }}>
                                        {chartData.slices.length}
                                    </span>
                                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Personas</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
