import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';
// Styles imported in App.jsx via dashboard.css

// We'll use inline styles or standard CSS modules. Since I haven't set up modules yet, 
// I'll stick to classNames and a new CSS file, or just standard utility classes if I had Tailwind.
// But I have "Vanilla CSS".
// I will create a Dashboard.css later. For now, using standard classes "summary-card".

export default function SummaryCards({ stats }) {
    const { totalLent, totalBorrowed } = stats;
    const balance = totalLent - totalBorrowed;

    return (
        <div className="summary-grid">
            <div className="card summary-card fade-in">
                <div className="icon-wrapper lent">
                    <TrendingUp size={24} />
                </div>
                <div className="summary-content">
                    <span className="summary-label">Te Deben</span>
                    <h3 className="summary-value">${totalLent.toFixed(2)}</h3>
                </div>
            </div>

            <div className="card summary-card fade-in" style={{ animationDelay: '0.1s' }}>
                <div className="icon-wrapper borrowed">
                    <TrendingDown size={24} />
                </div>
                <div className="summary-content">
                    <span className="summary-label">Tú Debes</span>
                    <h3 className="summary-value">${totalBorrowed.toFixed(2)}</h3>
                </div>
            </div>

            <div className="card summary-card highlight fade-in" style={{ animationDelay: '0.2s' }}>
                <div className="icon-wrapper balance">
                    <Wallet size={24} />
                </div>
                <div className="summary-content">
                    <span className="summary-label">Balance Global</span>
                    <h3 className="summary-value">
                        {balance >= 0 ? '+' : '-'}${Math.abs(balance).toFixed(2)}
                    </h3>
                </div>
            </div>
        </div>
    );
}
