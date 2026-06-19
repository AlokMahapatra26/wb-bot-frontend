import React from 'react';

const NAV_ITEMS = [
    {
        key: 'chat',
        label: 'Status & Logs',
        icon: (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <line x1="9" y1="9" x2="15" y2="9"/>
                <line x1="9" y1="13" x2="15" y2="13"/>
                <line x1="9" y1="17" x2="11" y2="17"/>
            </svg>
        )
    },
    {
        key: 'inbox',
        label: 'Chats',
        icon: (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
        )
    },
    {
        key: 'responder',
        label: 'Individual Responder',
        icon: (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
            </svg>
        )
    },
    {
        key: 'business',
        label: 'Business Autopilot',
        icon: (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
        )
    },
    {
        key: 'settings',
        label: 'Settings',
        icon: (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <circle cx="12" cy="12" r="3"/>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>
        )
    }
];

export default function Sidebar({ activeView, setActiveView, setActiveChatJid, isSidebarCollapsed, setIsSidebarCollapsed, theme, toggleTheme, handleLogout, hideResponderTab, hideBusinessTab }) {
    const navBtnStyle = (key) => ({
        display: 'flex',
        alignItems: 'center',
        justifyContent: isSidebarCollapsed ? 'center' : 'flex-start',
        gap: isSidebarCollapsed ? '0' : '0.75rem',
        width: '100%',
        textAlign: 'left',
        fontSize: '0.8rem',
        fontWeight: 600,
        padding: isSidebarCollapsed ? '0.7rem 0' : '0.7rem 0.85rem',
        borderRadius: 'var(--radius-sm)',
        background: activeView === key ? 'var(--primary)' : 'transparent',
        color: activeView === key ? '#171717' : 'var(--text)',
        border: '1px solid',
        borderColor: activeView === key ? 'var(--primary)' : 'transparent',
        cursor: 'pointer',
        transition: 'all 0.15s ease'
    });

    return (
        <aside style={{
            width: isSidebarCollapsed ? '72px' : '260px',
            background: 'var(--white)',
            borderRight: '1px solid var(--border)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: isSidebarCollapsed ? '1.5rem 0.75rem' : '1.5rem',
            flexShrink: 0,
            height: '100%',
            boxSizing: 'border-box',
            transition: 'width 0.2s cubic-bezier(0.4, 0, 0.2, 1), padding 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            alignItems: isSidebarCollapsed ? 'center' : 'stretch'
        }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', width: '100%' }}>
                {/* Brand Logo & Collapse Toggle */}
                {isSidebarCollapsed ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', width: '100%' }}>
                        <span style={{ color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Whatsapp AI Bot Creator">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                            </svg>
                        </span>
                        <button 
                            type="button" 
                            onClick={() => setIsSidebarCollapsed(false)} 
                            style={{
                                background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                padding: '0.25rem', borderRadius: '4px', width: 'auto'
                            }}
                            title="Expand Sidebar"
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="9 18 15 12 9 6" />
                            </svg>
                        </button>
                    </div>
                ) : (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                            <span className="logo" style={{ fontSize: '1.02rem', fontWeight: 700, whiteSpace: 'nowrap' }}>Whatsapp AI Bot <span style={{ color: 'var(--primary)' }}>Creator</span></span>
                            <span style={{ fontSize: '0.62rem', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '-2px' }}>Admin Dashboard</span>
                        </div>
                        <button 
                            type="button" 
                            onClick={() => setIsSidebarCollapsed(true)} 
                            style={{
                                background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                padding: '0.25rem', borderRadius: '4px', width: 'auto'
                            }}
                            title="Collapse Sidebar"
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="15 18 9 12 15 6" />
                            </svg>
                        </button>
                    </div>
                )}

                {/* Navigation Menu */}
                <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', width: '100%' }}>
                    {NAV_ITEMS.filter(item => {
                        if (item.key === 'responder' && hideResponderTab) return false;
                        if (item.key === 'business' && hideBusinessTab) return false;
                        return true;
                    }).map(item => (
                        <button 
                            key={item.key}
                            type="button" 
                            onClick={() => { setActiveView(item.key); setActiveChatJid(null); }}
                            style={navBtnStyle(item.key)}
                            className={`sidebar-nav-btn ${activeView === item.key ? 'active' : ''}`}
                            title={isSidebarCollapsed ? item.label : ""}
                        >
                            {item.icon}
                            {!isSidebarCollapsed && <span>{item.label}</span>}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Sidebar Footer */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%', alignItems: isSidebarCollapsed ? 'center' : 'stretch' }}>
                <button 
                    type="button" 
                    onClick={toggleTheme} 
                    style={{ 
                        display: 'flex', alignItems: 'center',
                        justifyContent: isSidebarCollapsed ? 'center' : 'flex-start',
                        gap: isSidebarCollapsed ? '0' : '0.75rem',
                        width: '100%', fontSize: '0.75rem', fontWeight: 600,
                        padding: isSidebarCollapsed ? '0.55rem 0' : '0.55rem 0.75rem',
                        borderRadius: 'var(--radius-sm)',
                        background: 'var(--canvas-soft)', color: 'var(--text)',
                        border: '1px solid var(--border)', cursor: 'pointer'
                    }}
                    title={isSidebarCollapsed ? (theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode") : ""}
                >
                    {theme === 'dark' ? (
                        <>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ flexShrink: 0 }}>
                                <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                            </svg>
                            {!isSidebarCollapsed && <span>Light Mode</span>}
                        </>
                    ) : (
                        <>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ flexShrink: 0 }}>
                                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                            </svg>
                            {!isSidebarCollapsed && <span>Dark Mode</span>}
                        </>
                    )}
                </button>
                
                <button 
                    type="button" 
                    onClick={handleLogout} 
                    style={{ 
                        display: 'flex', alignItems: 'center',
                        justifyContent: isSidebarCollapsed ? 'center' : 'flex-start',
                        gap: isSidebarCollapsed ? '0' : '0.75rem',
                        width: '100%', fontSize: '0.75rem', fontWeight: 600,
                        padding: isSidebarCollapsed ? '0.55rem 0' : '0.55rem 0.75rem',
                        borderRadius: 'var(--radius-sm)',
                        background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444',
                        border: '1px solid rgba(239, 68, 68, 0.2)', cursor: 'pointer'
                    }}
                    title={isSidebarCollapsed ? "Logout" : ""}
                >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ flexShrink: 0 }}>
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>
                    </svg>
                    {!isSidebarCollapsed && <span>Logout</span>}
                </button>
            </div>
        </aside>
    );
}
