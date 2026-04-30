import { NavLink, Outlet } from 'react-router-dom'

const NAV = [
  { to: '/',        label: 'Dashboard', icon: '📊' },
  { to: '/logs',    label: 'History',   icon: '📝' },
  { to: '/parts',   label: 'Parts',     icon: '⚙️' },
  { to: '/charts',  label: 'Charts',    icon: '📈' },
  { to: '/tax',     label: 'Tax',       icon: '💴' },
  { to: '/export',  label: 'Export',    icon: '📄' },
  { to: '/settings',label: 'Settings',  icon: '🔧' },
]

export default function Layout() {
  return (
    <div className="flex h-screen bg-bg text-on overflow-hidden">
      {/* Sidebar — desktop */}
      <aside className="hidden md:flex flex-col w-52 bg-surface border-r border-border shrink-0">
        <div className="px-5 py-5 border-b border-border">
          <span className="text-accent font-bold text-xl tracking-tight">BikeLog</span>
        </div>
        <nav className="flex-1 py-4 space-y-1 px-2">
          {NAV.map(n => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-accent/20 text-accent font-semibold'
                    : 'text-muted hover:bg-surfaceV hover:text-on'
                }`
              }
            >
              <span className="text-base">{n.icon}</span>
              {n.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>

        {/* Bottom nav — mobile */}
        <nav className="md:hidden flex border-t border-border bg-surface">
          {NAV.map(n => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.to === '/'}
              className={({ isActive }) =>
                `flex-1 flex flex-col items-center py-2 text-xs gap-0.5 transition-colors ${
                  isActive ? 'text-accent' : 'text-muted'
                }`
              }
            >
              <span className="text-lg leading-none">{n.icon}</span>
              {n.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  )
}
