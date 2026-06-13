import { useNavigate } from 'react-router-dom'
import {
  useTournamentStore,
  getNextUnplayedKnockoutMatch,
} from '../store'
import BracketMatch from '../components/BracketMatch'

export default function KnockoutBracket() {
  const navigate = useNavigate()
  const tournament = useTournamentStore((s) => s.tournament)
  const completeKnockout = useTournamentStore((s) => s.completeKnockout)

  if (!tournament) {
    return (
      <div className="text-center py-16">
        <p className="text-slate-500">No active tournament. <a href="/" className="text-indigo-600 hover:underline">Go home</a></p>
      </div>
    )
  }

  const matches = tournament.knockoutMatches
  const nextMatch = getNextUnplayedKnockoutMatch(tournament)

  const finalMatch = matches.find((m) => m.round === 'F')
  const allDone = !!finalMatch?.winnerId

  const roundOrder = ['R32', 'R16', 'QF', 'SF', 'F', '3rd']
  const rounds = roundOrder.filter((r) => matches.some((m) => m.round === r))

  const roundLabels: Record<string, string> = {
    R32: 'Round of 32',
    R16: 'Round of 16',
    QF: 'Quarter-Finals',
    SF: 'Semi-Finals',
    F: 'Final',
    '3rd': '3rd Place',
  }

  const handleFinalize = () => {
    completeKnockout()
    navigate('/podium')
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-800 mb-1">Knockout Stage</h1>
        <p className="text-slate-500">{tournament.name}</p>
      </div>

      {/* Next match CTA */}
      {!allDone && nextMatch && (
        <div className="bg-indigo-600 text-white rounded-2xl p-5 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-indigo-200 mb-0.5">
              Next Match · {nextMatch.round}
            </p>
            <p className="font-bold text-lg">
              {tournament.snacks.find((s) => s.id === nextMatch.a)?.name ?? '?'}
              {' vs '}
              {tournament.snacks.find((s) => s.id === nextMatch.b)?.name ?? '?'}
            </p>
          </div>
          <button
            onClick={() => navigate(`/match/${nextMatch.id}`)}
            className="px-6 py-2.5 bg-white text-indigo-700 font-bold rounded-xl hover:bg-indigo-50 transition-colors shadow whitespace-nowrap"
          >
            ⚔️ Play Match
          </button>
        </div>
      )}

      {/* Bracket */}
      <div className="overflow-x-auto">
        <div className="flex gap-8 min-w-max pb-6">
          {rounds.map((round) => (
            <div key={round} className="flex flex-col gap-4">
              <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider text-center">
                {roundLabels[round] ?? round}
              </h2>
              <div className="flex flex-col gap-4 justify-around h-full">
                {matches
                  .filter((m) => m.round === round)
                  .map((m) => (
                    <BracketMatch
                      key={m.id}
                      match={m}
                      snacks={tournament.snacks}
                      onPlay={() => navigate(`/match/${m.id}`)}
                    />
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Finalize button */}
      {allDone && (
        <div className="mt-6 bg-yellow-50 border-2 border-yellow-400 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="font-bold text-lg text-yellow-800">🏆 Tournament Complete!</p>
            <p className="text-sm text-yellow-600">All knockout matches have been played.</p>
          </div>
          <button
            onClick={handleFinalize}
            className="px-6 py-2.5 bg-yellow-500 hover:bg-yellow-600 text-white font-bold rounded-xl transition-colors shadow whitespace-nowrap"
          >
            View Podium 🥇
          </button>
        </div>
      )}
    </div>
  )
}
