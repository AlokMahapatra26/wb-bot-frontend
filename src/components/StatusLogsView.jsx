import React, { useState } from 'react';

export default function StatusLogsView({ 
    botStatus, qrCode, handleDisconnectBot, logs, handleClearLogs,
    individualEnabled, businessEnabled, aiContacts, knowledgeRows
}) {
    const [showQrModal, setShowQrModal] = useState(false);

    return (
        <>
            {/* QR Enlarge Modal */}
            {showQrModal && qrCode && (
                <div onClick={() => setShowQrModal(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, cursor: 'pointer', backdropFilter: 'blur(4px)' }}>
                    <div onClick={(e) => e.stopPropagation()} style={{ background: '#fff', borderRadius: 16, padding: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, cursor: 'default', maxWidth: 360 }}>
                        <img src={qrCode} alt="WhatsApp QR Code" style={{ width: 280, height: 280, objectFit: 'contain' }} />
                        <p style={{ fontSize: 13, color: '#3d3d3a', textAlign: 'center', lineHeight: 1.5 }}>Scan this QR code with WhatsApp → Linked Devices</p>
                        <button type="button" onClick={() => setShowQrModal(false)} style={{ background: 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>Close</button>
                    </div>
                </div>
            )}
            {/* COL 1: Integration status */}
            <div style={{ display:'flex', flexDirection:'column', gap:16, overflowY:'auto', paddingRight:4 }}>
                {/* WhatsApp Integration Status Panel */}
                <div style={{ background:'var(--color-surface-card)', border:'1px solid var(--color-hairline)', borderRadius:12, padding:32, display:'flex', flexDirection:'column' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', borderBottom:'1px solid var(--color-hairline)', paddingBottom:16 }}>
                        <span style={{ fontFamily:'var(--font-display)', fontSize:22, fontWeight:400, color:'var(--color-ink)' }}>WhatsApp Integration</span>
                        <span style={{ fontSize:12, fontWeight:500, textTransform:'uppercase', letterSpacing:'1.5px', color: botStatus === 'connected' ? 'var(--color-success)' : botStatus === 'connecting' ? 'var(--color-warning)' : 'var(--color-error)' }}>
                            {botStatus}
                        </span>
                    </div>

                    <div style={{ marginTop:24, display:'flex', flexDirection:'column', gap:16 }}>
                        {botStatus === 'connected' ? (
                            /* Connected state — single compact row */
                            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 16px', borderRadius:8, border:'1px solid var(--color-hairline)', background:'var(--color-canvas)' }}>
                                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                                    <span style={{ width:8, height:8, borderRadius:'50%', background:'var(--color-success)' }}></span>
                                    <span style={{ fontSize:13, fontWeight:500, color:'var(--color-ink)' }}>WhatsApp linked — bot is live and auto-replying</span>
                                </div>
                                <button type="button" onClick={() => { if (confirm('Disconnect WhatsApp bot daemon?')) handleDisconnectBot(); }} style={{ background:'rgba(198,69,69,0.1)', color:'var(--color-error)', border:'1px solid rgba(198,69,69,0.25)', fontWeight:500, padding:'6px 14px', fontSize:12, borderRadius:8, cursor:'pointer' }}>Disconnect</button>
                            </div>
                        ) : (
                            /* Not connected — show QR */
                            <div style={{ display:'flex', gap:24, alignItems:'flex-start', background:'var(--color-canvas)', padding:20, borderRadius:8, border:'1px solid var(--color-hairline)' }}>
                                <div style={{ position:'relative', background: qrCode ? '#fff' : 'var(--color-canvas)', border:'1px solid var(--color-hairline)', display:'flex', alignItems:'center', justifyContent:'center', width: qrCode ? 180 : 'auto', height: qrCode ? 180 : 'auto', padding: qrCode ? 8 : 16, borderRadius:12, flexShrink:0 }}>
                                    {qrCode ? (
                                        <>
                                            <img src={qrCode} alt="WhatsApp QR Code" style={{ width:'100%', height:'100%', objectFit:'contain' }} />
                                            <button type="button" onClick={() => setShowQrModal(true)} title="Enlarge QR" style={{ position:'absolute', top:8, right:8, width:28, height:28, borderRadius:6, background:'rgba(0,0,0,0.6)', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>
                                            </button>
                                        </>
                                    ) : (
                                        <span style={{ fontSize:12, color:'var(--color-muted-soft)' }}>Waiting for QR...</span>
                                    )}
                                </div>
                                <div style={{ fontSize:13, color:'var(--color-body)', lineHeight:1.7, flex:1, paddingTop:4, fontFamily:'var(--font-body)' }}>
                                    <p style={{ fontWeight:500, color:'var(--color-ink)', marginBottom:8 }}>To link WhatsApp:</p>
                                    <ol style={{ marginLeft:16, listStyleType:'decimal', display:'flex', flexDirection:'column', gap:6 }}>
                                        <li>Open WhatsApp on phone</li>
                                        <li>Go to Linked Devices</li>
                                        <li>Scan the QR code</li>
                                    </ol>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* System Status */}
                <div style={{ background:'var(--color-surface-card)', border:'1px solid var(--color-hairline)', borderRadius:12, padding:20, display:'flex', flexDirection:'column', gap:10 }}>
                    <span style={{ fontSize:13, fontWeight:600, color:'var(--color-ink)' }}>System Status</span>
                    <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', fontSize:12 }}>
                            <span style={{ color:'var(--color-muted)' }}>WhatsApp</span>
                            <span style={{ paddingTop:2, paddingBottom:2, paddingLeft:8, paddingRight:8, borderRadius:9999, fontSize:10, fontWeight:600, textTransform:'uppercase', backgroundColor: botStatus === 'connected' ? 'rgba(93,184,114,0.12)' : botStatus === 'connecting' ? 'rgba(212,160,23,0.12)' : 'rgba(198,69,69,0.12)', color: botStatus === 'connected' ? 'var(--color-success)' : botStatus === 'connecting' ? 'var(--color-warning)' : 'var(--color-error)' }}>{botStatus}</span>
                        </div>
                        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', fontSize:12 }}>
                            <span style={{ color:'var(--color-muted)' }}>AI Responder</span>
                            <span style={{ fontWeight:500, color:'var(--color-ink)' }}>{individualEnabled ? '✓ On' : 'Off'}</span>
                        </div>
                        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', fontSize:12 }}>
                            <span style={{ color:'var(--color-muted)' }}>Business Autopilot</span>
                            <span style={{ fontWeight:500, color:'var(--color-ink)' }}>{businessEnabled ? '✓ On' : 'Off'}</span>
                        </div>
                        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', fontSize:12 }}>
                            <span style={{ color:'var(--color-muted)' }}>AI Contacts</span>
                            <span style={{ fontWeight:500, color:'var(--color-ink)' }}>{aiContacts?.length || 0}</span>
                        </div>
                        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', fontSize:12 }}>
                            <span style={{ color:'var(--color-muted)' }}>Knowledge Rows</span>
                            <span style={{ fontWeight:500, color:'var(--color-ink)' }}>{knowledgeRows?.length || 0}</span>
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
