import React from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import Navbar from './Navbar'; // Keep for landing page

const Layout = ({ children }) => {
    const location = useLocation();
    const isAuthPage = ['/login', '/signup'].includes(location.pathname);
    const isLanding = location.pathname === '/';

    if (isAuthPage) {
        return <main style={{ minHeight: '100vh', background: 'var(--bg-app)' }}>{children}</main>;
    }

    if (isLanding) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
                <Navbar />
                <main className="container" style={{ flex: 1, padding: '2rem 1rem' }}>
                    {children}
                </main>
            </div>
        );
    }

    // Application Layout
    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-app)' }}>
            <Sidebar />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                <Header />
                <main style={{
                    flex: 1,
                    padding: '2rem',
                    overflowY: 'auto',
                    height: 'calc(100vh - 80px)' // substract header height
                }}>
                    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Layout;
