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
    businessExcludeContacts = []
}) {
    const activeChatDetail = recentChats.find(c => c.chat_jid === activeChatJid);

    const checkIsBotActive = (jid) => {
        if (!jid) return false;
        
        // Check if individual responder list is globally disabled
        const isIndividualDisabled = aiContacts.some(c => c.number === '__SYSTEM_INDIVIDUAL_RESPONDER_DISABLED__');
        
        let hasIndividualMatch = false;
        if (!isIndividualDisabled) {
            hasIndividualMatch = aiContacts.some(c => {
                const configNum = c.number.trim().toLowerCase();
                const remoteJid = jid.trim().toLowerCase();
                if (configNum === remoteJid) return true;
                
                const cleanConfig = configNum.replace(/\D/g, '');
                const cleanRemote = remoteJid.replace(/\D/g, '');
                if (cleanConfig && cleanConfig.length >= 8 && cleanRemote.endsWith(cleanConfig)) {
                    return true;
                }
                return false;
            });
        }
        
        if (hasIndividualMatch) return true;
        
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
        <div style={{
            display: 'grid',
            gridTemplateColumns: '320px 1fr',
            gap: '1.5rem',
            height: '100%',
            width: '100%',
            overflow: 'hidden'
        }}>
            {/* Left Column: Recent Conversations List */}
            <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: '1.25rem' }}>
                <div className="panel-title" style={{ paddingBottom: '0.75rem', borderBottom: '1px solid var(--border)', margin: 0 }}>
                    Inbox
                </div>
                <div id="chat-list" className="feed-box" style={{ flex: 1, overflowY: 'auto', marginTop: '0.75rem', gap: '0.5rem', display: 'flex', flexDirection: 'column' }}>
                    {recentChats.length === 0 ? (
                        <div className="empty-state">No conversations captured yet.</div>
                    ) : (
                        recentChats.map((chat, idx) => {
                            const isSelected = chat.chat_jid === activeChatJid;
                            return (
                                <div 
                                    key={idx} 
                                    className="chat-thread-row" 
                                    onClick={() => setActiveChatJid(chat.chat_jid)} 
                                    style={{ 
                                        cursor: 'pointer', 
                                        padding: '0.75rem', 
                                        borderRadius: 'var(--radius-sm)', 
                                        border: isSelected ? '1px solid var(--primary)' : '1px solid var(--border)', 
                                        display: 'flex', 
                                        gap: '0.5rem', 
                                        alignItems: 'center', 
                                        position: 'relative', 
                                        background: isSelected ? 'rgba(0, 168, 132, 0.08)' : 'var(--canvas-soft)',
                                        transition: 'all 0.15s ease'
                                    }}
                                >
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', minWidth: 0, flex: 1, marginRight: '0.5rem' }}>
                                                <span style={{ fontWeight: 700, fontSize: '0.78rem', color: isSelected ? 'var(--primary)' : 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    {chat.sender_name || chat.chat_jid.split('@')[0]}
                                                </span>
                                                {checkIsBotActive(chat.chat_jid) && (
                                                    <span 
                                                        title="Bot Active" 
                                                        style={{
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            background: 'rgba(0, 168, 132, 0.12)',
                                                            color: 'var(--primary)',
                                                            fontSize: '0.55rem',
                                                            fontWeight: 700,
                                                            padding: '1.5px 5px',
                                                            borderRadius: '3px',
                                                            marginLeft: '6px',
                                                            flexShrink: 0,
                                                            letterSpacing: '0.03em',
                                                            border: '1px solid rgba(0, 168, 132, 0.2)'
                                                        }}
                                                    >
                                                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '3px', flexShrink: 0 }}>
                                                            <rect x="3" y="11" width="18" height="10" rx="2" />
                                                            <circle cx="8" cy="16" r="1.5" fill="currentColor" />
                                                            <circle cx="16" cy="16" r="1.5" fill="currentColor" />
                                                            <path d="M9 20h6M12 6V2M9 2h6M12 11V8" />
                                                        </svg>
                                                        BOT
                                                    </span>
                                                )}
                                            </div>
                                            <span style={{ fontSize: '0.58rem', color: 'var(--dim)' }}>
                                                {new Date(chat.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '3px', alignItems: 'center' }}>
                                            <span style={{ fontSize: '0.7rem', color: 'var(--muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '85%' }}>
                                                {chat.is_from_me ? 'Me: ' : ''}{chat.latest_message}
                                            </span>
                                            <span style={{ fontSize: '0.58rem', color: 'var(--dim)', fontFamily: 'monospace' }}>
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
                                            style={{ 
                                                background: 'none', border: 'none', color: 'var(--muted)', 
                                                fontSize: '0.9rem', cursor: 'pointer', padding: '0.2rem 0.4rem', 
                                                borderRadius: '4px', display: 'flex', alignItems: 'center',
                                                justifyContent: 'center', transition: 'color 0.15s, background-color 0.15s'
                                            }}
                                            className="options-trigger-btn"
                                        >
                                            ⋮
                                        </button>
                                        {openDropdownJid === chat.chat_jid && (
                                            <div 
                                                style={{ 
                                                    position: 'absolute', right: 0, top: '100%', marginTop: '4px',
                                                    background: 'var(--white)', border: '1px solid var(--border)', 
                                                    borderRadius: 'var(--radius-sm)', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)', 
                                                    zIndex: 100, minWidth: '100px'
                                                }}
                                            >
                                                <button 
                                                    type="button" 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setOpenDropdownJid(null);
                                                        handleDeleteChat(e, chat.chat_jid);
                                                    }} 
                                                    style={{ 
                                                        width: '100%', textAlign: 'left', background: 'none', 
                                                        border: 'none', padding: '0.55rem 0.75rem', color: '#ef4444', 
                                                        fontSize: '0.75rem', cursor: 'pointer', fontWeight: 600
                                                    }}
                                                    className="dropdown-menu-item delete-chat-btn"
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
            <div className="card feed-panel" style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: 0 }}>
                {activeChatJid ? (
                    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                        {/* Chat Header */}
                        <div className="panel-title" style={{ padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', borderBottom: '1px solid var(--border)', margin: 0 }}>
                            <button type="button" onClick={() => setActiveChatJid(null)} className="select-sender-btn" style={{ margin: 0, padding: '0.25rem 0.6rem', fontSize: '0.72rem' }}>
                                &larr; Close
                            </button>
                            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.25, flex: 1, minWidth: 0 }}>
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <span id="detail-chat-title" style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {activeChatDetail?.sender_name || activeChatJid.split('@')[0]}
                                    </span>
                                    {checkIsBotActive(activeChatJid) && (
                                        <span 
                                            title="Bot Active" 
                                            style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                background: 'rgba(0, 168, 132, 0.12)',
                                                color: 'var(--primary)',
                                                fontSize: '0.55rem',
                                                fontWeight: 700,
                                                padding: '1.5px 5px',
                                                borderRadius: '3px',
                                                marginLeft: '6px',
                                                flexShrink: 0,
                                                letterSpacing: '0.03em',
                                                border: '1px solid rgba(0, 168, 132, 0.2)'
                                            }}
                                        >
                                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '3px', flexShrink: 0 }}>
                                                <rect x="3" y="11" width="18" height="10" rx="2" />
                                                <circle cx="8" cy="16" r="1.5" fill="currentColor" />
                                                <circle cx="16" cy="16" r="1.5" fill="currentColor" />
                                                <path d="M9 20h6M12 6V2M9 2h6M12 11V8" />
                                            </svg>
                                            BOT ACTIVE
                                        </span>
                                    )}
                                </div>
                                <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', marginTop: '0.15rem' }}>
                                    <span id="detail-chat-jid" style={{ fontSize: '0.65rem', color: 'var(--dim)', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '240px' }}>
                                        {activeChatJid}
                                    </span>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => {
                                    setTargetJid(activeChatJid);
                                    setActiveView('responder');
                                }}
                                className="btn-sm btn-primary"
                                style={{
                                    margin: 0,
                                    padding: '0.3rem 0.6rem',
                                    fontSize: '0.7rem',
                                    width: 'auto',
                                    fontWeight: 600,
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    whiteSpace: 'nowrap'
                                }}
                            >
                                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                                    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
                                    <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
                                </svg>
                                Use JID to Configure
                            </button>
                        </div>
                        
                        {/* Messages Log Panel */}
                        <div id="detail-chat-history" className="feed-box" style={{ flex: 1, overflowY: 'auto', padding: '1.2rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.85rem', background: 'var(--bg)' }}>
                            {activeChatMessages.length === 0 ? (
                                <div className="empty-state">No messages loaded.</div>
                            ) : (
                                activeChatMessages.map((msg, idx) => (
                                    <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.is_from_me ? 'flex-end' : 'flex-start' }}>
                                        <div style={{ maxWidth: '75%', padding: '0.55rem 0.8rem', borderRadius: '12px', background: msg.is_from_me ? 'var(--primary)' : 'var(--white)', color: msg.is_from_me ? '#171717' : 'var(--text)', border: msg.is_from_me ? 'none' : '1px solid var(--border)', fontSize: '0.78rem', lineBreak: 'anywhere' }}>
                                            {msg.message_text}
                                        </div>
                                        <span style={{ fontSize: '0.58rem', color: 'var(--dim)', marginTop: '2px', padding: '0 4px' }}>
                                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                ))
                            )}
                            <div ref={chatHistoryEndRef} />
                        </div>

                        {/* Compose Reply Form */}
                        <form onSubmit={handleSendQuickReply} style={{ padding: '0.75rem 1.25rem', borderTop: '1px solid var(--border)', background: 'var(--white)', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <input type="text" placeholder="Type a message..." value={replyText} onChange={(e) => setReplyText(e.target.value)} required style={{ flex: 1, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '0.5rem 0.75rem', color: 'var(--text)', fontSize: '0.78rem', outline: 'none' }} />
                            <button type="submit" className="btn-sm" style={{ width: 'auto', background: 'var(--primary)', color: '#171717', fontWeight: 600, padding: '0.5rem 0.85rem', fontSize: '0.75rem' }}>
                                SEND
                            </button>
                        </form>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--dim)', gap: '0.75rem' }}>
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.4 }}>
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                        </svg>
                        <span style={{ fontSize: '0.8rem' }}>Select a conversation from the list to start chatting</span>
                    </div>
                )}
            </div>
        </div>
    );
}
