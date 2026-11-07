import { useEffect, useMemo, useState } from 'react'
import {
  AlertCircle,
  ArrowDownWideNarrow,
  ArrowRight,
  Bell,
  BookOpen,
  CalendarDays,
  Check,
  CheckCheck,
  CheckCircle2,
  Circle,
  Clock3,
  Download,
  GraduationCap,
  LayoutDashboard,
  ListTodo,
  Plus,
  Search,
  Sparkles,
  X,
} from 'lucide-react'

const STORAGE_KEY = 'teman-pr:homework:v1'
const filters = [
  { id: 'all', label: 'Semua tugas', icon: ListTodo },
  { id: 'active', label: 'Belum selesai', icon: Circle },
  { id: 'today', label: 'Tenggat hari ini', icon: CalendarDays },
  { id: 'completed', label: 'Selesai', icon: CheckCircle2 },
]

const priorityOptions = [
  { value: 'Tinggi', color: 'rose' },
  { value: 'Sedang', color: 'amber' },
  { value: 'Rendah', color: 'sage' },
]

function loadTasks() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (!saved) return []
    const parsed = JSON.parse(saved)
    if (!Array.isArray(parsed)) return []
    return parsed.filter((task) => task && task.id && task.title && task.dueAt)
  } catch {
    return []
  }
}

function localDateTimeInput(date) {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000)
  return local.toISOString().slice(0, 16)
}

function isToday(value) {
  const date = new Date(value)
  return date.toDateString() === new Date().toDateString()
}

function formatDate(value, options = {}) {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    ...options,
  }).format(new Date(value))
}

function countdown(value, now) {
  const difference = new Date(value).getTime() - now.getTime()
  if (difference <= 0) {
    const hours = Math.floor(Math.abs(difference) / 3_600_000)
    if (hours < 1) return 'Terlambat · baru saja'
    if (hours < 24) return `Terlambat ${hours} jam`
    const days = Math.floor(hours / 24)
    return `Terlambat ${days} hari`
  }
  const minutes = Math.floor(difference / 60_000)
  const days = Math.floor(minutes / 1_440)
  if (days > 0) return `${days} hari lagi`
  const hours = Math.floor(minutes / 60)
  if (hours > 0) return `${hours} jam lagi`
  return `${Math.max(minutes, 1)} menit lagi`
}

function priorityClass(priority) {
  if (priority === 'Tinggi') return 'priority-high'
  if (priority === 'Rendah') return 'priority-low'
  return 'priority-medium'
}

function taskReminder(task, now) {
  const difference = new Date(task.dueAt).getTime() - now.getTime()
  if (task.completed) return 'Selesai'
  if (difference < 0) return 'Terlambat'
  if (difference <= 24 * 60 * 60 * 1000) return 'Segera'
  return ''
}

