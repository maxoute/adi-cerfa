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
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <label htmlFor={id} className="text-xs font-semibold text-gray-500 flex items-center gap-1">
        {code && (
          <span className="bg-[#e8f0fe] text-[#003189] rounded px-1.5 py-px text-[10px] font-bold">
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
          className={`border rounded-md px-2.5 py-2 text-sm bg-white transition-all focus:outline-none
            ${highlighted ? 'border-green-400 bg-green-50' : 'border-[#d0d8e8] focus:border-[#4a7adb] focus:ring-2 focus:ring-[#4a7adb]/10'}`}
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
          className={`border rounded-md px-2.5 py-2 text-sm transition-all focus:outline-none
            ${highlighted ? 'border-green-400 bg-green-50' : 'border-[#d0d8e8] focus:border-[#4a7adb] focus:ring-2 focus:ring-[#4a7adb]/10'}`}
        />
      )}
    </div>
  )
}
