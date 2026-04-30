import type { InputHTMLAttributes } from 'react'

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label: string
}

export function Field({ label, ...rest }: Props) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs text-muted uppercase tracking-wide">{label}</span>
      <input
        {...rest}
        className="bg-surfaceV border border-border rounded-lg px-3 py-2 text-on text-sm focus:outline-none focus:border-accent placeholder-muted"
      />
    </label>
  )
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string
  children: React.ReactNode
}

export function Select({ label, children, ...rest }: SelectProps) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs text-muted uppercase tracking-wide">{label}</span>
      <select
        {...rest}
        className="bg-surfaceV border border-border rounded-lg px-3 py-2 text-on text-sm focus:outline-none focus:border-accent"
      >
        {children}
      </select>
    </label>
  )
}

export function Btn({
  children, variant = 'primary', className = '', ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'ghost' | 'danger' }) {
  const base = 'px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50'
  const v = {
    primary: 'bg-accent text-white hover:bg-accent/90',
    ghost:   'border border-border text-muted hover:text-on hover:border-accent',
    danger:  'bg-danger/20 text-danger hover:bg-danger/30 border border-danger/30',
  }[variant]
  return <button className={`${base} ${v} ${className}`} {...rest}>{children}</button>
}
