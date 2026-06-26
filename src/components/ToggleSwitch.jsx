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
                width: 38, height: 22, borderRadius: 9999, position: 'relative', display: 'inline-block',
                transition: 'background-color 0.2s',
                backgroundColor: checked ? 'var(--color-primary)' : 'var(--color-hairline)'
            }}>
                <span style={{
                    width: 16, height: 16, borderRadius: 9999, position: 'absolute', top: 3,
                    transition: 'all 0.2s', backgroundColor: '#fff',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    left: checked ? 19 : 3
                }} />
            </span>
        </label>
    );
}
