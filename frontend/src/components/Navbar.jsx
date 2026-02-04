import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { TrendingUp, User, LogOut, LayoutDashboard, Shield } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [searchQuery, setSearchQuery] = React.useState('');
    const [searchResults, setSearchResults] = React.useState([]);
    const [showResults, setShowResults] = React.useState(false);

    // Simple debounce could be added here
    React.useEffect(() => {
        const timeoutId = setTimeout(async () => {
            if (searchQuery.length > 2) {
                try {
                    const res = await import('../api').then(m => m.default.get(`/stock/search?q=${searchQuery}`));
                    setSearchResults(res.data);
                    setShowResults(true);
                } catch (e) {
                    console.error("Search failed", e);
                }
            } else {
                setSearchResults([]);
                setShowResults(false);
            }
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [searchQuery]);

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    const isActive = (path) => location.pathname === path;

    return (
        <nav style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0.8rem 2rem',
            backgroundColor: 'var(--bg-glass)',
            borderBottom: '1px solid var(--border-subtle)',
            position: 'sticky',
            top: 0,
            zIndex: 100,
            backdropFilter: 'blur(12px)'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, fontSize: '18px' }}>
                    <TrendingUp color="var(--primary)" size={24} />
                    <span style={{ color: 'var(--text-main)', letterSpacing: '0.5px' }}>STOCKER</span>
                </Link>

                {user && (
                    <div style={{ display: 'flex', gap: '1.5rem', fontSize: '14px' }}>
                        <Link to="/explore" style={{
                            color: isActive('/explore') ? 'var(--primary)' : 'var(--text-muted)',
                            display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 500
                        }}>
                            <img src="https://cdns.iconmonstr.com/wp-content/releases/preview/2019/240/iconmonstr-compass-4.png" width="16" style={{ filter: isActive('/explore') ? 'invert(37%) sepia(93%) saturate(3031%) hue-rotate(213deg) brightness(100%) contrast(106%)' : 'invert(60%)' }} alt="" />
                            <span>Explore</span>
                        </Link>
                        <Link to="/dashboard" style={{
                            color: isActive('/dashboard') ? 'var(--primary)' : 'var(--text-muted)',
                            display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 500
                        }}>
                            <LayoutDashboard size={16} />
                            <span>Dashboard</span>
                        </Link>
                        {user.role === 'ADMIN' && (
                            <Link to="/admin" style={{
                                color: isActive('/admin') ? 'var(--primary)' : 'var(--text-muted)',
                                display: 'flex', alignItems: 'center', gap: '0.4rem'
                            }}>
                                <Shield size={16} />
                                <span>Admin</span>
                            </Link>
                        )}
                    </div>
                )}
            </div>

            {/* Search Bar - Centered-ish if user exists */}
            {user && (
                <div style={{ position: 'relative', width: '300px' }}>
                    <input
                        className="input"
                        placeholder="Search stocks..."
                        style={{ padding: '0.5rem 1rem', borderRadius: '50px', background: 'var(--bg-surface)' }}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onFocus={() => { if (searchResults.length > 0) setShowResults(true) }}
                        onBlur={() => setTimeout(() => setShowResults(false), 200)}
                    />
                    {showResults && searchResults.length > 0 && (
                        <div className="card" style={{
                            position: 'absolute', top: '110%', left: 0, right: 0,
                            padding: '0.5rem', zIndex: 200, maxHeight: '300px', overflowY: 'auto'
                        }}>
                            {searchResults.map((s) => (
                                <Link
                                    key={s.symbol} to={`/stock/${s.symbol}`}
                                    style={{ display: 'block', padding: '0.5rem', borderRadius: '4px', color: 'var(--text-main)' }}
                                    className="hover-bg"
                                    onClick={() => setShowResults(false)}
                                >
                                    <div style={{ fontWeight: 600 }}>{s.symbol}</div>
                                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{s.name}</div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                {user ? (
                    <>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{
                                width: '32px', height: '32px', borderRadius: '50%',
                                backgroundColor: 'var(--bg-surface)', color: 'var(--primary)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontWeight: 600, border: '1px solid var(--border-subtle)'
                            }}>
                                {user.username[0].toUpperCase()}
                            </div>
                        </div>
                        <button onClick={handleLogout} className="btn btn-outline" style={{ border: 'none', padding: '0.4rem' }} title="Logout">
                            <LogOut size={18} color="var(--danger)" />
                        </button>
                    </>
                ) : (
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <Link to="/login" className="btn btn-outline">Login</Link>
                        <Link to="/signup" className="btn btn-primary" style={{ borderRadius: '50px' }}>Sign up</Link>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
