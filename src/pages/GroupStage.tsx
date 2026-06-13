import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  useTournamentStore,
  getNextUnplayedGroupMatch,
  isGroupStageComplete,
  getTotalGroupMatches,
  getPlayedGroupMatches,
} from '../store'
import GroupTable from '../components/GroupTable'

const groupColors = [
  'border-indigo-400 bg-indigo-50',
  'border-pink-400 bg-pink-50',
  'border-amber-400 bg-amber-50',
  'border-green-400 bg-green-50',
  'border-purple-400 bg-purple-50',
  'border-cyan-400 bg-cyan-50',
  'border-orange-400 bg-orange-50',
  'border-teal-400 bg-teal-50',
]

const groupTabColors = [
  'bg-indigo-600',
  'bg-pink-600',
  'bg-amber-600',
  'bg-green-600',
  'bg-purple-600',
  'bg-cyan-600',
  'bg-orange-600',
  'bg-teal-600',
]

export default function GroupStage() {
  const navigate = useNavigate()
  const tournament = useTournamentStore((s) => s.tournament)
  const advanceToKnockout = useTournamentStore((s) => s.advanceToKnockout)
  const [activeGroup, setActiveGroup] = useState(0)

  if (!tournament) {
    return (
      <div className="text-center py-16">
        <p className="text-slate-500">No active tournament. <a href="/" className="text-indigo-600 hover:underline">Go home</a></p>
      </div>
    )
  }

  const nextMatch = getNextUnplayedGroupMatch(tournament)
  const complete = isGroupStageComplete(tournament)
  const total = getTotalGroupMatches(tournament)
  const played = getPlayedGroupMatches(tournament)
  const progressPct = total > 0 ? Math.round((played / total) * 100) : 0

  const handleAdvance = () => {
    advanceToKnockout()
    navigate('/knockout')
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-800 mb-1">Group Stage</h1>
        <p className="text-slate-500">{tournament.name}</p>
      </div>

      {/* Progress bar */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 mb-6">
        <div className="flex justify-between text-sm text-slate-600 mb-2">
          <span>Match Progress</span>
          <span className="font-semibold">{played}/{total} played</span>
        </div>
        <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-500 rounded-full transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <p className="text-xs text-slate-400 mt-1">{progressPct}% complete</p>
      </div>

      {/* Next match CTA */}
      {!complete && nextMatch && (
        <div className="bg-indigo-600 text-white rounded-2xl p-5 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-indigo-200 mb-0.5">Next Match</p>
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

      {/* Complete state */}
      {complete && (
        <div className="bg-green-600 text-white rounded-2xl p-5 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="font-bold text-lg">✅ All group matches complete!</p>
            <p className="text-sm text-green-100">Ready to advance to the knockout stage.</p>
          </div>
          <button
            onClick={handleAdvance}
            className="px-6 py-2.5 bg-white text-green-700 font-bold rounded-xl hover:bg-green-50 transition-colors shadow whitespace-nowrap"
          >
            Advance to Knockout →
          </button>
        </div>
      )}

      {/* Group tabs */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {tournament.groups.map((group, idx) => (
          <button
            key={group.id}
            onClick={() => setActiveGroup(idx)}
            className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
              activeGroup === idx
                ? `${groupTabColors[idx % groupTabColors.length]} text-white shadow-md`
                : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
            }`}
          >
            {group.name}
          </button>
        ))}
      </div>

      {/* Active group content */}
      {tournament.groups[activeGroup] && (
        <div
          className={`bg-white rounded-2xl shadow-sm border-2 p-6 ${
            groupColors[activeGroup % groupColors.length]
          }`}
        >
          <h2 className="text-xl font-bold text-slate-800 mb-4">
            {tournament.groups[activeGroup].name}
          </h2>

          <GroupTable
            group={tournament.groups[activeGroup]}
            snacks={tournament.snacks}
            advancementCount={tournament.advancementCount}
          />

          {/* Matches in this group */}
          <div className="mt-6">
            <h3 className="text-sm font-semibold text-slate-600 mb-3">Matches</h3>
            <div className="space-y-2">
              {tournament.groups[activeGroup].matches.map((match) => {
                const snackA = tournament.snacks.find((s) => s.id === match.a)
                const snackB = tournament.snacks.find((s) => s.id === match.b)
                const isPlayed = !!match.winnerId

                return (
                  <div
                    key={match.id}
                    className={`flex items-center justify-between p-3 rounded-xl text-sm ${
                      isPlayed ? 'bg-slate-50' : 'bg-white border border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span
                        className={`font-medium truncate ${
                          match.winnerId === match.a ? 'text-green-600 font-bold' : 'text-slate-700'
                        }`}
                      >
                        {snackA?.name ?? '?'}
                      </span>
                      {isPlayed && (
                        <span className="text-slate-400 font-mono text-xs shrink-0">
                          {match.scoreA} – {match.scoreB}
                        </span>
                      )}
                      <span className="text-slate-400 shrink-0">vs</span>
                      <span
                        className={`font-medium truncate ${
                          match.winnerId === match.b ? 'text-green-600 font-bold' : 'text-slate-700'
                        }`}
                      >
                        {snackB?.name ?? '?'}
                      </span>
                    </div>
                    {!isPlayed ? (
                      <button
                        onClick={() => navigate(`/match/${match.id}`)}
                        className="ml-2 shrink-0 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-lg font-semibold hover:bg-indigo-200 transition-colors text-xs"
                      >
                        Play
                      </button>
                    ) : (
                      <span className="ml-2 shrink-0 text-xs text-green-600">✓ Done</span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