function App() {
  const [tasks, setTasks] = useState(loadTasks)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [toast, setToast] = useState('')
  const [now, setNow] = useState(() => new Date())
  const [installPrompt, setInstallPrompt] = useState(null)

  useEffect(() => {
    function handleInstallAvailable(event) {
      event.preventDefault()
      setInstallPrompt(event)
    }

    window.addEventListener('beforeinstallprompt', handleInstallAvailable)
    return () => window.removeEventListener('beforeinstallprompt', handleInstallAvailable)
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
    } catch {
      setToast('Penyimpanan browser penuh atau tidak tersedia.')
    }
  }, [tasks])

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 60_000)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    if (!toast) return undefined
    const timer = window.setTimeout(() => setToast(''), 2800)
    return () => window.clearTimeout(timer)
  }, [toast])

  const pendingTasks = useMemo(() => tasks.filter((task) => !task.completed), [tasks])
  const todayTasks = pendingTasks.filter((task) => isToday(task.dueAt))
  const completedTasks = tasks.filter((task) => task.completed)
  const doneCount = completedTasks.length
  const progress = tasks.length ? Math.round((doneCount / tasks.length) * 100) : 0

  const visibleTasks = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase('id-ID')
    return tasks
      .filter((task) => {
        if (filter === 'active' && task.completed) return false
        if (filter === 'completed' && !task.completed) return false
        if (filter === 'today' && (task.completed || !isToday(task.dueAt))) return false
        return !normalizedSearch || `${task.title} ${task.subject}`.toLocaleLowerCase('id-ID').includes(normalizedSearch)
      })
      .sort((a, b) => {
        if (a.completed !== b.completed) return a.completed ? 1 : -1
        return new Date(a.dueAt) - new Date(b.dueAt)
      })
  }, [tasks, filter, search])

  const reminders = pendingTasks
    .filter((task) => {
      const delta = new Date(task.dueAt).getTime() - now.getTime()
      return delta <= 24 * 60 * 60 * 1000
    })
    .sort((a, b) => new Date(a.dueAt) - new Date(b.dueAt))
  const nextTask = [...pendingTasks].sort((a, b) => new Date(a.dueAt) - new Date(b.dueAt))[0]

  function openNewTask() {
    setEditingTask(null)
    setIsFormOpen(true)
  }

  function openEditTask(task) {
    setEditingTask(task)
    setIsFormOpen(true)
  }

  function saveTask(formValues) {
    if (editingTask) {
      setTasks((current) => current.map((task) => task.id === editingTask.id ? { ...task, ...formValues } : task))
      setToast('Perubahan tugas disimpan.')
    } else {
      setTasks((current) => [{
        id: crypto.randomUUID(),
        ...formValues,
        completed: false,
        createdAt: new Date().toISOString(),
      }, ...current])
      setFilter('all')
      setSearch('')
      setToast('Tugas baru ditambahkan.')
    }
    setIsFormOpen(false)
    setEditingTask(null)
  }

  function toggleComplete(id) {
    const task = tasks.find((item) => item.id === id)
    setTasks((current) => current.map((item) => item.id === id ? { ...item, completed: !item.completed } : item))
    setToast(task?.completed ? 'Tugas dipindahkan ke belum selesai.' : 'Satu tugas selesai. Mantap!')
  }

  function deleteTask(id) {
    setTasks((current) => current.filter((task) => task.id !== id))
    setToast('Tugas dihapus.')
  }

  async function installApp() {
    if (!installPrompt) return
    await installPrompt.prompt()
    await installPrompt.userChoice
    setInstallPrompt(null)
  }

  const activeFilter = filters.find((item) => item.id === filter)
  const todayLabel = new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric', month: 'long' }).format(now)

  return (
    <div className="min-h-screen bg-[#f7f8f4] text-[#20251f]">
      <header className="app-header">
        <a className="brand" href="#beranda" aria-label="Teman PR beranda">
          <span className="brand-mark"><BookOpen size={19} strokeWidth={2.3} /></span>
          <span>teman<span className="brand-accent">PR</span></span>
        </a>
        <div className="header-right">
          <span className="header-date"><CalendarDays size={15} /> {todayLabel}</span>
          {installPrompt && <button className="install-button" onClick={installApp}><Download size={15} /> Pasang aplikasi</button>}
          <span className="avatar" aria-label="Profil pelajar">A</span>
        </div>
      </header>

      <div className="app-layout">
        <aside className="sidebar">
          <div className="sidebar-label">MENU</div>
          <nav className="nav-list" aria-label="Filter tugas">
            {filters.map(({ id, label, icon: Icon }) => {
              const count = id === 'active' ? pendingTasks.length : id === 'today' ? todayTasks.length : id === 'completed' ? doneCount : tasks.length
              return (
                <button key={id} className={`nav-item ${filter === id ? 'nav-item-active' : ''}`} onClick={() => setFilter(id)}>
                  <Icon size={18} strokeWidth={1.9} />
                  <span>{label}</span>
                  <span className="nav-count">{count}</span>
                </button>
              )
            })}
          </nav>

          <div className="sidebar-divider" />
          <div className="sidebar-label">RINGKASAN</div>
          <section className="progress-card">
            <div className="progress-card-top">
              <span className="progress-icon"><Sparkles size={16} /></span>
              <span className="progress-percent">{progress}%</span>
            </div>
            <p className="progress-title">Progres belajarmu</p>
            <p className="progress-caption">{doneCount} dari {tasks.length} tugas selesai</p>
            <div className="progress-track"><span style={{ width: `${progress}%` }} /></div>
          </section>

          <div className="sidebar-tip">
            <div className="tip-icon"><GraduationCap size={17} /></div>
            <p>Kerjakan sedikit demi sedikit. Kamu pasti bisa!</p>
          </div>
          <div className="sidebar-footer">Tugasmu tersimpan otomatis di perangkat ini.</div>
        </aside>

        <main className="main-content" id="beranda">
          <section className="welcome-banner">
            <div className="welcome-copy">
              <span className="eyebrow"><Sparkles size={13} /> RUANG BELAJARMU</span>
              <h1>Hai, siap menaklukkan<br className="desktop-break" /> tugas hari ini?</h1>
              <p>Atur tugasmu satu per satu, dan rasakan lega saat semuanya selesai.</p>
              <button className="banner-button" onClick={openNewTask}><Plus size={17} /> Tambah tugas</button>
            </div>
            <div className="banner-art" aria-hidden="true">
              <div className="art-sun" />
              <div className="art-book art-book-back" />
              <div className="art-book art-book-front"><span /><span /><span /></div>
              <div className="art-pencil" />
              <div className="art-star star-one">✳</div>
              <div className="art-star star-two">✦</div>
            </div>
          </section>

          <div className="overview-grid">
            <article className="overview-card">
              <span className="overview-icon icon-lilac"><LayoutDashboard size={18} /></span>
              <div><p>Tugas aktif</p><strong>{pendingTasks.length}</strong><span>yang perlu dikerjakan</span></div>
            </article>
            <article className="overview-card">
              <span className="overview-icon icon-peach"><Clock3 size={18} /></span>
              <div><p>Tenggat hari ini</p><strong>{todayTasks.length}</strong><span>jangan lupa, ya</span></div>
            </article>
            <article className="overview-card">
              <span className="overview-icon icon-mint"><CheckCheck size={18} /></span>
              <div><p>Sudah selesai</p><strong>{doneCount}</strong><span>keren sekali!</span></div>
            </article>
          </div>

          <div className="content-columns">
            <section className="task-section">
              <div className="section-heading">
                <div>
                  <span className="eyebrow muted-eyebrow">DAFTAR TUGAS</span>
                  <h2>{filter === 'all' ? 'Tugas saya' : activeFilter?.label}</h2>
                </div>
                <button className="add-button" onClick={openNewTask}><Plus size={17} /> <span>Tugas baru</span></button>
              </div>

              <div className="task-toolbar">
                <label className="search-box">
                  <Search size={17} />
                  <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cari tugas atau pelajaran..." />
                  {search && <button aria-label="Hapus pencarian" onClick={() => setSearch('')}><X size={15} /></button>}
                </label>
                <span className="task-total"><ArrowDownWideNarrow size={15} /> Terdekat dulu</span>
              </div>

              <div className="task-list">
                {visibleTasks.length > 0 ? visibleTasks.map((task) => (
                  <TaskCard key={task.id} task={task} now={now} onToggle={toggleComplete} onEdit={openEditTask} onDelete={deleteTask} />
                )) : (
                  <EmptyState hasAnyTask={tasks.length > 0} filter={filter} search={search} onAdd={openNewTask} />
                )}
              </div>
            </section>

            <aside className="reminder-column">
              <section className="reminder-panel">
                <div className="reminder-heading">
                  <span className="reminder-bell"><Bell size={17} /></span>
                  <div><h3>Pengingat</h3><p>Yang perlu kamu perhatikan</p></div>
                </div>
                {reminders.length > 0 ? (
                  <div className="reminder-list">
                    {reminders.slice(0, 3).map((task) => {
                      const late = new Date(task.dueAt).getTime() < now.getTime()
                      return <div key={task.id} className={`reminder-item ${late ? 'reminder-late' : ''}`}>
                        <span className="reminder-dot" />
                        <div><strong>{task.title}</strong><span>{task.subject} · {countdown(task.dueAt, now)}</span></div>
                        <ArrowRight size={15} />
                      </div>
                    })}
                    {reminders.length > 3 && <p className="more-reminders">+ {reminders.length - 3} tugas lainnya</p>}
                  </div>
                ) : (
                  <div className="reminder-empty">
                    <span className="reminder-empty-icon"><Check size={18} /></span>
                    <div><strong>Aman untuk sekarang</strong><p>Belum ada tenggat dalam 24 jam.</p></div>
                  </div>
                )}
              </section>

              <section className="next-deadline-panel">
                <span className="next-label"><CalendarDays size={14} /> TENGGAT BERIKUTNYA</span>
                {nextTask ? <>
                  <h3>{nextTask.title}</h3>
                  <p>{nextTask.subject}</p>
                  <div className="next-deadline-bottom"><span>{formatDate(nextTask.dueAt, { weekday: 'short', year: 'numeric' })}</span><span>{countdown(nextTask.dueAt, now)}</span></div>
                </> : <div className="no-deadline">Belum ada tugas aktif. Nikmati waktu luangmu 🌿</div>}
              </section>

              <div className="little-note"><span>☀</span><p>Mulai dari yang paling kecil. Langkah kecil tetap membuatmu maju.</p></div>
            </aside>
          </div>
        </main>
      </div>

      {isFormOpen && <TaskForm task={editingTask} onClose={() => { setIsFormOpen(false); setEditingTask(null) }} onSave={saveTask} />}
      {toast && <div className="toast" role="status"><CheckCircle2 size={17} /> {toast}</div>}
    </div>
  )
}

