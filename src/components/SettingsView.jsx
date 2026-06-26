import React from 'react';
import ToggleSwitch from './ToggleSwitch';

export default function SettingsView({
    individualEnabled, handleToggleIndividual,
    businessEnabled, handleToggleBusiness,
    geminiKey, setGeminiKey,
    geminiModel, setGeminiModel,
    saveEngineSettings,
    botStatus, user, supabase,
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

                {/* Gemini Engine Settings */}
                <div style={{ backgroundColor: 'var(--color-surface-card)', border: '1px solid var(--color-hairline)', borderRadius: 12, padding: 32, display: 'flex', flexDirection: 'column', gap: 20 }}>
                    <div style={{ borderBottom: '1px solid var(--color-hairline)', paddingBottom: 12 }}>
                        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 400, margin: 0, color: 'var(--color-ink)', letterSpacing: '-0.3px' }}>Gemini Engine Settings</h2>
                        <p style={{ fontSize: 13, color: 'var(--color-muted)', marginTop: 4 }}>Configure API keys and AI engine model</p>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div>
                            <label htmlFor="settings-gemini-key" style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--color-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '1.5px' }}>API Key</label>
                            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                <input type="password" id="settings-gemini-key" placeholder="Paste your Gemini API key here" value={geminiKey} onChange={(e) => setGeminiKey(e.target.value)} style={{ flex: 1, width: '100%', padding: '10px 14px', fontFamily: 'var(--font-body)', fontSize: 13, border: '1px solid var(--color-hairline)', borderRadius: 8, background: 'var(--color-canvas)', color: 'var(--color-ink)', outline: 'none', height: 40 }} />
                            </div>
                            <p style={{ fontSize: 11, color: 'var(--color-muted)', marginTop: 6 }}>Get a free key at <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary)', textDecoration: 'none' }}>aistudio.google.com/apikey</a></p>
                        </div>
                        <div>
                            <label htmlFor="settings-gemini-model" style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--color-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '1.5px' }}>Model Engine</label>
                            <div style={{ display: 'flex', gap: 8 }}>
                                <select id="settings-gemini-model" value={geminiModel} onChange={(e) => setGeminiModel(e.target.value)} style={{ flex: 1, width: '100%', padding: '10px 14px', fontFamily: 'var(--font-body)', fontSize: 13, border: '1px solid var(--color-hairline)', borderRadius: 8, background: 'var(--color-canvas)', color: 'var(--color-ink)', outline: 'none', cursor: 'pointer', height: 40, appearance: 'none', paddingRight: 32, backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%236c6a64'/%3E%3C/svg%3E\")", backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center' }}>
                                    <option value="gemma-4-31b-it">gemma-4-31b-it (1500 req/day)</option>
                                    <option value="gemma-4-26b-a4b-it">gemma-4-26b-a4b-it (1500 req/day)</option>
                                    <option value="gemini-3.1-flash-lite">gemini-3.1-flash-lite (500 req/day)</option>
                                    <option value="gemini-2.5-flash">gemini-2.5-flash (20 req/day)</option>
                                    <option value="gemini-2.5-flash-lite">gemini-2.5-flash-lite (20 req/day)</option>
                                    <option value="gemini-2.5-pro">gemini-2.5-pro (limited)</option>
                                    <option value="gemini-1.5-flash">gemini-1.5-flash (legacy)</option>
                                </select>
                                <button type="button" onClick={saveEngineSettings} style={{ whiteSpace: 'nowrap', padding: '12px 20px', fontSize: 14, fontWeight: 500, borderRadius: 8, background: 'var(--color-primary)', color: 'var(--color-on-primary)', border: 'none', cursor: 'pointer' }}>Save</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* COL 2: My Account & About */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20, overflowY: 'auto' }}>
                {/* My Account */}
                <div style={{ backgroundColor: 'var(--color-surface-card)', border: '1px solid var(--color-hairline)', borderRadius: 12, padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 14, color: 'var(--color-on-primary)', flexShrink: 0 }}>
                            {user?.email?.charAt(0).toUpperCase() || '?'}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-ink)', display: 'block' }}>My Account</span>
                            <span style={{ fontSize: 12, color: 'var(--color-muted)', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email || 'No email'}</span>
                        </div>
                    </div>
                    <div style={{ borderTop: '1px solid var(--color-hairline)', paddingTop: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
                        <span style={{ fontSize: 11, color: 'var(--color-muted)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '1px' }}>Danger Zone</span>
                        <button type="button" onClick={async () => {
                            if (!confirm('Are you sure you want to permanently delete your account? This will remove all your data, configurations, and chat logs. This action cannot be undone.')) return;
                            if (!confirm('Final confirmation: Type your email to confirm deletion. Are you absolutely sure?')) return;
                            try {
                                const { data: { session } } = await supabase.auth.getSession();
                                // Delete user configs and chat logs
                                await supabase.from('user_configs').delete().eq('user_id', user.id);
                                await supabase.from('chat_logs').delete().eq('user_id', user.id);
                                await supabase.from('bot_knowledge').delete().eq('user_id', user.id);
                                // Sign out
                                await supabase.auth.signOut();
                                document.cookie = 'sb-access-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
                                alert('Account data deleted. You have been logged out.');
                                window.location.href = '/';
                            } catch (err) {
                                alert('Failed to delete account: ' + err.message);
                            }
                        }} style={{ background: 'rgba(198,69,69,0.1)', color: 'var(--color-error)', border: '1px solid rgba(198,69,69,0.25)', fontWeight: 500, padding: '10px 16px', fontSize: 12, borderRadius: 8, cursor: 'pointer', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                            Delete My Account
                        </button>
                    </div>
                </div>

                {/* About / Developer */}
                <div style={{ backgroundColor: 'var(--color-surface-card)', border: '1px solid var(--color-hairline)', borderRadius: 12, padding: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, textAlign: 'center' }}>
                    <div style={{ width: 44, height: 44, borderRadius: '50%', overflow: 'hidden', flexShrink: 0 }}>
                        <img src="/alok.jpg" alt="Alok Mahapatra" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div>
                        <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-ink)', display: 'block' }}>Alok Mahapatra</span>
                        <span style={{ fontSize: 11, color: 'var(--color-muted)' }}>Developer • alokmahapatra.in</span>
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
                        <a href="https://github.com/AlokMahapatra26" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 500, color: 'var(--color-ink)', textDecoration: 'none', padding: '6px 12px', background: 'var(--color-canvas)', borderRadius: 9999 }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>
                            GitHub
                        </a>
                        <a href="https://twitter.com/aloktwts" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 500, color: 'var(--color-ink)', textDecoration: 'none', padding: '6px 12px', background: 'var(--color-canvas)', borderRadius: 9999 }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
                            Twitter
                        </a>
                        <a href="https://instagram.com/alok.null" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 500, color: 'var(--color-ink)', textDecoration: 'none', padding: '6px 12px', background: 'var(--color-canvas)', borderRadius: 9999 }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
                            Instagram
                        </a>
                    </div>
                    <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                        <a href="https://github.com/AlokMahapatra26/wb-bot-frontend" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 500, color: 'var(--color-on-primary)', textDecoration: 'none', padding: '7px 14px', background: 'var(--color-primary)', borderRadius: 6 }}>
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                            Star Frontend
                        </a>
                        <a href="https://github.com/AlokMahapatra26/wb-bot-backend" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 500, color: 'var(--color-on-primary)', textDecoration: 'none', padding: '7px 14px', background: 'var(--color-primary)', borderRadius: 6 }}>
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                            Star Backend
                        </a>
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
            <span style={{ fontWeight: 600, color: 'var(--color-ink)' }}>{children}</span>
        </div>
    );
}
