import type { ReactNode } from 'react'

export function Card({ children, className = '', onClick }: {
  children: ReactNode; className?: string; onClick?: () => void
}) {
  return (
    <div
      className={`bg-surface border border-border rounded-xl p-4 ${onClick ? 'cursor-pointer hover:border-accent/50 transition-colors' : ''} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  )
}

export function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="bg-surface border border-border rounded-xl p-4 flex flex-col gap-1">
      <span className="text-xs text-muted uppercase tracking-wide">{label}</span>
      <span className="text-2xl font-bold text-accent">{value}</span>
      {sub && <span className="text-xs text-muted">{sub}</span>}
    </div>
  )
}

export function PageHeader({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-6">
      <h1 className="text-xl font-bold text-on">{title}</h1>
      {action}
    </div>
  )
}

export function EmptyState({ icon, title, sub }: { icon: string; title: string; sub?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
      <span className="text-5xl">{icon}</span>
      <p className="text-on font-medium">{title}</p>
      {sub && <p className="text-muted text-sm max-w-xs">{sub}</p>}
    </div>
  )
}
