import { useNavigate } from 'react-router-dom'
import { useTournamentStore } from '../store'

const stagePaths: Record<string, string> = {
  group: '/groups',
  knockout: '/knockout',
  complete: '/podium',
}

export default function Home() {
  const navigate = useNavigate()
  const tournament = useTournamentStore((s) => s.tournament)
  const resetTournament = useTournamentStore((s) => s.resetTournament)

  const handleContinue = () => {
    if (!tournament) return
    const path = stagePaths[tournament.stage] ?? '/groups'
    navigate(path)
  }

  const handleReset = () => {
    if (confirm('Reset tournament? All progress will be lost.')) {
      resetTournament()
    }
  }

  return (
    <div className="flex flex-col items-center py-12 px-4">
      {/* Hero */}
      <div className="text-center mb-12">
        <div className="text-6xl mb-4">🏆</div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-800 mb-3">
          Snacks Tournament
        </h1>
        <p className="text-lg text-slate-500 max-w-md mx-auto">
          Find out which snack reigns supreme! Set up groups, vote in matches, and crown the
          ultimate champion.
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-4 w-full max-w-sm">
        {!tournament && (
          <button
            onClick={() => navigate('/snacks')}
            className="w-full py-4 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-lg rounded-2xl shadow-lg transition-all hover:shadow-xl hover:-translate-y-0.5"
          >
            🎉 New Tournament
          </button>
        )}

        {tournament && tournament.stage !== 'complete' && (
          <>
            <button
              onClick={handleContinue}
              className="w-full py-4 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-lg rounded-2xl shadow-lg transition-all hover:shadow-xl hover:-translate-y-0.5"
            >
              ▶ Continue Tournament
            </button>
            <p className="text-center text-sm text-slate-500">
              {tournament.name} · {tournament.snacks.length} snacks
            </p>
          </>
        )}

        {tournament && tournament.stage === 'complete' && (
          <>
            <button
              onClick={() => navigate('/podium')}
              className="w-full py-4 px-6 bg-yellow-500 hover:bg-yellow-600 text-white font-bold text-lg rounded-2xl shadow-lg transition-all hover:shadow-xl hover:-translate-y-0.5"
            >
              🥇 View Results
            </button>
            <p className="text-center text-sm text-slate-500">
              {tournament.name} · Complete
            </p>
          </>
        )}

        {!tournament && (
          <button
            onClick={() => navigate('/snacks')}
            className="w-full py-3 px-6 bg-white border-2 border-slate-200 hover:border-indigo-300 text-slate-700 font-semibold rounded-2xl transition-all"
          >
            Add Snacks First
          </button>
        )}

        {tournament && (
          <button
            onClick={handleReset}
            className="w-full py-3 px-4 text-sm text-slate-400 hover:text-red-500 transition-colors rounded-xl"
          >
            🗑 Reset Tournament
          </button>
        )}
      </div>

      {/* Feature highlights */}
      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl w-full text-center">
        {[
          { icon: '🍕', title: 'Enter Snacks', desc: 'Add any snacks with names, images, and categories' },
          { icon: '⚔️', title: 'Group Stage', desc: 'Round-robin groups with standings and advancement' },
          { icon: '🏅', title: 'Podium', desc: 'Gold, silver, bronze plus full rankings' },
        ].map((f) => (
          <div key={f.title} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <div className="text-4xl mb-3">{f.icon}</div>
            <h3 className="font-bold text-slate-800 mb-1">{f.title}</h3>
            <p className="text-sm text-slate-500">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
