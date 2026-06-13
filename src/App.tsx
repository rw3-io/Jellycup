import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import SnackEditor from './pages/SnackEditor'
import TournamentSetup from './pages/TournamentSetup'
import GroupStage from './pages/GroupStage'
import MatchScreen from './pages/MatchScreen'
import KnockoutBracket from './pages/KnockoutBracket'
import Podium from './pages/Podium'

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <main className="max-w-5xl mx-auto px-4 py-6">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/snacks" element={<SnackEditor />} />
            <Route path="/setup" element={<TournamentSetup />} />
            <Route path="/groups" element={<GroupStage />} />
            <Route path="/match/:id" element={<MatchScreen />} />
            <Route path="/knockout" element={<KnockoutBracket />} />
            <Route path="/podium" element={<Podium />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App
