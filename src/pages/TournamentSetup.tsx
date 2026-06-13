import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useTournamentStore } from '../store'

export default function TournamentSetup() {
  const navigate = useNavigate()
  const pendingSnacks = useTournamentStore((s) => s.pendingSnacks)
  const createTournament = useTournamentStore((s) => s.createTournament)

  const snackCount = pendingSnacks.length

  // Suggest group count based on snack count
  const suggestedGroupCount = snackCount <= 8 ? 2 : snackCount <= 16 ? 4 : 8

  const [name, setName] = useState('Snacks Cup 2024')
  const [groupCount, setGroupCount] = useState(suggestedGroupCount)
  const [advancementCount, setAdvancementCount] = useState(2)
  const [error, setError] = useState('')

  const minPerGroup = Math.floor(snackCount / groupCount)
  const totalAdvancing = groupCount * advancementCount

  const handleStart = () => {
    if (!name.trim()) {
      setError('Tournament name is required')
      return
    }
    if (pendingSnacks.length < 2) {
      setError('Add at least 2 snacks first')
      return
    }
    if (advancementCount >= minPerGroup) {
      setError(`Each group has ~${minPerGroup} snacks. Advancement count must be less than that.`)
      return
    }
    setError('')
    createTournament(name.trim(), pendingSnacks, groupCount, advancementCount)
    navigate('/groups')
  }

  const groupOptions = [2, 4, 8].filter((n) => n <= snackCount / 2)
  if (groupOptions.length === 0) groupOptions.push(2)

  return (
    <div className="max-w-lg mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-800 mb-1">Tournament Setup</h1>
        <p className="text-slate-500">Configure your tournament settings.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-6">
        {/* Name */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">
            Tournament Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm"
            placeholder="e.g. Office Snacks Cup"
          />
        </div>

        {/* Snack summary */}
        <div className="flex items-center gap-3 bg-indigo-50 rounded-xl p-4">
          <span className="text-2xl">🍿</span>
          <div>
            <p className="font-bold text-indigo-800">{snackCount} Snacks</p>
            <Link to="/snacks" className="text-xs text-indigo-600 hover:underline">
              Edit snack list →
            </Link>
          </div>
        </div>

        {snackCount < 2 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-yellow-800">
            You need at least 2 snacks.{' '}
            <Link to="/snacks" className="underline font-semibold">
              Add snacks →
            </Link>
          </div>
        )}

        {/* Group count */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Number of Groups
          </label>
          <div className="flex gap-2">
            {groupOptions.map((n) => (
              <button
                key={n}
                onClick={() => setGroupCount(n)}
                className={`flex-1 py-2 rounded-xl font-semibold text-sm border-2 transition-all ${
                  groupCount === n
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                    : 'border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                {n} Groups
                {n === suggestedGroupCount && (
                  <span className="ml-1 text-xs text-indigo-500">(suggested)</span>
                )}
              </button>
            ))}
          </div>
          <p className="mt-1 text-xs text-slate-500">
            ~{Math.ceil(snackCount / groupCount)} snacks per group
          </p>
        </div>

        {/* Advancement count */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Advance per Group
          </label>
          <div className="flex gap-2">
            {[1, 2, 3].map((n) => (
              <button
                key={n}
                onClick={() => setAdvancementCount(n)}
                disabled={n >= minPerGroup}
                className={`flex-1 py-2 rounded-xl font-semibold text-sm border-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                  advancementCount === n
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                    : 'border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                Top {n}
              </button>
            ))}
          </div>
          <p className="mt-1 text-xs text-slate-500">
            {totalAdvancing} snacks advance to knockout stage
          </p>
        </div>

        {error && (
          <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>
        )}

        {/* Start button */}
        <button
          onClick={handleStart}
          disabled={snackCount < 2}
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold rounded-2xl transition-colors shadow-md text-base"
        >
          🚀 Start Tournament
        </button>
      </div>
    </div>
  )
}
