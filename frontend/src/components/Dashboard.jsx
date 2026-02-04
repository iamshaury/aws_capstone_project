import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { ArrowUpRight, ArrowDownRight, DollarSign, PieChart as PieChartIcon, Activity, TrendingUp, Clock } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

// Error Boundary Component
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({ error, errorInfo });
        console.error("Uncaught error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: '2rem', color: 'red' }}>
                    <h1>Something went wrong.</h1>
                    <details style={{ whiteSpace: 'pre-wrap' }}>
                        {this.state.error && this.state.error.toString()}
                        <br />
                        {this.state.errorInfo && this.state.errorInfo.componentStack}
                    </details>
                </div>
            );
        }
        return this.props.children;
    }
}

const DashboardContent = () => {
    const [transactions, setTransactions] = useState([]);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        console.log("DashboardContent mounting");
        const fetchData = async () => {
            try {
                console.log("Fetching dashboard data...");
                const [dashboardRes, transactionsRes] = await Promise.all([
                    api.get('/dashboard'),
                    api.get('/transactions')
                ]);
                console.log("Dashboard data received:", dashboardRes.data);
                setData(dashboardRes.data);

                // Defensive check to ensure we have an array
                const txData = Array.isArray(transactionsRes.data) ? transactionsRes.data : [];
                setTransactions(txData.slice(0, 5)); // Top 5
            } catch (err) {
                console.error("Failed to fetch dashboard data", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading Terminal...</div>;
    if (!data) return <div>Error loading dashboard.</div>;

    // Safe currency formatter helper
    const formatCurrency = (val) => {
        if (val === undefined || val === null) return '0.00';
        const num = Number(val);
        return isNaN(num) ? '0.00' : num.toFixed(2);
    };

    console.log("Rendering DashboardContent with data", data);

    const totalCurrentValue = data.total_portfolio_value;
    const totalInvested = data.portfolio.reduce((acc, item) => acc + (item.qty * item.price), 0);
    const totalPnL = totalCurrentValue - totalInvested;
    const pnlPercent = totalInvested > 0 ? (totalPnL / totalInvested) * 100 : 0;
    const totalAccountValue = data.balance + totalCurrentValue;

    // Pie Chart Data
    const allocationData = [
        { name: 'Cash', value: data.balance },
        { name: 'Investments', value: totalCurrentValue }
    ];
    const COLORS = ['#2A3441', '#00D4AA'];

    // Mock Watchlist
    const watchlist = [
        { symbol: 'AAPL', price: 173.50, change: 1.25 },
        { symbol: 'TSLA', price: 202.10, change: -2.40 },
        { symbol: 'NVDA', price: 485.00, change: 3.10 },
        { symbol: 'AMZN', price: 145.20, change: 0.50 },
        { symbol: 'MSFT', price: 370.00, change: 0.8 },
        { symbol: 'GOOGL', price: 139.50, change: -0.2 }
    ];

    // Mock Market Overview
    const marketIndices = [
        { name: 'S&P 500', val: 4780.20, change: 0.45 },
        { name: 'NASDAQ', val: 15300.50, change: 0.90 },
        { name: 'DOW', val: 37500.10, change: -0.10 },
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Top Row: Portfolio Summary & Market Overview */}
            <div className="grid-standard">

                {/* Portfolio Summary */}
                <div className="col-span-8 card" style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                    <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                            <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(0, 212, 170, 0.1)', color: 'var(--primary)' }}>
                                <PieChartIcon size={20} />
                            </div>
                            <h3 style={{ margin: 0 }}>Portfolio Summary</h3>
                        </div>

                        <div style={{ display: 'flex', gap: '3rem' }}>
                            <div>
                                <div className="label">Total Account Value</div>
                                <div style={{ fontSize: '2.5rem', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>
                                    ${totalAccountValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </div>
                                <div className={totalPnL >= 0 ? 'text-success' : 'text-danger'} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, fontSize: '1.1rem' }}>
                                    {totalPnL >= 0 ? <ArrowUpRight size={20} /> : <ArrowDownRight size={20} />}
                                    ${formatCurrency(Math.abs(totalPnL))} ({formatCurrency(Math.abs(pnlPercent))}%)
                                </div>
                            </div>

                            <div style={{ borderLeft: '1px solid var(--border-subtle)', paddingLeft: '3rem' }}>
                                <div className="label" style={{ marginBottom: '0.5rem' }}>Buying Power</div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--text-main)' }}>
                                    ${data.balance.toLocaleString()}
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                                    <Link to="/orders" className="btn btn-primary btn-sm">Orders</Link>
                                    <Link to="/explore" className="btn btn-outline btn-sm">Explore</Link>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Chart */}
                    <div style={{ width: '160px', height: '160px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={allocationData}
                                    innerRadius={50}
                                    outerRadius={70}
                                    paddingAngle={5}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {allocationData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ background: 'var(--bg-surface)', border: 'var(--glass-border)', borderRadius: '8px' }}
                                    itemStyle={{ color: 'var(--text-main)' }}
                                    formatter={(value) => `$${value.toLocaleString()}`}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Market Overview */}
                <div className="col-span-4 card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                        <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(255, 215, 0, 0.1)', color: 'var(--warning)' }}>
                            <Activity size={20} />
                        </div>
                        <h3 style={{ margin: 0 }}>Market Overview</h3>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {marketIndices.map((idx) => (
                            <div key={idx.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.02)' }}>
                                <div style={{ fontWeight: 600 }}>{idx.name}</div>
                                <div style={{ textAlign: 'right' }}>
                                    <div>{idx.val.toLocaleString()}</div>
                                    <div className={idx.change >= 0 ? 'text-success' : 'text-danger'} style={{ fontSize: '12px' }}>
                                        {idx.change >= 0 ? '+' : ''}{idx.change}%
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Watchlist Strip */}
            <div style={{ overflowX: 'auto', paddingBottom: '0.5rem' }}>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    {watchlist.map(stock => (
                        <div key={stock.symbol} className="card" style={{ padding: '1rem', minWidth: '160px', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-secondary)' }}>
                                <span>{stock.symbol}</span>
                                {stock.change >= 0 ? <TrendingUp size={14} className="text-success" /> : <TrendingUp size={14} className="text-danger" style={{ transform: 'scaleY(-1)' }} />}
                            </div>
                            <div style={{ fontSize: '1.25rem', fontWeight: 600 }}>${formatCurrency(stock.price)}</div>
                            <div className={stock.change >= 0 ? 'text-success' : 'text-danger'} style={{ fontSize: '12px', fontWeight: 500 }}>
                                {stock.change > 0 ? '+' : ''}{stock.change}%
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Positions Table */}
            <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
                <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(0, 212, 170, 0.1)', color: 'var(--primary)' }}>
                            <TrendingUp size={20} />
                        </div>
                        <h3 style={{ margin: 0 }}>Open Positions</h3>
                    </div>
                    <Link to="/buy" className="btn btn-primary btn-sm">New Trade</Link>
                </div>

                <div className="table-container" style={{ borderRadius: 0, border: 'none', boxShadow: 'none' }}>
                    <table>
                        <thead>
                            <tr>
                                <th>Instrument</th>
                                <th className="text-right">Qty</th>
                                <th className="text-right">Avg. Cost</th>
                                <th className="text-right">LTP</th>
                                <th className="text-right">Cur. Val</th>
                                <th className="text-right">P&L</th>
                                <th style={{ textAlign: 'center' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.portfolio.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="text-center text-muted" style={{ padding: '3rem' }}>
                                        <div style={{ marginBottom: '1rem' }}>No open positions.</div>
                                        <Link to="/explore" className="btn btn-outline btn-sm">Explore Market</Link>
                                    </td>
                                </tr>
                            ) : (
                                data.portfolio.map((item, index) => {
                                    const pnl = item.gain_loss;
                                    const pnlPct = (pnl / (item.qty * item.price)) * 100;
                                    return (
                                        <tr key={index}>
                                            <td>
                                                <Link to={`/stock/${item.ticker}`} style={{ fontWeight: 700, color: 'var(--text-main)', display: 'block' }}>{item.ticker}</Link>
                                                <span className="text-muted" style={{ fontSize: '11px' }}>EQUITY</span>
                                            </td>
                                            <td className="text-right" style={{ fontFamily: 'var(--font-mono)' }}>{item.qty}</td>
                                            <td className="text-right">${formatCurrency(item.price)}</td>
                                            <td className="text-right" style={{ fontWeight: 600 }}>${formatCurrency(item.current_price)}</td>
                                            <td className="text-right">${formatCurrency(item.market_value)}</td>
                                            <td className="text-right">
                                                <div className={pnl >= 0 ? 'text-success' : 'text-danger'} style={{ fontWeight: 600 }}>
                                                    {pnl >= 0 ? '+' : ''}{formatCurrency(pnl)}
                                                </div>
                                                <div className={pnl >= 0 ? 'text-success' : 'text-danger'} style={{ fontSize: '11px', opacity: 0.8 }}>
                                                    ({formatCurrency(pnlPct)}%)
                                                </div>
                                            </td>
                                            <td style={{ textAlign: 'center' }}>
                                                <Link to="/sell" className="btn btn-outline btn-sm" style={{ padding: '0.25rem 0.5rem', fontSize: '11px' }}>Close</Link>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Recent Activity Mock */}
            <div className="card" style={{ padding: '0' }}>
                <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-subtle)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Clock size={20} className="text-muted" />
                        <h3 style={{ margin: 0 }}>Recent Transactions</h3>
                    </div>
                </div>
                <div style={{ padding: '0' }}>
                    {transactions.length === 0 ? (
                        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                            No recent transactions.
                        </div>
                    ) : (
                        transactions.map((tx, i) => (
                            <div key={i} style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <div style={{ fontWeight: 600 }}>{tx.ticker}</div>
                                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{new Date(tx.time).toLocaleDateString()}</div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontWeight: 600, color: tx.type === 'BUY' ? 'var(--text-main)' : 'var(--text-main)' }}>
                                        {tx.type === 'BUY' ? '-' : '+'}${formatCurrency(tx.total_amount || (tx.price * tx.qty))}
                                    </div>
                                    <div style={{ fontSize: '11px', color: tx.type === 'BUY' ? 'var(--danger)' : 'var(--success)' }}>
                                        {tx.type} {tx.qty}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

const Dashboard = () => (
    <ErrorBoundary>
        <DashboardContent />
    </ErrorBoundary>
);

export default Dashboard;
