import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';

export default function Dashboard({ supabaseUrl, supabaseAnonKey, botUrl }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Options dropdown state
    const [openDropdownJid, setOpenDropdownJid] = useState(null);
    const [showAuthPanel, setShowAuthPanel] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    // Bot connection states
    const [botStatus, setBotStatus] = useState('disconnected');
    const [qrCode, setQrCode] = useState('');
    const [logs, setLogs] = useState([]);

    // Gemini and configuration states
    const [geminiKey, setGeminiKey] = useState('');
    const [geminiModel, setGeminiModel] = useState('gemini-2.5-flash');
    const [aiContacts, setAiContacts] = useState([]);

    // Conversation thread states
    const [recentChats, setRecentChats] = useState([]);
    const [activeChatJid, setActiveChatJid] = useState(null);
    const [activeChatMessages, setActiveChatMessages] = useState([]);
    const [replyText, setReplyText] = useState('');

    // Form inputs for managing specific AI target config
    const [targetJid, setTargetJid] = useState('');
    const [talkingStylePreset, setTalkingStylePreset] = useState('');
    const [customTalkStyle, setCustomTalkStyle] = useState('');
    const [senderContext, setSenderContext] = useState('');
    const [contactContext, setContactContext] = useState('');

    // Theme state
    const [theme, setTheme] = useState('dark');

    // View state: 'chat', 'responder', or 'business'
    const [activeView, setActiveView] = useState('chat');

    // Business Autopilot configurations state
    const [businessEnabled, setBusinessEnabled] = useState(false);
    const [businessPrompt, setBusinessPrompt] = useState('');
    const [businessStyle, setBusinessStyle] = useState('');
    const [businessExcludeContacts, setBusinessExcludeContacts] = useState([]);
    const [exclusionInput, setExclusionInput] = useState('');

    // Knowledge Base view and editing states
    const [knowledgeRows, setKnowledgeRows] = useState([]);
    const [newTrigger, setNewTrigger] = useState('');
    const [newResponse, setNewResponse] = useState('');
    const [editingRowId, setEditingRowId] = useState(null);
    const [editTrigger, setEditTrigger] = useState('');
    const [editResponse, setEditResponse] = useState('');

    // References for subscription synchronization and chat scrolling
    const activeChatJidRef = useRef(null);
    const chatHistoryEndRef = useRef(null);
    const supabaseRef = useRef(null);

    // Initialize Supabase Client safely
    if (!supabaseRef.current && supabaseUrl && supabaseAnonKey) {
        supabaseRef.current = createClient(supabaseUrl, supabaseAnonKey);
    }
    const supabase = supabaseRef.current;

    // Keep activeChatJid reference in sync for the real-time insert event handler
    useEffect(() => {
        activeChatJidRef.current = activeChatJid;
        if (activeChatJid) {
            fetchChatMessages(activeChatJid);
        }
    }, [activeChatJid]);

    // Handle initial auth & restore theme
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
            if (session) {
                setUser(session.user);
            } else {
                window.location.href = '/';
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    // Dismiss options dropdown on outside click
    useEffect(() => {
        const handleOutsideClick = () => setOpenDropdownJid(null);
        window.addEventListener('click', handleOutsideClick);
        return () => window.removeEventListener('click', handleOutsideClick);
    }, []);

    // Set up Realtime listener for incoming/outgoing WhatsApp messages
    useEffect(() => {
        if (!user) return;

        const channel = supabase
            .channel('chat_logs_realtime_dashboard')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_logs' }, (payload) => {
                if (payload.new.user_id === user.id) {
                    // Update threads inbox
                    fetchRecentConversations(user.id);
                    // Append message to active chat if open
                    if (activeChatJidRef.current === payload.new.chat_jid) {
                        setActiveChatMessages(prev => {
                            // Deduplicate by message contents and time if necessary
                            return [...prev, payload.new];
                        });
                    }
                }
            })
            .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'chat_logs' }, (payload) => {
                fetchRecentConversations(user.id);
                if (activeChatJidRef.current) {
                    fetchChatMessages(activeChatJidRef.current);
                }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user]);

    // Set up EventSource SSE connection to the backend bot daemon
    useEffect(() => {
        if (!user) return;

        let eventSource = null;
        let reconnectTimeout = null;

        const connectSSE = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            const token = session.access_token;
            // Establish SSE stream passing JWT token in URL query
            const url = `${botUrl}/api/events?token=${encodeURIComponent(token)}`;
            
            eventSource = new EventSource(url);

            eventSource.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    if (data.status !== undefined) {
                        setBotStatus(data.status);
                        if (data.status === 'connecting') {
                            setShowAuthPanel(true);
                        }
                    }
                    if (data.qrCode !== undefined) setQrCode(data.qrCode);
                    if (data.logs !== undefined) setLogs(data.logs);

                    if (data.type === 'chat_message' && data.message) {
                        fetchRecentConversations(user.id);
                        if (activeChatJidRef.current === data.message.chat_jid) {
                            setActiveChatMessages(prev => {
                                const exists = prev.some(m => m.created_at === data.message.created_at && m.message_text === data.message.message_text);
                                if (exists) return prev;
                                return [...prev, data.message];
                            });
                        }
                    }

                    if (data.type === 'chat_clear') {
                        fetchRecentConversations(user.id);
                        if (activeChatJidRef.current === data.chat_jid) {
                            setActiveChatMessages([]);
                        }
                    }
                } catch (err) {
                    console.error('Failed to parse SSE payload:', err);
                }
            };

            eventSource.onerror = (err) => {
                console.warn('SSE connection disconnected. Reconnecting in 5s...');
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

    // Auto-scroll chat history on new messages
    useEffect(() => {
        if (chatHistoryEndRef.current) {
            chatHistoryEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [activeChatMessages]);

    // Theme switcher
    const toggleTheme = () => {
        const nextTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(nextTheme);
        localStorage.setItem('theme', nextTheme);
        document.body.classList.toggle('dark-mode', nextTheme === 'dark');
        document.body.classList.toggle('light-mode', nextTheme === 'light');
    };

    // Load user configs (API key, models, AI contacts, business configs)
    const loadConfig = async (userId) => {
        try {
            const { data, error } = await supabase
                .from('user_configs')
                .select('*')
                .eq('user_id', userId)
                .maybeSingle();

            if (error) throw error;
            if (data) {
                setGeminiKey(data.gemini_api_key || '');
                setGeminiModel(data.gemini_model || 'gemini-2.5-flash');
                setAiContacts(data.ai_contacts || []);
                setBusinessEnabled(data.business_enabled ?? false);
                setBusinessPrompt(data.business_prompt || '');
                setBusinessStyle(data.business_style || '');
                setBusinessExcludeContacts(data.business_exclude_contacts || []);
            }
        } catch (err) {
            console.error('Error loading config:', err);
        }
    };

    // Fetch knowledge base rows
    const loadKnowledge = async (userId = user?.id) => {
        if (!userId) return;
        try {
            const { data, error } = await supabase
                .from('bot_knowledge')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: true });

            if (error) throw error;
            setKnowledgeRows(data || []);
        } catch (err) {
            console.error('Error loading knowledge:', err);
        }
    };

    // Add new knowledge base row
    const handleAddKnowledge = async (e) => {
        e.preventDefault();
        if (!newTrigger.trim() || !newResponse.trim()) {
            alert('Please specify both the trigger and the response.');
            return;
        }

        try {
            const { data, error } = await supabase
                .from('bot_knowledge')
                .insert({
                    user_id: user.id,
                    trigger_pattern: newTrigger.trim(),
                    response_text: newResponse.trim()
                })
                .select();

            if (error) throw error;
            
            if (data && data[0]) {
                setKnowledgeRows(prev => [...prev, data[0]]);
            } else {
                loadKnowledge(user.id);
            }
            setNewTrigger('');
            setNewResponse('');
        } catch (err) {
            alert('Failed to add knowledge: ' + err.message);
        }
    };

    // Delete knowledge base row
    const handleDeleteKnowledge = async (id) => {
        if (!confirm('Are you sure you want to delete this knowledge row?')) return;
        try {
            const { error } = await supabase
                .from('bot_knowledge')
                .delete()
                .eq('id', id);

            if (error) throw error;
            setKnowledgeRows(prev => prev.filter(row => row.id !== id));
        } catch (err) {
            alert('Failed to delete knowledge: ' + err.message);
        }
    };

    // Set row in edit mode
    const startEditKnowledge = (row) => {
        setEditingRowId(row.id);
        setEditTrigger(row.trigger_pattern);
        setEditResponse(row.response_text);
    };

    // Save edited knowledge row
    const handleUpdateKnowledge = async (id) => {
        if (!editTrigger.trim() || !editResponse.trim()) {
            alert('Trigger and Response cannot be empty.');
            return;
        }

        try {
            const { error } = await supabase
                .from('bot_knowledge')
                .update({
                    trigger_pattern: editTrigger.trim(),
                    response_text: editResponse.trim()
                })
                .eq('id', id);

            if (error) throw error;

            setKnowledgeRows(prev => prev.map(row => {
                if (row.id === id) {
                    return { ...row, trigger_pattern: editTrigger.trim(), response_text: editResponse.trim() };
                }
                return row;
            }));
            setEditingRowId(null);
        } catch (err) {
            alert('Failed to update knowledge: ' + err.message);
        }
    };

    // Fetch inbox threads
    const fetchRecentConversations = async (userId = user?.id) => {
        if (!userId) return;
        try {
            const { data, error } = await supabase
                .from('chat_logs')
                .select('chat_jid, sender_name, message_text, is_from_me, created_at')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (error) throw error;

            const chatsMap = {};
            (data || []).forEach(log => {
                if (!chatsMap[log.chat_jid]) {
                    chatsMap[log.chat_jid] = {
                        chat_jid: log.chat_jid,
                        sender_name: log.is_from_me ? null : log.sender_name,
                        latest_message: log.message_text,
                        is_from_me: log.is_from_me,
                        created_at: log.created_at
                    };
                } else if (!chatsMap[log.chat_jid].sender_name && !log.is_from_me) {
                    chatsMap[log.chat_jid].sender_name = log.sender_name;
                }
            });

            const chats = Object.values(chatsMap).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            setRecentChats(chats);
        } catch (err) {
            console.error('Error loading conversations:', err);
        }
    };

    // Fetch full message bubbles for a specific JID thread
    const fetchChatMessages = async (jid) => {
        if (!user) return;
        try {
            const { data, error } = await supabase
                .from('chat_logs')
                .select('sender_name, message_text, is_from_me, created_at')
                .eq('user_id', user.id)
                .eq('chat_jid', jid)
                .order('created_at', { ascending: true });

            if (error) throw error;
            setActiveChatMessages(data || []);
        } catch (err) {
            console.error('Error loading messages:', err);
        }
    };

    // Delete contact chat log history completely
    const handleDeleteChat = async (e, jid) => {
        e.stopPropagation();
        if (!confirm('Are you sure you want to clear conversation logs for this contact?')) return;
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;

            const response = await fetch(`${botUrl}/api/chats/${encodeURIComponent(jid)}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const result = await response.json();
            if (!result.success) {
                throw new Error(result.error || 'Failed to delete chat logs.');
            }
            
            if (activeChatJid === jid) {
                setActiveChatJid(null);
                setActiveChatMessages([]);
            }
            fetchRecentConversations();
        } catch (err) {
            alert('Failed to delete chat: ' + err.message);
        }
    };

    // Save Gemini Engine settings
    const saveEngineSettings = async () => {
        try {
            const { error } = await supabase
                .from('user_configs')
                .update({
                    gemini_api_key: geminiKey,
                    gemini_model: geminiModel
                })
                .eq('user_id', user.id);

            if (error) throw error;
            alert('Engine settings saved successfully!');
        } catch (err) {
            alert('Failed to save engine settings: ' + err.message);
        }
    };

    // Save Business Autopilot settings
    const saveBusinessSettings = async (overrideEnabled, overridePrompt, overrideStyle, overrideExclusions) => {
        try {
            const { error } = await supabase
                .from('user_configs')
                .update({
                    business_enabled: overrideEnabled !== undefined ? overrideEnabled : businessEnabled,
                    business_prompt: overridePrompt !== undefined ? overridePrompt : businessPrompt,
                    business_style: overrideStyle !== undefined ? overrideStyle : businessStyle,
                    business_exclude_contacts: overrideExclusions !== undefined ? overrideExclusions : businessExcludeContacts
                })
                .eq('user_id', user.id);

            if (error) throw error;
        } catch (err) {
            alert('Failed to save business settings: ' + err.message);
        }
    };

    const handleToggleBusiness = async (enabled) => {
        setBusinessEnabled(enabled);
        await saveBusinessSettings(enabled, undefined, undefined, undefined);
    };

    const handleSaveBusinessSettings = async () => {
        await saveBusinessSettings(businessEnabled, businessPrompt, businessStyle, businessExcludeContacts);
        alert('Business Autopilot settings saved successfully!');
    };

    const handleAddExclusion = async (e) => {
        e.preventDefault();
        const number = exclusionInput.trim();
        if (!number) return;

        if (businessExcludeContacts.includes(number)) {
            alert('Number is already excluded!');
            return;
        }

        const updatedExclusions = [...businessExcludeContacts, number];
        setBusinessExcludeContacts(updatedExclusions);
        setExclusionInput('');

        await saveBusinessSettings(undefined, undefined, undefined, updatedExclusions);
    };

    const handleRemoveExclusion = async (number) => {
        const updatedExclusions = businessExcludeContacts.filter(n => n !== number);
        setBusinessExcludeContacts(updatedExclusions);

        await saveBusinessSettings(undefined, undefined, undefined, updatedExclusions);
    };

    // Add or update AI contact configuration rules
    const handleAddContactConfig = async () => {
        if (!targetJid.trim()) {
            alert('Please specify a JID first!');
            return;
        }

        const activePreset = talkingStylePreset;
        const systemPrompt = activePreset ? activePreset : customTalkStyle;

        const updatedContact = {
            number: targetJid.trim(),
            systemPrompt: systemPrompt.trim(),
            talkingStyle: systemPrompt.trim(),
            senderContext: senderContext.trim(),
            contactContext: contactContext.trim()
        };

        // Mutate local/db array
        const updatedList = [...aiContacts];
        const existingIdx = updatedList.findIndex(c => c.number.trim().toLowerCase() === targetJid.trim().toLowerCase());

        if (existingIdx !== -1) {
            updatedList[existingIdx] = updatedContact;
        } else {
            updatedList.push(updatedContact);
        }

        try {
            const { error } = await supabase
                .from('user_configs')
                .update({
                    ai_contacts: updatedList
                })
                .eq('user_id', user.id);

            if (error) throw error;

            setAiContacts(updatedList);
            // Clear config fields
            setTargetJid('');
            setTalkingStylePreset('');
            setCustomTalkStyle('');
            setSenderContext('');
            setContactContext('');
            alert('AI configuration saved!');
        } catch (err) {
            alert('Failed to save configuration: ' + err.message);
        }
    };

    // Remove specific AI JID config rules
    const handleRemoveContactConfig = async (number) => {
        if (!confirm(`Remove AI rules for JID: ${number}?`)) return;
        const updatedList = aiContacts.filter(c => c.number.trim() !== number.trim());

        try {
            const { error } = await supabase
                .from('user_configs')
                .update({
                    ai_contacts: updatedList
                })
                .eq('user_id', user.id);

            if (error) throw error;

            setAiContacts(updatedList);
        } catch (err) {
            alert('Failed to remove AI JID config: ' + err.message);
        }
    };

    // Populate editor with clicked config JID row details
    const handleEditConfig = (c) => {
        setTargetJid(c.number);
        setSenderContext(c.senderContext || '');
        setContactContext(c.contactContext || '');
        
        // Match preset
        const presets = [
            "Reply in a highly sarcastic, witty, and slightly roasty tone. Use informal slang.",
            "Talk like a pirate! Use words like 'Ahoy', 'Matey', 'Ye', and 'Arrgh'.",
            "You are a professional corporate assistant. Be extremely formal, polite, and brief.",
            "Shayari style - reply poetically, combining Hindi and Urdu keywords.",
            "Use Gen-Z slang (no cap, bet, fr fr, lowkey, skibidi, rizz, gyatt). Keep it casual.",
            "Reply purely in emojis representing the message content."
        ];
        if (presets.includes(c.systemPrompt)) {
            setTalkingStylePreset(c.systemPrompt);
            setCustomTalkStyle('');
        } else {
            setTalkingStylePreset('');
            setCustomTalkStyle(c.systemPrompt || '');
        }
    };

    // Quick-reply form within active thread view
    const handleSendQuickReply = async (e) => {
        e.preventDefault();
        if (!replyText.trim() || !activeChatJid) return;

        const originalText = replyText;
        setReplyText(''); // optimistic clear

        try {
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;

            const response = await fetch(`${botUrl}/api/send`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    to: activeChatJid,
                    message: originalText.trim()
                })
            });

            const result = await response.json();
            if (!result.success) {
                alert(result.error || 'Failed to deliver message.');
                setReplyText(originalText); // restore text
            }
        } catch (err) {
            alert('Delivery error: ' + err.message);
            setReplyText(originalText);
        }
    };

    // Disconnect WhatsApp Client session
    const handleDisconnectBot = async () => {
        if (!confirm('Log out of WhatsApp? This will clear session credentials on the server.')) return;
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;

            const response = await fetch(`${botUrl}/api/whatsapp/disconnect`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            const result = await response.json();
            if (result.success) {
                alert('WhatsApp session cleared. A new QR code will generate shortly.');
            } else {
                alert('Disconnect failed: ' + result.error);
            }
        } catch (err) {
            alert('Wipe error: ' + err.message);
        }
    };

    // Logout from Dashboard
    const handleLogout = async () => {
        if (!confirm('Log out from the dashboard?')) return;
        await supabase.auth.signOut();
        // Clear auth cookie
        document.cookie = 'sb-access-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        window.location.href = '/';
    };

    if (!supabaseUrl || !supabaseAnonKey || !supabase) {
        return (
            <div style={{ display: 'flex', height: '100vh', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#141414', color: '#ef4444', padding: '2rem', textAlign: 'center', fontFamily: 'sans-serif' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Dashboard Configuration Error</h3>
                <p style={{ color: '#9a9a9a', marginTop: '0.5rem', fontSize: '0.9rem' }}>Supabase URL or Anon Key was not loaded into the dashboard component.</p>
                <p style={{ color: '#555555', marginTop: '1rem', fontSize: '0.8rem', fontFamily: 'monospace' }}>
                    url: "{supabaseUrl || 'undefined'}"<br/>
                    key: "{supabaseAnonKey ? supabaseAnonKey.substring(0, 10) + '...' : 'undefined'}"
                </p>
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
                .sidebar-nav-btn {
                    transition: all 0.2s ease !important;
                }
                .sidebar-nav-btn:not(.active):hover {
                    background: var(--canvas-soft) !important;
                    border-color: var(--border-dark) !important;
                    color: var(--text) !important;
                }
                .sidebar-nav-btn.active:hover {
                    background: var(--primary) !important;
                    color: #171717 !important;
                    opacity: 0.95;
                }
                .sidebar-nav-btn:active {
                    transform: scale(0.98);
                }
            `}} />

            {/* Sidebar Navigation */}
            <aside style={{
                width: isSidebarCollapsed ? '72px' : '260px',
                background: 'var(--white)',
                borderRight: '1px solid var(--border)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: isSidebarCollapsed ? '1.5rem 0.75rem' : '1.5rem',
                flexShrink: 0,
                height: '100%',
                boxSizing: 'border-box',
                transition: 'width 0.2s cubic-bezier(0.4, 0, 0.2, 1), padding 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                alignItems: isSidebarCollapsed ? 'center' : 'stretch'
            }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', width: '100%' }}>
                    {/* Brand Logo & Collapse Toggle */}
                    {isSidebarCollapsed ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', width: '100%' }}>
                            <span style={{ color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Whatsapp AI Bot Creator">
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                                </svg>
                            </span>
                            <button 
                                type="button" 
                                onClick={() => setIsSidebarCollapsed(false)} 
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    color: 'var(--muted)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    padding: '0.25rem',
                                    borderRadius: '4px',
                                    width: 'auto'
                                }}
                                title="Expand Sidebar"
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="9 18 15 12 9 6" />
                                </svg>
                            </button>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                                <span className="logo" style={{ fontSize: '1.02rem', fontWeight: 700, whiteSpace: 'nowrap' }}>Whatsapp AI Bot <span style={{ color: 'var(--primary)' }}>Creator</span></span>
                                <span style={{ fontSize: '0.62rem', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '-2px' }}>Admin Dashboard</span>
                            </div>
                            <button 
                                type="button" 
                                onClick={() => setIsSidebarCollapsed(true)} 
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    color: 'var(--muted)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    padding: '0.25rem',
                                    borderRadius: '4px',
                                    width: 'auto'
                                }}
                                title="Collapse Sidebar"
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="15 18 9 12 15 6" />
                                </svg>
                            </button>
                        </div>
                    )}

                    {/* Navigation Menu */}
                    <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', width: '100%' }}>
                        <button 
                            type="button" 
                            onClick={() => { setActiveView('chat'); setActiveChatJid(null); }} 
                            style={{ 
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: isSidebarCollapsed ? 'center' : 'flex-start',
                                gap: isSidebarCollapsed ? '0' : '0.75rem',
                                width: '100%',
                                textAlign: 'left',
                                fontSize: '0.8rem', 
                                fontWeight: 600, 
                                padding: isSidebarCollapsed ? '0.7rem 0' : '0.7rem 0.85rem',
                                borderRadius: 'var(--radius-sm)',
                                background: activeView === 'chat' ? 'var(--primary)' : 'transparent',
                                color: activeView === 'chat' ? '#171717' : 'var(--text)',
                                border: '1px solid',
                                borderColor: activeView === 'chat' ? 'var(--primary)' : 'transparent',
                                cursor: 'pointer',
                                transition: 'all 0.15s ease'
                            }}
                            className={`sidebar-nav-btn ${activeView === 'chat' ? 'active' : ''}`}
                            title={isSidebarCollapsed ? "Status & Logs" : ""}
                        >
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                                <line x1="9" y1="9" x2="15" y2="9"/>
                                <line x1="9" y1="13" x2="15" y2="13"/>
                                <line x1="9" y1="17" x2="11" y2="17"/>
                            </svg>
                            {!isSidebarCollapsed && <span>Status & Logs</span>}
                        </button>
                        
                        <button 
                            type="button" 
                            onClick={() => { setActiveView('responder'); setActiveChatJid(null); }} 
                            style={{ 
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: isSidebarCollapsed ? 'center' : 'flex-start',
                                gap: isSidebarCollapsed ? '0' : '0.75rem',
                                width: '100%',
                                textAlign: 'left',
                                fontSize: '0.8rem', 
                                fontWeight: 600, 
                                padding: isSidebarCollapsed ? '0.7rem 0' : '0.7rem 0.85rem',
                                borderRadius: 'var(--radius-sm)',
                                background: activeView === 'responder' ? 'var(--primary)' : 'transparent',
                                color: activeView === 'responder' ? '#171717' : 'var(--text)',
                                border: '1px solid',
                                borderColor: activeView === 'responder' ? 'var(--primary)' : 'transparent',
                                cursor: 'pointer',
                                transition: 'all 0.15s ease'
                            }}
                            className={`sidebar-nav-btn ${activeView === 'responder' ? 'active' : ''}`}
                            title={isSidebarCollapsed ? "Individual Responder" : ""}
                        >
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                <circle cx="12" cy="7" r="4" />
                            </svg>
                            {!isSidebarCollapsed && <span>Individual Responder</span>}
                        </button>
                        
                        <button 
                            type="button" 
                            onClick={() => { setActiveView('business'); setActiveChatJid(null); }} 
                            style={{ 
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: isSidebarCollapsed ? 'center' : 'flex-start',
                                gap: isSidebarCollapsed ? '0' : '0.75rem',
                                width: '100%',
                                textAlign: 'left',
                                fontSize: '0.8rem', 
                                fontWeight: 600, 
                                padding: isSidebarCollapsed ? '0.7rem 0' : '0.7rem 0.85rem',
                                borderRadius: 'var(--radius-sm)',
                                background: activeView === 'business' ? 'var(--primary)' : 'transparent',
                                color: activeView === 'business' ? '#171717' : 'var(--text)',
                                border: '1px solid',
                                borderColor: activeView === 'business' ? 'var(--primary)' : 'transparent',
                                cursor: 'pointer',
                                transition: 'all 0.15s ease'
                            }}
                            className={`sidebar-nav-btn ${activeView === 'business' ? 'active' : ''}`}
                            title={isSidebarCollapsed ? "Business Autopilot" : ""}
                        >
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                            </svg>
                            {!isSidebarCollapsed && <span>Business Autopilot</span>}
                        </button>
                    </nav>
                </div>

                {/* Sidebar Footer */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%', alignItems: isSidebarCollapsed ? 'center' : 'stretch' }}>
                    <button 
                        type="button" 
                        onClick={toggleTheme} 
                        style={{ 
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: isSidebarCollapsed ? 'center' : 'flex-start',
                            gap: isSidebarCollapsed ? '0' : '0.75rem',
                            width: '100%',
                            fontSize: '0.75rem', 
                            fontWeight: 600, 
                            padding: isSidebarCollapsed ? '0.55rem 0' : '0.55rem 0.75rem',
                            borderRadius: 'var(--radius-sm)',
                            background: 'var(--canvas-soft)',
                            color: 'var(--text)',
                            border: '1px solid var(--border)',
                            cursor: 'pointer'
                        }}
                        title={isSidebarCollapsed ? (theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode") : ""}
                    >
                        {theme === 'dark' ? (
                            <>
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ flexShrink: 0 }}>
                                    <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                                </svg>
                                {!isSidebarCollapsed && <span>Light Mode</span>}
                            </>
                        ) : (
                            <>
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ flexShrink: 0 }}>
                                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                                </svg>
                                {!isSidebarCollapsed && <span>Dark Mode</span>}
                            </>
                        )}
                    </button>
                    
                    <button 
                        type="button" 
                        onClick={handleLogout} 
                        style={{ 
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: isSidebarCollapsed ? 'center' : 'flex-start',
                            gap: isSidebarCollapsed ? '0' : '0.75rem',
                            width: '100%',
                            fontSize: '0.75rem', 
                            fontWeight: 600, 
                            padding: isSidebarCollapsed ? '0.55rem 0' : '0.55rem 0.75rem',
                            borderRadius: 'var(--radius-sm)',
                            background: 'rgba(239, 68, 68, 0.1)',
                            color: '#ef4444',
                            border: '1px solid rgba(239, 68, 68, 0.2)',
                            cursor: 'pointer'
                        }}
                        title={isSidebarCollapsed ? "Logout" : ""}
                    >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ flexShrink: 0 }}>
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>
                        </svg>
                        {!isSidebarCollapsed && <span>Logout</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content Pane */}
            <div style={{ flex: 1, height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <main className="container" style={{ 
                    display: 'grid', 
                    gridTemplateColumns: activeView === 'business' ? '1fr 1.5fr' : '1fr 1fr',
                    height: '100%',
                    width: '100%',
                    maxWidth: '100%',
                    padding: '1.5rem',
                    gap: '1.5rem',
                    margin: 0,
                    overflowY: 'hidden',
                    boxSizing: 'border-box'
                }}>
                {activeView === 'chat' && (
                    <>
                        {/* COL 1: Integration & System settings */}
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

                            <div className="card" id="system-settings-details">
                                <div style={{ fontWeight: 600, borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>System & API Settings</div>
                                <div className="details-content" style={{ marginTop: '15px' }}>
                                    <div className="field">
                                        <label htmlFor="gemini-key">API Key</label>
                                        <input type="password" id="gemini-key" placeholder="Paste your API key here" value={geminiKey} onChange={(e) => setGeminiKey(e.target.value)} />
                                    </div>
                                    
                                    <div className="field">
                                        <label htmlFor="gemini-model">Model Engine</label>
                                        <div className="row-btns" style={{ display: 'flex', gap: '0.5rem' }}>
                                            <select id="gemini-model" value={geminiModel} onChange={(e) => setGeminiModel(e.target.value)} style={{ flex: 1 }}>
                                                <option value="gemma-4-31b-it">gemma-4-31b-it (1500 req/day)</option>
                                                <option value="gemma-4-26b-a4b-it">gemma-4-26b-a4b-it (1500 req/day)</option>
                                                <option value="gemini-3.1-flash-lite">gemini-3.1-flash-lite (500 req/day)</option>
                                                <option value="gemini-2.5-flash">gemini-2.5-flash (20 req/day)</option>
                                                <option value="gemini-2.5-flash-lite">gemini-2.5-flash-lite (20 req/day)</option>
                                                <option value="gemini-2.5-pro">gemini-2.5-pro (limited)</option>
                                                <option value="gemini-1.5-flash">gemini-1.5-flash (legacy)</option>
                                            </select>
                                            <button type="button" onClick={saveEngineSettings} className="btn-sm btn-primary" style={{ width: 'auto' }}>Save Engine</button>
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
                )}

                {activeView === 'responder' && (
                    <>
                        {/* COL 1: Form to Manage Rules */}
                        <div className="column-left">
                            <div className="card">
                                <div className="panel-title">Manage AI Auto-Responder JIDs</div>
                                <div className="field">
                                    <label htmlFor="ai-number">Target WhatsApp JID</label>
                                    <input type="text" id="ai-number" placeholder="e.g. 918849561649@s.whatsapp.net or 120363294328@g.us" value={targetJid} onChange={(e) => setTargetJid(e.target.value)} />
                                    <div className="hint" style={{ fontSize: '0.68rem', color: 'var(--muted)', marginTop: '4px' }}>
                                        Enter the exact WhatsApp JID. You can click <strong>Use JID</strong> inside any active chat detail view in the Chats tab to copy it instantly here.
                                    </div>
                                </div>
                                
                                <div className="field">
                                    <label htmlFor="ai-prompt-template">Preset Talk Style</label>
                                    <select id="ai-prompt-template" value={talkingStylePreset} onChange={(e) => setTalkingStylePreset(e.target.value)}>
                                        <option value="">— Pick a preset template —</option>
                                        <option value="Reply in a highly sarcastic, witty, and slightly roasty tone. Use informal slang.">Sarcastic & Witty</option>
                                        <option value="Talk like a pirate! Use words like 'Ahoy', 'Matey', 'Ye', and 'Arrgh'.">Pirate Captain</option>
                                        <option value="You are a professional corporate assistant. Be extremely formal, polite, and brief.">Formal Corporate</option>
                                        <option value="Shayari style - reply poetically, combining Hindi and Urdu keywords.">Poetic Shayari</option>
                                        <option value="Use Gen-Z slang (no cap, bet, fr fr, lowkey, skibidi, rizz, gyatt). Keep it casual.">Gen-Z Slang</option>
                                        <option value="Reply purely in emojis representing the message content.">Emoji Only</option>
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

                                <button type="button" onClick={handleAddContactConfig} className="btn-primary" style={{ marginTop: '15px' }}>Add / Update Contact Config</button>
                            </div>
                        </div>

                        {/* COL 2: Active Rules configurations OR Live Chat Detail */}
                        <div className="column-right" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', height: '100%', overflow: 'hidden' }}>
                            {activeChatJid ? (
                                <div id="chat-detail-screen" className="card feed-panel" style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                                    <div className="panel-title" style={{ padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', borderBottom: '1px solid var(--border)' }}>
                                        <button type="button" onClick={() => setActiveChatJid(null)} className="select-sender-btn" style={{ margin: 0, padding: '0.25rem 0.6rem', fontSize: '0.72rem' }}>
                                            &larr; Back to List
                                        </button>
                                        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.25, flex: 1, minWidth: 0 }}>
                                            <span id="detail-chat-title" style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {recentChats.find(c => c.chat_jid === activeChatJid)?.sender_name || activeChatJid.split('@')[0]}
                                            </span>
                                            <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', marginTop: '0.15rem' }}>
                                                <span id="detail-chat-jid" style={{ fontSize: '0.65rem', color: 'var(--dim)', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '140px' }}>
                                                    {activeChatJid}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div id="detail-chat-history" className="feed-box" style={{ flex: 1, overflowY: 'auto', padding: '1.2rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.85rem', background: 'var(--bg)' }}>
                                        {activeChatMessages.map((msg, idx) => (
                                            <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.is_from_me ? 'flex-end' : 'flex-start' }}>
                                                <div style={{ maxWidth: '75%', padding: '0.55rem 0.8rem', borderRadius: '12px', background: msg.is_from_me ? 'var(--primary)' : 'var(--white)', color: msg.is_from_me ? '#171717' : 'var(--text)', border: msg.is_from_me ? 'none' : '1px solid var(--border)', fontSize: '0.78rem', lineBreak: 'anywhere' }}>
                                                    {msg.message_text}
                                                </div>
                                                <span style={{ fontSize: '0.58rem', color: 'var(--dim)', marginTop: '2px', padding: '0 4px' }}>
                                                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        ))}
                                        <div ref={chatHistoryEndRef} />
                                    </div>

                                    <form onSubmit={handleSendQuickReply} style={{ padding: '0.75rem 1.25rem', borderTop: '1px solid var(--border)', background: 'var(--white)', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                        <input type="text" placeholder="Type a message..." value={replyText} onChange={(e) => setReplyText(e.target.value)} required style={{ flex: 1, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '0.5rem 0.75rem', color: 'var(--text)', fontSize: '0.78rem', outline: 'none' }} />
                                        <button type="submit" className="btn-sm" style={{ width: 'auto', background: 'var(--primary)', color: '#171717', fontWeight: 600, padding: '0.5rem 0.85rem', fontSize: '0.75rem' }}>
                                            SEND
                                        </button>
                                    </form>
                                </div>
                            ) : (
                                <>
                                    {/* Active JID Configurations Card */}
                                    <div className="card" style={{ flex: '1 1 0%', minHeight: '200px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                                        <div className="panel-title" style={{ paddingBottom: '0.5rem', borderBottom: '1px solid var(--border)' }}>Active AI JID Configurations</div>
                                        <div id="ai-contacts-list" className="contacts-list-container" style={{ flex: 1, overflowY: 'auto', marginTop: '0.75rem' }}>
                                            {aiContacts.length === 0 ? (
                                                <div className="empty-state">No auto-responder configurations added.</div>
                                            ) : (
                                                aiContacts.map((c, i) => (
                                                    <div key={i} className="ai-contact-row" onClick={() => handleEditConfig(c)} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }} title="Click to edit configuration">
                                                        <div className="contact-info" style={{ flex: 1 }}>
                                                            <span className="contact-number" style={{ fontWeight: 600 }}>{c.number}</span>
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
                                                                }} 
                                                                className="btn-sm btn-primary" 
                                                                style={{ 
                                                                    width: 'auto', 
                                                                    fontSize: '0.7rem', 
                                                                    fontWeight: 600, 
                                                                    padding: '0.25rem 0.55rem',
                                                                    display: 'inline-flex',
                                                                    alignItems: 'center',
                                                                    gap: '4px',
                                                                    margin: 0
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

                                    {/* Recent Conversations (Inbox) Card */}
                                    <div className="card" style={{ flex: '1.5 1 0%', minHeight: '250px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                                        <div className="panel-title" style={{ paddingBottom: '0.5rem', borderBottom: '1px solid var(--border)' }}>Recent Conversations (Inbox)</div>
                                        <div id="chat-list" className="feed-box" style={{ flex: 1, overflowY: 'auto', marginTop: '0.75rem', gap: '0.5rem', display: 'flex', flexDirection: 'column' }}>
                                            {recentChats.length === 0 ? (
                                                <div className="empty-state">No conversations captured yet.</div>
                                            ) : (
                                                recentChats.map((chat, idx) => (
                                                    <div key={idx} className="chat-thread-row" onClick={() => setActiveChatJid(chat.chat_jid)} style={{ cursor: 'pointer', padding: '0.65rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', display: 'flex', gap: '0.5rem', alignItems: 'center', position: 'relative', background: 'var(--canvas-soft)' }}>
                                                        <div style={{ flex: 1, minWidth: 0 }}>
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                                                <span style={{ fontWeight: 600, fontSize: '0.78rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                                    {chat.sender_name || chat.chat_jid.split('@')[0]}
                                                                </span>
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
                                                                    background: 'none', 
                                                                    border: 'none', 
                                                                    color: 'var(--muted)', 
                                                                    fontSize: '0.9rem', 
                                                                    cursor: 'pointer', 
                                                                    padding: '0.2rem 0.4rem', 
                                                                    borderRadius: '4px',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    transition: 'color 0.15s, background-color 0.15s'
                                                                }}
                                                                className="options-trigger-btn"
                                                            >
                                                                ⋮
                                                            </button>
                                                            {openDropdownJid === chat.chat_jid && (
                                                                <div 
                                                                    style={{ 
                                                                        position: 'absolute', 
                                                                        right: 0, 
                                                                        top: '100%', 
                                                                        marginTop: '4px',
                                                                        background: 'var(--white)', 
                                                                        border: '1px solid var(--border)', 
                                                                        borderRadius: 'var(--radius-sm)', 
                                                                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)', 
                                                                        zIndex: 100,
                                                                        minWidth: '100px'
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
                                                                            width: '100%', 
                                                                            textAlign: 'left', 
                                                                            background: 'none', 
                                                                            border: 'none', 
                                                                            padding: '0.55rem 0.75rem', 
                                                                            color: '#ef4444', 
                                                                            fontSize: '0.75rem', 
                                                                            cursor: 'pointer',
                                                                            fontWeight: 600
                                                                        }}
                                                                        className="dropdown-menu-item delete-chat-btn"
                                                                    >
                                                                        Delete Chat
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </>
                )}

                {activeView === 'business' && (
                    <>
                        {/* COL 1: Business configurations & Exclusion List */}
                        <div className="column-left" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            {/* Business Autopilot Settings Card */}
                            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text)' }}>Business Autopilot</span>
                                        <span style={{ fontSize: '0.68rem', color: 'var(--muted)' }}>Global auto-responder fallback</span>
                                    </div>
                                    
                                    {/* Toggle Switch */}
                                    <label style={{ display: 'inline-flex', alignItems: 'center', cursor: 'pointer', position: 'relative' }}>
                                        <input 
                                            type="checkbox" 
                                            checked={businessEnabled} 
                                            onChange={(e) => handleToggleBusiness(e.target.checked)} 
                                            style={{ display: 'none' }}
                                        />
                                        <span style={{
                                            width: '42px',
                                            height: '24px',
                                            background: businessEnabled ? 'var(--primary)' : 'var(--border)',
                                            borderRadius: '12px',
                                            position: 'relative',
                                            transition: 'background-color 0.2s',
                                            display: 'inline-block'
                                        }}>
                                            <span style={{
                                                width: '18px',
                                                height: '18px',
                                                background: businessEnabled ? '#171717' : 'var(--text)',
                                                borderRadius: '50%',
                                                position: 'absolute',
                                                top: '3px',
                                                left: businessEnabled ? '21px' : '3px',
                                                transition: 'left 0.2s, background-color 0.2s'
                                            }} />
                                        </span>
                                    </label>
                                </div>

                                <div className="field">
                                    <label htmlFor="biz-prompt">Business Knowledge & Description</label>
                                    <textarea 
                                        id="biz-prompt" 
                                        rows={4} 
                                        placeholder="Describe your business, services, pricing, hours, or any other global context. The AI will use this description to formulate answers." 
                                        value={businessPrompt} 
                                        onChange={(e) => setBusinessPrompt(e.target.value)}
                                        style={{ resize: 'vertical' }}
                                    />
                                    <span className="hint" style={{ fontSize: '0.68rem', color: 'var(--muted)', marginTop: '4px', display: 'block' }}>
                                        Provide detailed company info. If customers ask matching QA pairs, the spreadsheet answers are used first; otherwise Gemini falls back to this context.
                                    </span>
                                </div>

                                <div className="field">
                                    <label htmlFor="biz-style">Business Reply Style / Tone</label>
                                    <input 
                                        type="text" 
                                        id="biz-style" 
                                        placeholder="e.g. Reply as a polite customer support agent. Keep answers under 2 sentences." 
                                        value={businessStyle} 
                                        onChange={(e) => setBusinessStyle(e.target.value)}
                                    />
                                </div>

                                <button 
                                    type="button" 
                                    onClick={handleSaveBusinessSettings} 
                                    className="btn-primary" 
                                    style={{ marginTop: '0.5rem' }}
                                >
                                    Save Autopilot Settings
                                </button>
                            </div>

                            {/* Exclusion Ignore List Card */}
                            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
                                    <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text)' }}>Exclusion List</span>
                                    <p style={{ fontSize: '0.68rem', color: 'var(--muted)', marginTop: '2px' }}>
                                        Phone numbers or JIDs listed here will NOT be replied to by the global Business Autopilot.
                                    </p>
                                </div>

                                <form onSubmit={handleAddExclusion} style={{ display: 'flex', gap: '0.5rem' }}>
                                    <input 
                                        type="text" 
                                        placeholder="e.g. 918849561649" 
                                        value={exclusionInput} 
                                        onChange={(e) => setExclusionInput(e.target.value)}
                                        style={{ flex: 1, margin: 0, padding: '0.35rem 0.6rem', fontSize: '0.78rem' }}
                                    />
                                    <button 
                                        type="submit" 
                                        className="btn-sm btn-primary"
                                        style={{ width: 'auto', padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
                                    >
                                        + Add
                                    </button>
                                </form>

                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', maxHeight: '150px', overflowY: 'auto', padding: '0.2rem 0' }}>
                                    {businessExcludeContacts.length === 0 ? (
                                        <span style={{ fontSize: '0.72rem', color: 'var(--dim)', fontStyle: 'italic' }}>No numbers excluded. Autopilot will reply to all.</span>
                                    ) : (
                                        businessExcludeContacts.map((num, idx) => (
                                            <div 
                                                key={idx} 
                                                style={{ 
                                                    display: 'inline-flex', 
                                                    alignItems: 'center', 
                                                    gap: '0.3rem', 
                                                    background: 'var(--canvas-soft)', 
                                                    border: '1px solid var(--border)', 
                                                    borderRadius: '4px', 
                                                    padding: '0.2rem 0.45rem', 
                                                    fontSize: '0.72rem',
                                                    color: 'var(--text)'
                                                }}
                                            >
                                                <span>{num}</span>
                                                <button 
                                                    type="button" 
                                                    onClick={() => handleRemoveExclusion(num)}
                                                    style={{ 
                                                        background: 'none', 
                                                        border: 'none', 
                                                        color: '#ef4444', 
                                                        cursor: 'pointer', 
                                                        padding: 0, 
                                                        fontWeight: 800,
                                                        fontSize: '0.8rem',
                                                        lineHeight: 1
                                                    }}
                                                >
                                                    &times;
                                                </button>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* COL 2: Business Knowledge Base spreadsheet UI */}
                        <div className="column-right">
                            <div className="card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                <div>
                                    <h2 style={{ fontSize: '1.15rem', fontWeight: 700, letterSpacing: '-0.3px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <span>Business Knowledge Base</span>
                                        <span style={{ 
                                            fontSize: '0.68rem', 
                                            fontWeight: 600, 
                                            background: 'rgba(62, 207, 142, 0.15)', 
                                            color: 'var(--primary)', 
                                            padding: '0.15rem 0.45rem', 
                                            borderRadius: '4px' 
                                        }}>
                                            Spreadsheet UI
                                        </span>
                                    </h2>
                                    <p style={{ fontSize: '0.78rem', color: 'var(--muted)', marginTop: '0.35rem' }}>
                                        Define customer queries/keywords and how the bot should reply. Updates are live in real-time.
                                    </p>
                                </div>

                                {/* Spreadsheet Table Container */}
                                <div style={{ 
                                    overflowX: 'auto', 
                                    border: '1px solid var(--border)', 
                                    borderRadius: 'var(--radius-md)',
                                    background: 'var(--canvas-soft)'
                                }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', textAlign: 'left' }}>
                                        <thead>
                                            <tr style={{ background: 'var(--white)', borderBottom: '1px solid var(--border)' }}>
                                                <th style={{ padding: '0.75rem 1rem', color: 'var(--muted)', fontWeight: 600, width: '60px' }}>No.</th>
                                                <th style={{ padding: '0.75rem 1rem', color: 'var(--muted)', fontWeight: 600, width: '30%' }}>Trigger Keyword / Customer Question</th>
                                                <th style={{ padding: '0.75rem 1rem', color: 'var(--muted)', fontWeight: 600 }}>Bot Response / Answer</th>
                                                <th style={{ padding: '0.75rem 1rem', color: 'var(--muted)', fontWeight: 600, width: '140px', textAlign: 'center' }}>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {knowledgeRows.length === 0 ? (
                                                <tr>
                                                    <td colSpan="4" style={{ padding: '2rem', textAlign: 'center', color: 'var(--dim)', background: 'var(--white)' }}>
                                                        Your business knowledge base is empty. Add your first QA pair below.
                                                    </td>
                                                </tr>
                                            ) : (
                                                knowledgeRows.map((row, index) => {
                                                    const isEditing = editingRowId === row.id;
                                                    return (
                                                        <tr key={row.id} className="knowledge-row" style={{ 
                                                            background: 'var(--white)', 
                                                            borderBottom: '1px solid var(--border)',
                                                            transition: 'background-color 0.15s ease'
                                                        }}>
                                                            <td style={{ padding: '0.85rem 1rem', color: 'var(--dim)', fontWeight: 500 }}>{index + 1}</td>
                                                            <td style={{ padding: '0.85rem 1rem', verticalAlign: 'middle' }}>
                                                                {isEditing ? (
                                                                    <input 
                                                                        type="text" 
                                                                        value={editTrigger} 
                                                                        onChange={(e) => setEditTrigger(e.target.value)} 
                                                                        style={{ padding: '0.35rem 0.6rem', fontSize: '0.8rem', margin: 0 }}
                                                                    />
                                                                ) : (
                                                                    <span style={{ fontWeight: 600, color: 'var(--text)' }}>{row.trigger_pattern}</span>
                                                                )}
                                                            </td>
                                                            <td style={{ padding: '0.85rem 1rem', verticalAlign: 'middle' }}>
                                                                {isEditing ? (
                                                                    <textarea 
                                                                        value={editResponse} 
                                                                        onChange={(e) => setEditResponse(e.target.value)} 
                                                                        rows={1}
                                                                        style={{ padding: '0.35rem 0.6rem', fontSize: '0.8rem', margin: 0, resize: 'vertical' }}
                                                                    />
                                                                ) : (
                                                                    <span style={{ color: 'var(--muted)', whiteSpace: 'pre-wrap' }}>{row.response_text}</span>
                                                                )}
                                                            </td>
                                                            <td style={{ padding: '0.85rem 1rem', textAlign: 'center', verticalAlign: 'middle' }}>
                                                                {isEditing ? (
                                                                    <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center' }}>
                                                                        <button 
                                                                            type="button" 
                                                                            onClick={() => handleUpdateKnowledge(row.id)} 
                                                                            className="btn-sm btn-primary"
                                                                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.7rem' }}
                                                                        >
                                                                            Save
                                                                        </button>
                                                                        <button 
                                                                            type="button" 
                                                                            onClick={() => setEditingRowId(null)} 
                                                                            className="btn-sm"
                                                                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.7rem' }}
                                                                        >
                                                                            Cancel
                                                                        </button>
                                                                    </div>
                                                                ) : (
                                                                    <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center' }}>
                                                                        <button 
                                                                            type="button" 
                                                                            onClick={() => startEditKnowledge(row)} 
                                                                            className="btn-sm"
                                                                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.7rem' }}
                                                                        >
                                                                            Edit
                                                                        </button>
                                                                        <button 
                                                                            type="button" 
                                                                            onClick={() => handleDeleteKnowledge(row.id)} 
                                                                            className="btn-sm"
                                                                            style={{ 
                                                                                padding: '0.25rem 0.5rem', 
                                                                                fontSize: '0.7rem', 
                                                                                color: '#ef4444', 
                                                                                borderColor: 'rgba(239, 68, 68, 0.2)',
                                                                                background: 'rgba(239, 68, 68, 0.05)'
                                                                            }}
                                                                        >
                                                                            Delete
                                                                        </button>
                                                                    </div>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    );
                                                })
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Add New Knowledge Row Section */}
                                <form onSubmit={handleAddKnowledge} className="card" style={{ 
                                    background: 'var(--canvas-soft)', 
                                    border: '1px solid var(--border)',
                                    borderRadius: 'var(--radius-md)',
                                    padding: '1.25rem',
                                    marginTop: '0.5rem'
                                }}>
                                    <div style={{ fontWeight: 600, fontSize: '0.78rem', marginBottom: '0.75rem', color: 'var(--text)' }}>
                                        Add New Knowledge Row
                                    </div>
                                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                        <div style={{ flex: '1', minWidth: '220px' }}>
                                            <label htmlFor="kb-new-trigger" style={{ fontSize: '0.72rem' }}>Trigger Pattern / Customer Question</label>
                                            <input 
                                                type="text" 
                                                id="kb-new-trigger" 
                                                placeholder="e.g. price list, delivery info, address" 
                                                value={newTrigger} 
                                                onChange={(e) => setNewTrigger(e.target.value)} 
                                                required
                                            />
                                        </div>
                                        <div style={{ flex: '2', minWidth: '300px' }}>
                                            <label htmlFor="kb-new-response" style={{ fontSize: '0.72rem' }}>Bot Response Text</label>
                                            <textarea 
                                                id="kb-new-response" 
                                                rows={1}
                                                placeholder="Enter the corresponding answer details here..." 
                                                value={newResponse} 
                                                onChange={(e) => setNewResponse(e.target.value)} 
                                                required
                                                style={{ minHeight: '38px', resize: 'vertical' }}
                                            />
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'flex-end', minWidth: '120px' }}>
                                            <button 
                                                type="submit" 
                                                className="btn-primary" 
                                                style={{ height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                            >
                                                + Add Row
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </>
                )}
            </main>
            </div>
        </div>
    );
}
