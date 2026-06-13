import { type Group, type Snack } from '../types'
import { calculateGroupStandings } from '../utils/tournament'

interface GroupTableProps {
  group: Group
  snacks: Snack[]
  advancementCount: number
}

export default function GroupTable({ group, snacks, advancementCount }: GroupTableProps) {
  const standings = calculateGroupStandings(group, snacks)

  const getSnack = (id: string) => snacks.find((s) => s.id === id)

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-slate-500 border-b border-slate-200">
            <th className="pb-2 pr-2 font-semibold">#</th>
            <th className="pb-2 pr-2 font-semibold">Snack</th>
            <th className="pb-2 px-2 font-semibold text-center">P</th>
            <th className="pb-2 px-2 font-semibold text-center">W</th>
            <th className="pb-2 px-2 font-semibold text-center">L</th>
            <th className="pb-2 px-2 font-semibold text-center">GF</th>
            <th className="pb-2 px-2 font-semibold text-center">GA</th>
            <th className="pb-2 px-2 font-semibold text-center">GD</th>
            <th className="pb-2 pl-2 font-semibold text-center">Pts</th>
          </tr>
        </thead>
        <tbody>
          {standings.map((row, idx) => {
            const snack = getSnack(row.snackId)
            const isAdvancing = idx < advancementCount
            return (
              <tr
                key={row.snackId}
                className={`border-b border-slate-100 ${
                  isAdvancing ? 'bg-green-50' : ''
                }`}
              >
                <td className="py-2 pr-2">
                  <span
                    className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                      isAdvancing
                        ? 'bg-green-500 text-white'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {idx + 1}
                  </span>
                </td>
                <td className="py-2 pr-2">
                  <div className="flex items-center gap-2">
                    {snack?.image ? (
                      <img
                        src={snack.image}
                        alt={snack.name}
                        className="w-8 h-8 rounded-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none'
                        }}
                      />
                    ) : (
                      <span className="text-lg">🍿</span>
                    )}
                    <span className="font-medium text-slate-800">
                      {snack?.name ?? row.snackId}
                    </span>
                  </div>
                </td>
                <td className="py-2 px-2 text-center text-slate-600">{row.played}</td>
                <td className="py-2 px-2 text-center text-green-600 font-medium">{row.won}</td>
                <td className="py-2 px-2 text-center text-red-500">{row.lost}</td>
                <td className="py-2 px-2 text-center text-slate-600">{row.scoredFor}</td>
                <td className="py-2 px-2 text-center text-slate-600">{row.scoredAgainst}</td>
                <td className="py-2 px-2 text-center font-medium">
                  <span className={row.diff > 0 ? 'text-green-600' : row.diff < 0 ? 'text-red-500' : 'text-slate-500'}>
                    {row.diff > 0 ? '+' : ''}{row.diff}
                  </span>
                </td>
                <td className="py-2 pl-2 text-center">
                  <span className="font-bold text-slate-800 text-base">{row.points}</span>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
      {advancementCount > 0 && (
        <p className="mt-2 text-xs text-slate-500">
          <span className="inline-block w-3 h-3 rounded bg-green-500 mr-1 align-middle" />
          Top {advancementCount} advance
        </p>
      )}
    </div>
  )
}
