import React from 'react';
import ToggleSwitch from './ToggleSwitch';

export default function SettingsView({
    individualEnabled, handleToggleIndividual,
    businessEnabled, handleToggleBusiness,
    geminiKey, setGeminiKey,
    geminiModel, setGeminiModel,
    saveEngineSettings,
    botStatus, user,
    aiContacts, businessExcludeContacts, knowledgeRows,
    hideResponderTab, setHideResponderTab,
    hideBusinessTab, setHideBusinessTab
}) {

    return (
        <>
            {/* COL 1: Control Center */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20, overflowY: 'auto', paddingRight: 4 }}>
                {/* Automation Control Center */}
                <div style={{ backgroundColor: 'var(--color-surface-card)', border: '1px solid var(--color-hairline)', borderRadius: 12, padding: 32, display: 'flex', flexDirection: 'column', gap: 20 }}>
                    <div style={{ borderBottom: '1px solid var(--color-hairline)', paddingBottom: 12 }}>
                        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 400, margin: 0, color: 'var(--color-ink)', letterSpacing: '-0.3px' }}>Automation Control Center</h2>
                        <p style={{ fontSize: 13, color: 'var(--color-muted)', marginTop: 4 }}>Globally enable or disable auto-responders</p>
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {/* Individual Responder Switch */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, backgroundColor: 'var(--color-canvas)', padding: 14, borderRadius: 8, border: '1px solid var(--color-hairline)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1, paddingRight: 16 }}>
                                    <span style={{ fontSize: 16, fontWeight: 500, color: 'var(--color-ink)' }}>Individual Responder</span>
                                    <span style={{ fontSize: 13, color: 'var(--color-muted)', lineHeight: 1.375 }}>Automatically respond to contacts configured in the 'Individual Responder' tab.</span>
                                </div>
                                <ToggleSwitch checked={individualEnabled} onChange={handleToggleIndividual} />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--color-hairline)', paddingTop: 8 }}>
                                <span style={{ fontSize: 12, color: 'var(--color-muted)', fontWeight: 500 }}>Hide tab from sidebar</span>
                                <ToggleSwitch checked={hideResponderTab} onChange={setHideResponderTab} />
                            </div>
                        </div>

                        {/* Business Autopilot Switch */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, backgroundColor: 'var(--color-canvas)', padding: 14, borderRadius: 8, border: '1px solid var(--color-hairline)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1, paddingRight: 16 }}>
                                    <span style={{ fontSize: 16, fontWeight: 500, color: 'var(--color-ink)' }}>Business Autopilot</span>
                                    <span style={{ fontSize: 13, color: 'var(--color-muted)', lineHeight: 1.375 }}>Automatically respond to all other incoming chats (fallback mode).</span>
                                </div>
                                <ToggleSwitch checked={businessEnabled} onChange={handleToggleBusiness} />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--color-hairline)', paddingTop: 8 }}>
                                <span style={{ fontSize: 12, color: 'var(--color-muted)', fontWeight: 500 }}>Hide tab from sidebar</span>
                                <ToggleSwitch checked={hideBusinessTab} onChange={setHideBusinessTab} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* COL 2: System Info & Database Stats */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20, overflowY: 'auto' }}>
                <div style={{ backgroundColor: 'var(--color-surface-card)', border: '1px solid var(--color-hairline)', borderRadius: 12, padding: 32, display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div style={{ borderBottom: '1px solid var(--color-hairline)', paddingBottom: 12 }}>
                        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 400, margin: 0, color: 'var(--color-ink)', letterSpacing: '-0.3px' }}>System Status & Statistics</h2>
                        <p style={{ fontSize: 13, color: 'var(--color-muted)', marginTop: 4 }}>Real-time service signals and data points</p>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        <StatRow label="WhatsApp Connection">
                            <span style={{
                                paddingTop: 2, paddingBottom: 2, paddingLeft: 8, paddingRight: 8, borderRadius: 9999, fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
                                backgroundColor: botStatus === 'connected' ? 'rgba(93,184,114,0.12)' : botStatus === 'connecting' ? 'rgba(212,160,23,0.12)' : 'rgba(198,69,69,0.12)',
                                color: botStatus === 'connected' ? 'var(--color-success)' : botStatus === 'connecting' ? 'var(--color-warning)' : 'var(--color-error)'
                            }}>{botStatus}</span>
                        </StatRow>

                        <StatRow label="Supabase Database Connection">
                            <span style={{ paddingTop: 2, paddingBottom: 2, paddingLeft: 8, paddingRight: 8, borderRadius: 9999, fontSize: 10, fontWeight: 700, backgroundColor: 'rgba(93,184,114,0.12)', color: 'var(--color-success)' }}>Active</span>
                        </StatRow>

                        <StatRow label="AI Responder Mode">
                            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-ink)' }}>{individualEnabled ? 'Enabled' : 'Disabled'}</span>
                        </StatRow>

                        <StatRow label="Business Autopilot Mode">
                            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-ink)' }}>{businessEnabled ? 'Enabled' : 'Disabled'}</span>
                        </StatRow>

                        <StatRow label="Configured AI Contacts">
                            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-ink)' }}>{aiContacts.length}</span>
                        </StatRow>

                        <StatRow label="Exclusion Contacts">
                            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-ink)' }}>{businessExcludeContacts.length}</span>
                        </StatRow>

                        <StatRow label="Knowledge Base Patterns">
                            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-ink)' }}>{knowledgeRows.length} rows</span>
                        </StatRow>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12 }}>
                            <span style={{ color: 'var(--color-muted)' }}>Current User Session ID</span>
                            <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--color-ink)', backgroundColor: 'var(--color-canvas)', paddingTop: 2, paddingBottom: 2, paddingLeft: 6, paddingRight: 6, borderRadius: 4 }}>
                                {user?.id?.slice(0, 8)}...
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

function StatRow({ label, children }) {
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, paddingBottom: 12, borderBottom: '1px solid var(--color-hairline)' }}>
            <span style={{ color: 'var(--color-muted)' }}>{label}</span>
            {children}
        </div>
    );
}
