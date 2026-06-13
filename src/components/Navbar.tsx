import { Link, useLocation } from 'react-router-dom'
import { useTournamentStore } from '../store'

const stagePaths: Record<string, string> = {
  setup: '/setup',
  group: '/groups',
  knockout: '/knockout',
  complete: '/podium',
}

export default function Navbar() {
  const tournament = useTournamentStore((s) => s.tournament)
  const location = useLocation()

  const currentPath = location.pathname

  return (
    <nav className="bg-white shadow-sm border-b border-slate-200">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-xl font-bold text-slate-800 hover:text-indigo-600 transition-colors">
          <span className="text-2xl">🏆</span>
          <span>Snacks Tournament</span>
        </Link>

        {tournament && (
          <div className="flex items-center gap-1 text-sm">
            <NavLink to="/snacks" current={currentPath} label="Snacks" />
            <span className="text-slate-300">/</span>
            <NavLink to="/setup" current={currentPath} label="Setup" />
            {tournament.stage !== 'setup' && (
              <>
                <span className="text-slate-300">/</span>
                <NavLink
                  to={stagePaths[tournament.stage] ?? '/groups'}
                  current={currentPath}
                  label={
                    tournament.stage === 'group'
                      ? 'Groups'
                      : tournament.stage === 'knockout'
                      ? 'Bracket'
                      : 'Podium'
                  }
                />
              </>
            )}
          </div>
        )}

        {!tournament && currentPath !== '/' && (
          <Link
            to="/"
            className="text-sm text-slate-500 hover:text-indigo-600 transition-colors"
          >
            ← Home
          </Link>
        )}
      </div>
    </nav>
  )
}

function NavLink({
  to,
  current,
  label,
}: {
  to: string
  current: string
  label: string
}) {
  const isActive = current === to || current.startsWith(to + '/')
  return (
    <Link
      to={to}
      className={`px-2 py-1 rounded text-sm font-medium transition-colors ${
        isActive
          ? 'text-indigo-600 bg-indigo-50'
          : 'text-slate-600 hover:text-indigo-600'
      }`}
    >
      {label}
    </Link>
  )
}
