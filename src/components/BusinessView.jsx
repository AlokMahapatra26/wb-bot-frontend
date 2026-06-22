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

    // Parse DB rows into spreadsheet format on load
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

    const handleSheetChange = (newData) => {
        setSheetData(newData);
        setIsDirty(true);
        setSaveStatus(null);
    };

    const serializeRow = (cells) => {
        if (!cells) return '';
        const values = cells.map(c => (c?.value || '').trim());
        let lastIdx = -1;
        for (let i = values.length - 1; i >= 0; i--) {
            if (values[i]) { lastIdx = i; break; }
        }
        if (lastIdx === -1) return '';
        return values.slice(0, lastIdx + 1).join(' | ');
    };

    const handleSaveSheet = async () => {
        if (!supabase || !user) return;
        setSaving(true);
        setSaveStatus(null);

        try {
            const newContents = [];
            for (let i = 0; i < sheetData.length; i++) {
                const serialized = serializeRow(sheetData[i]);
                if (serialized) newContents.push(serialized);
            }

            const { error: deleteError } = await supabase
                .from('bot_knowledge')
                .delete()
                .eq('user_id', user.id);
            if (deleteError) throw deleteError;

            if (newContents.length > 0) {
                const insertRows = newContents.map(content => ({
                    user_id: user.id,
                    trigger_pattern: content,
                    response_text: content
                }));
                const { error: insertError } = await supabase
                    .from('bot_knowledge')
                    .insert(insertRows);
                if (insertError) throw insertError;
            }

            if (loadKnowledge) loadKnowledge(user.id);
            setIsDirty(false);
            setSaveStatus('saved');
        } catch (err) {
            console.error('Failed to save sheet:', err);
            setSaveStatus('error');
            alert('Failed to save: ' + err.message);
        } finally {
            setSaving(false);
        }
    };

    const columnLabels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').slice(0, DEFAULT_COLS);

    return (
        <>
            {/* COL 1: Business configurations & Exclusion List */}
            <div className="column-left" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text)' }}>Business Autopilot</span>
                            <span style={{ fontSize: '0.68rem', color: 'var(--muted)' }}>Global auto-responder fallback</span>
                        </div>
                        <ToggleSwitch checked={businessEnabled} onChange={handleToggleBusiness} />
                    </div>

                    <div className="field">
                        <label htmlFor="biz-prompt">Business Knowledge & Description</label>
                        <textarea 
                            id="biz-prompt" rows={4}
                            placeholder="Describe your business, services, pricing, hours, or any other global context." 
                            value={businessPrompt} onChange={(e) => setBusinessPrompt(e.target.value)}
                            style={{ resize: 'vertical' }}
                        />
                        <span className="hint" style={{ fontSize: '0.68rem', color: 'var(--muted)', marginTop: '4px', display: 'block' }}>
                            This + the knowledge sheet are both sent to AI as context.
                        </span>
                    </div>

                    <div className="field">
                        <label htmlFor="biz-style">Business Reply Style / Tone</label>
                        <input 
                            type="text" id="biz-style"
                            placeholder="e.g. Reply as a polite customer support agent. Keep answers under 2 sentences." 
                            value={businessStyle} onChange={(e) => setBusinessStyle(e.target.value)}
                        />
                    </div>

                    <button type="button" onClick={handleSaveBusinessSettings} className="btn-primary" style={{ marginTop: '0.5rem' }}>
                        Save Autopilot Settings
                    </button>
                </div>

                {/* Exclusion List Card */}
                <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text)' }}>Exclusion List</span>
                        <p style={{ fontSize: '0.68rem', color: 'var(--muted)', marginTop: '2px' }}>
                            Phone numbers or JIDs listed here will NOT be replied to by the global Business Autopilot.
                        </p>
                    </div>

                    <form onSubmit={handleAddExclusion} style={{ display: 'flex', gap: '0.5rem' }}>
                        <input 
                            type="text" placeholder="e.g. 918849561649" 
                            value={exclusionInput} onChange={(e) => setExclusionInput(e.target.value)}
                            style={{ flex: 1, margin: 0, padding: '0.35rem 0.6rem', fontSize: '0.78rem' }}
                        />
                        <button type="submit" className="btn-sm btn-primary" style={{ width: 'auto', padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}>
                            + Add
                        </button>
                    </form>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', maxHeight: '150px', overflowY: 'auto', padding: '0.2rem 0' }}>
                        {businessExcludeContacts.length === 0 ? (
                            <span style={{ fontSize: '0.72rem', color: 'var(--dim)', fontStyle: 'italic' }}>No numbers excluded. Autopilot will reply to all.</span>
                        ) : (
                            businessExcludeContacts.map((num, idx) => (
                                <div key={idx} style={{ 
                                    display: 'inline-flex', alignItems: 'center', gap: '0.3rem', 
                                    background: 'var(--canvas-soft)', border: '1px solid var(--border)', 
                                    borderRadius: '4px', padding: '0.2rem 0.45rem', fontSize: '0.72rem', color: 'var(--text)'
                                }}>
                                    <span>{num}</span>
                                    <button type="button" onClick={() => handleRemoveExclusion(num)} style={{ 
                                        background: 'none', border: 'none', color: '#ef4444', 
                                        cursor: 'pointer', padding: 0, fontWeight: 800, fontSize: '0.8rem', lineHeight: 1
                                    }}>&times;</button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* COL 2: Spreadsheet */}
            <div className="column-right" style={{ overflow: 'hidden' }}>
                <div className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', height: '100%', overflow: 'hidden' }}>
                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
                        <div>
                            <h2 style={{ fontSize: '1rem', fontWeight: 700, letterSpacing: '-0.3px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                Knowledge Sheet
                                <span style={{ 
                                    fontSize: '0.6rem', fontWeight: 600, 
                                    background: 'rgba(62, 207, 142, 0.15)', color: 'var(--primary)', 
                                    padding: '0.1rem 0.35rem', borderRadius: '3px' 
                                }}>
                                    Freeform
                                </span>
                            </h2>
                            <p style={{ fontSize: '0.7rem', color: 'var(--muted)', marginTop: '0.2rem' }}>
                                Write anything in cells. Hit Save Sheet when done.
                            </p>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                            {saveStatus === 'saved' && !isDirty && (
                                <span style={{ fontSize: '0.68rem', color: 'var(--primary)', fontWeight: 500 }}>
                                    ✓ Saved
                                </span>
                            )}
                            {isDirty && (
                                <span style={{ fontSize: '0.68rem', color: '#eab308', fontWeight: 500 }}>
                                    • Unsaved
                                </span>
                            )}
                            <button
                                type="button"
                                onClick={handleSaveSheet}
                                disabled={!isDirty || saving}
                                className="btn-primary"
                                style={{ 
                                    width: 'auto', padding: '0.4rem 1rem', 
                                    fontSize: '0.78rem', opacity: (!isDirty || saving) ? 0.5 : 1
                                }}
                            >
                                {saving ? 'Saving...' : 'Save Sheet'}
                            </button>
                        </div>
                    </div>

                    {/* Spreadsheet */}
                    <div className="sheet-wrapper" style={{ flex: 1, overflow: 'auto', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                        <Spreadsheet
                            data={sheetData}
                            onChange={handleSheetChange}
                            columnLabels={columnLabels}
                        />
                    </div>

                    {/* Footer */}
                    <div style={{ 
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        fontSize: '0.65rem', color: 'var(--dim)', flexShrink: 0
                    }}>
                        <span>{knowledgeRows.length} row{knowledgeRows.length !== 1 ? 's' : ''} in database</span>
                        <span>All content is passed to AI as knowledge context</span>
                    </div>
                </div>
            </div>

            {/* Spreadsheet style overrides */}
            <style>{`
                .sheet-wrapper .Spreadsheet {
                    font-family: var(--font);
                    font-size: 0.8rem;
                    --background-color: var(--white);
                    --border-color: var(--border);
                    --text-color: var(--text);
                }
                .sheet-wrapper .Spreadsheet__header {
                    background: var(--canvas-soft);
                    color: var(--dim);
                    font-size: 0.7rem;
                    min-width: 35px;
                }
                .sheet-wrapper .Spreadsheet__cell {
                    min-width: 100px;
                    height: 28px;
                    color: var(--text);
                }
                .sheet-wrapper .Spreadsheet__cell--selected {
                    outline: 2px solid var(--primary);
                    outline-offset: -1px;
                }
                .sheet-wrapper .Spreadsheet__active-cell input {
                    font-family: var(--font);
                    font-size: 0.8rem;
                    color: var(--text);
                    background: var(--white);
                }
                .sheet-wrapper table {
                    border-collapse: collapse;
                }
            `}</style>
        </>
    );
}
