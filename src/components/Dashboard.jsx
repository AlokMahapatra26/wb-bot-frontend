import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import Sidebar from './Sidebar';
import StatusLogsView from './StatusLogsView';
import ResponderView from './ResponderView';
import BusinessView from './BusinessView';
import SettingsView from './SettingsView';

export default function Dashboard({ supabaseUrl, supabaseAnonKey, botUrl }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const [openDropdownJid, setOpenDropdownJid] = useState(null);
    const [showAuthPanel, setShowAuthPanel] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    const [botStatus, setBotStatus] = useState('disconnected');
    const [qrCode, setQrCode] = useState('');
    const [logs, setLogs] = useState([]);

    const [geminiKey, setGeminiKey] = useState('');
    const [geminiModel, setGeminiModel] = useState('gemini-2.5-flash');
    const [aiContacts, setAiContacts] = useState([]);
    const [individualEnabled, setIndividualEnabled] = useState(true);

    const [recentChats, setRecentChats] = useState([]);
    const [activeChatJid, setActiveChatJid] = useState(null);
    const [activeChatMessages, setActiveChatMessages] = useState([]);
    const [replyText, setReplyText] = useState('');

    const [targetJid, setTargetJid] = useState('');
    const [talkingStylePreset, setTalkingStylePreset] = useState('');
    const [customTalkStyle, setCustomTalkStyle] = useState('');
    const [senderContext, setSenderContext] = useState('');
    const [contactContext, setContactContext] = useState('');

    const [theme, setTheme] = useState('dark');
    const [activeView, setActiveView] = useState('chat');

    const [businessEnabled, setBusinessEnabled] = useState(false);
    const [businessPrompt, setBusinessPrompt] = useState('');
    const [businessStyle, setBusinessStyle] = useState('');
    const [businessExcludeContacts, setBusinessExcludeContacts] = useState([]);
    const [exclusionInput, setExclusionInput] = useState('');

    const [knowledgeRows, setKnowledgeRows] = useState([]);
    const [newTrigger, setNewTrigger] = useState('');
    const [newResponse, setNewResponse] = useState('');
    const [editingRowId, setEditingRowId] = useState(null);
    const [editTrigger, setEditTrigger] = useState('');
    const [editResponse, setEditResponse] = useState('');

    const [hideResponderTab, setHideResponderTab] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('hide_responder_tab') === 'true';
        }
        return false;
    });

    const [hideBusinessTab, setHideBusinessTab] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('hide_business_tab') === 'true';
        }
        return false;
    });

    const handleToggleHideResponder = (val) => {
        setHideResponderTab(val);
        localStorage.setItem('hide_responder_tab', String(val));
    };

    const handleToggleHideBusiness = (val) => {
        setHideBusinessTab(val);
        localStorage.setItem('hide_business_tab', String(val));
    };

    const activeChatJidRef = useRef(null);
    const chatHistoryEndRef = useRef(null);
    const supabaseRef = useRef(null);

    if (!supabaseRef.current && supabaseUrl && supabaseAnonKey) {
        supabaseRef.current = createClient(supabaseUrl, supabaseAnonKey);
    }
    const supabase = supabaseRef.current;

    useEffect(() => {
        activeChatJidRef.current = activeChatJid;
        if (activeChatJid) fetchChatMessages(activeChatJid);
    }, [activeChatJid]);

    useEffect(() => {
        const storedTheme = localStorage.getItem('theme') || 'dark';
        setTheme(storedTheme);
        document.body.classList.toggle('dark-mode', storedTheme === 'dark');
        document.body.classList.toggle('light-mode', storedTheme === 'light');

        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) {
                setUser(session.user);
                loadConfig(session.user.id);
                fetchRecentConversations(session.user.id);
                loadKnowledge(session.user.id);
            } else {
                window.location.href = '/';
            }
            setLoading(false);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session) setUser(session.user);
            else window.location.href = '/';
        });

        return () => subscription.unsubscribe();
    }, []);

    useEffect(() => {
        const handleOutsideClick = () => setOpenDropdownJid(null);
        window.addEventListener('click', handleOutsideClick);
        return () => window.removeEventListener('click', handleOutsideClick);
    }, []);

    useEffect(() => {
        if (!user) return;
        const channel = supabase
            .channel('chat_logs_realtime_dashboard')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_logs' }, (payload) => {
                if (payload.new.user_id === user.id) {
                    fetchRecentConversations(user.id);
                    if (activeChatJidRef.current === payload.new.chat_jid) {
                        setActiveChatMessages(prev => [...prev, payload.new]);
                    }
                }
            })
            .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'chat_logs' }, () => {
                fetchRecentConversations(user.id);
                if (activeChatJidRef.current) fetchChatMessages(activeChatJidRef.current);
            })
            .subscribe();
        return () => supabase.removeChannel(channel);
    }, [user]);

    useEffect(() => {
        if (!user) return;
        let eventSource = null;
        let reconnectTimeout = null;

        const connectSSE = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;
            const url = `${botUrl}/api/events?token=${encodeURIComponent(session.access_token)}`;
            eventSource = new EventSource(url);

            eventSource.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    if (data.status !== undefined) {
                        setBotStatus(data.status);
                        if (data.status === 'connecting') setShowAuthPanel(true);
                    }
                    if (data.qrCode !== undefined) setQrCode(data.qrCode);
                    if (data.logs !== undefined) setLogs(data.logs);
                    if (data.type === 'chat_message' && data.message) {
                        fetchRecentConversations(user.id);
                        if (activeChatJidRef.current === data.message.chat_jid) {
                            setActiveChatMessages(prev => {
                                const exists = prev.some(m => m.created_at === data.message.created_at && m.message_text === data.message.message_text);
                                return exists ? prev : [...prev, data.message];
                            });
                        }
                    }
                    if (data.type === 'chat_clear') {
                        fetchRecentConversations(user.id);
                        if (activeChatJidRef.current === data.chat_jid) setActiveChatMessages([]);
                    }
                } catch (err) { console.error('Failed to parse SSE payload:', err); }
            };
            eventSource.onerror = () => {
                console.warn('SSE disconnected. Reconnecting in 5s...');
                eventSource.close();
                reconnectTimeout = setTimeout(connectSSE, 5000);
            };
        };
        connectSSE();
        return () => {
            if (eventSource) eventSource.close();
            if (reconnectTimeout) clearTimeout(reconnectTimeout);
        };
    }, [user]);

    useEffect(() => {
        if (chatHistoryEndRef.current) chatHistoryEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }, [activeChatMessages]);

    // --- Handlers ---

    const toggleTheme = () => {
        const nextTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(nextTheme);
        localStorage.setItem('theme', nextTheme);
        document.body.classList.toggle('dark-mode', nextTheme === 'dark');
        document.body.classList.toggle('light-mode', nextTheme === 'light');
    };

    const loadConfig = async (userId) => {
        try {
            const { data, error } = await supabase.from('user_configs').select('*').eq('user_id', userId).maybeSingle();
            if (error) throw error;
            if (data) {
                setGeminiKey(data.gemini_api_key || '');
                setGeminiModel(data.gemini_model || 'gemini-2.5-flash');
                const rawContacts = data.ai_contacts || [];
                const isDisabled = rawContacts.some(c => c.number === '__SYSTEM_INDIVIDUAL_RESPONDER_DISABLED__');
                setIndividualEnabled(!isDisabled);
                setAiContacts(rawContacts.filter(c => c.number !== '__SYSTEM_INDIVIDUAL_RESPONDER_DISABLED__'));
                setBusinessEnabled(data.business_enabled ?? false);
                setBusinessPrompt(data.business_prompt || '');
                setBusinessStyle(data.business_style || '');
                setBusinessExcludeContacts(data.business_exclude_contacts || []);
            }
        } catch (err) { console.error('Error loading config:', err); }
    };

    const loadKnowledge = async (userId = user?.id) => {
        if (!userId) return;
        try {
            const { data, error } = await supabase.from('bot_knowledge').select('*').eq('user_id', userId).order('created_at', { ascending: true });
            if (error) throw error;
            setKnowledgeRows(data || []);
        } catch (err) { console.error('Error loading knowledge:', err); }
    };

    const handleAddKnowledge = async (e) => {
        e.preventDefault();
        if (!newTrigger.trim() || !newResponse.trim()) { alert('Please specify both the trigger and the response.'); return; }
        try {
            const { data, error } = await supabase.from('bot_knowledge').insert({ user_id: user.id, trigger_pattern: newTrigger.trim(), response_text: newResponse.trim() }).select();
            if (error) throw error;
            if (data && data[0]) setKnowledgeRows(prev => [...prev, data[0]]);
            else loadKnowledge(user.id);
            setNewTrigger(''); setNewResponse('');
        } catch (err) { alert('Failed to add knowledge: ' + err.message); }
    };

    const handleDeleteKnowledge = async (id) => {
        if (!confirm('Are you sure you want to delete this knowledge row?')) return;
        try {
            const { error } = await supabase.from('bot_knowledge').delete().eq('id', id);
            if (error) throw error;
            setKnowledgeRows(prev => prev.filter(row => row.id !== id));
        } catch (err) { alert('Failed to delete knowledge: ' + err.message); }
    };

    const startEditKnowledge = (row) => { setEditingRowId(row.id); setEditTrigger(row.trigger_pattern); setEditResponse(row.response_text); };

    const handleUpdateKnowledge = async (id) => {
        if (!editTrigger.trim() || !editResponse.trim()) { alert('Trigger and Response cannot be empty.'); return; }
        try {
            const { error } = await supabase.from('bot_knowledge').update({ trigger_pattern: editTrigger.trim(), response_text: editResponse.trim() }).eq('id', id);
            if (error) throw error;
            setKnowledgeRows(prev => prev.map(row => row.id === id ? { ...row, trigger_pattern: editTrigger.trim(), response_text: editResponse.trim() } : row));
            setEditingRowId(null);
        } catch (err) { alert('Failed to update knowledge: ' + err.message); }
    };

    const fetchRecentConversations = async (userId = user?.id) => {
        if (!userId) return;
        try {
            const { data, error } = await supabase.from('chat_logs').select('chat_jid, sender_name, message_text, is_from_me, created_at').eq('user_id', userId).order('created_at', { ascending: false });
            if (error) throw error;
            const chatsMap = {};
            (data || []).forEach(log => {
                if (!chatsMap[log.chat_jid]) {
                    chatsMap[log.chat_jid] = { chat_jid: log.chat_jid, sender_name: log.is_from_me ? null : log.sender_name, latest_message: log.message_text, is_from_me: log.is_from_me, created_at: log.created_at };
                } else if (!chatsMap[log.chat_jid].sender_name && !log.is_from_me) {
                    chatsMap[log.chat_jid].sender_name = log.sender_name;
                }
            });
            setRecentChats(Object.values(chatsMap).sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
        } catch (err) { console.error('Error loading conversations:', err); }
    };

    const fetchChatMessages = async (jid) => {
        if (!user) return;
        try {
            const { data, error } = await supabase.from('chat_logs').select('sender_name, message_text, is_from_me, created_at').eq('user_id', user.id).eq('chat_jid', jid).order('created_at', { ascending: true });
            if (error) throw error;
            setActiveChatMessages(data || []);
        } catch (err) { console.error('Error loading messages:', err); }
    };

    const handleDeleteChat = async (e, jid) => {
        e.stopPropagation();
        if (!confirm('Are you sure you want to clear conversation logs for this contact?')) return;
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const response = await fetch(`${botUrl}/api/chats/${encodeURIComponent(jid)}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${session?.access_token}` } });
            const result = await response.json();
            if (!result.success) throw new Error(result.error || 'Failed to delete chat logs.');
            if (activeChatJid === jid) { setActiveChatJid(null); setActiveChatMessages([]); }
            fetchRecentConversations();
        } catch (err) { alert('Failed to delete chat: ' + err.message); }
    };

    const saveEngineSettings = async () => {
        try {
            const { error } = await supabase.from('user_configs').update({ gemini_api_key: geminiKey, gemini_model: geminiModel }).eq('user_id', user.id);
            if (error) throw error;
            alert('Engine settings saved successfully!');
        } catch (err) { alert('Failed to save engine settings: ' + err.message); }
    };

    const saveBusinessSettings = async (overrideEnabled, overridePrompt, overrideStyle, overrideExclusions) => {
        try {
            const { error } = await supabase.from('user_configs').update({
                business_enabled: overrideEnabled !== undefined ? overrideEnabled : businessEnabled,
                business_prompt: overridePrompt !== undefined ? overridePrompt : businessPrompt,
                business_style: overrideStyle !== undefined ? overrideStyle : businessStyle,
                business_exclude_contacts: overrideExclusions !== undefined ? overrideExclusions : businessExcludeContacts
            }).eq('user_id', user.id);
            if (error) throw error;
        } catch (err) { alert('Failed to save business settings: ' + err.message); }
    };

    const handleToggleBusiness = async (enabled) => { setBusinessEnabled(enabled); await saveBusinessSettings(enabled, undefined, undefined, undefined); };

    const handleToggleIndividual = async (enabled) => {
        setIndividualEnabled(enabled);
        try {
            const listToSave = [...aiContacts];
            if (!enabled) listToSave.push({ number: '__SYSTEM_INDIVIDUAL_RESPONDER_DISABLED__' });
            const { error } = await supabase.from('user_configs').update({ ai_contacts: listToSave }).eq('user_id', user.id);
            if (error) throw error;
        } catch (err) { alert('Failed to save individual responder settings: ' + err.message); }
    };

    const handleSaveBusinessSettings = async () => {
        await saveBusinessSettings(businessEnabled, businessPrompt, businessStyle, businessExcludeContacts);
        alert('Business Autopilot settings saved successfully!');
    };

    const handleAddExclusion = async (e) => {
        e.preventDefault();
        const number = exclusionInput.trim();
        if (!number) return;
        if (businessExcludeContacts.includes(number)) { alert('Number is already excluded!'); return; }
        const updated = [...businessExcludeContacts, number];
        setBusinessExcludeContacts(updated); setExclusionInput('');
        await saveBusinessSettings(undefined, undefined, undefined, updated);
    };

    const handleRemoveExclusion = async (number) => {
        const updated = businessExcludeContacts.filter(n => n !== number);
        setBusinessExcludeContacts(updated);
        await saveBusinessSettings(undefined, undefined, undefined, updated);
    };

    const handleAddContactConfig = async () => {
        if (!targetJid.trim()) { alert('Please specify a JID first!'); return; }
        const systemPrompt = talkingStylePreset ? talkingStylePreset : customTalkStyle;
        const updatedContact = { number: targetJid.trim(), systemPrompt: systemPrompt.trim(), talkingStyle: systemPrompt.trim(), senderContext: senderContext.trim(), contactContext: contactContext.trim() };
        const updatedList = [...aiContacts];
        const idx = updatedList.findIndex(c => c.number.trim().toLowerCase() === targetJid.trim().toLowerCase());
        if (idx !== -1) updatedList[idx] = updatedContact; else updatedList.push(updatedContact);
        const listToSave = [...updatedList];
        if (!individualEnabled) listToSave.push({ number: '__SYSTEM_INDIVIDUAL_RESPONDER_DISABLED__' });
        try {
            const { error } = await supabase.from('user_configs').update({ ai_contacts: listToSave }).eq('user_id', user.id);
            if (error) throw error;
            setAiContacts(updatedList); setTargetJid(''); setTalkingStylePreset(''); setCustomTalkStyle(''); setSenderContext(''); setContactContext('');
            alert('AI configuration saved!');
        } catch (err) { alert('Failed to save configuration: ' + err.message); }
    };

    const handleRemoveContactConfig = async (number) => {
        if (!confirm(`Remove AI rules for JID: ${number}?`)) return;
        const updatedList = aiContacts.filter(c => c.number.trim() !== number.trim());
        const listToSave = [...updatedList];
        if (!individualEnabled) listToSave.push({ number: '__SYSTEM_INDIVIDUAL_RESPONDER_DISABLED__' });
        try {
            const { error } = await supabase.from('user_configs').update({ ai_contacts: listToSave }).eq('user_id', user.id);
            if (error) throw error;
            setAiContacts(updatedList);
        } catch (err) { alert('Failed to remove AI JID config: ' + err.message); }
    };

    const handleEditConfig = (c) => {
        setTargetJid(c.number); setSenderContext(c.senderContext || ''); setContactContext(c.contactContext || '');
        const presets = [
            "Reply in a highly sarcastic, witty, and slightly roasty tone. Use informal slang.",
            "Talk like a pirate! Use words like 'Ahoy', 'Matey', 'Ye', and 'Arrgh'.",
            "You are a professional corporate assistant. Be extremely formal, polite, and brief.",
            "Shayari style - reply poetically, combining Hindi and Urdu keywords.",
            "Use Gen-Z slang (no cap, bet, fr fr, lowkey, skibidi, rizz, gyatt). Keep it casual.",
            "Reply purely in emojis representing the message content."
        ];
        if (presets.includes(c.systemPrompt)) { setTalkingStylePreset(c.systemPrompt); setCustomTalkStyle(''); }
        else { setTalkingStylePreset(''); setCustomTalkStyle(c.systemPrompt || ''); }
    };

    const handleSendQuickReply = async (e) => {
        e.preventDefault();
        if (!replyText.trim() || !activeChatJid) return;
        const originalText = replyText; setReplyText('');
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const response = await fetch(`${botUrl}/api/send`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session?.access_token}` }, body: JSON.stringify({ to: activeChatJid, message: originalText.trim() }) });
            const result = await response.json();
            if (!result.success) { alert(result.error || 'Failed to deliver message.'); setReplyText(originalText); }
        } catch (err) { alert('Delivery error: ' + err.message); setReplyText(originalText); }
    };

    const handleDisconnectBot = async () => {
        if (!confirm('Log out of WhatsApp? This will clear session credentials on the server.')) return;
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const response = await fetch(`${botUrl}/api/whatsapp/disconnect`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session?.access_token}` } });
            const result = await response.json();
            if (result.success) alert('WhatsApp session cleared. A new QR code will generate shortly.');
            else alert('Disconnect failed: ' + result.error);
        } catch (err) { alert('Wipe error: ' + err.message); }
    };

    const handleLogout = async () => {
        if (!confirm('Log out from the dashboard?')) return;
        await supabase.auth.signOut();
        document.cookie = 'sb-access-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        window.location.href = '/';
    };

    // --- Render ---

    if (!supabaseUrl || !supabaseAnonKey || !supabase) {
        return (
            <div style={{ display: 'flex', height: '100vh', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#141414', color: '#ef4444', padding: '2rem', textAlign: 'center', fontFamily: 'sans-serif' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Dashboard Configuration Error</h3>
                <p style={{ color: '#9a9a9a', marginTop: '0.5rem', fontSize: '0.9rem' }}>Supabase URL or Anon Key was not loaded into the dashboard component.</p>
            </div>
        );
    }

    if (loading) {
        return (
            <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', color: 'var(--text)' }}>
                <p>Verifying secure dashboard session...</p>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', background: 'var(--bg)' }}>
            <style dangerouslySetInnerHTML={{__html: `
                .sidebar-nav-btn { transition: all 0.2s ease !important; }
                .sidebar-nav-btn:not(.active):hover { background: var(--canvas-soft) !important; border-color: var(--border-dark) !important; color: var(--text) !important; }
                .sidebar-nav-btn.active:hover { background: var(--primary) !important; color: #171717 !important; opacity: 0.95; }
                .sidebar-nav-btn:active { transform: scale(0.98); }
            `}} />

             <Sidebar
                activeView={activeView} setActiveView={setActiveView}
                setActiveChatJid={setActiveChatJid}
                isSidebarCollapsed={isSidebarCollapsed} setIsSidebarCollapsed={setIsSidebarCollapsed}
                theme={theme} toggleTheme={toggleTheme}
                handleLogout={handleLogout}
                hideResponderTab={hideResponderTab}
                hideBusinessTab={hideBusinessTab}
            />

            <div style={{ flex: 1, height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <main className="container" style={{
                    display: 'grid',
                    gridTemplateColumns: activeView === 'settings' ? '1.2fr 1fr' : activeView === 'business' ? '1fr 1.5fr' : '1fr 1fr',
                    height: '100%', width: '100%', maxWidth: '100%',
                    padding: '1.5rem', gap: '1.5rem', margin: 0,
                    overflowY: 'hidden', boxSizing: 'border-box'
                }}>
                    {activeView === 'chat' && (
                        <StatusLogsView botStatus={botStatus} qrCode={qrCode} handleDisconnectBot={handleDisconnectBot} logs={logs} />
                    )}

                    {activeView === 'responder' && (
                        <ResponderView
                            targetJid={targetJid} setTargetJid={setTargetJid}
                            talkingStylePreset={talkingStylePreset} setTalkingStylePreset={setTalkingStylePreset}
                            customTalkStyle={customTalkStyle} setCustomTalkStyle={setCustomTalkStyle}
                            senderContext={senderContext} setSenderContext={setSenderContext}
                            contactContext={contactContext} setContactContext={setContactContext}
                            handleAddContactConfig={handleAddContactConfig}
                            aiContacts={aiContacts} handleEditConfig={handleEditConfig} handleRemoveContactConfig={handleRemoveContactConfig}
                            activeChatJid={activeChatJid} setActiveChatJid={setActiveChatJid}
                            activeChatMessages={activeChatMessages} chatHistoryEndRef={chatHistoryEndRef}
                            replyText={replyText} setReplyText={setReplyText} handleSendQuickReply={handleSendQuickReply}
                            recentChats={recentChats} openDropdownJid={openDropdownJid} setOpenDropdownJid={setOpenDropdownJid} handleDeleteChat={handleDeleteChat}
                        />
                    )}

                    {activeView === 'business' && (
                        <BusinessView
                            businessEnabled={businessEnabled} handleToggleBusiness={handleToggleBusiness}
                            businessPrompt={businessPrompt} setBusinessPrompt={setBusinessPrompt}
                            businessStyle={businessStyle} setBusinessStyle={setBusinessStyle}
                            handleSaveBusinessSettings={handleSaveBusinessSettings}
                            businessExcludeContacts={businessExcludeContacts} exclusionInput={exclusionInput} setExclusionInput={setExclusionInput}
                            handleAddExclusion={handleAddExclusion} handleRemoveExclusion={handleRemoveExclusion}
                            knowledgeRows={knowledgeRows} editingRowId={editingRowId} editTrigger={editTrigger} setEditTrigger={setEditTrigger}
                            editResponse={editResponse} setEditResponse={setEditResponse}
                            startEditKnowledge={startEditKnowledge} handleUpdateKnowledge={handleUpdateKnowledge} setEditingRowId={setEditingRowId}
                            handleDeleteKnowledge={handleDeleteKnowledge} handleAddKnowledge={handleAddKnowledge}
                            newTrigger={newTrigger} setNewTrigger={setNewTrigger} newResponse={newResponse} setNewResponse={setNewResponse}
                        />
                    )}

                    {activeView === 'settings' && (
                        <SettingsView
                            individualEnabled={individualEnabled} handleToggleIndividual={handleToggleIndividual}
                            businessEnabled={businessEnabled} handleToggleBusiness={handleToggleBusiness}
                            geminiKey={geminiKey} setGeminiKey={setGeminiKey}
                            geminiModel={geminiModel} setGeminiModel={setGeminiModel}
                            saveEngineSettings={saveEngineSettings}
                            botStatus={botStatus} user={user}
                            aiContacts={aiContacts} businessExcludeContacts={businessExcludeContacts} knowledgeRows={knowledgeRows}
                            hideResponderTab={hideResponderTab} setHideResponderTab={handleToggleHideResponder}
                            hideBusinessTab={hideBusinessTab} setHideBusinessTab={handleToggleHideBusiness}
                        />
                    )}
                </main>
            </div>
        </div>
    );
}
