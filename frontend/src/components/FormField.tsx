import type { ChangeEvent } from 'react'

interface Props {
  label: string
  code?: string
  id: string
  value: string
  placeholder?: string
  highlighted?: boolean
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void
  type?: 'text' | 'select'
  options?: { value: string; label: string }[]
  className?: string
}

export default function FormField({
  label, code, id, value, placeholder, highlighted, onChange,
  type = 'text', options, className = '',
}: Props) {
  const isHighlighted = !!highlighted

  return (
    <div className={className} style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
      <label htmlFor={id} style={{
        display: 'flex',
        alignItems: 'center',
        gap: '5px',
        fontSize: '11px',
        fontWeight: 600,
        color: isHighlighted ? '#065f46' : '#475569',
        letterSpacing: '0.15px',
        transition: 'color 0.3s ease',
      }}>
        {code && (
          <span style={{
            background: isHighlighted ? '#d1fae5' : 'linear-gradient(135deg, #eff6ff, #dbeafe)',
            color: isHighlighted ? '#065f46' : '#1d4ed8',
            borderRadius: '5px',
            padding: '1px 6px',
            fontSize: '10px',
            fontWeight: 800,
            border: isHighlighted ? '1px solid #6ee7b7' : '1px solid rgba(37,99,235,0.2)',
            fontFamily: 'monospace',
            transition: 'all 0.3s ease',
          }}>
            {code}
          </span>
        )}
        {label}
      </label>
      {type === 'select' ? (
        <select
          id={id}
          value={value}
          onChange={onChange}
          style={{
            border: `1.5px solid ${isHighlighted ? '#6ee7b7' : 'rgba(37,99,235,0.15)'}`,
            borderRadius: '8px',
            padding: '6px 10px 10px',
            fontSize: '13px',
            background: isHighlighted ? '#ecfdf5' : '#fff',
            color: '#000',
            outline: 'none',
            transition: 'all 0.2s ease',
            boxShadow: isHighlighted ? '0 0 0 3px rgba(16,185,129,0.12)' : 'none',
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
          onFocus={(e) => {
            e.target.style.borderColor = '#2563eb'
            e.target.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.12)'
          }}
          onBlur={(e) => {
            e.target.style.borderColor = isHighlighted ? '#6ee7b7' : 'rgba(37,99,235,0.15)'
            e.target.style.boxShadow = isHighlighted ? '0 0 0 3px rgba(16,185,129,0.12)' : 'none'
          }}
        >
          {options?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      ) : (
        <input
          id={id}
          type="text"
          value={value}
          placeholder={placeholder}
          onChange={onChange}
          style={{
            border: `1.5px solid ${isHighlighted ? '#6ee7b7' : 'rgba(37,99,235,0.15)'}`,
            borderRadius: '8px',
            padding: '6px 10px 10px',
            fontSize: '13px',
            background: isHighlighted ? '#ecfdf5' : '#fff',
            color: '#000',
            outline: 'none',
            transition: 'all 0.2s ease',
            boxShadow: isHighlighted ? '0 0 0 3px rgba(16,185,129,0.12)' : 'none',
            fontFamily: 'inherit',
          }}
          onFocus={(e) => {
            e.target.style.borderColor = '#2563eb'
            e.target.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.12)'
          }}
          onBlur={(e) => {
            e.target.style.borderColor = isHighlighted ? '#6ee7b7' : 'rgba(37,99,235,0.15)'
            e.target.style.boxShadow = isHighlighted ? '0 0 0 3px rgba(16,185,129,0.12)' : 'none'
          }}
        />
      )}
    </div>
  )
}
