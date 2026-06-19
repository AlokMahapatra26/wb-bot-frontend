import React, { useState } from 'react';
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
    const [showApiKey, setShowApiKey] = useState(false);

    return (
        <>
            {/* COL 1: Control Center & Engine Settings */}
            <div className="column-left" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', overflowY: 'auto' }}>
                {/* Automation Control Center */}
                <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
                        <h2 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0, color: 'var(--text)' }}>Automation Control Center</h2>
                        <p style={{ fontSize: '0.68rem', color: 'var(--muted)', margin: '0.15rem 0 0 0' }}>Globally enable or disable auto-responders</p>
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {/* Individual Responder Switch */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', background: 'var(--canvas-soft)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', flex: 1, paddingRight: '1rem' }}>
                                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text)' }}>Individual Responder</span>
                                    <span style={{ fontSize: '0.68rem', color: 'var(--muted)', lineHeight: '1.2' }}>Automatically respond to contacts configured in the 'Individual Responder' tab.</span>
                                </div>
                                <ToggleSwitch checked={individualEnabled} onChange={handleToggleIndividual} />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: '0.5rem' }}>
                                <span style={{ fontSize: '0.72rem', color: 'var(--muted)', fontWeight: 500 }}>Hide tab from sidebar</span>
                                <ToggleSwitch checked={hideResponderTab} onChange={setHideResponderTab} />
                            </div>
                        </div>

                        {/* Business Autopilot Switch */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', background: 'var(--canvas-soft)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', flex: 1, paddingRight: '1rem' }}>
                                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text)' }}>Business Autopilot</span>
                                    <span style={{ fontSize: '0.68rem', color: 'var(--muted)', lineHeight: '1.2' }}>Automatically respond to all other incoming chats (fallback mode).</span>
                                </div>
                                <ToggleSwitch checked={businessEnabled} onChange={handleToggleBusiness} />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: '0.5rem' }}>
                                <span style={{ fontSize: '0.72rem', color: 'var(--muted)', fontWeight: 500 }}>Hide tab from sidebar</span>
                                <ToggleSwitch checked={hideBusinessTab} onChange={setHideBusinessTab} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Gemini Engine Settings */}
                <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
                        <h2 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0, color: 'var(--text)' }}>Gemini Engine Settings</h2>
                        <p style={{ fontSize: '0.68rem', color: 'var(--muted)', margin: '0.15rem 0 0 0' }}>Configure API keys and AI engine model</p>
                    </div>
                    <div className="details-content" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div className="field">
                            <label htmlFor="settings-gemini-key">API Key</label>
                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                <input 
                                    type={showApiKey ? "text" : "password"} 
                                    id="settings-gemini-key" 
                                    placeholder="Paste your API key here" 
                                    value={geminiKey} 
                                    onChange={(e) => setGeminiKey(e.target.value)}
                                    style={{ flex: 1 }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowApiKey(!showApiKey)}
                                    className="btn-sm"
                                    style={{ width: 'auto', whiteSpace: 'nowrap', padding: '0.35rem 0.6rem', fontSize: '0.7rem' }}
                                >
                                    {showApiKey ? 'Hide' : 'Show'}
                                </button>
                            </div>
                        </div>
                        
                        <div className="field">
                            <label htmlFor="settings-gemini-model">Model Engine</label>
                            <div className="row-btns" style={{ display: 'flex', gap: '0.5rem' }}>
                                <select 
                                    id="settings-gemini-model" 
                                    value={geminiModel} 
                                    onChange={(e) => setGeminiModel(e.target.value)} 
                                    style={{ flex: 1 }}
                                >
                                    <option value="gemma-4-31b-it">gemma-4-31b-it (1500 req/day)</option>
                                    <option value="gemma-4-26b-a4b-it">gemma-4-26b-a4b-it (1500 req/day)</option>
                                    <option value="gemini-3.1-flash-lite">gemini-3.1-flash-lite (500 req/day)</option>
                                    <option value="gemini-2.5-flash">gemini-2.5-flash (20 req/day)</option>
                                    <option value="gemini-2.5-flash-lite">gemini-2.5-flash-lite (20 req/day)</option>
                                    <option value="gemini-2.5-pro">gemini-2.5-pro (limited)</option>
                                    <option value="gemini-1.5-flash">gemini-1.5-flash (legacy)</option>
                                </select>
                                <button 
                                    type="button" 
                                    onClick={saveEngineSettings} 
                                    className="btn-sm btn-primary" 
                                    style={{ width: 'auto', whiteSpace: 'nowrap' }}
                                >
                                    Save Settings
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* COL 2: System Info & Database Stats */}
            <div className="column-right" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', overflowY: 'auto' }}>
                <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
                        <h2 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0, color: 'var(--text)' }}>System Status & Statistics</h2>
                        <p style={{ fontSize: '0.68rem', color: 'var(--muted)', margin: '0.15rem 0 0 0' }}>Real-time service signals and data points</p>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                        <StatRow label="WhatsApp Connection">
                            <span style={{
                                padding: '0.2rem 0.5rem', borderRadius: 'var(--radius-sm)',
                                fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase',
                                background: botStatus === 'connected' ? 'rgba(34, 197, 94, 0.1)' : botStatus === 'connecting' ? 'rgba(234, 179, 8, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                color: botStatus === 'connected' ? '#22c55e' : botStatus === 'connecting' ? '#eab308' : '#ef4444'
                            }}>{botStatus}</span>
                        </StatRow>

                        <StatRow label="Supabase Database Connection">
                            <span style={{
                                padding: '0.2rem 0.5rem', borderRadius: 'var(--radius-sm)',
                                fontSize: '0.65rem', fontWeight: 700,
                                background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e'
                            }}>Active</span>
                        </StatRow>

                        <StatRow label="AI Responder Mode">
                            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text)' }}>
                                {individualEnabled ? 'Enabled' : 'Disabled'}
                            </span>
                        </StatRow>

                        <StatRow label="Business Autopilot Mode">
                            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text)' }}>
                                {businessEnabled ? 'Enabled' : 'Disabled'}
                            </span>
                        </StatRow>

                        <StatRow label="Configured AI Contacts">
                            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text)' }}>{aiContacts.length}</span>
                        </StatRow>

                        <StatRow label="Exclusion Contacts">
                            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text)' }}>{businessExcludeContacts.length}</span>
                        </StatRow>

                        <StatRow label="Knowledge Base Patterns">
                            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text)' }}>{knowledgeRows.length} rows</span>
                        </StatRow>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem' }}>
                            <span style={{ color: 'var(--muted)' }}>Current User Session ID</span>
                            <span style={{ fontSize: '0.65rem', fontFamily: 'var(--mono)', color: 'var(--text)', background: 'var(--canvas-soft)', padding: '0.1rem 0.3rem', borderRadius: '3px' }}>
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', paddingBottom: '0.50rem', borderBottom: '1px solid var(--border)' }}>
            <span style={{ color: 'var(--muted)' }}>{label}</span>
            {children}
        </div>
    );
}
