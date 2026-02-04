import React, { useEffect, useState } from 'react';
import api from '../api';
import { Clock, CheckCircle } from 'lucide-react';

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await api.get('/transactions');
                setOrders(response.data);
            } catch (err) {
                console.error("Failed to fetch orders", err);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading Order History...</div>;

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <div style={{ padding: '10px', borderRadius: '12px', background: 'rgba(0, 212, 170, 0.1)', color: 'var(--primary)' }}>
                    <Clock size={24} />
                </div>
                <div>
                    <h1 style={{ margin: 0 }}>Order History</h1>
                    <p style={{ color: 'var(--text-secondary)', margin: 0 }}>View all your past transactions.</p>
                </div>
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div className="table-container" style={{ border: 'none', boxShadow: 'none' }}>
                    <table>
                        <thead>
                            <tr>
                                <th>Date/Time</th>
                                <th>Symbol</th>
                                <th>Type</th>
                                <th className="text-right">Quantity</th>
                                <th className="text-right">Price</th>
                                <th className="text-right">Total</th>
                                <th className="text-right">Balance</th>
                                <th style={{ textAlign: 'center' }}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="text-center text-muted" style={{ padding: '3rem' }}>
                                        No orders found.
                                    </td>
                                </tr>
                            ) : (
                                orders.map((order, index) => {
                                    const isBuy = order.type === 'BUY';
                                    const total = order.total_amount || (order.price * order.qty);
                                    const balance = order.balance_after_trade !== undefined ? order.balance_after_trade : '-';
                                    const date = new Date(order.time).toLocaleString();

                                    return (
                                        <tr key={index}>
                                            <td style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{date}</td>
                                            <td style={{ fontWeight: 600, color: 'var(--text-main)' }}>{order.ticker}</td>
                                            <td>
                                                <span className={isBuy ? 'text-success' : 'text-danger'} style={{
                                                    background: isBuy ? 'rgba(0, 212, 170, 0.1)' : 'rgba(255, 71, 87, 0.1)',
                                                    padding: '0.25rem 0.75rem',
                                                    borderRadius: '4px',
                                                    fontSize: '12px',
                                                    fontWeight: 600
                                                }}>
                                                    {order.type}
                                                </span>
                                            </td>
                                            <td className="text-right" style={{ fontFamily: 'var(--font-mono)' }}>{order.qty}</td>
                                            <td className="text-right">${order.price.toFixed(2)}</td>
                                            <td className="text-right" style={{ fontWeight: 600 }}>${total.toFixed(2)}</td>
                                            <td className="text-right" style={{ fontFamily: 'var(--font-mono)' }}>
                                                {balance !== '-' ? `$${balance.toFixed(2)}` : '-'}
                                            </td>
                                            <td style={{ textAlign: 'center' }}>
                                                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '12px', color: 'var(--success)' }}>
                                                    <CheckCircle size={14} /> Executed
                                                </div>
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

export default Orders;
