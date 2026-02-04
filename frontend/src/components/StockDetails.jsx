import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { ArrowUpRight, ArrowDownRight, Clock, Activity, DollarSign, Wallet } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const StockDetails = () => {
    const { symbol } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Trading State
    const [orderType, setOrderType] = useState('buy'); // 'buy' or 'sell'
    const [quantity, setQuantity] = useState(1);
    const [tradeLoading, setTradeLoading] = useState(false);
    const [tradeMessage, setTradeMessage] = useState('');
    const [tradeError, setTradeError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const detailRes = await api.get(`/stock/${symbol}`);
                setData(detailRes.data);

                const historyRes = await api.get(`/stock/${symbol}/history`);
                setHistory(historyRes.data.reverse());
            } catch (err) {
                setError('Failed to load stock data.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [symbol]);

    const handleTrade = async (e) => {
        e.preventDefault();
        setTradeMessage('');
        setTradeError('');
        setTradeLoading(true);

        try {
            const endpoint = orderType === 'buy' ? '/buy' : '/sell';
            const res = await api.post(endpoint, { ticker: symbol, quantity: parseInt(quantity) });
            setTradeMessage(res.data.message);
            // Refresh data potentially? For now just show success.
            setTimeout(() => {
                setTradeMessage('');
                if (orderType === 'buy') navigate('/dashboard'); // Optional redirect
            }, 2000);
        } catch (err) {
            setTradeError(err.response?.data?.error || 'Trade failed');
        } finally {
            setTradeLoading(false);
        }
    };

    if (loading) return <div style={{ padding: '4rem', textAlign: 'center' }}>Loading Ticker...</div>;
    if (!data) return <div style={{ padding: '4rem', textAlign: 'center' }}>Stock not found</div>;

    const { quote, overview } = data;
    const isPositive = quote.change >= 0;
    const currentPrice = quote.price;
    const estimatedTotal = (currentPrice * quantity).toFixed(2);

    return (
        <div style={{ paddingBottom: '2rem' }}>
            <div className="grid-standard">
                {/* Left Column: Chart & Info */}
                <div className="col-span-8">
                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', marginBottom: '2rem' }}>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '0.5rem' }}>
                                <h1 style={{ margin: 0, fontSize: '2.5rem' }}>{quote.symbol}</h1>
                                <span className="badge" style={{ fontSize: '12px', background: 'rgba(255,255,255,0.1)' }}>{overview.AssetType || 'Stock'}</span>
                            </div>
                            <div style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>{overview.Name || symbol}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '2.5rem', fontWeight: 700 }}>${currentPrice.toFixed(2)}</div>
                            <div className={isPositive ? 'text-success' : 'text-danger'} style={{ fontSize: '1.1rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.4rem' }}>
                                {isPositive ? <ArrowUpRight size={20} /> : <ArrowDownRight size={20} />}
                                {isPositive ? '+' : ''}{quote.change.toFixed(2)} ({quote.change_percent}%)
                            </div>
                        </div>
                    </div>

                    {/* Chart Container */}
                    <div className="card" style={{ height: '500px', marginBottom: '2rem', padding: '1rem 2rem 0 0', position: 'relative' }}>
                        {/* Time Frames (Mock) */}
                        <div style={{ position: 'absolute', top: '1rem', right: '1rem', display: 'flex', gap: '0.5rem', zIndex: 10 }}>
                            {['1D', '1W', '1M', '1Y', 'ALL'].map(tf => (
                                <button key={tf} style={{
                                    background: tf === '1M' ? 'var(--bg-active)' : 'transparent',
                                    border: 'none',
                                    color: tf === '1M' ? 'var(--text-main)' : 'var(--text-secondary)',
                                    padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 600
                                }}>{tf}</button>
                            ))}
                        </div>

                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={history}>
                                <defs>
                                    <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={isPositive ? 'var(--success)' : 'var(--danger)'} stopOpacity={0.3} />
                                        <stop offset="95%" stopColor={isPositive ? 'var(--success)' : 'var(--danger)'} stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-subtle)" opacity={0.5} />
                                <XAxis dataKey="date" hide />
                                <YAxis
                                    orientation="right"
                                    domain={['auto', 'auto']}
                                    tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(val) => `$${val}`}
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'var(--bg-surface)', border: 'var(--glass-border)', borderRadius: '8px' }}
                                    itemStyle={{ color: 'var(--text-main)' }}
                                    labelStyle={{ color: 'var(--text-secondary)' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="close"
                                    stroke={isPositive ? 'var(--success)' : 'var(--danger)'}
                                    strokeWidth={2}
                                    fillOpacity={1}
                                    fill="url(#colorPrice)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Stats Grid */}
                    <div className="card" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
                        <div>
                            <div className="label">Market Cap</div>
                            <div className="font-bold">{overview.MarketCapitalization ? (parseInt(overview.MarketCapitalization) / 1e9).toFixed(2) + 'B' : '-'}</div>
                        </div>
                        <div>
                            <div className="label">P/E Ratio</div>
                            <div className="font-bold">{overview.PERatio || '-'}</div>
                        </div>
                        <div>
                            <div className="label">52W High</div>
                            <div className="font-bold">${overview['52WeekHigh'] || '-'}</div>
                        </div>
                        <div>
                            <div className="label">Volume</div>
                            <div className="font-bold">24.5M</div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Order Panel */}
                <div className="col-span-4">
                    <div className="card" style={{ position: 'sticky', top: '100px', border: '1px solid var(--border-active)' }}>
                        <div style={{ display: 'flex', marginBottom: '1.5rem', background: 'var(--bg-app)', borderRadius: '8px', padding: '4px' }}>
                            <button
                                onClick={() => setOrderType('buy')}
                                style={{
                                    flex: 1, padding: '0.75rem', borderRadius: '6px', border: 'none',
                                    background: orderType === 'buy' ? 'var(--success)' : 'transparent',
                                    color: orderType === 'buy' ? '#fff' : 'var(--text-secondary)',
                                    fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s'
                                }}
                            >
                                BUY
                            </button>
                            <button
                                onClick={() => setOrderType('sell')}
                                style={{
                                    flex: 1, padding: '0.75rem', borderRadius: '6px', border: 'none',
                                    background: orderType === 'sell' ? 'var(--danger)' : 'transparent',
                                    color: orderType === 'sell' ? '#fff' : 'var(--text-secondary)',
                                    fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s'
                                }}
                            >
                                SELL
                            </button>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', fontSize: '13px' }}>
                            <span className="text-muted">Available Balance</span>
                            <span style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Wallet size={12} /> $10,000.00
                            </span>
                        </div>

                        <form onSubmit={handleTrade}>
                            <div className="input-group">
                                <label className="label">Order Type</label>
                                <select className="input" style={{ appearance: 'none' }}>
                                    <option>Market Order</option>
                                    <option disabled>Limit Order (Pro)</option>
                                </select>
                            </div>

                            <div className="input-group">
                                <label className="label">Quantity</label>
                                <input
                                    className="input"
                                    type="number"
                                    min="1"
                                    value={quantity}
                                    onChange={(e) => setQuantity(e.target.value)}
                                    style={{ fontSize: '1.2rem', fontWeight: 600 }}
                                />
                            </div>

                            <div style={{ margin: '1.5rem 0', padding: '1rem', background: 'var(--bg-app)', borderRadius: '8px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '13px', color: 'var(--text-secondary)' }}>
                                    <span>Est. Price</span>
                                    <span>${currentPrice.toFixed(2)}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '1.1rem' }}>
                                    <span>Total</span>
                                    <span>${estimatedTotal}</span>
                                </div>
                            </div>

                            {tradeMessage && <div className="badge badge-success" style={{ width: '100%', padding: '0.8rem', textAlign: 'center', marginBottom: '1rem' }}>{tradeMessage}</div>}
                            {tradeError && <div className="badge badge-danger" style={{ width: '100%', padding: '0.8rem', textAlign: 'center', marginBottom: '1rem' }}>{tradeError}</div>}

                            <button
                                type="submit"
                                className={`btn ${orderType === 'buy' ? 'btn-success' : 'btn-danger'}`}
                                style={{ width: '100%', padding: '1rem', fontSize: '1.1rem', boxShadow: orderType === 'buy' ? '0 0 20px rgba(0, 212, 170, 0.3)' : '0 0 20px rgba(255, 71, 87, 0.3)' }}
                                disabled={tradeLoading}
                            >
                                {tradeLoading ? 'Processing...' : (orderType === 'buy' ? 'PLACE BUY ORDER' : 'PLACE SELL ORDER')}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StockDetails;
