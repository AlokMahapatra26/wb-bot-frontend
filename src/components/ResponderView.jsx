import React from 'react';
import ToggleSwitch from './ToggleSwitch';

export default function ResponderView({
    targetJid, setTargetJid,
    contactName, setContactName,
    talkingStylePreset, setTalkingStylePreset,
    customTalkStyle, setCustomTalkStyle,
    senderContext, setSenderContext,
    contactContext, setContactContext,
    allowBusinessKnowledge, setAllowBusinessKnowledge,
    handleAddContactConfig,
    aiContacts, handleEditConfig, handleRemoveContactConfig,
    setActiveChatJid,
    setActiveView
}) {
    return (
        <>
            {/* COL 1: Form */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20, overflowY: 'auto', paddingRight: 4 }}>
                <div style={{ background: 'var(--color-surface-card)', border: '1px solid var(--color-hairline)', borderRadius: 12, padding: 32, display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div style={{ fontSize: 16, fontWeight: 500, color: 'var(--color-ink)', borderBottom: '1px solid var(--color-hairline)', paddingBottom: 12 }}>Manage AI Auto-Responder JIDs</div>
                    
                    <div>
                        <label htmlFor="ai-number" style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--color-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '1.5px' }}>Target WhatsApp JID</label>
                        <input type="text" id="ai-number" placeholder="e.g. 918849561649@s.whatsapp.net" value={targetJid} onChange={(e) => setTargetJid(e.target.value)} style={{ width: '100%', padding: '10px 14px', fontFamily: 'var(--font-body)', fontSize: 14, border: '1px solid var(--color-hairline)', borderRadius: 8, background: 'var(--color-canvas)', color: 'var(--color-ink)', outline: 'none', height: 40, transition: 'all 0.15s' }} />
                        <p style={{ fontSize: 11, color: 'var(--color-muted-soft)', marginTop: 6, lineHeight: 1.6 }}>
                            Use full JID format: <code style={{ fontFamily: 'var(--font-mono)', background: 'var(--color-surface-soft)', paddingLeft: 4, paddingRight: 4, paddingTop: 2, paddingBottom: 2, borderRadius: 4, fontSize: 10, border: '1px solid var(--color-hairline)' }}>918849561649@s.whatsapp.net</code>
                        </p>
                    </div>

                    <div>
                        <label htmlFor="ai-contact-name" style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--color-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '1.5px' }}>Contact Name</label>
                        <input type="text" id="ai-contact-name" placeholder="e.g. Rahul, Mom, Office Group" value={contactName} onChange={(e) => setContactName(e.target.value)} style={{ width: '100%', padding: '10px 14px', fontFamily: 'var(--font-body)', fontSize: 14, border: '1px solid var(--color-hairline)', borderRadius: 8, background: 'var(--color-canvas)', color: 'var(--color-ink)', outline: 'none', height: 40, transition: 'all 0.15s' }} />
                        <p style={{ fontSize: 11, color: 'var(--color-muted-soft)', marginTop: 6 }}>A friendly name to identify this contact easily.</p>
                    </div>
                    
                    <div>
                        <label htmlFor="ai-prompt-template" style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--color-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '1.5px' }}>Preset Talk Style</label>
                        <select id="ai-prompt-template" value={talkingStylePreset} onChange={(e) => setTalkingStylePreset(e.target.value)} style={{ width: '100%', padding: '10px 14px', paddingRight: 32, fontFamily: 'var(--font-body)', fontSize: 14, border: '1px solid var(--color-hairline)', borderRadius: 8, background: 'var(--color-canvas)', color: 'var(--color-ink)', outline: 'none', height: 40, cursor: 'pointer', transition: 'all 0.15s', appearance: 'none', WebkitAppearance: 'none', backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%236c6a64'/%3E%3C/svg%3E\")", backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center' }}>
                            <option value="">— Pick a preset template —</option>
                            <option value="Keep responses warm, friendly, helpful, and conversational. Use natural casual language with appropriate emojis.">Friendly & Conversational</option>
                            <option value="Keep answers extremely brief, direct, and under two sentences. Avoid unnecessary fluff or greeting patterns.">Short & Concise (SMS Style)</option>
                            <option value="Respond as a polite, helpful, and professional business assistant. Structure with clear bullet points if listing options.">Professional Business Support</option>
                            <option value="Respond casually in Hinglish (a mix of Hindi and English) using Latin characters. Keep it friendly and informal.">Casual Hinglish (Mix of Hindi/English)</option>
                            <option value="Act as a proactive sales representative. Be persuasive, offer solutions, and nudge the user toward booking a call or meeting.">Sales & Lead Nurturing</option>
                            <option value="Be extremely patient, empathetic, and reassuring. Focus on step-by-step customer support and problem resolution.">Customer Support & Empathy</option>
                            <option value="Be precise, detail-oriented, and objective. Focus on facts, troubleshooting steps, and technical accuracy.">Technical & Analytical Assistant</option>
                            <option value="Reply in a highly sarcastic, witty, and slightly roasty tone. Use informal slang.">Sarcastic & Witty (Fun)</option>
                            <option value="Use Gen-Z slang (no cap, bet, fr fr, lowkey, skibidi, rizz, gyatt). Keep it casual.">Gen-Z Slang (Fun)</option>
                        </select>
                    </div>

                    <details style={{ border: '1px solid var(--color-hairline)', borderRadius: 8, background: 'var(--color-canvas)' }} open>
                        <summary style={{ cursor: 'pointer', fontSize: 12, color: 'var(--color-muted)', fontWeight: 500, padding: 12, listStyle: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', userSelect: 'none', transition: 'all 0.15s' }}>
                            <span>Advanced / Custom Rules</span>
                            <span style={{ fontSize: 10 }}>▼</span>
                        </summary>
                        <div style={{ padding: 16, borderTop: '1px solid var(--color-hairline)', display: 'flex', flexDirection: 'column', gap: 14 }}>
                            <div>
                                <label htmlFor="ai-prompt" style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--color-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '1.5px' }}>Custom Talk Style</label>
                                <input type="text" id="ai-prompt" placeholder="Or write custom instructions (e.g. Talk like a Gen-Z)" value={customTalkStyle} onChange={(e) => setCustomTalkStyle(e.target.value)} style={{ width: '100%', padding: '10px 14px', fontFamily: 'var(--font-body)', fontSize: 14, border: '1px solid var(--color-hairline)', borderRadius: 8, background: 'var(--color-canvas)', color: 'var(--color-ink)', outline: 'none', height: 40, transition: 'all 0.15s' }} />
                            </div>
                            <div>
                                <label htmlFor="ai-sender-context" style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--color-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '1.5px' }}>Your Personality / Style</label>
                                <textarea id="ai-sender-context" rows={2} placeholder="e.g. I am Alok, a software developer. I talk casually in Hinglish." value={senderContext} onChange={(e) => setSenderContext(e.target.value)} style={{ width: '100%', padding: '10px 14px', fontFamily: 'var(--font-body)', fontSize: 14, border: '1px solid var(--color-hairline)', borderRadius: 8, background: 'var(--color-canvas)', color: 'var(--color-ink)', outline: 'none', resize: 'vertical', transition: 'all 0.15s' }}></textarea>
                            </div>
                            <div>
                                <label htmlFor="ai-contact-context" style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--color-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '1.5px' }}>About This Contact</label>
                                <textarea id="ai-contact-context" rows={2} placeholder="e.g. My friend Rahul. We chat about cricket." value={contactContext} onChange={(e) => setContactContext(e.target.value)} style={{ width: '100%', padding: '10px 14px', fontFamily: 'var(--font-body)', fontSize: 14, border: '1px solid var(--color-hairline)', borderRadius: 8, background: 'var(--color-canvas)', color: 'var(--color-ink)', outline: 'none', resize: 'vertical', transition: 'all 0.15s' }}></textarea>
                            </div>
                        </div>
                    </details>
 
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'var(--color-canvas)', padding: 12, borderRadius: 8, border: '1px solid var(--color-hairline)' }}>
                        <ToggleSwitch checked={allowBusinessKnowledge} onChange={setAllowBusinessKnowledge} />
                        <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-ink)', userSelect: 'none' }}>Allow access to Business FAQ Spreadsheet</span>
                    </div>

                    <button type="button" onClick={handleAddContactConfig} style={{ width: '100%', padding: '12px 20px', fontSize: 14, fontWeight: 500, borderRadius: 8, background: 'var(--color-primary)', color: 'var(--color-on-primary)', border: 'none', cursor: 'pointer', transition: 'all 0.15s', marginTop: 4 }}>Add / Update Contact Config</button>
                </div>
            </div>

            {/* COL 2: Active Rules */}
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
                <div style={{ background: 'var(--color-surface-card)', border: '1px solid var(--color-hairline)', borderRadius: 12, padding: 32, flex: 1, minHeight: 200, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    <div style={{ fontSize: 16, fontWeight: 500, color: 'var(--color-ink)', paddingBottom: 12, borderBottom: '1px solid var(--color-hairline)', flexShrink: 0 }}>Active AI JID Configurations</div>
                    <div style={{ flex: 1, overflowY: 'auto', marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {aiContacts.length === 0 ? (
                            <div style={{ fontSize: 13, color: 'var(--color-muted-soft)', textAlign: 'center', paddingTop: 32, paddingBottom: 32 }}>No auto-responder configurations added.</div>
                        ) : (
                            aiContacts.map((c, i) => (
                                <div key={i} onClick={() => handleEditConfig(c)} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, padding: 16, border: '1px solid var(--color-hairline)', borderRadius: 8, background: 'var(--color-canvas)', transition: 'all 0.15s' }} title="Click to edit">
                                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4, overflow: 'hidden' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                                            <span style={{ fontWeight: 500, fontSize: 13, color: 'var(--color-ink)' }}>{c.name || c.number}</span>
                                            {c.name && <span style={{ fontSize: 10, color: 'var(--color-muted-soft)', fontFamily: 'var(--font-mono)' }}>{c.number.split('@')[0]}</span>}
                                            {c.allowBusinessKnowledge && (
                                                <span style={{ fontSize: 9, fontWeight: 600, background: 'rgba(232,165,90,0.15)', color: 'var(--color-accent-amber)', paddingTop: 2, paddingBottom: 2, paddingLeft: 8, paddingRight: 8, borderRadius: 9999, textTransform: 'uppercase', letterSpacing: '0.5px' }}>FAQ</span>
                                            )}
                                        </div>
                                        <span style={{ fontSize: 12, color: 'var(--color-muted-soft)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.systemPrompt || 'Default AI style'}</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                                        <button 
                                            type="button" 
                                            onClick={(e) => { e.stopPropagation(); setActiveChatJid(c.number); setActiveView('inbox'); }} 
                                            style={{ fontSize: 11, fontWeight: 500, paddingTop: 6, paddingBottom: 6, paddingLeft: 10, paddingRight: 10, display: 'inline-flex', alignItems: 'center', gap: 4, borderRadius: 8, background: 'var(--color-primary)', color: 'var(--color-on-primary)', border: 'none', cursor: 'pointer', transition: 'all 0.15s' }}
                                        >
                                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                                            </svg>
                                            Chat
                                        </button>
                                        <span onClick={(e) => { e.stopPropagation(); handleRemoveContactConfig(c.number); }} style={{ color: 'var(--color-error)', fontSize: 18, cursor: 'pointer', transition: 'all 0.15s', lineHeight: 1 }}>×</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
