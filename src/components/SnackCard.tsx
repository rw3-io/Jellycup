import { type Snack } from '../types'

interface SnackCardProps {
  snack: Snack
  size?: 'sm' | 'md' | 'lg'
  highlight?: 'winner' | 'loser' | 'none'
  className?: string
}

const categoryColors: Record<string, string> = {
  chips: 'bg-yellow-100 text-yellow-800',
  candy: 'bg-pink-100 text-pink-800',
  chocolate: 'bg-amber-100 text-amber-800',
  fruit: 'bg-green-100 text-green-800',
  savory: 'bg-orange-100 text-orange-800',
  sweet: 'bg-purple-100 text-purple-800',
  drink: 'bg-blue-100 text-blue-800',
  other: 'bg-slate-100 text-slate-700',
}

function getCategoryColor(category?: string): string {
  if (!category) return 'bg-slate-100 text-slate-700'
  const key = category.toLowerCase()
  return categoryColors[key] ?? 'bg-indigo-100 text-indigo-800'
}

export default function SnackCard({
  snack,
  size = 'md',
  highlight = 'none',
  className = '',
}: SnackCardProps) {
  const isLg = size === 'lg'
  const isSm = size === 'sm'

  const highlightClass =
    highlight === 'winner'
      ? 'ring-4 ring-green-400 bg-green-50'
      : highlight === 'loser'
      ? 'opacity-50 bg-slate-100'
      : 'bg-white'

  return (
    <div
      className={`rounded-2xl shadow-md border border-slate-200 overflow-hidden flex flex-col items-center transition-all ${highlightClass} ${className}`}
    >
      {/* Image area */}
      <div
        className={`w-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 ${
          isLg ? 'h-48' : isSm ? 'h-20' : 'h-32'
        }`}
      >
        {snack.image ? (
          <img
            src={snack.image}
            alt={snack.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none'
            }}
          />
        ) : (
          <span className={isLg ? 'text-6xl' : isSm ? 'text-3xl' : 'text-4xl'}>🍿</span>
        )}
      </div>

      {/* Content */}
      <div className={`w-full ${isLg ? 'p-4' : isSm ? 'p-2' : 'p-3'} text-center`}>
        <h3
          className={`font-bold text-slate-800 leading-tight ${
            isLg ? 'text-xl' : isSm ? 'text-sm' : 'text-base'
          }`}
        >
          {snack.name}
        </h3>
        {snack.category && (
          <span
            className={`inline-block mt-1 px-2 py-0.5 rounded-full font-medium ${
              isLg ? 'text-sm' : 'text-xs'
            } ${getCategoryColor(snack.category)}`}
          >
            {snack.category}
          </span>
        )}
        {snack.description && isLg && (
          <p className="mt-2 text-sm text-slate-500 line-clamp-2">{snack.description}</p>
        )}
      </div>
    </div>
  )
}
