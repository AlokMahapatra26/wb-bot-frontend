import React from 'react';
import ToggleSwitch from './ToggleSwitch';

export default function ResponderView({
    targetJid, setTargetJid,
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
            {/* COL 1: Form to Manage Rules */}
            <div className="column-left">
                <div className="card">
                    <div className="panel-title">Manage AI Auto-Responder JIDs</div>
                    <div className="field">
                        <label htmlFor="ai-number">Target WhatsApp JID</label>
                        <input type="text" id="ai-number" placeholder="e.g. 918849561649@s.whatsapp.net" value={targetJid} onChange={(e) => setTargetJid(e.target.value)} />
                        <div className="hint" style={{ fontSize: '0.68rem', color: 'var(--muted)', marginTop: '4px' }}>
                            Only the exact WhatsApp JID (e.g. <code>918849561649@s.whatsapp.net</code> or <code>120363294328@g.us</code>) will work. Open any active chat on the right and click <strong>Use JID to Configure</strong> to copy it instantly here.
                        </div>
                    </div>
                    
                    <div className="field">
                        <label htmlFor="ai-prompt-template">Preset Talk Style</label>
                        <select id="ai-prompt-template" value={talkingStylePreset} onChange={(e) => setTalkingStylePreset(e.target.value)}>
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

                    <details className="inner-details" style={{ marginTop: '10px' }} open>
                        <summary style={{ cursor: 'pointer', fontSize: '0.75rem', color: 'var(--muted)' }}>Advanced / Custom Rules</summary>
                        <div className="inner-content" style={{ marginTop: '10px' }}>
                            <div className="field">
                                <label htmlFor="ai-prompt">Custom Talk Style</label>
                                <input type="text" id="ai-prompt" placeholder="Or write custom instructions (e.g. Talk like a Gen-Z)" value={customTalkStyle} onChange={(e) => setCustomTalkStyle(e.target.value)} />
                            </div>
                            <div className="field">
                                <label htmlFor="ai-sender-context">Your Personality / Style (Describe Yourself)</label>
                                <textarea id="ai-sender-context" rows={2} placeholder="e.g. I am Alok, a software developer. I talk casually in Hinglish." value={senderContext} onChange={(e) => setSenderContext(e.target.value)}></textarea>
                            </div>
                            <div className="field">
                                <label htmlFor="ai-contact-context">About This Contact</label>
                                <textarea id="ai-contact-context" rows={2} placeholder="e.g. My friend Rahul. We chat about cricket. Very casual style." value={contactContext} onChange={(e) => setContactContext(e.target.value)}></textarea>
                            </div>
                        </div>
                    </details>
 
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '15px', background: 'var(--canvas-soft)', padding: '0.6rem 0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                        <ToggleSwitch checked={allowBusinessKnowledge} onChange={setAllowBusinessKnowledge} />
                        <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text)', userSelect: 'none' }}>
                            Allow access to Business FAQ Spreadsheet
                        </span>
                    </div>

                    <button type="button" onClick={handleAddContactConfig} className="btn-primary" style={{ marginTop: '15px' }}>Add / Update Contact Config</button>
                </div>
            </div>

            {/* COL 2: Active Rules configurations */}
            <div className="column-right" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', height: '100%', overflow: 'hidden' }}>
                <div className="card" style={{ flex: '1 1 0%', minHeight: '200px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    <div className="panel-title" style={{ paddingBottom: '0.5rem', borderBottom: '1px solid var(--border)' }}>Active AI JID Configurations</div>
                    <div id="ai-contacts-list" className="contacts-list-container" style={{ flex: 1, overflowY: 'auto', marginTop: '0.75rem' }}>
                        {aiContacts.length === 0 ? (
                            <div className="empty-state">No auto-responder configurations added.</div>
                        ) : (
                            aiContacts.map((c, i) => (
                                <div key={i} className="ai-contact-row" onClick={() => handleEditConfig(c)} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }} title="Click to edit configuration">
                                    <div className="contact-info" style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                                            <span className="contact-number" style={{ fontWeight: 600 }}>{c.number}</span>
                                            {c.allowBusinessKnowledge && (
                                                <span style={{ 
                                                    fontSize: '0.58rem', 
                                                    fontWeight: 700, 
                                                    background: 'rgba(217, 119, 6, 0.12)', 
                                                    color: '#eab308', 
                                                    padding: '0.08rem 0.3rem', 
                                                    borderRadius: '4px',
                                                    border: '1px solid rgba(234, 179, 8, 0.25)',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.02em',
                                                    display: 'inline-flex',
                                                    alignItems: 'center'
                                                }}>
                                                    FAQ Enabled
                                                </span>
                                            )}
                                        </div>
                                        <span className="contact-prompt" style={{ fontSize: '0.7rem', display: 'block', opacity: 0.85 }}>{c.systemPrompt || 'Default AI text style'}</span>
                                        {c.senderContext && (
                                            <span className="contact-prompt" style={{ fontSize: '0.65rem', display: 'flex', alignItems: 'center', gap: '4px', opacity: 0.75, marginTop: '2px' }}>
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                                    <circle cx="12" cy="7" r="4" />
                                                </svg>
                                                <span>{c.senderContext.length > 52 ? `${c.senderContext.substring(0, 52)}…` : c.senderContext}</span>
                                            </span>
                                        )}
                                        {c.contactContext && (
                                            <span className="contact-prompt" style={{ fontSize: '0.65rem', display: 'flex', alignItems: 'center', gap: '4px', opacity: 0.75, marginTop: '2px' }}>
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                                    <polyline points="14 2 14 8 20 8" />
                                                    <line x1="16" y1="13" x2="8" y2="13" />
                                                    <line x1="16" y1="17" x2="8" y2="17" />
                                                </svg>
                                                <span>{c.contactContext.length > 52 ? `${c.contactContext.substring(0, 52)}…` : c.contactContext}</span>
                                            </span>
                                        )}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                        <button 
                                            type="button" 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setActiveChatJid(c.number);
                                                setActiveView('inbox');
                                            }} 
                                            className="btn-sm btn-primary" 
                                            style={{ 
                                                width: 'auto', fontSize: '0.7rem', fontWeight: 600, 
                                                padding: '0.25rem 0.55rem', display: 'inline-flex',
                                                alignItems: 'center', gap: '4px', margin: 0
                                            }}
                                        >
                                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                                            </svg>
                                            Chat
                                        </button>
                                        <span className="remove-badge-btn" onClick={(e) => { e.stopPropagation(); handleRemoveContactConfig(c.number); }} style={{ color: '#ef4444', fontSize: '1.2rem', padding: '0 5px' }}>
                                            &times;
                                        </span>
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
