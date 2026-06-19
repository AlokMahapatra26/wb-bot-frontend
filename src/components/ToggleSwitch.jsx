import React from 'react';

export default function ToggleSwitch({ checked, onChange }) {
    return (
        <label style={{ display: 'inline-flex', alignItems: 'center', cursor: 'pointer', position: 'relative', flexShrink: 0 }}>
            <input 
                type="checkbox" 
                checked={checked} 
                onChange={(e) => onChange(e.target.checked)} 
                style={{ display: 'none' }}
            />
            <span style={{
                width: '42px',
                height: '24px',
                background: checked ? 'var(--primary)' : 'var(--border)',
                borderRadius: '12px',
                position: 'relative',
                transition: 'background-color 0.2s',
                display: 'inline-block'
            }}>
                <span style={{
                    width: '18px',
                    height: '18px',
                    background: checked ? '#171717' : 'var(--text)',
                    borderRadius: '50%',
                    position: 'absolute',
                    top: '3px',
                    left: checked ? '21px' : '3px',
                    transition: 'left 0.2s, background-color 0.2s'
                }} />
            </span>
        </label>
    );
}