function TaskCard({ task, now, onToggle, onEdit, onDelete }) {
  const reminder = taskReminder(task, now)
  const isLate = reminder === 'Terlambat'
  const isSoon = reminder === 'Segera'
  return (
    <article className={`task-card ${task.completed ? 'task-completed' : ''}`}>
      <button className={`complete-button ${task.completed ? 'is-complete' : ''}`} onClick={() => onToggle(task.id)} aria-label={task.completed ? 'Tandai belum selesai' : 'Tandai selesai'}>
        {task.completed && <Check size={14} strokeWidth={3} />}
      </button>
      <div className="task-main">
        <div className="task-title-line">
          <h3>{task.title}</h3>
          <span className={`priority-pill ${priorityClass(task.priority)}`}><span />{task.priority}</span>
        </div>
        <div className="task-meta">
          <span className="subject-tag"><BookOpen size={13} />{task.subject}</span>
          <span className={`deadline-meta ${isLate ? 'meta-late' : isSoon ? 'meta-soon' : ''}`}>
            {isLate ? <AlertCircle size={13} /> : <CalendarDays size={13} />}
            {formatDate(task.dueAt, { weekday: 'short' })}, {new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date(task.dueAt))}
          </span>
          <span className={`countdown-pill ${isLate ? 'countdown-late' : isSoon ? 'countdown-soon' : ''}`}><Clock3 size={12} />{task.completed ? 'Selesai' : countdown(task.dueAt, now)}</span>
        </div>
      </div>
      <div className="task-actions">
        <button onClick={() => onEdit(task)} aria-label={`Edit ${task.title}`} title="Edit tugas"><span className="edit-glyph">✎</span></button>
        <button onClick={() => { if (window.confirm(`Hapus tugas “${task.title}”?`)) onDelete(task.id) }} aria-label={`Hapus ${task.title}`} title="Hapus tugas"><X size={16} /></button>
      </div>
    </article>
  )
}

