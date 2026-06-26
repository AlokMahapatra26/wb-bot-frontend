import React, { useState } from 'react';

export default function StatusLogsView({ 
    botStatus, qrCode, handleDisconnectBot, logs, handleClearLogs,
    geminiKey, setGeminiKey, geminiModel, setGeminiModel, saveEngineSettings
}) {
    const [showApiKey, setShowApiKey] = useState(false);

    return (
        <>
            {/* COL 1: Integration status + Gemini Engine */}
            <div style={{ display:'flex', flexDirection:'column', gap:24, overflowY:'auto', paddingRight:4 }}>
                {/* WhatsApp Integration Status Panel */}
                <div style={{ background:'var(--color-surface-card)', border:'1px solid var(--color-hairline)', borderRadius:12, padding:32, display:'flex', flexDirection:'column' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', borderBottom:'1px solid var(--color-hairline)', paddingBottom:16 }}>
                        <span style={{ fontFamily:'var(--font-display)', fontSize:22, fontWeight:400, color:'var(--color-ink)' }}>WhatsApp Integration</span>
                        <span style={{ fontSize:12, fontWeight:500, textTransform:'uppercase', letterSpacing:'1.5px', color: botStatus === 'connected' ? 'var(--color-success)' : botStatus === 'connecting' ? 'var(--color-warning)' : 'var(--color-error)' }}>
                            {botStatus}
                        </span>
                    </div>

                    <div style={{ marginTop:24, display:'flex', flexDirection:'column', gap:16 }}>
                        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 14px', borderRadius:8, border:'1px solid var(--color-hairline)', background:'var(--color-canvas)' }}>
                            <span style={{ fontSize:12, fontWeight:500, textTransform:'uppercase', letterSpacing:'1.5px', color:'var(--color-muted)' }}>Device Control</span>
                            {(botStatus === 'connected' || botStatus === 'connecting' || botStatus === 'conflict') && (
                                <button type="button" onClick={() => { if (confirm('Disconnect WhatsApp bot daemon?')) handleDisconnectBot(); }} style={{ background:'rgba(198,69,69,0.1)', color:'var(--color-error)', border:'1px solid rgba(198,69,69,0.25)', fontWeight:500, padding:'6px 14px', fontSize:12, borderRadius:8, cursor:'pointer', transition:'color 0.15s, background-color 0.15s, border-color 0.15s' }}>Disconnect</button>
                            )}
                        </div>

                        <div style={{ display:'flex', gap:24, alignItems:'flex-start', background:'var(--color-canvas)', padding:20, borderRadius:8, border:'1px solid var(--color-hairline)' }}>
                            <div style={{ background:'#fff', border:'1px solid var(--color-hairline)', display:'flex', alignItems:'center', justifyContent:'center', width:180, height:180, padding:8, borderRadius:12, flexShrink:0 }}>
                                {qrCode ? (
                                    <img src={qrCode} alt="WhatsApp QR Code" style={{ width:'100%', height:'100%', objectFit:'contain' }} />
                                ) : (
                                    <div style={{ textAlign:'center', fontSize:12, color:'var(--color-muted-soft)' }}>
                                        {botStatus === 'connected' ? (
                                            <div style={{ color:'var(--color-success)', fontWeight:500, fontSize:14 }}>✓ Connected</div>
                                        ) : (<span>Waiting for QR...</span>)}
                                    </div>
                                )}
                            </div>
                            <div style={{ fontSize:13, color:'var(--color-body)', lineHeight:1.7, flex:1, paddingTop:4, fontFamily:'var(--font-body)' }}>
                                {botStatus === 'connected' ? (
                                    <p>Your WhatsApp account is linked. The bot daemon is live and auto-reply rules are active.</p>
                                ) : (
                                    <>
                                        <p style={{ fontWeight:500, color:'var(--color-ink)', marginBottom:8 }}>To link WhatsApp:</p>
                                        <ol style={{ marginLeft:16, listStyleType:'decimal', display:'flex', flexDirection:'column', gap:6 }}>
                                            <li>Open WhatsApp on phone</li>
                                            <li>Go to Linked Devices</li>
                                            <li>Scan the QR code</li>
                                        </ol>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Gemini Engine Settings */}
                <div style={{ background:'var(--color-surface-card)', border:'1px solid var(--color-hairline)', borderRadius:12, padding:32, display:'flex', flexDirection:'column', gap:24 }}>
                    <div style={{ borderBottom:'1px solid var(--color-hairline)', paddingBottom:16 }}>
                        <h2 style={{ fontFamily:'var(--font-display)', fontSize:22, fontWeight:400, color:'var(--color-ink)' }}>Gemini Engine Settings</h2>
                        <p style={{ fontSize:13, color:'var(--color-muted)', marginTop:4 }}>Configure API keys and AI engine model</p>
                    </div>
                    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
                        <div>
                            <label htmlFor="dash-gemini-key" style={{ display:'block', fontSize:12, fontWeight:500, color:'var(--color-muted)', marginBottom:8, textTransform:'uppercase', letterSpacing:'1.5px' }}>API Key</label>
                            <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                                <input type={showApiKey ? "text" : "password"} id="dash-gemini-key" placeholder="Paste your Gemini API key here" value={geminiKey} onChange={(e) => setGeminiKey(e.target.value)} style={{ flex:1, width:'100%', padding:'10px 14px', fontFamily:'var(--font-body)', fontSize:13, border:'1px solid var(--color-hairline)', borderRadius:8, background:'var(--color-canvas)', color:'var(--color-ink)', outline:'none', height:40, transition:'border-color 0.15s' }} />
                                <button type="button" onClick={() => setShowApiKey(!showApiKey)} style={{ whiteSpace:'nowrap', padding:'10px 14px', fontSize:12, fontWeight:500, borderRadius:8, border:'1px solid var(--color-hairline)', background:'var(--color-canvas)', color:'var(--color-ink)', cursor:'pointer', height:40, transition:'border-color 0.15s' }}>{showApiKey ? 'Hide' : 'Show'}</button>
                            </div>
                        </div>
                        <div>
                            <label htmlFor="dash-gemini-model" style={{ display:'block', fontSize:12, fontWeight:500, color:'var(--color-muted)', marginBottom:8, textTransform:'uppercase', letterSpacing:'1.5px' }}>Model Engine</label>
                            <div style={{ display:'flex', gap:8 }}>
                                <select id="dash-gemini-model" value={geminiModel} onChange={(e) => setGeminiModel(e.target.value)} style={{ flex:1, width:'100%', padding:'10px 14px', fontFamily:'var(--font-body)', fontSize:13, border:'1px solid var(--color-hairline)', borderRadius:8, background:'var(--color-canvas)', color:'var(--color-ink)', outline:'none', cursor:'pointer', height:40, appearance:'none', paddingRight:32, backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%236c6a64'/%3E%3C/svg%3E\")", backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', transition:'border-color 0.15s' }}>
                                    <option value="gemma-4-31b-it">gemma-4-31b-it (1500 req/day)</option>
                                    <option value="gemma-4-26b-a4b-it">gemma-4-26b-a4b-it (1500 req/day)</option>
                                    <option value="gemini-3.1-flash-lite">gemini-3.1-flash-lite (500 req/day)</option>
                                    <option value="gemini-2.5-flash">gemini-2.5-flash (20 req/day)</option>
                                    <option value="gemini-2.5-flash-lite">gemini-2.5-flash-lite (20 req/day)</option>
                                    <option value="gemini-2.5-pro">gemini-2.5-pro (limited)</option>
                                    <option value="gemini-1.5-flash">gemini-1.5-flash (legacy)</option>
                                </select>
                                <button type="button" onClick={saveEngineSettings} style={{ whiteSpace:'nowrap', padding:'12px 20px', fontSize:14, fontWeight:500, borderRadius:8, background:'var(--color-primary)', color:'var(--color-on-primary)', border:'none', cursor:'pointer', transition:'background-color 0.15s' }}>Save</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* COL 2: Connection Logs */}
            <div style={{ display:'flex', flexDirection:'column', height:'100%', overflow:'hidden' }}>
                <div style={{ background:'var(--color-surface-card)', border:'1px solid var(--color-hairline)', borderRadius:12, padding:32, display:'flex', flexDirection:'column', gap:16, flex:1, overflow:'hidden' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', borderBottom:'1px solid var(--color-hairline)', paddingBottom:16, flexShrink:0 }}>
                        <span style={{ fontFamily:'var(--font-display)', fontSize:22, fontWeight:400, color:'var(--color-ink)' }}>Connection Logs</span>
                        <button type="button" onClick={handleClearLogs} style={{ background:'var(--color-canvas)', color:'var(--color-muted)', border:'1px solid var(--color-hairline)', fontWeight:500, padding:'8px 14px', fontSize:12, cursor:'pointer', borderRadius:8, transition:'border-color 0.15s' }}>Clear Logs</button>
                    </div>
                    <div style={{ fontSize:12, fontFamily:'var(--font-mono)', flex:1, overflowY:'auto', background:'var(--color-surface-dark)', borderRadius:8, padding:'16px 20px', color:'var(--color-on-dark-soft)', lineHeight:1.8, minHeight:0 }}>
                        {logs.length === 0 ? (
                            <div style={{ color:'var(--color-on-dark-soft)' }}>No logs captured yet.</div>
                        ) : (
                            logs.map((log, idx) => (
                                <div key={idx} style={{ padding:'3px 0', borderBottom:'1px solid var(--color-surface-dark-elevated)' }}>{log}</div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
