import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTournamentStore } from '../store'
import { type Snack } from '../types'
import SnackCard from '../components/SnackCard'

function generateId(): string {
  return `snack-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

interface FormState {
  name: string
  category: string
  image: string
  description: string
}

const emptyForm: FormState = { name: '', category: '', image: '', description: '' }

export default function SnackEditor() {
  const navigate = useNavigate()
  const pendingSnacks = useTournamentStore((s) => s.pendingSnacks)
  const addPendingSnack = useTournamentStore((s) => s.addPendingSnack)
  const updatePendingSnack = useTournamentStore((s) => s.updatePendingSnack)
  const removePendingSnack = useTournamentStore((s) => s.removePendingSnack)

  const [form, setForm] = useState<FormState>(emptyForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) {
      setError('Name is required')
      return
    }
    setError('')

    if (editingId) {
      const snack: Snack = {
        id: editingId,
        name: form.name.trim(),
        category: form.category || undefined,
        image: form.image.trim() || undefined,
        description: form.description.trim() || undefined,
      }
      updatePendingSnack(snack)
      setEditingId(null)
    } else {
      const snack: Snack = {
        id: generateId(),
        name: form.name.trim(),
        category: form.category || undefined,
        image: form.image.trim() || undefined,
        description: form.description.trim() || undefined,
      }
      addPendingSnack(snack)
    }
    setForm(emptyForm)
  }

  const handleEdit = (snack: Snack) => {
    setEditingId(snack.id)
    setForm({
      name: snack.name,
      category: snack.category ?? '',
      image: snack.image ?? '',
      description: snack.description ?? '',
    })
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setForm(emptyForm)
  }

  const handleDelete = (id: string) => {
    removePendingSnack(id)
    if (editingId === id) {
      setEditingId(null)
      setForm(emptyForm)
    }
  }

  const handleContinue = () => {
    if (pendingSnacks.length < 2) {
      setError('Add at least 2 snacks to continue')
      return
    }
    navigate('/setup')
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-800 mb-1">Add Snacks</h1>
        <p className="text-slate-500">Add all the snacks that will compete in the tournament.</p>
      </div>

      {/* Add / Edit Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8"
      >
        <h2 className="text-lg font-semibold text-slate-700 mb-4">
          {editingId ? '✏️ Edit Snack' : '➕ Add Snack'}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Doritos Nacho Cheese"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
            <select
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm bg-white"
            >
              <option value="">— Select —</option>
              <option value="Sweet">Sweet</option>
              <option value="Savoury">Savoury</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Image URL</label>
            <input
              type="url"
              value={form.image}
              onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))}
              placeholder="https://example.com/snack.jpg"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Optional short description..."
              rows={2}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm resize-none"
            />
          </div>
        </div>

        {error && <p className="mt-2 text-sm text-red-500">{error}</p>}

        <div className="flex gap-3 mt-4">
          <button
            type="submit"
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors text-sm"
          >
            {editingId ? 'Save Changes' : 'Add Snack'}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={handleCancelEdit}
              className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition-colors text-sm"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* Snack list */}
      {pendingSnacks.length > 0 ? (
        <>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-slate-700">
              Snacks ({pendingSnacks.length})
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
            {pendingSnacks.map((snack) => (
              <div key={snack.id} className="relative group">
                <SnackCard snack={snack} size="sm" />
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleEdit(snack)}
                    className="w-7 h-7 bg-white rounded-full shadow text-slate-600 hover:text-indigo-600 text-xs flex items-center justify-center border border-slate-200"
                    title="Edit"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDelete(snack.id)}
                    className="w-7 h-7 bg-white rounded-full shadow text-slate-600 hover:text-red-500 text-xs flex items-center justify-center border border-slate-200"
                    title="Delete"
                  >
                    🗑
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="text-center py-12 text-slate-400">
          <div className="text-5xl mb-3">🍿</div>
          <p>No snacks yet. Add some above!</p>
        </div>
      )}

      {/* Continue button */}
      <div className="flex justify-end">
        <button
          onClick={handleContinue}
          disabled={pendingSnacks.length < 2}
          className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold rounded-2xl transition-colors shadow-md"
        >
          Continue to Setup →
        </button>
      </div>
      {pendingSnacks.length < 2 && (
        <p className="text-right text-xs text-slate-400 mt-1">
          Add at least 2 snacks
        </p>
      )}
    </div>
  )
}