function EmptyState({ hasAnyTask, filter, search, onAdd }) {
  const title = search ? 'Tugas tidak ditemukan' : filter === 'completed' ? 'Belum ada tugas yang selesai' : filter === 'today' ? 'Tidak ada tenggat hari ini' : 'Belum ada tugas, nih!'
  const description = search ? 'Coba kata kunci lain atau periksa ejaan pencarianmu.' : filter === 'today' ? 'Kamu bisa fokus ke tugas dengan tenggat berikutnya.' : filter === 'completed' ? 'Tugas yang kamu selesaikan akan muncul di sini.' : hasAnyTask ? 'Semua tugasmu sudah tertata di filter lain.' : 'Catat PR pertamamu supaya rencana belajar lebih rapi.'
  return <div className="empty-state">
    <span className="empty-illustration"><BookOpen size={26} /></span>
    <h3>{title}</h3><p>{description}</p>
    {!hasAnyTask && !search && <button onClick={onAdd}><Plus size={16} /> Tambah tugas pertama</button>}
  </div>
}

function TaskForm({ task, onClose, onSave }) {
  const initialDue = task?.dueAt ? localDateTimeInput(new Date(task.dueAt)) : ''
  const [title, setTitle] = useState(task?.title ?? '')
  const [subject, setSubject] = useState(task?.subject ?? '')
  const [dueAt, setDueAt] = useState(initialDue)
  const [priority, setPriority] = useState(task?.priority ?? 'Sedang')
  const [error, setError] = useState('')

  function submit(event) {
    event.preventDefault()
    if (!title.trim() || !subject.trim() || !dueAt) {
      setError('Lengkapi nama tugas, mata pelajaran, dan tenggat waktu.')
      return
    }
    if (Number.isNaN(new Date(dueAt).getTime())) {
      setError('Format tenggat waktu belum valid.')
      return
    }
    onSave({ title: title.trim(), subject: subject.trim(), dueAt: new Date(dueAt).toISOString(), priority })
  }

  return (
    <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
      <section className="task-modal" role="dialog" aria-modal="true" aria-labelledby="form-title">
        <div className="modal-heading">
          <div><span className="eyebrow muted-eyebrow">{task ? 'PERBARUI RENCANA' : 'TUGAS BARU'}</span><h2 id="form-title">{task ? 'Edit tugas' : 'Tambah tugas'}</h2></div>
          <button className="close-modal" onClick={onClose} aria-label="Tutup"><X size={20} /></button>
        </div>
        <p className="modal-subtitle">Catat detailnya, biar kamu bisa fokus belajar.</p>
        <form onSubmit={submit}>
          <label className="form-field"><span>Nama tugas</span><input autoFocus value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Contoh: Latihan soal bab 3" maxLength={100} /></label>
          <label className="form-field"><span>Mata pelajaran</span><input value={subject} onChange={(event) => setSubject(event.target.value)} placeholder="Contoh: Matematika" maxLength={40} /></label>
          <label className="form-field"><span>Tenggat waktu</span><input type="datetime-local" value={dueAt} onChange={(event) => setDueAt(event.target.value)} /></label>
          <fieldset className="form-field priority-field"><legend>Prioritas</legend><div className="priority-options">
            {priorityOptions.map((option) => <button type="button" key={option.value} className={`priority-choice ${priority === option.value ? 'priority-choice-selected' : ''} ${priorityClass(option.value)}`} onClick={() => setPriority(option.value)}><span />{option.value}</button>)}
          </div></fieldset>
          {error && <p className="form-error" role="alert"><AlertCircle size={15} /> {error}</p>}
          <div className="modal-actions"><button type="button" className="cancel-button" onClick={onClose}>Batal</button><button type="submit" className="save-button">{task ? 'Simpan perubahan' : <><Plus size={16} /> Simpan tugas</>}</button></div>
        </form>
      </section>
    </div>
  )
}

export default App
