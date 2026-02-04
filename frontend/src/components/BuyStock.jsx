import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { ArrowUpRight, X } from 'lucide-react';

const BuyStock = () => {
    const [ticker, setTicker] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [price, setPrice] = useState(null); // Simulated price fetch if we wanted
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        try {
            const response = await api.post('/buy', { ticker, quantity });
            setMessage(response.data.message);
            setTimeout(() => navigate('/dashboard'), 1500);
        } catch (err) {
            setError(err.response?.data?.error || 'Purchase failed');
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <div class="card" style={{ width: '100%', maxWidth: '400px', borderTop: '4px solid var(--success)' }}>
                <div className="flex justify-between items-center" style={{ marginBottom: '1.5rem' }}>
                    <h2 style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <ArrowUpRight /> Buy Order
                    </h2>
                    <button onClick={() => navigate('/dashboard')} className="btn btn-outline" style={{ padding: '0.4rem' }}><X size={16} /></button>
                </div>

                {message && <div className="badge badge-success" style={{ display: 'block', marginBottom: '1rem', textAlign: 'center', fontSize: '14px' }}>{message}</div>}
                {error && <div className="badge badge-danger" style={{ display: 'block', marginBottom: '1rem', textAlign: 'center', fontSize: '14px' }}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label className="label">INSTRUMENT</label>
                        <input
                            className="input"
                            type="text"
                            value={ticker}
                            onChange={(e) => setTicker(e.target.value.toUpperCase())}
                            required
                            placeholder="e.g. AAPL"
                            style={{ fontSize: '16px', fontWeight: 600, letterSpacing: '1px' }}
                        />
                    </div>
                    <div className="input-group">
                        <label className="label">QUANTITY</label>
                        <input
                            className="input"
                            type="number"
                            min="1"
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                            required
                            style={{ fontSize: '16px' }}
                        />
                    </div>

                    <div className="flex gap-4" style={{ marginTop: '2rem' }}>
                        <button type="submit" className="btn btn-success" style={{ flex: 1, padding: '0.8rem' }}>BUY</button>
                        <button type="button" onClick={() => navigate('/dashboard')} className="btn btn-outline" style={{ flex: 1 }}>Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BuyStock;
