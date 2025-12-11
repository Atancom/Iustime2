import React, { useState } from 'react';
import { Risk, Task } from '../types';
import { Plus, Trash2, Loader2, Save, X, Link, AlertTriangle } from 'lucide-react';

interface RisksProps {
  risks: Risk[];
  tasks: Task[]; // Need tasks to link
  lineId: string;
  onAddRisk: (risk: Risk) => void;
  onUpdateRisk: (risk: Risk) => void;
  onDeleteRisk: (id: string) => void;
}

export const Risks: React.FC<RisksProps> = ({ risks, tasks, lineId, onAddRisk, onUpdateRisk, onDeleteRisk }) => {
  const [description, setDescription] = useState('');
  const [responsible, setResponsible] = useState('');
  const [requiredAction, setRequiredAction] = useState('');
  const [taskId, setTaskId] = useState('');
  const [status, setStatus] = useState<Risk['status']>('Open');
  const [priority, setPriority] = useState<Risk['priority']>('Medium');
  const [impact, setImpact] = useState<Risk['impact']>('Low');

  const [editingId, setEditingId] = useState<string | null>(null);

  const resetForm = () => {
    setDescription('');
    setResponsible('');
    setRequiredAction('');
    setTaskId('');
    setStatus('Open');
    setPriority('Medium');
    setImpact('Low');
    setEditingId(null);
  };

  const handleEdit = (risk: Risk) => {
    setDescription(risk.description);
    setResponsible(risk.responsible);
    setRequiredAction(risk.requiredAction);
    setTaskId(risk.taskId || '');
    setStatus(risk.status);
    setPriority(risk.priority);
    setImpact(risk.impact);
    setEditingId(risk.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    const riskData: Risk = {
      id: editingId || crypto.randomUUID(),
      lineId,
      taskId: taskId || undefined,
      description,
      responsible,
      requiredAction,
      status,
      priority,
      impact,
      mitigationStrategy: ''
    };

    if (editingId) {
      onUpdateRisk(riskData);
    } else {
      onAddRisk(riskData);
    }
    resetForm();
  };

  const getTaskTitle = (id?: string) => {
      if (!id) return 'General (Sin vincular)';
      const t = tasks.find(task => task.id === id);
      return t ? t.title : 'Tarea eliminada';
  };

  const getPriorityBadge = (priority: string) => { 
    const styles = { 'High': 'text-rose-700 bg-rose-50', 'Medium': 'text-orange-700 bg-orange-50', 'Low': 'text-zinc-600 bg-zinc-50' };
    return <span className={`px-2 py-0.5 rounded text-xs font-medium border ${styles[priority as keyof typeof styles]} border-opacity-50`}>{priority === 'High' ? 'Alta' : priority === 'Medium' ? 'Media' : 'Baja'}</span>;
  };

  const getStatusBadge = (s: Risk['status']) => {
      switch(s) {
          case 'Open': return <span className="text-xs font-bold text-zinc-600 bg-zinc-100 px-2 py-1 rounded">Abierto</span>;
          case 'In Progress': return <span className="text-xs font-bold text-blue-600 bg-blue-100 px-2 py-1 rounded">En Proceso</span>;
          case 'Mitigated': return <span className="text-xs font-bold text-emerald-600 bg-emerald-100 px-2 py-1 rounded">Mitigado</span>;
          case 'Closed': return <span className="text-xs font-bold text-zinc-400 bg-zinc-50 px-2 py-1 rounded line-through">Cerrado</span>;
          default: return <span>{s}</span>;
      }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
            <h2 className="text-3xl font-bold text-zinc-800 tracking-tight">Gestión de Riesgos</h2>
            <p className="text-zinc-500 mt-2">Identificación y plan de acción para contingencias.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-zinc-200">
        <h3 className="text-lg font-bold text-zinc-800 mb-4 flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2 text-rose-500" />
            {editingId ? 'Editar Riesgo' : 'Registrar Nuevo Riesgo'}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
          
          <div className="lg:col-span-2">
            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">Vincular a Tarea / Subtarea</label>
            <div className="relative">
                <Link className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <select
                    value={taskId}
                    onChange={(e) => setTaskId(e.target.value)}
                    className="w-full rounded-md border-zinc-300 shadow-sm focus:border-zinc-500 focus:ring-zinc-500 p-2 pl-9 border text-sm"
                >
                    <option value="">-- General (Sin vincular) --</option>
                    {tasks.map(t => (
                        <option key={t.id} value={t.id}>{t.title} {t.parentId ? '(Subtarea)' : ''}</option>
                    ))}
                </select>
            </div>
          </div>

          <div className="lg:col-span-2">
            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">Descripción del Riesgo</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-md border-zinc-300 shadow-sm focus:border-zinc-500 focus:ring-zinc-500 p-2 border text-sm"
              placeholder="Ej. Retraso en entregas de proveedores..."
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">Responsable</label>
            <input
              type="text"
              value={responsible}
              onChange={(e) => setResponsible(e.target.value)}
              className="w-full rounded-md border-zinc-300 shadow-sm focus:border-zinc-500 focus:ring-zinc-500 p-2 border text-sm"
              placeholder="Nombre..."
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">Impacto (Severidad)</label>
            <select
              value={impact}
              onChange={(e) => setImpact(e.target.value as any)}
              className="w-full rounded-md border-zinc-300 shadow-sm focus:border-zinc-500 focus:ring-zinc-500 p-2 border text-sm"
            >
              <option value="Low">Bajo</option>
              <option value="Medium">Medio</option>
              <option value="High">Alto</option>
            </select>
          </div>
          
           <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">Prioridad de Acción</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as any)}
              className="w-full rounded-md border-zinc-300 shadow-sm focus:border-zinc-500 focus:ring-zinc-500 p-2 border text-sm"
            >
              <option value="Low">Baja</option>
              <option value="Medium">Media</option>
              <option value="High">Alta</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">Estado</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full rounded-md border-zinc-300 shadow-sm focus:border-zinc-500 focus:ring-zinc-500 p-2 border text-sm"
            >
              <option value="Open">Abierto</option>
              <option value="In Progress">En Proceso</option>
              <option value="Mitigated">Mitigado</option>
              <option value="Closed">Cerrado</option>
            </select>
          </div>

          <div className="lg:col-span-4">
            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">Acción Requerida / Mitigación</label>
            <textarea
              rows={2}
              value={requiredAction}
              onChange={(e) => setRequiredAction(e.target.value)}
              className="w-full rounded-md border-zinc-300 shadow-sm focus:border-zinc-500 focus:ring-zinc-500 p-2 border text-sm resize-y"
              placeholder="Plan para evitar o mitigar el riesgo..."
            />
          </div>

        </div>
        <div className="mt-6 flex justify-end gap-2 border-t border-zinc-100 pt-4">
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="flex items-center space-x-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 px-4 py-2 rounded-lg transition-colors"
            >
              <X className="h-4 w-4" />
              <span>Cancelar</span>
            </button>
          )}
          <button
            type="submit"
            className="flex items-center space-x-2 bg-zinc-800 hover:bg-zinc-900 text-white px-4 py-2 rounded-lg transition-colors shadow-sm"
          >
            {editingId ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            <span>{editingId ? 'Actualizar Riesgo' : 'Guardar Riesgo'}</span>
          </button>
        </div>
      </form>

      <div className="bg-white rounded-xl shadow-lg border border-zinc-200 overflow-hidden">
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-zinc-200">
            <thead className="bg-zinc-50">
                <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-zinc-500 uppercase tracking-wider">Tarea Vinculada</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-zinc-500 uppercase tracking-wider">Descripción</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-zinc-500 uppercase tracking-wider">Responsable</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-zinc-500 uppercase tracking-wider">Acción Requerida</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-zinc-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-zinc-500 uppercase tracking-wider">Prioridad</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-zinc-500 uppercase tracking-wider">Impacto</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-zinc-500 uppercase tracking-wider">Acciones</th>
                </tr>
            </thead>
            <tbody className="bg-white divide-y divide-zinc-200">
                {risks.length === 0 ? (
                <tr>
                    <td colSpan={8} className="px-6 py-8 text-center text-zinc-500">
                        <div className="flex flex-col items-center justify-center">
                            <AlertTriangle className="h-8 w-8 text-zinc-300 mb-2" />
                            <p>No hay riesgos registrados.</p>
                        </div>
                    </td>
                </tr>
                ) : (
                risks.map((risk) => (
                    <tr 
                        key={risk.id} 
                        onClick={() => handleEdit(risk)}
                        className="hover:bg-zinc-50 cursor-pointer transition-colors"
                    >
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-zinc-500 font-medium">
                        {risk.taskId ? (
                            <span className="flex items-center gap-1 text-blue-600">
                                <Link className="h-3 w-3" />
                                {getTaskTitle(risk.taskId)}
                            </span>
                        ) : (
                            <span className="text-zinc-400 italic">General</span>
                        )}
                    </td>
                    <td className="px-6 py-4 text-sm text-zinc-900">
                        <div className="line-clamp-2" title={risk.description}>{risk.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-600">{risk.responsible || '--'}</td>
                    <td className="px-6 py-4 text-sm text-zinc-600">
                         <div className="line-clamp-2" title={risk.requiredAction}>{risk.requiredAction || '--'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(risk.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        {getPriorityBadge(risk.priority)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${risk.impact === 'High' ? 'bg-red-100 text-red-800' : 
                            risk.impact === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-green-100 text-green-800'}`}>
                        {risk.impact === 'High' ? 'Alto' : risk.impact === 'Medium' ? 'Medio' : 'Bajo'}
                        </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button 
                            onClick={(e) => { e.stopPropagation(); onDeleteRisk(risk.id); }} 
                            className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded-full transition-colors"
                        >
                        <Trash2 className="h-5 w-5" />
                        </button>
                    </td>
                    </tr>
                ))
                )}
            </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};