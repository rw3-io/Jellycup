import { useNavigate } from 'react-router-dom'
import { useTournamentStore } from '../store'

export default function Podium() {
  const navigate = useNavigate()
  const tournament = useTournamentStore((s) => s.tournament)
  const resetTournament = useTournamentStore((s) => s.resetTournament)

  if (!tournament || tournament.rankings.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-slate-500">No results yet. <a href="/" className="text-indigo-600 hover:underline">Go home</a></p>
      </div>
    )
  }

  const { snacks, rankings, name } = tournament
  const getSnack = (id: string) => snacks.find((s) => s.id === id)

  const first = getSnack(rankings[0])
  const second = getSnack(rankings[1])
  const third = getSnack(rankings[2])

  const handlePlayAgain = () => {
    resetTournament()
    navigate('/')
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="text-5xl mb-3">🏆</div>
        <h1 className="text-3xl font-extrabold text-slate-800">{name}</h1>
        <p className="text-slate-500 mt-1">Final Results</p>
      </div>

      {/* Podium */}
      <div className="flex items-end justify-center gap-4 mb-10">
        {/* 2nd place */}
        <div className="flex flex-col items-center">
          <div className="text-3xl mb-1">🥈</div>
          {second?.image && (
            <img
              src={second.image}
              alt={second.name}
              className="w-16 h-16 rounded-full object-cover border-4 border-slate-300 mb-2"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
            />
          )}
          {!second?.image && <div className="text-4xl mb-2">🍿</div>}
          <p className="text-sm font-bold text-center text-slate-700 max-w-[80px] truncate">{second?.name}</p>
          <div className="w-20 bg-slate-300 rounded-t-xl flex items-center justify-center mt-2" style={{ height: '80px' }}>
            <span className="text-slate-600 font-black text-2xl">2</span>
          </div>
        </div>

        {/* 1st place */}
        <div className="flex flex-col items-center">
          <div className="text-4xl mb-1">🥇</div>
          {first?.image && (
            <img
              src={first.image}
              alt={first.name}
              className="w-20 h-20 rounded-full object-cover border-4 border-yellow-400 mb-2"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
            />
          )}
          {!first?.image && <div className="text-5xl mb-2">🍿</div>}
          <p className="text-base font-extrabold text-center text-slate-800 max-w-[100px] truncate">{first?.name}</p>
          <div className="w-24 bg-yellow-400 rounded-t-xl flex items-center justify-center mt-2" style={{ height: '110px' }}>
            <span className="text-yellow-900 font-black text-3xl">1</span>
          </div>
        </div>

        {/* 3rd place */}
        <div className="flex flex-col items-center">
          <div className="text-3xl mb-1">🥉</div>
          {third?.image && (
            <img
              src={third.image}
              alt={third.name}
              className="w-16 h-16 rounded-full object-cover border-4 border-amber-600 mb-2"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
            />
          )}
          {!third?.image && <div className="text-4xl mb-2">🍿</div>}
          <p className="text-sm font-bold text-center text-slate-700 max-w-[80px] truncate">{third?.name}</p>
          <div className="w-20 bg-amber-600 rounded-t-xl flex items-center justify-center mt-2" style={{ height: '60px' }}>
            <span className="text-amber-100 font-black text-2xl">3</span>
          </div>
        </div>
      </div>

      {/* Full rankings */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 mb-6">
        <h2 className="text-lg font-bold text-slate-800 mb-4">Full Rankings</h2>
        <div className="space-y-2">
          {rankings.map((id, i) => {
            const s = getSnack(id)
            const medals = ['🥇', '🥈', '🥉']
            return (
              <div
                key={id}
                className={`flex items-center gap-3 p-3 rounded-xl ${i < 3 ? 'bg-yellow-50 border border-yellow-100' : 'bg-slate-50'}`}
              >
                <span className="w-8 text-center text-lg">
                  {i < 3 ? medals[i] : <span className="text-sm font-bold text-slate-500">{i + 1}</span>}
                </span>
                {s?.image ? (
                  <img
                    src={s.image}
                    alt={s.name}
                    className="w-9 h-9 rounded-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                  />
                ) : (
                  <span className="text-xl">🍿</span>
                )}
                <span className="font-semibold text-slate-800 flex-1">{s?.name ?? id}</span>
                {s?.category && (
                  <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                    {s.category}
                  </span>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <button
        onClick={handlePlayAgain}
        className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl transition-colors shadow-md text-base"
      >
        🔄 Play Again
      </button>
    </div>
  )
}
