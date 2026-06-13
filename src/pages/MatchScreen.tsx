import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTournamentStore, getMatchById } from '../store'
import { simulateMatch } from '../utils/tournament'
import SnackCard from '../components/SnackCard'

export default function MatchScreen() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const tournament = useTournamentStore((s) => s.tournament)
  const recordMatchResult = useTournamentStore((s) => s.recordMatchResult)

  const [result, setResult] = useState<{
    winnerId: string
    scoreA: number
    scoreB: number
  } | null>(null)

  if (!tournament || !id) {
    return (
      <div className="text-center py-16">
        <p className="text-slate-500">Match not found.</p>
      </div>
    )
  }

  const match = getMatchById(tournament, id)

  if (!match) {
    return (
      <div className="text-center py-16">
        <p className="text-slate-500">Match not found.</p>
      </div>
    )
  }

  const snackA = tournament.snacks.find((s) => s.id === match.a)
  const snackB = tournament.snacks.find((s) => s.id === match.b)

  if (!snackA || !snackB) {
    return (
      <div className="text-center py-16">
        <p className="text-slate-500">Snacks not found for this match.</p>
      </div>
    )
  }

  const returnPath = match.stage === 'knockout' ? '/knockout' : '/groups'

  const handleVote = (winnerId: string) => {
    if (result) return
    const scoreA = winnerId === match.a ? Math.floor(Math.random() * 3) + 3 : Math.floor(Math.random() * 3) + 1
    const scoreB = winnerId === match.b ? Math.floor(Math.random() * 3) + 3 : Math.floor(Math.random() * 3) + 1
    const res = { winnerId, scoreA, scoreB }
    setResult(res)
    recordMatchResult(id, res.winnerId, res.scoreA, res.scoreB)
  }

  const handleSimulate = () => {
    if (result) return
    const res = simulateMatch(match.a, match.b)
    setResult(res)
    recordMatchResult(id, res.winnerId, res.scoreA, res.scoreB)
  }

  const handleContinue = () => {
    navigate(returnPath)
  }

  const winnerSnack = result ? tournament.snacks.find((s) => s.id === result.winnerId) : null

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">
          {match.stage === 'group' ? 'Group Stage' : `Knockout · ${match.round}`}
        </p>
        <h1 className="text-3xl font-extrabold text-slate-800">Match Time!</h1>
      </div>

      {/* VS layout */}
      <div className="flex flex-col sm:flex-row items-stretch gap-4 mb-6">
        {/* Snack A */}
        <div className="flex-1 flex flex-col gap-3">
          <SnackCard
            snack={snackA}
            size="lg"
            highlight={
              result
                ? result.winnerId === match.a
                  ? 'winner'
                  : 'loser'
                : 'none'
            }
          />
          {!result && (
            <button
              onClick={() => handleVote(match.a)}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl text-base shadow-md transition-all hover:-translate-y-0.5"
            >
              👍 Vote {snackA.name}
            </button>
          )}
          {result && (
            <div className="text-center">
              <span
                className={`text-2xl font-extrabold ${
                  result.winnerId === match.a ? 'text-green-600' : 'text-slate-400'
                }`}
              >
                {result.scoreA}
              </span>
            </div>
          )}
        </div>

        {/* VS divider */}
        <div className="flex sm:flex-col items-center justify-center py-2 sm:py-0">
          <div className="flex sm:flex-col items-center gap-2">
            <div className="h-px w-12 sm:h-12 sm:w-px bg-slate-200" />
            <span className="text-2xl font-black text-slate-300">VS</span>
            <div className="h-px w-12 sm:h-12 sm:w-px bg-slate-200" />
          </div>
        </div>

        {/* Snack B */}
        <div className="flex-1 flex flex-col gap-3">
          <SnackCard
            snack={snackB}
            size="lg"
            highlight={
              result
                ? result.winnerId === match.b
                  ? 'winner'
                  : 'loser'
                : 'none'
            }
          />
          {!result && (
            <button
              onClick={() => handleVote(match.b)}
              className="w-full py-3 bg-pink-600 hover:bg-pink-700 text-white font-bold rounded-2xl text-base shadow-md transition-all hover:-translate-y-0.5"
            >
              👍 Vote {snackB.name}
            </button>
          )}
          {result && (
            <div className="text-center">
              <span
                className={`text-2xl font-extrabold ${
                  result.winnerId === match.b ? 'text-green-600' : 'text-slate-400'
                }`}
              >
                {result.scoreB}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Result banner */}
      {result && winnerSnack && (
        <div className="bg-green-50 border-2 border-green-400 rounded-2xl p-5 text-center mb-6">
          <p className="text-sm font-semibold text-green-600 mb-1">Winner!</p>
          <p className="text-2xl font-extrabold text-green-700">{winnerSnack.name} 🎉</p>
          <p className="text-slate-500 mt-1">
            {result.scoreA} – {result.scoreB}
          </p>
        </div>
      )}

      {/* Actions */}
      {!result && (
        <div className="text-center">
          <button
            onClick={handleSimulate}
            className="px-6 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-colors text-sm"
          >
            🎲 Simulate (Random)
          </button>
        </div>
      )}

      {result && (
        <div className="text-center">
          <button
            onClick={handleContinue}
            className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl transition-colors shadow-md text-base"
          >
            Continue →
          </button>
        </div>
      )}
    </div>
  )
}
