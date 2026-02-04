import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { TrendingUp, TrendingDown, Zap } from 'lucide-react';

const Explore = () => {
    const [movers, setMovers] = useState({ gainers: [], losers: [], most_active: [] });
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('All');
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        const fetchMarketData = async () => {
            try {
                const response = await api.get('/stock/explore');
                setMovers(response.data);
            } catch (err) {
                console.error("Failed to fetch market data", err);
            } finally {
                setLoading(false);
            }
        };
        fetchMarketData();
    }, []);

    const sectors = ['All', 'Tech', 'Energy', 'Finance', 'Healthcare', 'Crypto'];

    if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading Market Data...</div>;

    // Combine all stocks for the grid view, filter duplicates
    const allStocks = [...movers.gainers, ...movers.losers, ...movers.most_active]
        .filter((v, i, a) => a.findIndex(t => t.ticker === v.ticker) === i);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Header & Tabs */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1>Market Explore</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Discover new opportunities and trending assets.</p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', background: 'var(--bg-surface)', padding: '0.25rem', borderRadius: '8px', border: 'var(--glass-border)' }}>
                    {sectors.map(sector => (
                        <button
                            key={sector}
                            onClick={() => setActiveTab(sector)}
                            style={{
                                padding: '0.5rem 1rem',
                                borderRadius: '6px',
                                border: 'none',
                                background: activeTab === sector ? 'var(--primary-glow)' : 'transparent',
                                color: activeTab === sector ? 'var(--primary)' : 'var(--text-secondary)',
                                fontWeight: 600,
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            {sector}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid-standard">
                {/* Main Grid - Full Width */}
                <div className="col-span-12">
                    {/* Trending Carousel Mock */}
                    <div style={{ marginBottom: '2rem' }}>
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                            <Zap size={18} color="var(--accent)" fill="var(--accent)" /> Trending Now
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                            {movers.gainers.slice(0, 3).map((stock) => (
                                <Link to={`/stock/${stock.ticker}`} key={stock.ticker} className="card" style={{ padding: '1rem', border: '1px solid var(--success-bg)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                        <span style={{ fontWeight: 700 }}>{stock.ticker}</span>
                                        <TrendingUp size={16} color="var(--success)" />
                                    </div>
                                    <div style={{ fontSize: '1.25rem', fontWeight: 600 }}>${stock.price}</div>
                                    <div className="text-success" style={{ fontSize: '12px', fontWeight: 600 }}>+{stock.change_percentage}</div>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* All Stocks Grid */}
                    <h3 style={{ marginBottom: '1rem' }}>Market Opportunities</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.5rem' }}>
                        {allStocks.map((stock) => {
                            const change = parseFloat(stock.change_percentage.replace('%', ''));
                            const isPositive = change >= 0;

                            return (
                                <Link to={`/stock/${stock.ticker}`} key={stock.ticker} className="card" style={{
                                    transition: 'transform 0.2s',
                                    textDecoration: 'none',
                                    borderTop: `4px solid ${isPositive ? 'var(--success)' : 'var(--danger)'}`
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--bg-surface-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.8rem' }}>
                                            {stock.ticker[0]}
                                        </div>
                                        {isPositive ? <TrendingUp size={20} color="var(--success)" /> : <TrendingDown size={20} color="var(--danger)" />}
                                    </div>

                                    <div>
                                        <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>{stock.ticker}</div>
                                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Market Equity</div>
                                    </div>

                                    <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-active)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-main)' }}>${stock.price}</div>
                                        <div className={isPositive ? 'text-success' : 'text-danger'} style={{ fontWeight: 600, padding: '0.25rem 0.5rem', borderRadius: '4px', background: isPositive ? 'var(--success-bg)' : 'var(--danger-bg)', fontSize: '12px' }}>
                                            {stock.change_percentage}
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Explore;
