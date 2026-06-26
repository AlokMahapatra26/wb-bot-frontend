import React from 'react';

export default function InboxView({
    recentChats,
    activeChatJid,
    setActiveChatJid,
    activeChatMessages,
    chatHistoryEndRef,
    replyText,
    setReplyText,
    handleSendQuickReply,
    openDropdownJid,
    setOpenDropdownJid,
    handleDeleteChat,
    setTargetJid,
    setActiveView,
    aiContacts = [],
    businessEnabled = false,
    businessExcludeContacts = [],
    handleToggleIndividualBot
}) {
    const activeChatDetail = recentChats.find(c => c.chat_jid === activeChatJid);

    const checkIsBotActive = (jid) => {
        if (!jid) return false;
        const isIndividualDisabled = aiContacts.some(c => c.number === '__SYSTEM_INDIVIDUAL_RESPONDER_DISABLED__');
        let hasIndividualMatch = false;
        let isConfigDisabled = false;
        if (!isIndividualDisabled) {
            const matchedConfig = aiContacts.find(c => {
                const configNum = c.number.trim().toLowerCase();
                const remoteJid = jid.trim().toLowerCase();
                if (configNum === remoteJid) return true;
                const cleanConfig = configNum.replace(/\D/g, '');
                const cleanRemote = remoteJid.replace(/\D/g, '');
                if (cleanConfig && cleanConfig.length >= 8 && cleanRemote.endsWith(cleanConfig)) return true;
                return false;
            });
            if (matchedConfig) {
                if (matchedConfig.disabled) isConfigDisabled = true;
                else hasIndividualMatch = true;
            }
        }
        if (hasIndividualMatch) return true;
        if (isConfigDisabled) return false;
        if (businessEnabled && !jid.endsWith('@g.us')) {
            const cleanRemote = jid.replace(/\D/g, '');
            const isExcluded = businessExcludeContacts.some(exc => {
                const cleanExc = exc.trim().replace(/\D/g, '');
                return cleanExc && cleanRemote.endsWith(cleanExc);
            });
            if (!isExcluded) return true;
        }
        return false;
    };

    return (
        <div className="inbox-grid">
            {/* Left Column: Recent Conversations List */}
            <div className="inbox-chat-list">
                <div style={{ paddingBottom: 12, borderBottom: '1px solid var(--color-hairline)', margin: 0, fontSize: 16, fontWeight: 500, color: 'var(--color-ink)', letterSpacing: '-0.2px' }}>
                    Inbox
                </div>
                <div style={{ flex: 1, overflowY: 'auto', marginTop: 12, gap: 8, display: 'flex', flexDirection: 'column' }}>
                    {recentChats.length === 0 ? (
                        <div style={{ fontSize: 13, color: 'var(--color-muted)', textAlign: 'center', paddingTop: 16, paddingBottom: 16 }}>No conversations captured yet.</div>
                    ) : (
                        recentChats.map((chat, idx) => {
                            const isSelected = chat.chat_jid === activeChatJid;
                            return (
                                <div 
                                    key={idx} 
                                    onClick={() => setActiveChatJid(chat.chat_jid)} 
                                    style={{ cursor: 'pointer', padding: 12, borderRadius: 8, border: isSelected ? '1px solid var(--color-primary)' : '1px solid var(--color-hairline)', display: 'flex', gap: 8, alignItems: 'center', position: 'relative', transition: 'all 150ms', background: isSelected ? 'rgba(204,120,92,0.06)' : 'var(--color-canvas)' }}
                                >
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', minWidth: 0, flex: 1, marginRight: 8 }}>
                                                <span style={{ fontWeight: 700, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: isSelected ? 'var(--color-primary)' : 'var(--color-ink)' }}>
                                                    {chat.sender_name || chat.chat_jid.split('@')[0]}
                                                </span>
                                                {checkIsBotActive(chat.chat_jid) && (
                                                    <span style={{ display: 'inline-flex', alignItems: 'center', background: 'rgba(204,120,92,0.1)', color: 'var(--color-primary)', fontSize: 9, fontWeight: 700, paddingTop: '1.5px', paddingBottom: '1.5px', paddingLeft: 5, paddingRight: 5, borderRadius: 9999, marginLeft: 6, flexShrink: 0, letterSpacing: '0.05em', border: 'none' }}>
                                                        BOT ACTIVE
                                                    </span>
                                                )}
                                            </div>
                                            <span style={{ fontSize: 9, color: 'var(--color-muted-soft)' }}>
                                                {new Date(chat.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 3, alignItems: 'center' }}>
                                            <span style={{ fontSize: 11, color: 'var(--color-muted-soft)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '85%' }}>
                                                {chat.is_from_me ? 'Me: ' : ''}{chat.latest_message}
                                            </span>
                                            <span style={{ fontSize: 9, color: 'var(--color-muted-soft)', fontFamily: 'var(--font-mono)' }}>
                                                {chat.chat_jid.split('@')[0]}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    {/* Options Trigger (3 dots) */}
                                    <div style={{ position: 'relative', display: 'inline-block' }}>
                                        <button 
                                            type="button" 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setOpenDropdownJid(openDropdownJid === chat.chat_jid ? null : chat.chat_jid);
                                            }} 
                                            style={{ background: 'transparent', border: 'none', color: 'var(--color-muted-soft)', fontSize: 14, cursor: 'pointer', padding: '3px 6px', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', width: 'auto' }}
                                        >
                                            ⋮
                                        </button>
                                        {openDropdownJid === chat.chat_jid && (
                                            <div style={{ position: 'absolute', right: 0, top: '100%', marginTop: 4, background: 'var(--color-canvas)', border: '1px solid var(--color-hairline)', borderRadius: 8, boxShadow: '0 10px 15px -3px rgba(0,0,0,0.08), 0 4px 6px -4px rgba(0,0,0,0.06)', zIndex: 100, minWidth: 100 }}>
                                                <button 
                                                    type="button" 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setOpenDropdownJid(null);
                                                        handleDeleteChat(e, chat.chat_jid);
                                                    }} 
                                                    style={{ width: '100%', textAlign: 'left', background: 'transparent', border: 'none', paddingTop: 8, paddingBottom: 8, paddingLeft: 12, paddingRight: 12, color: 'var(--color-error)', fontSize: 12, cursor: 'pointer', fontWeight: 600, borderRadius: 8 }}
                                                >
                                                    Delete Chat
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Right Column: Chat History Detail Panel */}
            <div className="inbox-chat-detail">
                {activeChatJid ? (
                    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                        {/* Chat Header */}
                        <div style={{ paddingTop: 12, paddingBottom: 12, paddingLeft: 24, paddingRight: 24, display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid var(--color-hairline)', margin: 0 }}>
                            <button type="button" onClick={() => setActiveChatJid(null)} style={{ margin: 0, paddingTop: 4, paddingBottom: 4, paddingLeft: 10, paddingRight: 10, fontSize: 12, borderRadius: 8, border: '1px solid var(--color-hairline)', background: 'var(--color-canvas)', color: 'var(--color-muted)', cursor: 'pointer', fontWeight: 500, width: 'auto' }}>
                                &larr; Close
                            </button>
                            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2, flex: 1, minWidth: 0 }}>
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {activeChatDetail?.sender_name || activeChatJid.split('@')[0]}
                                    </span>
                                    {checkIsBotActive(activeChatJid) && (
                                        <span style={{ display: 'inline-flex', alignItems: 'center', background: 'rgba(204,120,92,0.1)', color: 'var(--color-primary)', fontSize: 9, fontWeight: 700, paddingTop: '1.5px', paddingBottom: '1.5px', paddingLeft: 5, paddingRight: 5, borderRadius: 9999, marginLeft: 6, flexShrink: 0, letterSpacing: '0.05em', border: 'none' }}>
                                            BOT ACTIVE
                                        </span>
                                    )}
                                </div>
                                <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginTop: 2 }}>
                                    <span style={{ fontSize: 10, color: 'var(--color-muted-soft)', fontFamily: 'var(--font-mono)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 240 }}>
                                        {activeChatJid}
                                    </span>
                                </div>
                            </div>
                            {/* Toggle Bot ON/OFF button */}
                            <button
                                type="button"
                                onClick={() => handleToggleIndividualBot?.(activeChatJid)}
                                style={{ margin: 0, paddingTop: 4, paddingBottom: 4, paddingLeft: 10, paddingRight: 10, fontSize: 11, width: 'auto', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap', borderRadius: 8, border: checkIsBotActive(activeChatJid) ? '1px solid rgba(198,69,69,0.25)' : '1px solid rgba(93,184,114,0.25)', cursor: 'pointer', transition: 'colors 150ms', background: checkIsBotActive(activeChatJid) ? 'rgba(198,69,69,0.12)' : 'rgba(93,184,114,0.12)', color: checkIsBotActive(activeChatJid) ? 'var(--color-error)' : 'var(--color-success)' }}
                            >
                                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                                    {checkIsBotActive(activeChatJid) ? (
                                        <>
                                            <circle cx="12" cy="12" r="10" />
                                            <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                                        </>
                                    ) : (
                                        <polyline points="20 6 9 17 4 12" />
                                    )}
                                </svg>
                                {checkIsBotActive(activeChatJid) ? 'Turn Bot OFF' : 'Turn Bot ON'}
                            </button>
                            <button
                                type="button"
                                onClick={() => { setTargetJid(activeChatJid); setActiveView('responder'); }}
                                style={{ margin: 0, paddingTop: 4, paddingBottom: 4, paddingLeft: 10, paddingRight: 10, fontSize: 11, width: 'auto', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap', borderRadius: 8, background: 'var(--color-primary)', color: 'var(--color-on-primary)', border: 'none', cursor: 'pointer' }}
                            >
                                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                                    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
                                    <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
                                </svg>
                                Use JID to Configure
                            </button>
                        </div>
                        
                        {/* Messages Log Panel */}
                        <div style={{ flex: 1, overflowY: 'auto', paddingTop: 20, paddingBottom: 20, paddingLeft: 24, paddingRight: 24, display: 'flex', flexDirection: 'column', gap: 14, background: 'var(--color-canvas)' }}>
                            {activeChatMessages.length === 0 ? (
                                <div style={{ fontSize: 13, color: 'var(--color-muted)', textAlign: 'center', paddingTop: 16, paddingBottom: 16 }}>No messages loaded.</div>
                            ) : (
                                activeChatMessages.map((msg, idx) => (
                                    <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.is_from_me ? 'flex-end' : 'flex-start' }}>
                                        <div style={{ maxWidth: '75%', paddingTop: 8, paddingBottom: 8, paddingLeft: 12, paddingRight: 12, borderRadius: 12, fontSize: 13, wordBreak: 'break-all', ...(msg.is_from_me ? { background: 'var(--color-primary)', color: 'var(--color-on-primary)', borderBottomRightRadius: 4 } : { background: 'var(--color-surface-soft)', color: 'var(--color-body)', border: '1px solid var(--color-hairline)', borderBottomLeftRadius: 4 }) }}>
                                            {msg.message_text}
                                        </div>
                                        <span style={{ fontSize: 9, color: 'var(--color-muted-soft)', marginTop: 2, paddingLeft: 4, paddingRight: 4 }}>
                                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                ))
                            )}
                            <div ref={chatHistoryEndRef} />
                        </div>

                        {/* Compose Reply Form */}
                        <form onSubmit={handleSendQuickReply} style={{ paddingTop: 12, paddingBottom: 12, paddingLeft: 20, paddingRight: 20, borderTop: '1px solid var(--color-hairline)', background: 'var(--color-surface-soft)', display: 'flex', gap: 8, alignItems: 'center' }}>
                            <input type="text" placeholder="Type a message..." value={replyText} onChange={(e) => setReplyText(e.target.value)} required style={{ flex: 1, background: 'var(--color-canvas)', border: '1px solid var(--color-hairline)', borderRadius: 8, paddingTop: 10, paddingBottom: 10, paddingLeft: 14, paddingRight: 14, color: 'var(--color-ink)', fontSize: 13, outline: 'none', height: 40 }} />
                            <button type="submit" style={{ width: 'auto', background: 'var(--color-primary)', color: 'var(--color-on-primary)', fontWeight: 500, paddingTop: 12, paddingBottom: 12, paddingLeft: 20, paddingRight: 20, fontSize: 14, borderRadius: 8, border: 'none', cursor: 'pointer' }}>
                                SEND
                            </button>
                        </form>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--color-muted)', gap: 12 }}>
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.4 }}>
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                        </svg>
                        <span style={{ fontSize: 13 }}>Select a conversation from the list to start chatting</span>
                    </div>
                )}
            </div>
        </div>
    );
}
