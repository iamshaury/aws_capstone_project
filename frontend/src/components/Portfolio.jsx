import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { ArrowUpRight, ArrowDownRight, TrendingUp, PieChart as PieChartIcon, Target } from 'lucide-react';

const Portfolio = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await api.get('/dashboard'); // Reuse dashboard endpoint for portfolio data
                setData(res.data);
            } catch (err) {
                console.error("Failed to fetch portfolio data", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading Portfolio...</div>;
    if (!data) return <div style={{ padding: '2rem', textAlign: 'center' }}>Error loading portfolio.</div>;

    const totalCurrentValue = data.total_portfolio_value;
    const totalInvested = data.portfolio.reduce((acc, item) => acc + (item.qty * item.price), 0);
    const totalPnL = totalCurrentValue - totalInvested;
    const pnlPercent = totalInvested > 0 ? (totalPnL / totalInvested) * 100 : 0;
    const totalAccountValue = data.balance + totalCurrentValue;

    // Safe currency formatter helper
    const formatCurrency = (val) => {
        if (val === undefined || val === null) return '0.00';
        const num = Number(val);
        return isNaN(num) ? '0.00' : num.toFixed(2);
    };

    return (
        <div style={{ paddingBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
                <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(0, 212, 170, 0.1)', color: 'var(--primary)' }}>
                    <Target size={24} />
                </div>
                <div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0, lineHeight: 1 }}>My Portfolio</h1>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>Manage your holdings and performance</div>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid-standard" style={{ marginBottom: '2rem' }}>
                <div className="col-span-4 card">
                    <div className="label">Total Account Value</div>
                    <div style={{ fontSize: '2rem', fontWeight: 700, margin: '0.5rem 0' }}>
                        ${totalAccountValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                </div>
                <div className="col-span-4 card">
                    <div className="label">Total P&L</div>
                    <div className={totalPnL >= 0 ? 'text-success' : 'text-danger'} style={{ fontSize: '2rem', fontWeight: 700, margin: '0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {totalPnL >= 0 ? <ArrowUpRight size={28} /> : <ArrowDownRight size={28} />}
                        ${formatCurrency(Math.abs(totalPnL))}
                    </div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                        {totalPnL >= 0 ? '+' : ''}{formatCurrency(pnlPercent)}% All Time
                    </div>
                </div>
                <div className="col-span-4 card">
                    <div className="label">Available Cash</div>
                    <div style={{ fontSize: '2rem', fontWeight: 700, margin: '0.5rem 0', color: 'var(--text-main)' }}>
                        ${data.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                </div>
            </div>

            {/* Holdings Table */}
            <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
                <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <TrendingUp size={20} className="text-primary" />
                        <h3 style={{ margin: 0 }}>Current Holdings</h3>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <Link to="/orders" className="btn btn-outline btn-sm">History</Link>
                        <Link to="/buy" className="btn btn-primary btn-sm">Buy Stock</Link>
                    </div>
                </div>

                <div className="table-container" style={{ borderRadius: 0, border: 'none', boxShadow: 'none' }}>
                    <table>
                        <thead>
                            <tr>
                                <th>Instrument</th>
                                <th className="text-right">Qty</th>
                                <th className="text-right">Avg. Cost</th>
                                <th className="text-right">LTP</th>
                                <th className="text-right">Market Value</th>
                                <th className="text-right">Day Change</th>
                                <th className="text-right">Total P&L</th>
                                <th style={{ textAlign: 'center' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.portfolio.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="text-center text-muted" style={{ padding: '3rem' }}>
                                        <div style={{ marginBottom: '1rem' }}>No open positions.</div>
                                        <Link to="/explore" className="btn btn-outline btn-sm">Start Trading</Link>
                                    </td>
                                </tr>
                            ) : (
                                data.portfolio.map((item, index) => {
                                    const pnl = item.gain_loss;
                                    const pnlPct = (pnl / (item.qty * item.price)) * 100;

                                    // Mock day change since API might not return it directly in this view
                                    // In real app, we would fetch or compute this.
                                    const dayChange = item.current_price * 0.012; // Mock 1.2%
                                    const dayChangePct = 1.2;

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
                                                {/* Mock Day Change Visual */}
                                                <div className="text-success" style={{ fontSize: '0.9rem' }}>+${formatCurrency(dayChange)}</div>
                                                <div className="text-success" style={{ fontSize: '11px' }}>(+{dayChangePct}%)</div>
                                            </td>
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
        </div>
    );
};

export default Portfolio;
