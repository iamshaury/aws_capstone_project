import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { TrendingUp, Lock, Mail, ArrowRight, User } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';

// Mock data for the auth visualization
const data = Array.from({ length: 30 }, (_, i) => ({
    name: i,
    value: 1000 + Math.random() * 500 + i * 20
}));

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await login(username, password);
            if (res && res.role === 'ADMIN') {
                navigate('/admin');
            } else {
                navigate('/dashboard');
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Invalid credentials');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden' }}>
            {/* Left Side - Visualization */}
            <div style={{
                flex: 1,
                background: 'linear-gradient(135deg, #0B1120 0%, #151E2E 100%)',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                padding: '4rem',
                borderRight: '1px solid var(--border-subtle)'
            }} className="hidden-mobile">

                {/* Background Decor */}
                <div style={{
                    position: 'absolute', top: '-20%', right: '-10%', width: '600px', height: '600px',
                    background: 'radial-gradient(circle, rgba(0,212,170,0.15) 0%, rgba(0,0,0,0) 70%)',
                    filter: 'blur(60px)', pointerEvents: 'none'
                }} />

                <div style={{ position: 'relative', zIndex: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                        <div style={{ background: 'var(--primary)', padding: '0.8rem', borderRadius: '12px', boxShadow: '0 0 20px var(--primary-glow)' }}>
                            <TrendingUp size={32} color="#0B1120" />
                        </div>
                        <h1 style={{ fontSize: '2.5rem', margin: 0 }}>STOCKER</h1>
                    </div>

                    <h2 style={{ fontSize: '3rem', lineHeight: 1.1, marginBottom: '1.5rem', background: 'linear-gradient(to right, #fff, #8B9CB5)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        Master the Market.<br />Risk Free.
                    </h2>
                    <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', maxWidth: '500px', marginBottom: '4rem' }}>
                        Experience professional-grade trading simulation with real-time data styling.
                        Test strategies, track performance, and climb the leaderboard.
                    </p>

                    {/* Dynamic Chart */}
                    <div style={{ height: '200px', width: '100%', maxWidth: '600px', opacity: 0.8 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data}>
                                <defs>
                                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <Area type="monotone" dataKey="value" stroke="var(--primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Right Side - Form */}
            <div style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--bg-app)',
                padding: '2rem'
            }}>
                <div style={{ width: '100%', maxWidth: '420px' }}>
                    <div style={{ marginBottom: '2.5rem' }}>
                        <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Welcome back</h2>
                        <p style={{ color: 'var(--text-secondary)' }}>Enter your credentials to access your terminal.</p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        {error && (
                            <div style={{
                                padding: '1rem',
                                background: 'rgba(255, 71, 87, 0.1)',
                                border: '1px solid var(--danger)',
                                color: 'var(--danger)',
                                borderRadius: '8px',
                                marginBottom: '1.5rem',
                                fontSize: '0.9rem'
                            }}>
                                {error}
                            </div>
                        )}

                        <div className="input-group">
                            <label className="label">Username</label>
                            <div style={{ position: 'relative' }}>
                                <User size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                                <input
                                    className="input"
                                    style={{ paddingLeft: '3rem' }}
                                    placeholder="Enter your username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="input-group">
                            <label className="label">Password</label>
                            <div style={{ position: 'relative' }}>
                                <Lock size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                                <input
                                    type="password"
                                    className="input"
                                    style={{ paddingLeft: '3rem' }}
                                    placeholder="••••••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', fontSize: '0.9rem' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                                <input type="checkbox" style={{ accentColor: 'var(--primary)' }} />
                                Remember me
                            </label>
                            <a href="#" style={{ color: 'var(--primary)', fontWeight: 500 }}>Forgot password?</a>
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary"
                            style={{ width: '100%', padding: '1rem', fontSize: '1rem', justifyContent: 'center' }}
                            disabled={loading}
                        >
                            {loading ? 'Authenticating...' : 'Sign In'} <ArrowRight size={18} />
                        </button>
                    </form>

                    <div style={{ marginTop: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                        Don't have an account? <Link to="/signup" style={{ color: 'var(--primary)', fontWeight: 600 }}>Create an account</Link>
                    </div>
                </div>
            </div>

            <style>{`
                @media (max-width: 900px) {
                    .hidden-mobile { display: none !important; }
                }
            `}</style>
        </div>
    );
};

export default Login;
