import React from 'react';

export default function StatusLogsView({ botStatus, qrCode, handleDisconnectBot, logs }) {
    return (
        <>
            {/* COL 1: Integration status */}
            <div className="column-left">
                {/* WhatsApp Integration Status Panel */}
                <div className="card">
                    <div style={{ fontWeight: 600, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
                        <span>WhatsApp Integration</span>
                        <span style={{ 
                            fontSize: '0.72rem', 
                            fontWeight: 600, 
                            color: botStatus === 'connected' ? '#22c55e' : botStatus === 'connecting' ? '#f59e0b' : '#ef4444'
                        }}>
                            {botStatus.toUpperCase()}
                        </span>
                    </div>

                    <div className="details-content" style={{ marginTop: '15px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {/* Device controls info banner */}
                        <div style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center', 
                            padding: '0.75rem', 
                            borderRadius: 'var(--radius-sm)', 
                            border: '1px solid var(--border)',
                            background: 'var(--canvas-soft)'
                        }}>
                            <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>Device Control</span>
                            {(botStatus === 'connected' || botStatus === 'connecting' || botStatus === 'conflict') && (
                                <button 
                                    type="button" 
                                    onClick={() => {
                                        if (confirm('Disconnect WhatsApp bot daemon? This will stop all auto-replies.')) {
                                            handleDisconnectBot();
                                        }
                                    }} 
                                    className="btn-sm" 
                                    style={{ 
                                        width: 'auto', 
                                        background: 'rgba(239, 68, 68, 0.1)', 
                                        color: '#ef4444', 
                                        border: '1px solid rgba(239, 68, 68, 0.2)', 
                                        fontWeight: 600, 
                                        padding: '0.25rem 0.5rem',
                                        fontSize: '0.68rem'
                                    }}
                                >
                                    Disconnect
                                </button>
                            )}
                        </div>

                        {/* QR Code Stream & Instructions */}
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', background: 'var(--canvas-soft)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                            <div id="qr-container" className="qr-box" style={{ background: 'var(--white)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '120px', height: '120px', padding: '5px', borderRadius: 'var(--radius-sm)', minHeight: 'auto', flexShrink: 0 }}>
                                {qrCode ? (
                                    <img src={qrCode} alt="WhatsApp QR Code" id="qr-image" style={{ width: '100%', height: '100%', objectFit: 'contain', maxWidth: '100%' }} />
                                ) : (
                                    <div style={{ textAlign: 'center', fontSize: '0.65rem', color: 'var(--muted)', padding: '0.2rem' }}>
                                        {botStatus === 'connected' ? (
                                            <div style={{ color: '#22c55e', fontWeight: 600 }}>✓ Connected</div>
                                        ) : (
                                            <span>Waiting...</span>
                                        )}
                                    </div>
                                )}
                            </div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--muted)', lineHeight: '1.4' }}>
                                {botStatus === 'connected' ? (
                                    "Your WhatsApp account is linked. The bot daemon is live and auto-reply rules are active."
                                ) : (
                                    <>
                                        <strong>To link WhatsApp:</strong>
                                        <ol style={{ marginLeft: '12px', marginTop: '4px' }}>
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
            </div>

            {/* COL 2: Connection Logs */}
            <div className="column-right" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.8rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
                        Connection Logs
                    </div>
                    <div id="console-logs" className="console-box" style={{ 
                        fontSize: '0.62rem', 
                        fontFamily: 'var(--mono)', 
                        flex: 1, 
                        overflowY: 'auto',
                        background: 'var(--canvas-soft)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '0.4rem 0.6rem',
                        color: 'var(--text)',
                        minHeight: '400px'
                    }}>
                        {logs.length === 0 ? (
                            <div style={{ color: 'var(--dim)' }}>No logs captured yet.</div>
                        ) : (
                            logs.map((log, idx) => (
                                <div key={idx} className="log-row" style={{ padding: '1px 0' }}>{log}</div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
