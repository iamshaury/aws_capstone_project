import React from 'react';

const Settings = () => {
    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h1 style={{ marginBottom: '2rem' }}>Settings</h1>

            <div className="card" style={{ marginBottom: '2rem' }}>
                <h3 style={{ marginBottom: '1rem' }}>Account Preferences</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div className="flex justify-between items-center">
                        <div>
                            <div style={{ fontWeight: 600 }}>Dark Mode</div>
                            <div className="text-muted" style={{ fontSize: '12px' }}>Toggle application theme</div>
                        </div>
                        <input type="checkbox" checked readOnly style={{ accentColor: 'var(--primary)' }} />
                    </div>
                    <div className="flex justify-between items-center">
                        <div>
                            <div style={{ fontWeight: 600 }}>Notifications</div>
                            <div className="text-muted" style={{ fontSize: '12px' }}>Email trade confirmations</div>
                        </div>
                        <input type="checkbox" style={{ accentColor: 'var(--primary)' }} />
                    </div>
                </div>
            </div>

            <div className="card">
                <h3 style={{ marginBottom: '1rem', color: 'var(--danger)' }}>Danger Zone</h3>
                <button className="btn btn-danger">Reset Account</button>
            </div>
        </div>
    );
};

export default Settings;
