import React from 'react';

const NAV_ITEMS = [
    { key: 'chat', label: 'Dashboard', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="9" y1="9" x2="15" y2="9"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="11" y2="17"/></svg> },
    { key: 'inbox', label: 'Chats', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> },
    { key: 'responder', label: 'Individual Responder', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg> },
    { key: 'business', label: 'Business Autopilot', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg> },
    { key: 'settings', label: 'Settings', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg> }
];

export default function Sidebar({ activeView, setActiveView, setActiveChatJid, isSidebarCollapsed, setIsSidebarCollapsed, theme, toggleTheme, handleLogout, hideResponderTab, hideBusinessTab, isBackendOnline }) {
    const collapsed = isSidebarCollapsed;

    return (
        <aside style={{
            width: collapsed ? 64 : 240, background: 'var(--color-surface-card)', borderRight: '1px solid var(--color-hairline)',
            display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
            padding: collapsed ? '24px 12px' : '24px 16px', flexShrink: 0, height: '100%',
            boxSizing: 'border-box', transition: 'width 0.2s ease',
            alignItems: collapsed ? 'center' : 'stretch'
        }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24, width: '100%' }}>
                {collapsed ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, width: '100%' }}>
                        <span style={{ color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }} title={`WhatsApp AI Bot (${isBackendOnline ? 'Online' : 'Offline'})`}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                            <span style={{ position: 'absolute', top: -2, right: -2, width: 7, height: 7, borderRadius: '50%', border: '2px solid var(--color-surface-card)', background: isBackendOnline ? 'var(--color-success)' : 'var(--color-error)' }} />
                        </span>
                        <button type="button" onClick={() => setIsSidebarCollapsed(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--color-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 4, borderRadius: 4 }} title="Expand">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
                        </button>
                    </div>
                ) : (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', padding: '0 4px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <span style={{ fontSize: 15, fontWeight: 500, letterSpacing: '-0.3px', whiteSpace: 'nowrap', color: 'var(--color-ink)' }}>WhatsApp AI <span style={{ color: 'var(--color-primary)' }}>Bot</span></span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Dashboard</span>
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 10, fontWeight: 500, color: isBackendOnline ? 'var(--color-success)' : 'var(--color-error)' }}>
                                    <span style={{ width: 5, height: 5, borderRadius: '50%', background: isBackendOnline ? 'var(--color-success)' : 'var(--color-error)' }} />
                                    {isBackendOnline ? 'Online' : 'Offline'}
                                </span>
                            </div>
                        </div>
                        <button type="button" onClick={() => setIsSidebarCollapsed(true)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--color-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 4, borderRadius: 4 }} title="Collapse">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
                        </button>
                    </div>
                )}

                <nav style={{ display: 'flex', flexDirection: 'column', gap: 4, width: '100%' }}>
                    {NAV_ITEMS.filter(item => {
                        if (item.key === 'responder' && hideResponderTab) return false;
                        if (item.key === 'business' && hideBusinessTab) return false;
                        return true;
                    }).map(item => {
                        const active = activeView === item.key;
                        return (
                            <button key={item.key} type="button"
                                onClick={() => { setActiveView(item.key); setActiveChatJid(null); }}
                                title={collapsed ? item.label : ""}
                                style={{
                                    display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'flex-start',
                                    gap: collapsed ? 0 : 10, width: '100%', textAlign: 'left', fontSize: 14, fontWeight: 500,
                                    padding: collapsed ? '10px 0' : '10px 12px', borderRadius: 8, cursor: 'pointer',
                                    transition: 'all 0.15s', border: 'none',
                                    background: active ? 'var(--color-primary)' : 'transparent',
                                    color: active ? 'var(--color-on-primary)' : 'var(--color-body)',
                                }}>
                                {item.icon}
                                {!collapsed && <span>{item.label}</span>}
                            </button>
                        );
                    })}
                </nav>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%', alignItems: collapsed ? 'center' : 'stretch' }}>
                <button type="button" onClick={toggleTheme} title={collapsed ? (theme === 'dark' ? "Light Mode" : "Dark Mode") : ""}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'flex-start', gap: collapsed ? 0 : 10, width: '100%', fontSize: 13, fontWeight: 500, padding: collapsed ? '8px 0' : '8px 12px', borderRadius: 8, background: 'var(--color-canvas)', border: '1px solid var(--color-hairline)', color: 'var(--color-body)', cursor: 'pointer' }}>
                    {theme === 'dark' ? (
                        <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>{!collapsed && <span>Light Mode</span>}</>
                    ) : (
                        <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>{!collapsed && <span>Dark Mode</span>}</>
                    )}
                </button>

                <button type="button" onClick={handleLogout} title={collapsed ? "Logout" : ""}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'flex-start', gap: collapsed ? 0 : 10, width: '100%', fontSize: 13, fontWeight: 500, padding: collapsed ? '8px 0' : '8px 12px', borderRadius: 8, background: 'transparent', border: '1px solid var(--color-hairline)', color: 'var(--color-error)', cursor: 'pointer' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/></svg>
                    {!collapsed && <span>Logout</span>}
                </button>

                {!collapsed && (
                    <div onClick={() => { setActiveView('about'); setActiveChatJid(null); }}
                        style={{ marginTop: 8, padding: 12, borderRadius: 8, display: 'flex', flexDirection: 'column', gap: 4, fontSize: 11, cursor: 'pointer', border: '1px solid var(--color-hairline)', background: activeView === 'about' ? 'var(--color-surface-soft)' : 'var(--color-canvas)', color: 'var(--color-muted)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontWeight: 500, fontSize: 12, color: 'var(--color-ink)' }}>WhatsApp AI Bot</span>
                            <span style={{ fontSize: 10, fontWeight: 500, padding: '2px 8px', borderRadius: 9999, background: 'var(--color-surface-cream-strong)', color: 'var(--color-primary)' }}>v1.2</span>
                        </div>
                        <span style={{ fontWeight: 500, color: 'var(--color-muted-soft)' }}>@AlokMahapatra26</span>
                    </div>
                )}
            </div>
        </aside>
    );
}
