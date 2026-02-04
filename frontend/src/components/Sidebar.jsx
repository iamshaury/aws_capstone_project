import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Compass, PieChart, ClipboardList, Settings, TrendingUp, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
    const { logout } = useAuth();

    const navItems = [
        { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/explore', label: 'Explore', icon: Compass },
        { path: '/portfolio', label: 'Portfolio', icon: PieChart },
        { path: '/orders', label: 'Orders', icon: ClipboardList },
        { path: '/settings', label: 'Settings', icon: Settings },
    ];

    return (
        <aside style={{
            width: '260px',
            height: '100vh',
            position: 'sticky',
            top: 0,
            left: 0,
            backgroundColor: 'var(--bg-surface)',
            borderRight: 'var(--glass-border)',
            display: 'flex',
            flexDirection: 'column',
            padding: '2rem 1.5rem',
            zIndex: 50
        }}>
            {/* Brand */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '3rem', paddingLeft: '0.5rem' }}>
                <div style={{
                    background: 'var(--primary)',
                    borderRadius: '8px',
                    padding: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 0 15px var(--primary-glow)'
                }}>
                    <TrendingUp size={24} color="#0B1120" />
                </div>
                <span style={{ fontSize: '1.25rem', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text-main)' }}>
                    STOCKER
                </span>
            </div>

            {/* Navigation */}
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        style={({ isActive }) => ({
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                            padding: '0.875rem 1rem',
                            borderRadius: '12px',
                            color: isActive ? 'var(--text-main)' : 'var(--text-secondary)',
                            backgroundColor: isActive ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
                            borderLeft: isActive ? '3px solid var(--primary)' : '3px solid transparent',
                            fontWeight: isActive ? 600 : 500,
                            transition: 'all 0.2s',
                        })}
                    >
                        {({ isActive }) => (
                            <>
                                <item.icon size={20} color={isActive ? 'var(--primary)' : 'currentColor'} />
                                <span>{item.label}</span>
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>

            {/* Logout/User Actions */}
            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1.5rem' }}>
                <button
                    onClick={logout}
                    className="btn-outline"
                    style={{
                        width: '100%',
                        display: 'flex',
                        justifyContent: 'flex-start',
                        border: 'none',
                        padding: '0.875rem 1rem',
                        color: 'var(--danger)'
                    }}
                >
                    <LogOut size={20} />
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
