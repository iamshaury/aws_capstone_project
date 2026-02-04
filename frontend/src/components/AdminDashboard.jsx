import React, { useEffect, useState } from 'react';
import api from '../api';
import { ArrowUpRight, ArrowDownRight, Clock } from 'lucide-react';

const AdminDashboard = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await api.get('/admin/transactions');
                setTransactions(response.data.transactions);
            } catch (err) {
                console.error("Failed to fetch admin data", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <div>Loading...</div>;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="flex items-center justify-between">
                <h1>Admin Console</h1>
                <span className="badge badge-success">System Active</span>
            </div>

            <div className="card" style={{ padding: 0 }}>
                <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)' }}>
                    <h3>Global Order Book ({transactions.length})</h3>
                </div>
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th><div className="flex items-center gap-2"><Clock size={14} /> Time</div></th>
                                <th>User</th>
                                <th>Type</th>
                                <th>Instrument</th>
                                <th className="text-right">Qty</th>
                                <th className="text-right">Price</th>
                                <th className="text-right">Value</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.map((t, index) => (
                                <tr key={index}>
                                    <td className="text-muted" style={{ fontSize: '12px' }}>{new Date(t.time).toLocaleString()}</td>
                                    <td>{t.user}</td>
                                    <td>
                                        <span className={`badge ${t.type === 'BUY' ? 'badge-success' : 'badge-danger'}`}>
                                            {t.type}
                                        </span>
                                    </td>
                                    <td style={{ fontWeight: 600 }}>{t.ticker}</td>
                                    <td className="text-right">{t.qty}</td>
                                    <td className="text-right">{t.price.toFixed(2)}</td>
                                    <td className="text-right">{(t.qty * t.price).toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
