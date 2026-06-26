import React, { useState, useEffect } from 'react';
import Spreadsheet from 'react-spreadsheet';
import ToggleSwitch from './ToggleSwitch';

const DEFAULT_ROWS = 20;
const DEFAULT_COLS = 5;

export default function BusinessView({
    businessEnabled, handleToggleBusiness,
    businessPrompt, setBusinessPrompt,
    businessStyle, setBusinessStyle,
    handleSaveBusinessSettings,
    businessExcludeContacts, exclusionInput, setExclusionInput,
    handleAddExclusion, handleRemoveExclusion,
    knowledgeRows, loadKnowledge,
    supabase, user
}) {
    const [sheetData, setSheetData] = useState([]);
    const [isDirty, setIsDirty] = useState(false);
    const [saving, setSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState(null);

    useEffect(() => {
        const rows = [];
        const totalRows = Math.max(DEFAULT_ROWS, knowledgeRows.length + 5);
        for (let i = 0; i < totalRows; i++) {
            if (i < knowledgeRows.length) {
                const content = knowledgeRows[i].trigger_pattern || '';
                const cells = content.split('|').map(c => ({ value: c.trim() }));
                while (cells.length < DEFAULT_COLS) cells.push({ value: '' });
                rows.push(cells.slice(0, DEFAULT_COLS));
            } else {
                rows.push(Array.from({ length: DEFAULT_COLS }, () => ({ value: '' })));
            }
        }
        setSheetData(rows);
        setIsDirty(false);
        setSaveStatus(null);
    }, [knowledgeRows]);

    const handleSheetChange = (newData) => { setSheetData(newData); setIsDirty(true); setSaveStatus(null); };

    const serializeRow = (cells) => {
        if (!cells) return '';
        const values = cells.map(c => (c?.value || '').trim());
        let lastIdx = -1;
        for (let i = values.length - 1; i >= 0; i--) { if (values[i]) { lastIdx = i; break; } }
        if (lastIdx === -1) return '';
        return values.slice(0, lastIdx + 1).join(' | ');
    };

    const handleSaveSheet = async () => {
        if (!supabase || !user) return;
        setSaving(true); setSaveStatus(null);
        try {
            const newContents = [];
            for (let i = 0; i < sheetData.length; i++) {
                const serialized = serializeRow(sheetData[i]);
                if (serialized) newContents.push(serialized);
            }
            const { error: deleteError } = await supabase.from('bot_knowledge').delete().eq('user_id', user.id);
            if (deleteError) throw deleteError;
            if (newContents.length > 0) {
                const insertRows = newContents.map(content => ({ user_id: user.id, trigger_pattern: content, response_text: content }));
                const { error: insertError } = await supabase.from('bot_knowledge').insert(insertRows);
                if (insertError) throw insertError;
            }
            if (loadKnowledge) loadKnowledge(user.id);
            setIsDirty(false); setSaveStatus('saved');
        } catch (err) { console.error('Failed to save sheet:', err); setSaveStatus('error'); alert('Failed to save: ' + err.message); }
        finally { setSaving(false); }
    };

    const columnLabels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').slice(0, DEFAULT_COLS);

    return (
        <>
            {/* COL 1: Business configurations & Exclusion List */}
            <div style={{ display:'flex', flexDirection:'column', gap:20, overflowY:'auto', paddingRight:4 }}>
                <div style={{ background:'var(--color-surface-card)', border:'1px solid var(--color-hairline)', borderRadius:12, padding:32, display:'flex', flexDirection:'column', gap:16 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', borderBottom:'1px solid var(--color-hairline)', paddingBottom:12 }}>
                        <div style={{ display:'flex', flexDirection:'column' }}>
                            <span style={{ fontFamily:'var(--font-display)', fontSize:22, fontWeight:400, color:'var(--color-ink)', letterSpacing:'-0.3px' }}>Business Autopilot</span>
                            <span style={{ fontSize:13, color:'var(--color-muted)' }}>Global auto-responder fallback</span>
                        </div>
                        <ToggleSwitch checked={businessEnabled} onChange={handleToggleBusiness} />
                    </div>

                    <div>
                        <label htmlFor="biz-prompt" style={{ display:'block', fontSize:12, fontWeight:500, textTransform:'uppercase', letterSpacing:'1.5px', color:'var(--color-muted)', marginBottom:6 }}>Business Knowledge & Description</label>
                        <textarea 
                            id="biz-prompt" rows={4}
                            placeholder="Describe your business, services, pricing, hours, or any other global context." 
                            value={businessPrompt} onChange={(e) => setBusinessPrompt(e.target.value)}
                            style={{ width:'100%', paddingTop:10, paddingBottom:10, paddingLeft:14, paddingRight:14, fontFamily:'var(--font-body)', fontSize:14, border:'1px solid var(--color-hairline)', borderRadius:8, background:'var(--color-canvas)', color:'var(--color-ink)', outline:'none', resize:'vertical', transition:'border-color 0.2s' }}
                        />
                        <span style={{ fontSize:12, color:'var(--color-muted-soft)', marginTop:4, display:'block' }}>
                            This + the knowledge sheet are both sent to AI as context.
                        </span>
                    </div>

                    <div>
                        <label htmlFor="biz-style" style={{ display:'block', fontSize:12, fontWeight:500, textTransform:'uppercase', letterSpacing:'1.5px', color:'var(--color-muted)', marginBottom:6 }}>Business Reply Style / Tone</label>
                        <input 
                            type="text" id="biz-style"
                            placeholder="e.g. Reply as a polite customer support agent. Keep answers under 2 sentences." 
                            value={businessStyle} onChange={(e) => setBusinessStyle(e.target.value)}
                            style={{ width:'100%', paddingTop:10, paddingBottom:10, paddingLeft:14, paddingRight:14, fontFamily:'var(--font-body)', fontSize:14, border:'1px solid var(--color-hairline)', borderRadius:8, background:'var(--color-canvas)', color:'var(--color-ink)', outline:'none', height:40, transition:'border-color 0.2s' }}
                        />
                    </div>

                    <button type="button" onClick={handleSaveBusinessSettings} style={{ width:'100%', paddingTop:12, paddingBottom:12, paddingLeft:20, paddingRight:20, fontSize:14, fontWeight:500, borderRadius:8, background:'var(--color-primary)', color:'var(--color-on-primary)', border:'none', cursor:'pointer', marginTop:8, transition:'opacity 0.2s' }}>
                        Save Autopilot Settings
                    </button>
                </div>

                {/* Exclusion List Card */}
                <div style={{ background:'var(--color-surface-card)', border:'1px solid var(--color-hairline)', borderRadius:12, padding:32, display:'flex', flexDirection:'column', gap:16 }}>
                    <div style={{ borderBottom:'1px solid var(--color-hairline)', paddingBottom:12 }}>
                        <span style={{ fontSize:16, fontWeight:500, color:'var(--color-ink)' }}>Exclusion List</span>
                        <p style={{ fontSize:13, color:'var(--color-muted)', marginTop:4 }}>
                            Phone numbers or JIDs listed here will NOT be replied to by the global Business Autopilot.
                        </p>
                    </div>

                    <form onSubmit={handleAddExclusion} style={{ display:'flex', gap:8 }}>
                        <input 
                            type="text" placeholder="e.g. 918849561649" 
                            value={exclusionInput} onChange={(e) => setExclusionInput(e.target.value)}
                            style={{ flex:1, margin:0, paddingTop:10, paddingBottom:10, paddingLeft:14, paddingRight:14, fontSize:13, border:'1px solid var(--color-hairline)', borderRadius:8, background:'var(--color-canvas)', color:'var(--color-ink)', outline:'none', height:40, transition:'border-color 0.2s' }}
                        />
                        <button type="submit" style={{ width:'auto', paddingTop:12, paddingBottom:12, paddingLeft:20, paddingRight:20, fontSize:14, fontWeight:500, borderRadius:8, background:'var(--color-primary)', color:'var(--color-on-primary)', border:'none', cursor:'pointer', transition:'opacity 0.2s' }}>
                            + Add
                        </button>
                    </form>

                    <div style={{ display:'flex', flexWrap:'wrap', gap:6, maxHeight:150, overflowY:'auto', paddingTop:4, paddingBottom:4 }}>
                        {businessExcludeContacts.length === 0 ? (
                            <span style={{ fontSize:12, color:'var(--color-muted-soft)', fontStyle:'italic' }}>No numbers excluded. Autopilot will reply to all.</span>
                        ) : (
                            businessExcludeContacts.map((num, idx) => (
                                <div key={idx} style={{ display:'inline-flex', alignItems:'center', gap:4, background:'var(--color-canvas)', border:'1px solid var(--color-hairline)', borderRadius:4, paddingTop:2, paddingBottom:2, paddingLeft:8, paddingRight:8, fontSize:12, color:'var(--color-ink)' }}>
                                    <span>{num}</span>
                                    <button type="button" onClick={() => handleRemoveExclusion(num)} style={{ background:'transparent', border:'none', color:'var(--color-error)', cursor:'pointer', padding:0, fontWeight:800, fontSize:13, lineHeight:1, width:'auto' }}>&times;</button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* COL 2: Spreadsheet */}
            <div style={{ overflow:'hidden' }}>
                <div style={{ background:'var(--color-surface-card)', border:'1px solid var(--color-hairline)', borderRadius:12, padding:32, display:'flex', flexDirection:'column', gap:12, height:'100%', overflow:'hidden' }}>
                    {/* Header */}
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexShrink:0 }}>
                        <div>
                            <h2 style={{ fontFamily:'var(--font-display)', fontSize:22, fontWeight:400, letterSpacing:'-0.3px', display:'flex', alignItems:'center', gap:8, color:'var(--color-ink)' }}>
                                Knowledge Sheet
                                <span style={{ fontSize:10, fontWeight:600, background:'rgba(204,120,92,0.1)', color:'var(--color-primary)', paddingTop:2, paddingBottom:2, paddingLeft:6, paddingRight:6, borderRadius:9999 }}>
                                    Freeform
                                </span>
                            </h2>
                            <p style={{ fontSize:13, color:'var(--color-muted)', marginTop:4 }}>
                                Write anything in cells. Hit Save Sheet when done.
                            </p>
                        </div>
                        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                            {saveStatus === 'saved' && !isDirty && (
                                <span style={{ fontSize:11, color:'var(--color-success)', fontWeight:500 }}>✓ Saved</span>
                            )}
                            {isDirty && (
                                <span style={{ fontSize:11, color:'var(--color-warning)', fontWeight:500 }}>• Unsaved</span>
                            )}
                            <button
                                type="button"
                                onClick={handleSaveSheet}
                                disabled={!isDirty || saving}
                                style={{ width:'auto', paddingTop:12, paddingBottom:12, paddingLeft:20, paddingRight:20, fontSize:14, fontWeight:500, borderRadius:8, background:'var(--color-primary)', color:'var(--color-on-primary)', border:'none', cursor: (!isDirty || saving) ? 'not-allowed' : 'pointer', transition:'opacity 0.2s', opacity: (!isDirty || saving) ? 0.5 : 1 }}
                            >
                                {saving ? 'Saving...' : 'Save Sheet'}
                            </button>
                        </div>
                    </div>

                    {/* Spreadsheet */}
                    <div className="sheet-wrapper" style={{ flex:1, overflow:'auto', borderRadius:8, border:'1px solid var(--color-hairline)' }}>
                        <Spreadsheet
                            data={sheetData}
                            onChange={handleSheetChange}
                            columnLabels={columnLabels}
                        />
                    </div>

                    {/* Footer */}
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', fontSize:10, color:'var(--color-muted-soft)', flexShrink:0 }}>
                        <span>{knowledgeRows.length} row{knowledgeRows.length !== 1 ? 's' : ''} in database</span>
                        <span>All content is passed to AI as knowledge context</span>
                    </div>
                </div>
            </div>

            {/* Spreadsheet style overrides */}
            <style>{`
                .sheet-wrapper .Spreadsheet {
                    font-family: var(--font-body);
                    font-size: 13px;
                }
                .sheet-wrapper .Spreadsheet__header {
                    background: var(--color-surface-card) !important;
                    color: var(--color-muted) !important;
                    font-size: 11px;
                    min-width: 35px;
                    border: 1px solid var(--color-hairline) !important;
                }
                .sheet-wrapper .Spreadsheet__cell {
                    min-width: 100px;
                    height: 28px;
                    color: var(--color-ink) !important;
                    background: var(--color-canvas) !important;
                    border: 1px solid var(--color-hairline) !important;
                }
                .sheet-wrapper .Spreadsheet__cell--selected {
                    outline: 2px solid var(--color-primary) !important;
                    outline-offset: -1px;
                }
                .sheet-wrapper .Spreadsheet__active-cell input {
                    font-family: var(--font-body);
                    font-size: 13px;
                    color: var(--color-ink) !important;
                    background: var(--color-canvas) !important;
                }
                .sheet-wrapper table {
                    border-collapse: collapse;
                }
            `}</style>
        </>
    );
}
