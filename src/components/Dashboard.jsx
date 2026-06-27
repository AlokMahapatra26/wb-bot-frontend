import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import Sidebar from './Sidebar';
import StatusLogsView from './StatusLogsView';
import ResponderView from './ResponderView';
import BusinessView from './BusinessView';
import SettingsView from './SettingsView';
import InboxView from './InboxView';

export default function Dashboard({ supabaseUrl, supabaseAnonKey, botUrl: rawBotUrl }) {
    const botUrl = rawBotUrl ? rawBotUrl.replace(/\/+$/, '') : '';
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const [openDropdownJid, setOpenDropdownJid] = useState(null);
    const [showAuthPanel, setShowAuthPanel] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    const [botStatus, setBotStatus] = useState('disconnected');
    const [qrCode, setQrCode] = useState('');
    const [logs, setLogs] = useState([]);
    const [isBackendOnline, setIsBackendOnline] = useState(false);

    const [geminiKey, setGeminiKey] = useState('');
    const [geminiModel, setGeminiModel] = useState('gemini-2.5-flash');
    const [chatHistoryLimit, setChatHistoryLimit] = useState(10);
    const [aiContacts, setAiContacts] = useState([]);
    const [individualEnabled, setIndividualEnabled] = useState(true);

    const [recentChats, setRecentChats] = useState([]);
    const [activeChatJid, setActiveChatJid] = useState(null);
    const [activeChatMessages, setActiveChatMessages] = useState([]);
    const [replyText, setReplyText] = useState('');

    const [targetJid, setTargetJid] = useState('');
    const [contactName, setContactName] = useState('');
    const [talkingStylePreset, setTalkingStylePreset] = useState('');
    const [customTalkStyle, setCustomTalkStyle] = useState('');
    const [senderContext, setSenderContext] = useState('');
    const [contactContext, setContactContext] = useState('');
    const [allowBusinessKnowledge, setAllowBusinessKnowledge] = useState(false);

    const [theme, setTheme] = useState('dark');
    const [activeView, setActiveView] = useState('chat');

    const [businessEnabled, setBusinessEnabled] = useState(false);
    const [businessPrompt, setBusinessPrompt] = useState('');
    const [businessStyle, setBusinessStyle] = useState('');
    const [businessExcludeContacts, setBusinessExcludeContacts] = useState([]);
    const [exclusionInput, setExclusionInput] = useState('');

    const [knowledgeRows, setKnowledgeRows] = useState([]);
    const [customPresets, setCustomPresets] = useState([]);
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

            eventSource.onopen = () => {
                setIsBackendOnline(true);
            };

            eventSource.onmessage = (event) => {
                setIsBackendOnline(true);
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
                setIsBackendOnline(false);
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
                setChatHistoryLimit(data.chat_history_limit ?? 10);
                const rawContacts = data.ai_contacts || [];
                const isDisabled = rawContacts.some(c => c.number === '__SYSTEM_INDIVIDUAL_RESPONDER_DISABLED__');
                setIndividualEnabled(!isDisabled);
                setAiContacts(rawContacts.filter(c => c.number !== '__SYSTEM_INDIVIDUAL_RESPONDER_DISABLED__'));
                setBusinessEnabled(data.business_enabled ?? false);
                setBusinessPrompt(data.business_prompt || '');
                setBusinessStyle(data.business_style || '');
                setBusinessExcludeContacts(data.business_exclude_contacts || []);
                setCustomPresets(data.custom_presets || []);
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
            const { error } = await supabase.from('user_configs').update({ gemini_api_key: geminiKey, gemini_model: geminiModel, chat_history_limit: chatHistoryLimit }).eq('user_id', user.id);
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
        const instructions = customTalkStyle.trim() || talkingStylePreset;
        const updatedContact = { 
            number: targetJid.trim(),
            name: contactName.trim(),
            systemPrompt: instructions, 
            talkingStyle: instructions, 
            senderContext: '', 
            contactContext: '',
            allowBusinessKnowledge: !!allowBusinessKnowledge
        };
        const updatedList = [...aiContacts];
        const idx = updatedList.findIndex(c => c.number.trim().toLowerCase() === targetJid.trim().toLowerCase());
        if (idx !== -1) updatedList[idx] = { ...updatedList[idx], ...updatedContact }; else updatedList.push(updatedContact);
        const listToSave = [...updatedList];
        if (!individualEnabled) listToSave.push({ number: '__SYSTEM_INDIVIDUAL_RESPONDER_DISABLED__' });
        try {
            const { error } = await supabase.from('user_configs').update({ ai_contacts: listToSave }).eq('user_id', user.id);
            if (error) throw error;
            setAiContacts(updatedList); setTargetJid(''); setContactName(''); setTalkingStylePreset(''); setCustomTalkStyle(''); setSenderContext(''); setContactContext(''); setAllowBusinessKnowledge(false);
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

    const handleSaveCustomPreset = async (name, value) => {
        const updated = [...customPresets, { name, value }];
        try {
            const { error } = await supabase.from('user_configs').update({ custom_presets: updated }).eq('user_id', user.id);
            if (error) throw error;
            setCustomPresets(updated);
        } catch (err) { alert('Failed to save preset: ' + err.message); }
    };

    const handleDeleteCustomPreset = async (index) => {
        const updated = customPresets.filter((_, i) => i !== index);
        try {
            const { error } = await supabase.from('user_configs').update({ custom_presets: updated }).eq('user_id', user.id);
            if (error) throw error;
            setCustomPresets(updated);
        } catch (err) { alert('Failed to delete preset: ' + err.message); }
    };

    const handleToggleIndividualBot = async (jid) => {
        if (!jid) return;
        const cleanJid = jid.trim();
        
        const isIndividualDisabled = aiContacts.some(c => c.number === '__SYSTEM_INDIVIDUAL_RESPONDER_DISABLED__');
        
        const existingConfigIndex = aiContacts.findIndex(c => {
            const configNum = c.number.trim().toLowerCase();
            const remoteJid = cleanJid.toLowerCase();
            if (configNum === remoteJid) return true;
            const cleanConfig = configNum.replace(/\D/g, '');
            const cleanRemote = remoteJid.replace(/\D/g, '');
            return cleanConfig && cleanConfig.length >= 8 && cleanRemote.endsWith(cleanConfig);
        });
        
        const existingConfig = existingConfigIndex !== -1 ? aiContacts[existingConfigIndex] : null;
        
        const cleanRemote = cleanJid.replace(/\D/g, '');
        const isExcludedFromBusiness = businessExcludeContacts.some(exc => {
            const cleanExc = exc.trim().replace(/\D/g, '');
            return cleanExc && cleanRemote.endsWith(cleanExc);
        });
        
        const isCurrentlyActive = (existingConfig && !existingConfig.disabled) || 
                                  (!existingConfig && businessEnabled && !cleanJid.endsWith('@g.us') && !isExcludedFromBusiness);

        let updatedAiContacts = [...aiContacts];
        let updatedExcludeContacts = [...businessExcludeContacts];

        if (isCurrentlyActive) {
            if (existingConfigIndex !== -1) {
                updatedAiContacts[existingConfigIndex] = {
                    ...updatedAiContacts[existingConfigIndex],
                    disabled: true
                };
            } else {
                updatedAiContacts.push({
                    number: cleanJid,
                    systemPrompt: '',
                    talkingStyle: '',
                    senderContext: '',
                    contactContext: '',
                    allowBusinessKnowledge: false,
                    disabled: true
                });
            }
            
            if (businessEnabled && !cleanJid.endsWith('@g.us') && !isExcludedFromBusiness) {
                updatedExcludeContacts.push(cleanJid);
            }
        } else {
            if (existingConfigIndex !== -1) {
                updatedAiContacts[existingConfigIndex] = {
                    ...updatedAiContacts[existingConfigIndex],
                    disabled: false
                };
            } else {
                if (!businessEnabled || cleanJid.endsWith('@g.us')) {
                    updatedAiContacts.push({
                        number: cleanJid,
                        systemPrompt: 'Keep responses warm, friendly, helpful, and conversational. Use natural casual language with appropriate emojis.',
                        talkingStyle: 'Keep responses warm, friendly, helpful, and conversational. Use natural casual language with appropriate emojis.',
                        senderContext: '',
                        contactContext: '',
                        allowBusinessKnowledge: false,
                        disabled: false
                    });
                }
            }
            
            updatedExcludeContacts = updatedExcludeContacts.filter(exc => {
                const cleanExc = exc.trim().replace(/\D/g, '');
                return !(cleanExc && cleanRemote.endsWith(cleanExc));
            });
        }

        try {
            const { error } = await supabase.from('user_configs').update({
                ai_contacts: updatedAiContacts,
                business_exclude_contacts: updatedExcludeContacts
            }).eq('user_id', user.id);
            
            if (error) throw error;
            
            setAiContacts(updatedAiContacts);
            setBusinessExcludeContacts(updatedExcludeContacts);
        } catch (err) {
            console.error('Failed to toggle individual bot status:', err);
            alert('Failed to toggle bot status: ' + err.message);
        }
    };

    const handleEditConfig = (c) => {
        setTargetJid(c.number); setContactName(c.name || '');
        // Load all context into the single instructions field
        const combined = [c.systemPrompt, c.senderContext, c.contactContext].filter(Boolean).join('\n').trim();
        setCustomTalkStyle(combined);
        setAllowBusinessKnowledge(!!c.allowBusinessKnowledge);
        const presets = [];
        // Don't try to match old presets — just load into textarea
        setTalkingStylePreset('');
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

    const handleClearLogs = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const response = await fetch(`${botUrl}/api/logs/clear`, { 
                method: 'POST', 
                headers: { 
                    'Content-Type': 'application/json', 
                    'Authorization': `Bearer ${session?.access_token}` 
                } 
            });
            const result = await response.json();
            if (result.success) {
                setLogs([]);
            } else {
                alert('Clear logs failed: ' + result.error);
            }
        } catch (err) {
            alert('Clear logs error: ' + err.message);
        }
    };

    const handleClearAllChats = async () => {
        if (!confirm('Are you sure you want to clear ALL chat history? This cannot be undone.')) return;
        try {
            const { error } = await supabase.from('chat_logs').delete().eq('user_id', user.id);
            if (error) throw error;
            setRecentChats([]);
            setActiveChatJid(null);
            setActiveChatMessages([]);
            alert('All chat history cleared.');
        } catch (err) { alert('Failed to clear chats: ' + err.message); }
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
            <div style={{ display: 'flex', height: '100vh', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--color-surface-dark)', color: 'var(--color-error)', padding: 32, textAlign: 'center', fontFamily: 'var(--font-body)' }}>
                <h3 style={{ fontSize: 19, fontWeight: 500, letterSpacing: '-0.3px' }}>Dashboard Configuration Error</h3>
                <p style={{ color: 'var(--color-muted)', marginTop: 8, fontSize: 15 }}>Supabase URL or Anon Key was not loaded into the dashboard component.</p>
            </div>
        );
    }

    if (loading) {
        return (
            <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', background: 'var(--color-canvas)', color: 'var(--color-ink)' }}>
                <p style={{ fontSize: 14 }}>Verifying secure dashboard session...</p>
            </div>
        );
    }

    return (
        <div className="dashboard-root">
             <Sidebar
                activeView={activeView} setActiveView={setActiveView}
                setActiveChatJid={setActiveChatJid}
                isSidebarCollapsed={isSidebarCollapsed} setIsSidebarCollapsed={setIsSidebarCollapsed}
                theme={theme} toggleTheme={toggleTheme}
                handleLogout={handleLogout}
                hideResponderTab={hideResponderTab}
                hideBusinessTab={hideBusinessTab}
                isBackendOnline={isBackendOnline}
            />

            <div className="dashboard-content">
                {/* Backend sleeping banner */}
                {!isBackendOnline && (
                    <div style={{ padding: '10px 20px', background: 'rgba(212,160,23,0.1)', borderBottom: '1px solid rgba(212,160,23,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexShrink: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-warning)', flexShrink: 0 }}></span>
                            <span style={{ fontSize: 12, color: 'var(--color-ink)', fontWeight: 500 }}>Backend server is sleeping</span>
                            <span style={{ fontSize: 11, color: 'var(--color-muted)' }}>— Free tier on Render sleeps after 15min of inactivity</span>
                        </div>
                        <button type="button" onClick={async () => {
                            try {
                                const el = document.getElementById('wake-btn');
                                if (el) { el.textContent = 'Waking up...'; el.disabled = true; }
                                await fetch(`${botUrl}/api/health`).catch(() => {});
                                setTimeout(async () => {
                                    try { await fetch(`${botUrl}/api/health`); } catch {}
                                    if (el) { el.textContent = 'Wake Up Server'; el.disabled = false; }
                                }, 3000);
                            } catch {}
                        }} id="wake-btn" style={{ background: 'var(--color-warning)', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 14px', fontSize: 12, fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                            Wake Up Server
                        </button>
                    </div>
                )}
                <main className="dashboard-main" style={{
                    gridTemplateColumns: activeView === 'inbox' ? '1fr' : activeView === 'settings' ? '1.2fr 1fr' : activeView === 'business' ? '1fr 1.5fr' : '1fr 1fr',
                    gridAutoRows: 'auto'
                }}>
                    {activeView === 'chat' && (
                        <>
                            {/* Onboarding checklist */}
                            {(!geminiKey || botStatus !== 'connected' || aiContacts.length === 0) && (
                                <div style={{ gridColumn: '1 / -1', background: 'var(--color-surface-card)', border: '1px solid var(--color-hairline)', borderRadius: 10, padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-ink)' }}>Getting Started</span>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                        {/* Step 1 */}
                                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                                            <span style={{ width: 18, height: 18, borderRadius: 4, border: geminiKey ? 'none' : '1.5px solid var(--color-muted-soft)', background: geminiKey ? 'var(--color-success)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                                                {geminiKey && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
                                            </span>
                                            <div>
                                                <span style={{ fontSize: 12, fontWeight: 600, color: geminiKey ? 'var(--color-success)' : 'var(--color-ink)' }}>Add Gemini API Key</span>
                                                <p style={{ fontSize: 11, color: 'var(--color-muted)', lineHeight: 1.4, marginTop: 2 }}>Go to "Settings" tab → Gemini Engine Settings and paste your API key. <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary)', textDecoration: 'none' }}>Get a free key here →</a></p>
                                            </div>
                                        </div>
                                        {/* Step 2 */}
                                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                                            <span style={{ width: 18, height: 18, borderRadius: 4, border: botStatus === 'connected' ? 'none' : '1.5px solid var(--color-muted-soft)', background: botStatus === 'connected' ? 'var(--color-success)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                                                {botStatus === 'connected' && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
                                            </span>
                                            <div>
                                                <span style={{ fontSize: 12, fontWeight: 600, color: botStatus === 'connected' ? 'var(--color-success)' : 'var(--color-ink)' }}>Scan QR Code</span>
                                                <p style={{ fontSize: 11, color: 'var(--color-muted)', lineHeight: 1.4, marginTop: 2 }}>Open WhatsApp on your phone → Settings → Linked Devices → Scan the QR code shown below.</p>
                                            </div>
                                        </div>
                                        {/* Step 3 */}
                                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                                            <span style={{ width: 18, height: 18, borderRadius: 4, border: aiContacts.length > 0 ? 'none' : '1.5px solid var(--color-muted-soft)', background: aiContacts.length > 0 ? 'var(--color-success)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                                                {aiContacts.length > 0 && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
                                            </span>
                                            <div>
                                                <span style={{ fontSize: 12, fontWeight: 600, color: aiContacts.length > 0 ? 'var(--color-success)' : 'var(--color-ink)' }}>Configure AI for a Contact</span>
                                                <p style={{ fontSize: 11, color: 'var(--color-muted)', lineHeight: 1.4, marginTop: 2 }}>Wait for someone to message you — their JID will appear in "Chats" tab. Then go to "Individual Responder" and add that JID with a talk style.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <StatusLogsView 
                                botStatus={botStatus} qrCode={qrCode} handleDisconnectBot={handleDisconnectBot} 
                                logs={logs} handleClearLogs={handleClearLogs}
                                individualEnabled={individualEnabled} businessEnabled={businessEnabled}
                                aiContacts={aiContacts} knowledgeRows={knowledgeRows}
                            />
                        </>
                    )}


                    {activeView === 'inbox' && (
                        <InboxView
                            recentChats={recentChats}
                            activeChatJid={activeChatJid}
                            setActiveChatJid={setActiveChatJid}
                            activeChatMessages={activeChatMessages}
                            chatHistoryEndRef={chatHistoryEndRef}
                            replyText={replyText}
                            setReplyText={setReplyText}
                            handleSendQuickReply={handleSendQuickReply}
                            openDropdownJid={openDropdownJid}
                            setOpenDropdownJid={setOpenDropdownJid}
                            handleDeleteChat={handleDeleteChat}
                            setTargetJid={setTargetJid}
                            setActiveView={setActiveView}
                            aiContacts={aiContacts}
                            businessEnabled={businessEnabled}
                            businessExcludeContacts={businessExcludeContacts}
                            handleToggleIndividualBot={handleToggleIndividualBot}
                        />
                    )}

                    {activeView === 'responder' && (
                        <ResponderView
                            targetJid={targetJid} setTargetJid={setTargetJid}
                            contactName={contactName} setContactName={setContactName}
                            talkingStylePreset={talkingStylePreset} setTalkingStylePreset={setTalkingStylePreset}
                            customTalkStyle={customTalkStyle} setCustomTalkStyle={setCustomTalkStyle}
                            allowBusinessKnowledge={allowBusinessKnowledge} setAllowBusinessKnowledge={setAllowBusinessKnowledge}
                            handleAddContactConfig={handleAddContactConfig}
                            aiContacts={aiContacts} handleEditConfig={handleEditConfig} handleRemoveContactConfig={handleRemoveContactConfig}
                            setActiveChatJid={setActiveChatJid}
                            setActiveView={setActiveView}
                            customPresets={customPresets} handleSaveCustomPreset={handleSaveCustomPreset} handleDeleteCustomPreset={handleDeleteCustomPreset}
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
                            knowledgeRows={knowledgeRows} loadKnowledge={loadKnowledge}
                            supabase={supabase} user={user}
                        />
                    )}

                    {activeView === 'settings' && (
                        <SettingsView
                            individualEnabled={individualEnabled} handleToggleIndividual={handleToggleIndividual}
                            businessEnabled={businessEnabled} handleToggleBusiness={handleToggleBusiness}
                            geminiKey={geminiKey} setGeminiKey={setGeminiKey}
                            geminiModel={geminiModel} setGeminiModel={setGeminiModel}
                            chatHistoryLimit={chatHistoryLimit} setChatHistoryLimit={setChatHistoryLimit}
                            saveEngineSettings={saveEngineSettings}
                            handleClearAllChats={handleClearAllChats}
                            botStatus={botStatus} user={user} supabase={supabase}
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
