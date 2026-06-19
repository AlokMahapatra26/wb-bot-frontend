import React from 'react';
import ToggleSwitch from './ToggleSwitch';

export default function BusinessView({
    businessEnabled, handleToggleBusiness,
    businessPrompt, setBusinessPrompt,
    businessStyle, setBusinessStyle,
    handleSaveBusinessSettings,
    businessExcludeContacts, exclusionInput, setExclusionInput,
    handleAddExclusion, handleRemoveExclusion,
    knowledgeRows, editingRowId, editTrigger, setEditTrigger, editResponse, setEditResponse,
    startEditKnowledge, handleUpdateKnowledge, setEditingRowId,
    handleDeleteKnowledge, handleAddKnowledge,
    newTrigger, setNewTrigger, newResponse, setNewResponse
}) {
    return (
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
                        <ToggleSwitch checked={businessEnabled} onChange={handleToggleBusiness} />
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
                                        display: 'inline-flex', alignItems: 'center', gap: '0.3rem', 
                                        background: 'var(--canvas-soft)', border: '1px solid var(--border)', 
                                        borderRadius: '4px', padding: '0.2rem 0.45rem', fontSize: '0.72rem',
                                        color: 'var(--text)'
                                    }}
                                >
                                    <span>{num}</span>
                                    <button 
                                        type="button" 
                                        onClick={() => handleRemoveExclusion(num)}
                                        style={{ 
                                            background: 'none', border: 'none', color: '#ef4444', 
                                            cursor: 'pointer', padding: 0, fontWeight: 800,
                                            fontSize: '0.8rem', lineHeight: 1
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
                                fontSize: '0.68rem', fontWeight: 600, 
                                background: 'rgba(62, 207, 142, 0.15)', color: 'var(--primary)', 
                                padding: '0.15rem 0.45rem', borderRadius: '4px' 
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
                        overflowX: 'auto', border: '1px solid var(--border)', 
                        borderRadius: 'var(--radius-md)', background: 'var(--canvas-soft)'
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
                                                background: 'var(--white)', borderBottom: '1px solid var(--border)',
                                                transition: 'background-color 0.15s ease'
                                            }}>
                                                <td style={{ padding: '0.85rem 1rem', color: 'var(--dim)', fontWeight: 500 }}>{index + 1}</td>
                                                <td style={{ padding: '0.85rem 1rem', verticalAlign: 'middle' }}>
                                                    {isEditing ? (
                                                        <input type="text" value={editTrigger} onChange={(e) => setEditTrigger(e.target.value)} style={{ padding: '0.35rem 0.6rem', fontSize: '0.8rem', margin: 0 }} />
                                                    ) : (
                                                        <span style={{ fontWeight: 600, color: 'var(--text)' }}>{row.trigger_pattern}</span>
                                                    )}
                                                </td>
                                                <td style={{ padding: '0.85rem 1rem', verticalAlign: 'middle' }}>
                                                    {isEditing ? (
                                                        <textarea value={editResponse} onChange={(e) => setEditResponse(e.target.value)} rows={1} style={{ padding: '0.35rem 0.6rem', fontSize: '0.8rem', margin: 0, resize: 'vertical' }} />
                                                    ) : (
                                                        <span style={{ color: 'var(--muted)', whiteSpace: 'pre-wrap' }}>{row.response_text}</span>
                                                    )}
                                                </td>
                                                <td style={{ padding: '0.85rem 1rem', textAlign: 'center', verticalAlign: 'middle' }}>
                                                    {isEditing ? (
                                                        <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center' }}>
                                                            <button type="button" onClick={() => handleUpdateKnowledge(row.id)} className="btn-sm btn-primary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.7rem' }}>Save</button>
                                                            <button type="button" onClick={() => setEditingRowId(null)} className="btn-sm" style={{ padding: '0.25rem 0.5rem', fontSize: '0.7rem' }}>Cancel</button>
                                                        </div>
                                                    ) : (
                                                        <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center' }}>
                                                            <button type="button" onClick={() => startEditKnowledge(row)} className="btn-sm" style={{ padding: '0.25rem 0.5rem', fontSize: '0.7rem' }}>Edit</button>
                                                            <button type="button" onClick={() => handleDeleteKnowledge(row.id)} className="btn-sm" style={{ padding: '0.25rem 0.5rem', fontSize: '0.7rem', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.2)', background: 'rgba(239, 68, 68, 0.05)' }}>Delete</button>
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
                        background: 'var(--canvas-soft)', border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-md)', padding: '1.25rem', marginTop: '0.5rem'
                    }}>
                        <div style={{ fontWeight: 600, fontSize: '0.78rem', marginBottom: '0.75rem', color: 'var(--text)' }}>
                            Add New Knowledge Row
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                            <div style={{ flex: '1', minWidth: '220px' }}>
                                <label htmlFor="kb-new-trigger" style={{ fontSize: '0.72rem' }}>Trigger Pattern / Customer Question</label>
                                <input type="text" id="kb-new-trigger" placeholder="e.g. price list, delivery info, address" value={newTrigger} onChange={(e) => setNewTrigger(e.target.value)} required />
                            </div>
                            <div style={{ flex: '2', minWidth: '300px' }}>
                                <label htmlFor="kb-new-response" style={{ fontSize: '0.72rem' }}>Bot Response Text</label>
                                <textarea id="kb-new-response" rows={1} placeholder="Enter the corresponding answer details here..." value={newResponse} onChange={(e) => setNewResponse(e.target.value)} required style={{ minHeight: '38px', resize: 'vertical' }} />
                            </div>
                            <div style={{ display: 'flex', alignItems: 'flex-end', minWidth: '120px' }}>
                                <button type="submit" className="btn-primary" style={{ height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    + Add Row
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}
