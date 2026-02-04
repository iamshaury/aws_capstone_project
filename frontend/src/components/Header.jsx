import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Bell, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api';

const Header = () => {
    const { user } = useAuth();
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [showResults, setShowResults] = useState(false);

    useEffect(() => {
        const timeoutId = setTimeout(async () => {
            if (searchQuery.length > 1) {
                try {
                    const res = await api.get(`/stock/search?q=${searchQuery}`);
                    setSearchResults(res.data);
                    setShowResults(true);
                } catch (e) {
                    console.error("Search failed", e);
                }
            } else {
                setSearchResults([]);
                setShowResults(false);
            }
        }, 300);
        return () => clearTimeout(timeoutId);
    }, [searchQuery]);

    return (
        <header style={{
            height: '80px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 2rem',
            borderBottom: 'var(--glass-border)',
            background: 'rgba(11, 17, 32, 0.5)',
            backdropFilter: 'blur(8px)',
            position: 'sticky',
            top: 0,
            zIndex: 40
        }}>
            {/* Search Bar */}
            <div style={{ position: 'relative', width: '400px' }}>
                <div style={{ position: 'relative' }}>
                    <Search
                        size={18}
                        color="var(--text-secondary)"
                        style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }}
                    />
                    <input
                        type="text"
                        placeholder="Search for stocks, ETFs..."
                        className="input"
                        style={{ paddingLeft: '3rem', borderRadius: '50px', background: 'var(--bg-surface)' }}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onFocus={() => { if (searchResults.length > 0) setShowResults(true) }}
                        onBlur={() => setTimeout(() => setShowResults(false), 200)}
                    />
                </div>

                {/* Search Results Dropdown */}
                {showResults && searchResults.length > 0 && (
                    <div className="card" style={{
                        position: 'absolute',
                        top: '120%',
                        left: 0,
                        right: 0,
                        padding: '0.5rem',
                        zIndex: 100,
                        maxHeight: '400px',
                        overflowY: 'auto',
                        background: 'var(--bg-surface)',
                        border: '1px solid var(--border-active)'
                    }}>
                        {searchResults.map((s) => (
                            <Link
                                key={s.symbol}
                                to={`/stock/${s.symbol}`}
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '0.75rem 1rem',
                                    borderRadius: '8px',
                                    color: 'var(--text-main)'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-surface-hover)'}
                                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                            >
                                <div>
                                    <div style={{ fontWeight: 700 }}>{s.symbol}</div>
                                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{s.name}</div>
                                </div>
                                <span className="badge badge-success">Trade</span>
                            </Link>
                        ))}
                    </div>
                )}
            </div>

            {/* Right Side Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                {/* Notifications */}
                <button
                    className="btn btn-outline"
                    style={{
                        borderRadius: '50%',
                        width: '40px',
                        height: '40px',
                        padding: 0,
                        border: 'none',
                        position: 'relative'
                    }}
                >
                    <Bell size={20} />
                    <span style={{
                        position: 'absolute',
                        top: '8px',
                        right: '10px',
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: 'var(--danger)',
                        border: '1px solid var(--bg-app)'
                    }}></span>
                </button>

                {/* User Profile */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                    <div style={{ textAlign: 'right', display: 'none', lg: 'block' }}>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{user?.username || 'Guest'}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{user?.role === 'ADMIN' ? 'Administrator' : 'Trader'}</div>
                    </div>
                    <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, var(--primary), var(--primary-hover))',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        color: '#0B1120',
                        boxShadow: 'var(--shadow-glow-primary)'
                    }}>
                        {user?.username?.[0]?.toUpperCase() || 'G'}
                    </div>
                    <ChevronDown size={16} color="var(--text-secondary)" />
                </div>
            </div>
        </header>
    );
};

export default Header;
