import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { TrendingUp, User, Lock, ArrowRight, Activity, CheckCircle } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';

// Mock data for visual
const data = Array.from({ length: 30 }, (_, i) => ({
    name: i,
    value: 1000 + (i * i) + Math.random() * 500
}));

const Signup = () => {
    const [step, setStep] = useState(1);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [risk, setRisk] = useState(50); // 0-100
    const [error, setError] = useState('');
    const { signup } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const handleNext = (e) => {
        e.preventDefault();
        setStep(prev => prev + 1);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            // We ignore risk/kyc data for now as backend doesn't support it yet
            await signup(username, password);
            // Show success step before redirect
            setStep(3);
            setTimeout(() => navigate('/dashboard'), 2000);
        } catch (err) {
            setError(err.response?.data?.error || 'Signup failed');
            setLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden' }}>
            {/* Left Side - Visualization */}
            <div style={{
                flex: 1,
                background: 'linear-gradient(135deg, #0B1120 0%, #000000 100%)',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                padding: '4rem',
                borderRight: '1px solid var(--border-subtle)'
            }} className="hidden-mobile">

                <div style={{ position: 'absolute', top: '0', left: '0', right: '0', bottom: '0', overflow: 'hidden', opacity: 0.3 }}>
                    <div style={{ position: 'absolute', top: '10%', left: '10%', width: '400px', height: '400px', background: 'var(--primary)', filter: 'blur(150px)', borderRadius: '50%', opacity: 0.2 }}></div>
                    <div style={{ position: 'absolute', bottom: '10%', right: '10%', width: '300px', height: '300px', background: 'var(--accent)', filter: 'blur(120px)', borderRadius: '50%', opacity: 0.2 }}></div>
                </div>

                <div style={{ position: 'relative', zIndex: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                        <div style={{ background: 'var(--accent)', padding: '0.8rem', borderRadius: '12px', boxShadow: '0 0 20px rgba(255, 71, 87, 0.4)' }}>
                            <TrendingUp size={32} color="#fff" />
                        </div>
                        <h1 style={{ fontSize: '2.5rem', margin: 0 }}>STOCKER</h1>
                    </div>

                    <h2 style={{ fontSize: '3rem', lineHeight: 1.1, marginBottom: '1.5rem', color: '#fff' }}>
                        Join the Elite.<br />Trade Smarter.
                    </h2>

                    <div style={{ marginBottom: '4rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem', color: 'var(--text-secondary)' }}>
                            <CheckCircle size={20} color="var(--success)" /> Real-time market data
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem', color: 'var(--text-secondary)' }}>
                            <CheckCircle size={20} color="var(--success)" /> Advanced risk analysis
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem', color: 'var(--text-secondary)' }}>
                            <CheckCircle size={20} color="var(--success)" /> Zero-risk simulated environment
                        </div>
                    </div>

                    <div style={{ height: '150px', width: '100%', maxWidth: '500px', opacity: 0.6 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data}>
                                <defs>
                                    <linearGradient id="colorValueSign" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="var(--accent)" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <Area type="monotone" dataKey="value" stroke="var(--accent)" strokeWidth={2} fillOpacity={1} fill="url(#colorValueSign)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Right Side - Multi-step Form */}
            <div style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--bg-app)',
                padding: '2rem'
            }}>
                <div style={{ width: '100%', maxWidth: '450px' }}>
                    {/* Progress Bar */}
                    <div style={{ display: 'flex', marginBottom: '2rem', gap: '0.5rem' }}>
                        {[1, 2].map(s => (
                            <div key={s} style={{
                                flex: 1, height: '4px', borderRadius: '2px',
                                background: step >= s ? 'var(--primary)' : 'var(--border-subtle)',
                                transition: 'all 0.3s'
                            }} />
                        ))}
                    </div>

                    <div style={{ marginBottom: '2rem' }}>
                        <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
                            {step === 1 && "Create your account"}
                            {step === 2 && "Risk Profile"}
                        </h2>
                        <p style={{ color: 'var(--text-secondary)' }}>
                            {step === 1 && "Start your journey to financial mastery."}
                            {step === 2 && "Help us tailor your trading experience."}
                        </p>
                    </div>

                    {error && (
                        <div style={{ padding: '1rem', background: 'rgba(255, 71, 87, 0.1)', border: '1px solid var(--danger)', color: 'var(--danger)', borderRadius: '8px', marginBottom: '1.5rem' }}>
                            {error}
                        </div>
                    )}

                    <form onSubmit={step === 2 ? handleSubmit : handleNext}>
                        {step === 1 && (
                            <div className="fade-in">
                                <div className="input-group">
                                    <label className="label">Username</label>
                                    <div style={{ position: 'relative' }}>
                                        <User size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                                        <input
                                            className="input"
                                            style={{ paddingLeft: '3rem' }}
                                            placeholder="Choose a username"
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
                                            placeholder="Create a password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="fade-in">
                                <div style={{ background: 'var(--bg-surface)', padding: '1.5rem', borderRadius: '12px', marginBottom: '1.5rem', border: 'var(--glass-border)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                        <span className="label">Risk Tolerance</span>
                                        <span style={{ fontWeight: 600, color: risk > 70 ? 'var(--warning)' : 'var(--primary)' }}>
                                            {risk < 30 ? 'Conservative' : risk < 70 ? 'Moderate' : 'Aggressive'}
                                        </span>
                                    </div>
                                    <input
                                        type="range"
                                        min="0" max="100"
                                        value={risk}
                                        onChange={(e) => setRisk(e.target.value)}
                                        style={{ width: '100%', accentColor: 'var(--primary)' }}
                                    />
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '11px', color: 'var(--text-muted)' }}>
                                        <span>Low Risk</span>
                                        <span>High Risk</span>
                                    </div>
                                </div>
                                <div className="input-group">
                                    <label className="label">Investment Goal</label>
                                    <select className="input" style={{ appearance: 'none' }}>
                                        <option>Long-term Growth</option>
                                        <option>Day Trading</option>
                                        <option>Hedging</option>
                                    </select>
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="fade-in text-center" style={{ padding: '2rem 0' }}>
                                <CheckCircle size={64} color="var(--success)" style={{ marginBottom: '1rem' }} />
                                <h2>Success!</h2>
                                <p className="text-muted">Redirecting to your dashboard...</p>
                            </div>
                        )}

                        {step < 3 && (
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                                {step > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => setStep(prev => prev - 1)}
                                        className="btn btn-outline"
                                        style={{ flex: 1 }}
                                    >
                                        Back
                                    </button>
                                )}
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    style={{ flex: 1, justifyContent: 'center' }}
                                    disabled={loading}
                                >
                                    {loading ? 'Processing...' : (step === 2 ? 'Complete Signup' : 'Next Step')} <ArrowRight size={18} />
                                </button>
                            </div>
                        )}
                    </form>

                    {step === 1 && (
                        <div style={{ marginTop: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                            Already have an account? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>Login</Link>
                        </div>
                    )}
                </div>
            </div>
            <style>{`
                @media (max-width: 900px) {
                    .hidden-mobile { display: none !important; }
                }
                .fade-in { animation: fadeIn 0.3s ease-out; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
};

export default Signup;
