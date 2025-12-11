import React, { useState, useEffect } from 'react';
import { LineSelector } from './components/LineSelector';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { Projects } from './components/Projects';
import { Tasks } from './components/Tasks';
import { Risks } from './components/Risks';
import { Timeline } from './components/Timeline';
import { MonthlyReviewView } from './components/MonthlyReview';
import { Login } from './components/Login';
import { UserManagement } from './components/UserManagement';
import { WorkLine, Project, Task, Risk, ViewState, User } from './types';
import { Menu, LogOut, ArrowLeft } from 'lucide-react';

const App: React.FC = () => {
  const [lines, setLines] = useState<WorkLine[]>(() => {
    const saved = localStorage.getItem('iustime_lines');
    return saved ? JSON.parse(saved) : [{ id: 'line-1', name: 'Línea General', description: 'Línea por defecto', createdAt: new Date().toISOString() }];
  });
  const [projects, setProjects] = useState<Project[]>(() => JSON.parse(localStorage.getItem('iustime_projects') || '[]'));
  const [tasks, setTasks] = useState<Task[]>(() => JSON.parse(localStorage.getItem('iustime_tasks') || '[]'));
  const [risks, setRisks] = useState<Risk[]>(() => JSON.parse(localStorage.getItem('iustime_risks') || '[]'));
  const [users, setUsers] = useState<User[]>(() => JSON.parse(localStorage.getItem('iustime_users') || JSON.stringify([
    { id: 'admin', name: 'Admin', email: 'admin@iustime.com', password: 'admin', role: 'ADMIN' },
    { id: 'ana', name: 'Ana Tanco', email: 'ana.tanco@solfico.es', password: 'An@t4505', role: 'ADMIN' }
  ])));

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedLineId, setSelectedLineId] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.PROJECTS);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [adminViewLineId, setAdminViewLineId] = useState<string>('');

  useEffect(() => localStorage.setItem('iustime_lines', JSON.stringify(lines)), [lines]);
  useEffect(() => localStorage.setItem('iustime_projects', JSON.stringify(projects)), [projects]);
  useEffect(() => localStorage.setItem('iustime_tasks', JSON.stringify(tasks)), [tasks]);
  useEffect(() => localStorage.setItem('iustime_risks', JSON.stringify(risks)), [risks]);
  useEffect(() => localStorage.setItem('iustime_users', JSON.stringify(users)), [users]);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    if (user.role === 'USER' && user.assignedLineId) {
        setSelectedLineId(user.assignedLineId);
        setCurrentView(ViewState.DASHBOARD);
    } else {
        setSelectedLineId(null);
        if (lines.length > 0) setAdminViewLineId(lines[0].id);
    }
  };

  const handleLogout = () => { setCurrentUser(null); setSelectedLineId(null); setSidebarOpen(false); };
  
  const recalculateProgress = (projectId: string, currentTasks: Task[]) => {
      const pTasks = currentTasks.filter(t => t.projectId === projectId && !t.parentId);
      if (pTasks.length === 0) return 0;
      return Math.round(pTasks.reduce((acc, t) => acc + t.progress, 0) / pTasks.length);
  };

  const handleAddTask = (t: Task) => {
      const newTasks = [...tasks, t];
      setTasks(newTasks);
      setProjects(projects.map(p => p.id === t.projectId ? { ...p, progress: recalculateProgress(p.id, newTasks) } : p));
  };

  const handleUpdateTask = (t: Task) => {
      const newTasks = tasks.map(tk => tk.id === t.id ? t : tk);
      setTasks(newTasks);
      setProjects(projects.map(p => p.id === t.projectId ? { ...p, progress: recalculateProgress(p.id, newTasks) } : p));
  };

  if (!currentUser) return <Login users={users} onLogin={handleLogin} />;

  const isGlobal = currentView === ViewState.GLOBAL_DASHBOARD || currentView === ViewState.GLOBAL_REVIEW || currentView === ViewState.CONFIGURATION;
  const activeLineId = isGlobal ? adminViewLineId : selectedLineId;
  const filteredProjects = projects.filter(p => p.lineId === activeLineId);
  const filteredTasks = tasks.filter(t => t.lineId === activeLineId);
  const filteredRisks = risks.filter(r => r.lineId === activeLineId);

  if (currentUser.role === 'ADMIN' && !selectedLineId && !isGlobal) {
      return <LineSelector lines={lines} onSelectLine={(id) => { setSelectedLineId(id); setCurrentView(ViewState.PROJECTS); }} onAddLine={(l) => setLines([...lines, l])} onDeleteLine={(id) => setLines(lines.filter(l => l.id !== id))} />;
  }

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden">
        <Sidebar currentView={currentView} onChangeView={setCurrentView} onExitLine={() => { setSelectedLineId(null); setCurrentView(ViewState.PROJECTS); }} onLogout={handleLogout} lineName={lines.find(l => l.id === selectedLineId)?.name || 'Admin'} isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} userRole={currentUser.role} />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-4 shadow-sm z-10 shrink-0">
                <div className="flex items-center gap-4">
                    <button onClick={() => setSidebarOpen(true)} className="md:hidden"><Menu className="h-6 w-6 text-slate-500" /></button>
                    <div className="flex items-center">
                         {currentUser.role === 'ADMIN' && (selectedLineId || isGlobal) && <button onClick={() => { setSelectedLineId(null); setCurrentView(ViewState.PROJECTS); }} className="mr-3"><ArrowLeft className="h-5 w-5 text-slate-400" /></button>}
                         <h1 className="font-bold text-slate-800 text-lg truncate">
                            {selectedLineId 
                                ? (lines.find(l => l.id === selectedLineId)?.name) 
                                : isGlobal 
                                    ? (currentView === ViewState.CONFIGURATION ? 'Configuración' : 'Visión General Administrador') 
                                    : 'Gestión de Líneas Ius'}
                         </h1>
                    </div>
                </div>
                <div className="flex items-center space-x-3">
                     <span className="text-sm text-slate-500 hidden sm:inline">{currentUser.name}</span>
                     {currentUser.role === 'ADMIN' && selectedLineId && <button onClick={() => setSelectedLineId(null)} className="text-sm text-slate-600 border px-3 py-1 rounded hover:bg-slate-50"><LogOut className="h-4 w-4 inline mr-1" /> Cambiar</button>}
                </div>
            </header>
            <main className="flex-1 overflow-y-auto bg-slate-50/50 p-4 md:p-8">
                {currentView === ViewState.DASHBOARD && <Dashboard projects={filteredProjects} tasks={filteredTasks} risks={filteredRisks} />}
                {currentView === ViewState.PROJECTS && <Projects projects={filteredProjects} lineId={activeLineId!} onAddProject={(p) => setProjects([...projects, p])} onUpdateProject={(p) => setProjects(projects.map(pr => pr.id === p.id ? p : pr))} onDeleteProject={(id) => setProjects(projects.filter(p => p.id !== id))} />}
                {currentView === ViewState.TASKS && <Tasks tasks={filteredTasks} projects={filteredProjects} lineId={activeLineId!} onAddTask={handleAddTask} onUpdateTask={handleUpdateTask} onDeleteTask={(id) => setTasks(tasks.filter(t => t.id !== id))} />}
                {currentView === ViewState.TIMELINE && <Timeline tasks={filteredTasks} />}
                {currentView === ViewState.RISKS && <Risks risks={filteredRisks} tasks={filteredTasks} lineId={activeLineId!} onAddRisk={(r) => setRisks([...risks, r])} onUpdateRisk={(r) => setRisks(risks.map(rk => rk.id === r.id ? r : rk))} onDeleteRisk={(id) => setRisks(risks.filter(r => r.id !== id))} />}
                {currentView === ViewState.MONTHLY_REVIEW && <MonthlyReviewView lineId={activeLineId!} projects={filteredProjects} tasks={filteredTasks} risks={filteredRisks} />}
                {currentView === ViewState.CONFIGURATION && <UserManagement users={users} lines={lines} onAddUser={(u) => setUsers([...users, u])} onUpdateUser={(u) => setUsers(users.map(us => us.id === u.id ? u : us))} onDeleteUser={(id) => setUsers(users.filter(u => u.id !== id))} />}
            </main>
        </div>
    </div>
  );
};

export default App;