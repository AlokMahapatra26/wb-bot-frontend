import React from 'react';

export default function AboutView({ user }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24, height: '100%', overflowY: 'auto', paddingRight: 8 }}>
            <div style={{
                position: 'relative', overflow: 'hidden',
                background: 'linear-gradient(to bottom right, var(--color-canvas), var(--color-surface-soft))',
                padding: 40, border: '1px solid var(--color-hairline)', borderRadius: 18,
                display: 'flex', flexDirection: 'column', gap: 20
            }}>
                <div>
                    <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 400, marginTop: 0, marginBottom: 4, color: 'var(--color-ink)', letterSpacing: '-0.5px', lineHeight: 1.25 }}>
                        WhatsApp AI Bot Creator
                    </h1>
                    <p style={{ fontSize: 14, color: 'var(--color-muted)', margin: 0, lineHeight: 1.625, maxWidth: 600, fontFamily: 'var(--font-body)' }}>
                        An advanced autonomous chatbot dashboard powered by Gemini AI and Baileys. Orchestrate business FAQs, build individual responder configs with customizable talking styles, and manage live chats directly.
                    </p>
                </div>

                <hr style={{ border: 'none', height: 1, background: 'var(--color-hairline)', margin: '8px 0' }} />

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 32, alignItems: 'center' }}>
                    <div>
                        <span style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '1.5px', color: 'var(--color-muted)', fontWeight: 500, display: 'block', marginBottom: 6 }}>
                            DEVELOPER PROFILE
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{
                                width: 38, height: 38, borderRadius: '50%', background: 'var(--color-primary)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontWeight: 800, fontSize: 16, color: 'var(--color-on-primary)',
                                boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'
                            }}>A</div>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-ink)' }}>Alok Mahapatra</span>
                                <a href="https://github.com/AlokMahapatra26" target="_blank" rel="noopener noreferrer"
                                    style={{ fontSize: 12, color: 'var(--color-primary)', textDecoration: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 3 }}>
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
