import React, { useState, useMemo } from 'react';
import { Project, Task, Risk } from '../types';
import { Save, Calendar, Download, FileText, CheckCircle2, AlertCircle, BarChart3 } from 'lucide-react';

interface MonthlyReviewProps {
  lineId: string;
  projects: Project[];
  tasks: Task[];
  risks: Risk[];
}

export const MonthlyReviewView: React.FC<MonthlyReviewProps> = ({ lineId, projects, tasks, risks }) => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
  
  // Report State
  const [summary, setSummary] = useState('');
  const [achievements, setAchievements] = useState('');
  const [issues, setIssues] = useState('');
  const [nextSteps, setNextSteps] = useState('');
  
  const [isSaved, setIsSaved] = useState(false);

  // --- Calculate Stats for the Selected Month ---
  const stats = useMemo(() => {
    const [year, month] = selectedMonth.split('-').map(Number);
    
    // Filter tasks active in this month (Started before end of month AND Ended after start of month)
    const activeTasks = tasks.filter(t => {
        const start = new Date(t.startDate);
        const end = new Date(t.endDate);
        const monthStart = new Date(year, month - 1, 1);
        const monthEnd = new Date(year, month, 0); // Last day of month
        
        return start <= monthEnd && end >= monthStart;
    });

    const completedInMonth = activeTasks.filter(t => t.status === 'Completed').length;
    const delayedInMonth = activeTasks.filter(t => t.status === 'Delayed').length;
    
    // Risks open currently
    const openRisks = risks.filter(r => r.status === 'Open' || r.status === 'In Progress').length;

    return {
        totalActive: activeTasks.length,
        completed: completedInMonth,
        delayed: delayedInMonth,
        openRisks
    };
  }, [selectedMonth, tasks, risks]);

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
    // In a real app, save this object to DB linked to lineId + selectedMonth
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Revisión Mensual</h2>
            <p className="text-slate-500 mt-1">Informe de estado, logros y plan de acción.</p>
        </div>
        <div className="flex items-center gap-3 bg-white p-1.5 rounded-lg border border-slate-200 shadow-sm">
            <Calendar className="h-5 w-5 text-brand-500 ml-2" />
            <input 
                type="month" 
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="border-none focus:ring-0 text-slate-700 font-bold bg-transparent text-sm"
            />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Report Editor */}
        <div className="lg:col-span-2 space-y-6">
            
            {/* Document Editor */}
            <div className="bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden">
                <div className="bg-slate-50 px-8 py-4 border-b border-slate-200 flex justify-between items-center">
                    <div className="flex items-center gap-2 text-slate-500 text-sm font-medium uppercase tracking-wider">
                        <FileText className="h-4 w-4" />
                        Documento de Revisión
                    </div>
                    <button onClick={() => window.print()} className="text-slate-400 hover:text-brand-600">
                        <Download className="h-5 w-5" />
                    </button>
                </div>
                
                <div className="p-8 space-y-8">
                    
                    {/* Executive Summary */}
                    <div>
                        <label className="block text-sm font-bold text-slate-800 mb-2 uppercase tracking-wide">Resumen Ejecutivo</label>
                        <textarea
                            value={summary}
                            onChange={(e) => setSummary(e.target.value)}
                            className="w-full rounded-lg border-slate-200 bg-slate-50/50 p-4 text-slate-700 leading-relaxed focus:bg-white focus:border-brand-500 focus:ring-brand-500 transition-all shadow-sm"
                            rows={4}
                            placeholder="Visión general del estado del proyecto este mes..."
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Achievements */}
                        <div>
                            <label className="block text-sm font-bold text-emerald-700 mb-2 uppercase tracking-wide flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4" /> Logros Principales
                            </label>
                            <textarea
                                value={achievements}
                                onChange={(e) => setAchievements(e.target.value)}
                                className="w-full rounded-lg border-emerald-100 bg-emerald-50/30 p-4 text-slate-700 leading-relaxed focus:bg-white focus:border-emerald-500 focus:ring-emerald-500 transition-all shadow-sm"
                                rows={8}
                                placeholder="Lista de hitos conseguidos..."
                            />
                        </div>

                        {/* Issues */}
                        <div>
                            <label className="block text-sm font-bold text-rose-700 mb-2 uppercase tracking-wide flex items-center gap-2">
                                <AlertCircle className="h-4 w-4" /> Bloqueos y Riesgos
                            </label>
                            <textarea
                                value={issues}
                                onChange={(e) => setIssues(e.target.value)}
                                className="w-full rounded-lg border-rose-100 bg-rose-50/30 p-4 text-slate-700 leading-relaxed focus:bg-white focus:border-rose-500 focus:ring-rose-500 transition-all shadow-sm"
                                rows={8}
                                placeholder="Problemas detectados y áreas de atención..."
                            />
                        </div>
                    </div>

                    {/* Next Steps */}
                    <div>
                        <label className="block text-sm font-bold text-slate-800 mb-2 uppercase tracking-wide">Próximos Pasos Estratégicos</label>
                        <textarea
                            value={nextSteps}
                            onChange={(e) => setNextSteps(e.target.value)}
                            className="w-full rounded-lg border-slate-200 bg-slate-50/50 p-4 text-slate-700 leading-relaxed focus:bg-white focus:border-brand-500 focus:ring-brand-500 transition-all shadow-sm"
                            rows={3}
                            placeholder="Acciones clave para el mes entrante..."
                        />
                    </div>

                </div>
                
                <div className="bg-slate-50 px-8 py-4 border-t border-slate-200 flex justify-end">
                    <button
                        onClick={handleSave}
                        className="flex items-center space-x-2 bg-brand-700 hover:bg-brand-800 text-white px-8 py-2.5 rounded-lg transition-all shadow-md font-bold"
                    >
                        <Save className="h-4 w-4" />
                        <span>{isSaved ? 'Guardado' : 'Guardar Revisión'}</span>
                    </button>
                </div>
            </div>
        </div>

        {/* Right Column: Month Stats Context */}
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm sticky top-6">
                <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2 border-b border-slate-100 pb-4">
                    <BarChart3 className="h-5 w-5 text-brand-600" />
                    Métricas de {selectedMonth}
                </h3>
                
                <div className="space-y-6">
                    <div>
                        <div className="flex justify-between text-sm mb-1">
                            <span className="text-slate-500">Tareas Activas</span>
                            <span className="font-bold text-slate-800">{stats.totalActive}</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2">
                            <div className="bg-brand-500 h-2 rounded-full" style={{width: '100%'}}></div>
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between text-sm mb-1">
                            <span className="text-slate-500">Completadas</span>
                            <span className="font-bold text-emerald-600">{stats.completed}</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2">
                            <div 
                                className="bg-emerald-500 h-2 rounded-full" 
                                style={{width: stats.totalActive > 0 ? `${(stats.completed / stats.totalActive) * 100}%` : '0%'}}
                            ></div>
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between text-sm mb-1">
                            <span className="text-slate-500">Retrasadas</span>
                            <span className="font-bold text-rose-600">{stats.delayed}</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2">
                            <div 
                                className="bg-rose-500 h-2 rounded-full" 
                                style={{width: stats.totalActive > 0 ? `${(stats.delayed / stats.totalActive) * 100}%` : '0%'}}
                            ></div>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100">
                        <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-100">
                            <span className="text-sm font-medium text-orange-800">Riesgos Abiertos</span>
                            <span className="bg-white px-2 py-0.5 rounded text-sm font-bold text-orange-700 shadow-sm">
                                {stats.openRisks}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};