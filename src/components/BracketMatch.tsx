import { type Match, type Snack } from '../types'

interface BracketMatchProps {
  match: Match
  snacks: Snack[]
  onPlay?: () => void
}

function getSnack(snacks: Snack[], id: string): Snack | undefined {
  return snacks.find((s) => s.id === id)
}

function isPlaceholder(id: string): boolean {
  return id.startsWith('ko-') || id.startsWith('__')
}

export default function BracketMatch({ match, snacks, onPlay }: BracketMatchProps) {
  const snackA = isPlaceholder(match.a) ? null : getSnack(snacks, match.a)
  const snackB = isPlaceholder(match.b) ? null : getSnack(snacks, match.b)
  const isPlayed = !!match.winnerId
  const canPlay = !isPlayed && snackA && snackB

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden min-w-[180px]">
      {/* Round label */}
      <div className="px-3 py-1 bg-slate-100 text-xs font-semibold text-slate-500 text-center">
        {match.round}
      </div>

      {/* Competitor A */}
      <div
        className={`flex items-center gap-2 px-3 py-2 border-b border-slate-100 ${
          isPlayed && match.winnerId === match.a ? 'bg-green-50 font-semibold' : ''
        } ${isPlayed && match.winnerId !== match.a ? 'opacity-50' : ''}`}
      >
        {snackA ? (
          <>
            {snackA.image ? (
              <img
                src={snackA.image}
                alt={snackA.name}
                className="w-6 h-6 rounded-full object-cover flex-shrink-0"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none'
                }}
              />
            ) : (
              <span className="text-sm">🍿</span>
            )}
            <span className="text-sm text-slate-800 truncate flex-1">{snackA.name}</span>
            {isPlayed && (
              <span className="text-sm font-bold text-slate-700 ml-1">{match.scoreA}</span>
            )}
            {isPlayed && match.winnerId === match.a && (
              <span className="text-green-500 text-xs">✓</span>
            )}
          </>
        ) : (
          <span className="text-sm text-slate-400 italic">TBD</span>
        )}
      </div>

      {/* Competitor B */}
      <div
        className={`flex items-center gap-2 px-3 py-2 ${
          isPlayed && match.winnerId === match.b ? 'bg-green-50 font-semibold' : ''
        } ${isPlayed && match.winnerId !== match.b ? 'opacity-50' : ''}`}
      >
        {snackB ? (
          <>
            {snackB.image ? (
              <img
                src={snackB.image}
                alt={snackB.name}
                className="w-6 h-6 rounded-full object-cover flex-shrink-0"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none'
                }}
              />
            ) : (
              <span className="text-sm">🍿</span>
            )}
            <span className="text-sm text-slate-800 truncate flex-1">{snackB.name}</span>
            {isPlayed && (
              <span className="text-sm font-bold text-slate-700 ml-1">{match.scoreB}</span>
            )}
            {isPlayed && match.winnerId === match.b && (
              <span className="text-green-500 text-xs">✓</span>
            )}
          </>
        ) : (
          <span className="text-sm text-slate-400 italic">TBD</span>
        )}
      </div>

      {/* Play button */}
      {canPlay && onPlay && (
        <div className="px-3 py-2 bg-slate-50 border-t border-slate-100">
          <button
            onClick={onPlay}
            className="w-full text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            ▶ Play
          </button>
        </div>
      )}
    </div>
  )
}
