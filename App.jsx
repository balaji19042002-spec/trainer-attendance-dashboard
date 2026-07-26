import React, { useState, useMemo } from 'react'
import {
  Plus,
  Trash2,
  Users,
  CalendarDays,
  Check,
  X,
  Minus,
  BarChart3,
} from 'lucide-react'

// Attendance value constants
const PRESENT = 'present'
const ABSENT = 'absent'

export default function App() {
  const [sessions, setSessions] = useState([
    { id: 1, name: 'Session 1' },
    { id: 2, name: 'Session 2' },
  ])
  const [trainers, setTrainers] = useState([
    { id: 1, name: 'Trainer A' },
    { id: 2, name: 'Trainer B' },
  ])
  // attendance[sessionId][trainerId] = 'present' | 'absent' | undefined
  const [attendance, setAttendance] = useState({})

  const [newSessionName, setNewSessionName] = useState('')
  const [newTrainerName, setNewTrainerName] = useState('')

  const nextSessionId = useMemo(
    () => (sessions.length ? Math.max(...sessions.map((s) => s.id)) + 1 : 1),
    [sessions]
  )
  const nextTrainerId = useMemo(
    () => (trainers.length ? Math.max(...trainers.map((t) => t.id)) + 1 : 1),
    [trainers]
  )

  const addSession = () => {
    const name = newSessionName.trim() || `Session ${nextSessionId}`
    setSessions([...sessions, { id: nextSessionId, name }])
    setNewSessionName('')
  }

  const removeSession = (id) => {
    setSessions(sessions.filter((s) => s.id !== id))
    setAttendance((prev) => {
      const copy = { ...prev }
      delete copy[id]
      return copy
    })
  }

  const addTrainer = () => {
    const name = newTrainerName.trim() || `Trainer ${nextTrainerId}`
    setTrainers([...trainers, { id: nextTrainerId, name }])
    setNewTrainerName('')
  }

  const removeTrainer = (id) => {
    setTrainers(trainers.filter((t) => t.id !== id))
    setAttendance((prev) => {
      const copy = {}
      for (const sid of Object.keys(prev)) {
        copy[sid] = { ...prev[sid] }
        delete copy[sid][id]
      }
      return copy
    })
  }

  const markAttendance = (sessionId, trainerId, status) => {
    setAttendance((prev) => {
      const current = prev[sessionId]?.[trainerId]
      const nextStatus = current === status ? undefined : status
      return {
        ...prev,
        [sessionId]: {
          ...prev[sessionId],
          [trainerId]: nextStatus,
        },
      }
    })
  }

  // ---- Stats ----
  const stats = useMemo(() => {
    let present = 0
    let absent = 0
    let unmarked = 0
    const total = sessions.length * trainers.length

    for (const session of sessions) {
      for (const trainer of trainers) {
        const status = attendance[session.id]?.[trainer.id]
        if (status === PRESENT) present++
        else if (status === ABSENT) absent++
        else unmarked++
      }
    }

    const marked = present + absent
    const percentage = marked > 0 ? Math.round((present / marked) * 100) : 0

    return { present, absent, unmarked, total, percentage }
  }, [sessions, trainers, attendance])

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-7 h-7 text-indigo-600" />
            Trainer Session Attendance Dashboard
          </h1>
          <p className="text-slate-500 mt-1">
            Mark and track trainer attendance across sessions.
          </p>
        </header>

        {/* Stats */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <StatCard label="Present" value={stats.present} color="green" />
          <StatCard label="Absent" value={stats.absent} color="red" />
          <StatCard label="Unmarked" value={stats.unmarked} color="slate" />
          <StatCard
            label="Attendance %"
            value={`${stats.percentage}%`}
            color="indigo"
          />
        </section>

        {/* Add Session / Trainer controls */}
        <section className="grid sm:grid-cols-2 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
            <h2 className="font-semibold text-slate-700 flex items-center gap-2 mb-3">
              <CalendarDays className="w-5 h-5 text-indigo-600" />
              Sessions
            </h2>
            <div className="flex gap-2">
              <input
                type="text"
                value={newSessionName}
                onChange={(e) => setNewSessionName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addSession()}
                placeholder="New session name"
                className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                onClick={addSession}
                className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-3 py-2 flex items-center gap-1 text-sm font-medium"
              >
                <Plus className="w-4 h-4" />
                Add
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
            <h2 className="font-semibold text-slate-700 flex items-center gap-2 mb-3">
              <Users className="w-5 h-5 text-indigo-600" />
              Trainers
            </h2>
            <div className="flex gap-2">
              <input
                type="text"
                value={newTrainerName}
                onChange={(e) => setNewTrainerName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addTrainer()}
                placeholder="New trainer name"
                className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                onClick={addTrainer}
                className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-3 py-2 flex items-center gap-1 text-sm font-medium"
              >
                <Plus className="w-4 h-4" />
                Add
              </button>
            </div>
          </div>
        </section>

        {/* Attendance table */}
        <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-x-auto">
          {sessions.length === 0 || trainers.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">
              Add at least one session and one trainer to start marking attendance.
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200">
                  <th className="text-left px-4 py-3 font-semibold text-slate-600 sticky left-0 bg-slate-100">
                    Trainer
                  </th>
                  {sessions.map((session) => (
                    <th
                      key={session.id}
                      className="px-4 py-3 font-semibold text-slate-600 min-w-[160px]"
                    >
                      <div className="flex items-center justify-center gap-2">
                        {session.name}
                        <button
                          onClick={() => removeSession(session.id)}
                          className="text-slate-400 hover:text-red-500"
                          title="Remove session"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {trainers.map((trainer, idx) => (
                  <tr
                    key={trainer.id}
                    className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}
                  >
                    <td className="px-4 py-3 font-medium text-slate-700 sticky left-0 bg-inherit">
                      <div className="flex items-center gap-2">
                        {trainer.name}
                        <button
                          onClick={() => removeTrainer(trainer.id)}
                          className="text-slate-400 hover:text-red-500"
                          title="Remove trainer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                    {sessions.map((session) => {
                      const status = attendance[session.id]?.[trainer.id]
                      return (
                        <td key={session.id} className="px-4 py-3">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() =>
                                markAttendance(session.id, trainer.id, PRESENT)
                              }
                              className={`w-8 h-8 rounded-lg flex items-center justify-center border transition ${
                                status === PRESENT
                                  ? 'bg-green-500 border-green-500 text-white'
                                  : 'border-slate-300 text-slate-400 hover:border-green-400 hover:text-green-500'
                              }`}
                              title="Present"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() =>
                                markAttendance(session.id, trainer.id, ABSENT)
                              }
                              className={`w-8 h-8 rounded-lg flex items-center justify-center border transition ${
                                status === ABSENT
                                  ? 'bg-red-500 border-red-500 text-white'
                                  : 'border-slate-300 text-slate-400 hover:border-red-400 hover:text-red-500'
                              }`}
                              title="Absent"
                            >
                              <X className="w-4 h-4" />
                            </button>
                            {!status && (
                              <span
                                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-300"
                                title="Unmarked"
                              >
                                <Minus className="w-4 h-4" />
                              </span>
                            )}
                          </div>
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        <footer className="text-center text-xs text-slate-400 mt-8">
          Click the checkmark to mark present, the X to mark absent. Click again to unmark.
        </footer>
      </div>
    </div>
  )
}

function StatCard({ label, value, color }) {
  const colorMap = {
    green: 'text-green-600 bg-green-50 border-green-200',
    red: 'text-red-600 bg-red-50 border-red-200',
    slate: 'text-slate-600 bg-slate-100 border-slate-200',
    indigo: 'text-indigo-600 bg-indigo-50 border-indigo-200',
  }
  return (
    <div className={`rounded-xl border p-4 ${colorMap[color]}`}>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs font-medium uppercase tracking-wide mt-1">
        {label}
      </div>
    </div>
  )
}
