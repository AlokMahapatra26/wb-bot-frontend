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
                {/* Background decorative gradient glow */}
                <div style={{
                    position: 'absolute',
                    top: '-50px',
                    right: '-50px',
                    width: '200px',
                    height: '200px',
                    background: 'radial-gradient(circle, rgba(0, 168, 132, 0.12) 0%, transparent 70%)',
                    pointerEvents: 'none'
                }} />

                <div>
                    <span style={{ 
                        background: 'rgba(0, 168, 132, 0.12)', 
                        color: 'var(--primary)', 
                        padding: '0.2rem 0.6rem', 
                        borderRadius: '20px', 
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        letterSpacing: '0.05em',
                        textTransform: 'uppercase'
                    }}>
                        Stable Release v1.2.0
                    </span>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.6rem', marginBottom: '0.25rem', color: 'var(--text)' }}>
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
                                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text)' }}>Alok</span>
                                <a 
                                    href="https://github.com/alok" 
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
                                    github.com/alok
                                </a>
                            </div>
                        </div>
                    </div>

                    <div>
                        <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--dim)', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>
                            ENVIRONMENT
                        </span>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text)' }}>
                                Linux Workspace
                            </span>
                            <span style={{
                                width: '6px',
                                height: '6px',
                                borderRadius: '50%',
                                background: '#22c55e',
                                display: 'inline-block'
                            }} />
                            <span style={{ fontSize: '0.7rem', color: 'var(--dim)', fontFamily: 'monospace' }}>
                                /home/alok/Dev
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Features Detail Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '1rem'
            }}>
                <div className="card" style={{ padding: '1.25rem', display: 'flex', gap: '0.75rem' }}>
                    <div style={{ color: 'var(--primary)', marginTop: '2px' }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                        </svg>
                    </div>
                    <div>
                        <h3 style={{ fontSize: '0.82rem', fontWeight: 700, margin: '0 0 0.25rem 0', color: 'var(--text)' }}>Business Autopilot</h3>
                        <p style={{ fontSize: '0.72rem', color: 'var(--muted)', margin: 0, lineHeight: 1.4 }}>
                            Automatically query Supabase vector database knowledge rows to answer customer queries with zero manual intervention.
                        </p>
                    </div>
                </div>

                <div className="card" style={{ padding: '1.25rem', display: 'flex', gap: '0.75rem' }}>
                    <div style={{ color: 'var(--primary)', marginTop: '2px' }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                        </svg>
                    </div>
                    <div>
                        <h3 style={{ fontSize: '0.82rem', fontWeight: 700, margin: '0 0 0.25rem 0', color: 'var(--text)' }}>Individual Responder</h3>
                        <p style={{ fontSize: '0.72rem', color: 'var(--muted)', margin: 0, lineHeight: 1.4 }}>
                            Isolate personal configurations, customise prompts, and conditionally allow access to the business FAQ database.
                        </p>
                    </div>
                </div>

                <div className="card" style={{ padding: '1.25rem', display: 'flex', gap: '0.75rem' }}>
                    <div style={{ color: 'var(--primary)', marginTop: '2px' }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                        </svg>
                    </div>
                    <div>
                        <h3 style={{ fontSize: '0.82rem', fontWeight: 700, margin: '0 0 0.25rem 0', color: 'var(--text)' }}>Live Chats Pane</h3>
                        <p style={{ fontSize: '0.72rem', color: 'var(--muted)', margin: 0, lineHeight: 1.4 }}>
                            A high-visibility dual-pane inbox separating configuration settings from real-time client conversational feeds.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
