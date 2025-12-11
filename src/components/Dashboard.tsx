import React, { useMemo } from 'react';
import { Project, Task, Risk } from '../types';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, 
  XAxis, YAxis, Tooltip, Legend, CartesianGrid, 
  LineChart, Line 
} from 'recharts';
import { Users, AlertCircle, Briefcase } from 'lucide-react';

interface DashboardProps {
  projects: Project[];
  tasks: Task[];
  risks: Risk[];
}

export const Dashboard: React.FC<DashboardProps> = ({ projects, tasks }) => {

  const projectStats = useMemo(() => {
    return projects.map(project => {
      const projectTasks = tasks.filter(t => t.projectId === project.id);
      const total = projectTasks.length;
      const completed = projectTasks.filter(t => t.status === 'Completed').length;
      const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
      
      return {
        id: project.id,
        name: project.name,
        total,
        completed,
        progress,
        status: project.status
      };
    }).sort((a, b) => b.progress - a.progress);
  }, [projects, tasks]);

  const responsibleStats = useMemo(() => {
    const assignees = Array.from(new Set(tasks.map(t => t.assignee).filter(Boolean)));
    
    return assignees.map(assignee => {
      const userTasks = tasks.filter(t => t.assignee === assignee);
      const total = userTasks.length;
      const completed = userTasks.filter(t => t.status === 'Completed').length;
      const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
      const userProjectIds = new Set(userTasks.map(t => t.projectId));
      
      return {
        name: assignee,
        projectsCount: userProjectIds.size,
        total,
        completed,
        progress
      };
    }).sort((a, b) => b.completed - a.completed);
  }, [tasks]);

  const monthlyEvolutionData = useMemo(() => {
    const completedTasks = tasks.filter(t => t.status === 'Completed');
    const grouped: Record<string, number> = {};

    for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        grouped[key] = 0;
    }

    completedTasks.forEach(t => {
        const d = new Date(t.endDate);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        if (grouped[key] !== undefined) {
            grouped[key]++;
        }
    });

    return Object.keys(grouped).sort().map(key => {
        const [year, month] = key.split('-');
        const date = new Date(parseInt(year), parseInt(month) - 1);
        return {
            name: date.toLocaleDateString('es-ES', { month: 'short' }).toUpperCase(),
            completed: grouped[key]
        };
    });
  }, [tasks]);

  const statusData = [
    { name: 'Completado', value: tasks.filter(t => t.status === 'Completed').length, color: '#10b981' },
    { name: 'En Progreso', value: tasks.filter(t => t.status === 'In Progress').length, color: '#3b82f6' },
    { name: 'Retrasado', value: tasks.filter(t => t.status === 'Delayed').length, color: '#f43f5e' },
    { name: 'Por Iniciar', value: tasks.filter(t => t.status === 'Ready to Start').length, color: '#94a3b8' },
  ].filter(d => d.value > 0);

  const totalProjects = projects.length;
  const avgProjectProgress = projects.length > 0 
    ? Math.round(projects.reduce((acc, p) => acc + (p.progress || 0), 0) / projects.length) 
    : 0;
  
  const prioritiesCount = {
    High: tasks.filter(t => t.priority === 'High').length,
    Medium: tasks.filter(t => t.priority === 'Medium').length,
    Low: tasks.filter(t => t.priority === 'Low').length,
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      
      <div>
        <h2 className="text-3xl font-bold text-zinc-800 tracking-tight">Dashboard Ejecutivo</h2>
        <p className="text-zinc-500 mt-2">Métricas de rendimiento, evolución y carga de trabajo.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-zinc-200">
            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-4">Resumen Global</h3>
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <span className="text-zinc-600 text-sm">Total Proyectos</span>
                    <span className="text-lg font-bold text-zinc-800">{totalProjects}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-zinc-600 text-sm">Progreso Promedio</span>
                    <span className={`text-lg font-bold ${avgProjectProgress >= 70 ? 'text-emerald-600' : 'text-blue-600'}`}>
                        {avgProjectProgress}%
                    </span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-zinc-600 text-sm">Total Tareas</span>
                    <span className="text-lg font-bold text-zinc-800">{tasks.length}</span>
                </div>
            </div>
        </div>

        <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-zinc-200">
            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-4">Prioridades (Tareas)</h3>
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <span className="w-3 h-3 rounded-full bg-rose-500 mr-2"></span>
                        <span className="text-sm text-zinc-600">Alta</span>
                    </div>
                    <span className="font-bold text-zinc-800">{prioritiesCount.High}</span>
                </div>
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <span className="w-3 h-3 rounded-full bg-orange-400 mr-2"></span>
                        <span className="text-sm text-zinc-600">Media</span>
                    </div>
                    <span className="font-bold text-zinc-800">{prioritiesCount.Medium}</span>
                </div>
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <span className="w-3 h-3 rounded-full bg-zinc-300 mr-2"></span>
                        <span className="text-sm text-zinc-600">Baja</span>
                    </div>
                    <span className="font-bold text-zinc-800">{prioritiesCount.Low}</span>
                </div>
            </div>
        </div>

        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-zinc-200">
             <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Evolución Mensual (Tareas Completadas)</h3>
             <div className="h-40 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthlyEvolutionData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="name" tick={{fontSize: 10}} axisLine={false} tickLine={false} />
                        <YAxis hide />
                        <Tooltip 
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            cursor={{ stroke: '#cbd5e1', strokeWidth: 1 }}
                        />
                        <Line type="monotone" dataKey="completed" stroke="#3b82f6" strokeWidth={3} dot={{r: 4, fill: '#3b82f6'}} activeDot={{r: 6}} />
                    </LineChart>
                </ResponsiveContainer>
             </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-zinc-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-zinc-100 flex justify-between items-center">
             <h3 className="font-bold text-zinc-800 flex items-center">
                <Briefcase className="h-5 w-5 mr-2 text-zinc-600" />
                Progreso por Proyecto
             </h3>
        </div>
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-zinc-100">
                <thead className="bg-zinc-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-bold text-zinc-500 uppercase tracking-wider">Proyecto</th>
                        <th className="px-6 py-3 text-center text-xs font-bold text-zinc-500 uppercase tracking-wider">Total Tareas</th>
                        <th className="px-6 py-3 text-center text-xs font-bold text-zinc-500 uppercase tracking-wider">Completadas</th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-zinc-500 uppercase tracking-wider w-1/3">% Progreso</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-zinc-100">
                    {projectStats.map((p) => (
                        <tr key={p.id} className="hover:bg-zinc-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-zinc-800">{p.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-zinc-600">{p.total}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-zinc-600">{p.completed}</td>
                            <td className="px-6 py-4 whitespace-nowrap align-middle">
                                <div className="flex items-center">
                                    <div className="flex-1 bg-zinc-100 rounded-full h-2 mr-3">
                                        <div 
                                            className={`h-2 rounded-full ${p.progress === 100 ? 'bg-emerald-500' : 'bg-blue-600'}`} 
                                            style={{ width: `${p.progress}%` }}
                                        ></div>
                                    </div>
                                    <span className="text-xs font-bold text-zinc-700 w-8 text-right">{p.progress}%</span>
                                </div>
                            </td>
                        </tr>
                    ))}
                    {projectStats.length === 0 && (
                        <tr><td colSpan={4} className="px-6 py-8 text-center text-zinc-400">No hay datos de proyectos disponibles</td></tr>
                    )}
                </tbody>
            </table>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-zinc-200">
            <h3 className="font-bold text-zinc-800 mb-6 flex items-center">
                <AlertCircle className="h-5 w-5 mr-2 text-zinc-600" />
                Distribución de Estados
            </h3>
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={statusData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {statusData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip />
                        <Legend verticalAlign="bottom" height={36}/>
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-zinc-200 overflow-hidden">
             <div className="px-6 py-5 border-b border-zinc-100 flex justify-between items-center">
                <h3 className="font-bold text-zinc-800 flex items-center">
                    <Users className="h-5 w-5 mr-2 text-zinc-600" />
                    Panel por Responsable
                </h3>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-zinc-100">
                    <thead className="bg-zinc-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-bold text-zinc-500 uppercase tracking-wider">Responsable</th>
                            <th className="px-6 py-3 text-center text-xs font-bold text-zinc-500 uppercase tracking-wider">Proyectos</th>
                            <th className="px-6 py-3 text-center text-xs font-bold text-zinc-500 uppercase tracking-wider">Tareas Total</th>
                            <th className="px-6 py-3 text-center text-xs font-bold text-zinc-500 uppercase tracking-wider">Completadas</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-zinc-500 uppercase tracking-wider">% Cumplimiento</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-zinc-100">
                        {responsibleStats.map((r, idx) => (
                            <tr key={idx} className="hover:bg-zinc-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-zinc-800">
                                    <div className="flex items-center">
                                        <div className="h-6 w-6 rounded-full bg-zinc-200 flex items-center justify-center text-[10px] font-bold text-zinc-600 mr-2">
                                            {r.name.charAt(0).toUpperCase()}
                                        </div>
                                        {r.name}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-zinc-600">{r.projectsCount}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-zinc-600">{r.total}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-zinc-600">{r.completed}</td>
                                <td className="px-6 py-4 whitespace-nowrap align-middle">
                                    <div className="flex items-center">
                                        <div className="flex-1 bg-zinc-100 rounded-full h-1.5 mr-3 w-24">
                                            <div 
                                                className={`h-1.5 rounded-full ${r.progress >= 80 ? 'bg-emerald-500' : r.progress >= 50 ? 'bg-blue-500' : 'bg-orange-400'}`} 
                                                style={{ width: `${r.progress}%` }}
                                            ></div>
                                        </div>
                                        <span className="text-xs font-bold text-zinc-700">{r.progress}%</span>
                                    </div>
                                </td>
                            </tr>
                        ))}
                         {responsibleStats.length === 0 && (
                            <tr><td colSpan={5} className="px-6 py-8 text-center text-zinc-400">No hay datos de responsables disponibles</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>

      </div>
    </div>
  );
};