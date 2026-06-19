import React from 'react';

export default function AboutView({ user }) {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
            height: '100%',
            overflowY: 'auto',
            paddingRight: '0.5rem'
        }}>
            {/* Main Premium Card */}
            <div className="card" style={{
                position: 'relative',
                overflow: 'hidden',
                background: 'linear-gradient(135deg, var(--white) 0%, var(--canvas-soft) 100%)',
                padding: '2.5rem 2rem',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.2rem'
            }}>

                <div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: 0, marginBottom: '0.25rem', color: 'var(--text)' }}>
                        WhatsApp AI Bot Creator
                    </h1>
                    <p style={{ fontSize: '0.85rem', color: 'var(--muted)', margin: 0, lineHeight: 1.5, maxWidth: '600px' }}>
                        An advanced autonomous chatbot dashboard powered by Gemini AI and Baileys. Orchestrate business FAQs, build individual responder configs with customizable talking styles, and manage live chats directly.
                    </p>
                </div>

                <hr style={{ border: 'none', height: '1px', background: 'var(--border)', margin: '0.5rem 0' }} />

                {/* Developer Info Row */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', alignItems: 'center' }}>
                    <div>
                        <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--dim)', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>
                            DEVELOPER PROFILE
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{
                                width: '38px',
                                height: '38px',
                                borderRadius: '50%',
                                background: 'var(--primary)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 800,
                                fontSize: '1rem',
                                color: '#171717',
                                boxShadow: '0 4px 10px rgba(0, 168, 132, 0.25)'
                            }}>
                                A
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text)' }}>Alok Mahapatra</span>
                                <a 
                                    href="https://github.com/AlokMahapatra26" 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    style={{ 
                                        fontSize: '0.75rem', 
                                        color: 'var(--primary)', 
                                        textDecoration: 'none', 
                                        fontWeight: 600,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '3px'
                                    }}
                                >
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
                                    </svg>
                                    github.com/AlokMahapatra26
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
