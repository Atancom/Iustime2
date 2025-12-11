import React, { useState, useMemo, useRef } from 'react';
import { Task, Project, ChecklistItem, Attachment } from '../types';
import { Plus, CheckCircle2, Circle, Trash2, Filter, ArrowUpDown, X, ListTodo, AlertCircle, PlayCircle, CornerDownRight, Paperclip, FileIcon, CheckSquare, MoreHorizontal, Layers, LayoutList, Calculator } from 'lucide-react';

interface TasksProps {
  tasks: Task[];
  projects: Project[];
  lineId: string;
  onAddTask: (task: Task) => void;
  onUpdateTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
}

type SortField = 'projectName' | 'title' | 'endDate' | 'priority' | 'status' | 'progress';
type SortDirection = 'asc' | 'desc';
type TaskType = 'task' | 'subtask';

export const Tasks: React.FC<TasksProps> = ({ tasks, projects, lineId, onAddTask, onUpdateTask, onDeleteTask }) => {
  const [showForm, setShowForm] = useState(false);
  const [filterProjectId, setFilterProjectId] = useState<string>('all');
  
  // Sorting
  const [sortField, setSortField] = useState<SortField>('endDate');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [taskType, setTaskType] = useState<TaskType>('task');
  
  // Specific Form Inputs
  const [checklistItemInput, setChecklistItemInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [newTask, setNewTask] = useState<Partial<Task>>({
    projectId: '',
    parentId: '',
    title: '',
    assignee: '',
    startDate: '',
    endDate: '',
    priority: 'Medium',
    difficulty: 'Medium',
    progress: 0,
    status: 'Ready to Start',
    dependencies: '',
    comments: '',
    checklist: [],
    attachments: []
  });

  // Check if current editing task has children (Subtasks)
  const hasSubtasks = useMemo(() => {
    if (!editingId) return false;
    return tasks.some(t => t.parentId === editingId);
  }, [editingId, tasks]);

  // --- Helpers ---

  const resetForm = () => {
    setNewTask({
      projectId: filterProjectId !== 'all' ? filterProjectId : '',
      parentId: '',
      title: '',
      assignee: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      priority: 'Medium',
      difficulty: 'Medium',
      progress: 0,
      status: 'Ready to Start',
      dependencies: '',
      comments: '',
      checklist: [],
      attachments: []
    });
    setEditingId(null);
    setTaskType('task');
    setShowForm(false);
    setChecklistItemInput('');
  };

  const openNew = () => {
    resetForm();
    setTaskType('task');
    setShowForm(true);
    // Auto-select project if filtering
    if (filterProjectId !== 'all') {
        setNewTask(prev => ({ ...prev, projectId: filterProjectId }));
    }
  };

  const openEdit = (task: Task) => {
    setNewTask({ ...task });
    setEditingId(task.id);
    setTaskType(task.parentId ? 'subtask' : 'task');
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openSubtaskCreate = (parent: Task) => {
    resetForm();
    setTaskType('subtask');
    setNewTask({
      ...newTask,
      projectId: parent.projectId,
      parentId: parent.id,
      startDate: parent.startDate, // Inherit dates for convenience
      endDate: parent.endDate
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // --- Handlers: Form Submission ---

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.title) return;
    
    // Validate based on type
    if (taskType === 'task' && !newTask.projectId) {
        alert("Por favor selecciona un Proyecto para la tarea principal.");
        return;
    }
    if (taskType === 'subtask' && !newTask.parentId) {
        alert("Por favor selecciona una Tarea Principal para la subtarea.");
        return;
    }

    const finalProjectId = taskType === 'subtask' 
        ? (tasks.find(t => t.id === newTask.parentId)?.projectId || newTask.projectId!)
        : newTask.projectId!;

    const taskData: Task = {
      id: editingId || crypto.randomUUID(),
      lineId,
      projectId: finalProjectId,
      parentId: taskType === 'subtask' ? newTask.parentId : null,
      title: newTask.title!,
      assignee: newTask.assignee || '',
      startDate: newTask.startDate || new Date().toISOString().split('T')[0],
      endDate: newTask.endDate || new Date().toISOString().split('T')[0],
      priority: (newTask.priority as any) || 'Medium',
      difficulty: (newTask.difficulty as any) || 'Medium',
      progress: Number(newTask.progress) || 0,
      status: (newTask.status as any) || 'Ready to Start',
      dependencies: newTask.dependencies || '',
      comments: newTask.comments || '',
      checklist: newTask.checklist || [],
      attachments: newTask.attachments || []
    };

    if (editingId) {
      onUpdateTask(taskData);
    } else {
      onAddTask(taskData);
    }

    resetForm();
  };

  // --- Handlers: Checklist & Attachments (Same as before) ---
  const addChecklistItem = () => {
    if (!checklistItemInput.trim()) return;
    const newItem: ChecklistItem = { id: crypto.randomUUID(), text: checklistItemInput.trim(), completed: false };
    setNewTask(prev => ({ ...prev, checklist: [...(prev.checklist || []), newItem] }));
    setChecklistItemInput('');
  };
  const toggleChecklistItem = (itemId: string) => {
    setNewTask(prev => ({ ...prev, checklist: prev.checklist?.map(item => item.id === itemId ? { ...item, completed: !item.completed } : item) }));
  };
  const removeChecklistItem = (itemId: string) => {
    setNewTask(prev => ({ ...prev, checklist: prev.checklist?.filter(item => item.id !== itemId) }));
  };
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        const newAttachment: Attachment = { id: crypto.randomUUID(), name: file.name, type: file.type, size: file.size, data: event.target?.result as string, createdAt: new Date().toISOString() };
        setNewTask(prev => ({ ...prev, attachments: [...(prev.attachments || []), newAttachment] }));
      };
      reader.readAsDataURL(file);
    }
  };
  const removeAttachment = (attachmentId: string) => {
    setNewTask(prev => ({ ...prev, attachments: prev.attachments?.filter(a => a.id !== attachmentId) }));
  };

  // --- Handlers: List Actions ---
  const toggleStatus = (task: Task) => {
    const statusCycle: Task['status'][] = ['Ready to Start', 'In Progress', 'Delayed', 'Completed'];
    const nextStatus = statusCycle[(statusCycle.indexOf(task.status) + 1) % statusCycle.length];
    onUpdateTask({ ...task, status: nextStatus });
  };

  const handleDelete = (id: string) => {
    if (window.confirm('¿Eliminar tarea? Si tiene subtareas, estas podrían quedar huérfanas.')) {
        onDeleteTask(id);
    }
  };

  const getProjectName = (pid: string) => projects.find(p => p.id === pid)?.name || 'Sin Proyecto';

  // --- Derived State: Hierarchy & Parent Options ---

  // Get potential parents for the dropdown (only top-level tasks)
  const availableParents = useMemo(() => {
    return tasks.filter(t => !t.parentId && (newTask.projectId ? t.projectId === newTask.projectId : true));
  }, [tasks, newTask.projectId]);

  const processedTasks = useMemo(() => {
    let filtered = tasks;
    if (filterProjectId !== 'all') {
      filtered = filtered.filter(t => t.projectId === filterProjectId);
    }

    const parents = filtered.filter(t => !t.parentId);
    const childrenMap = new Map<string, Task[]>();
    
    filtered.filter(t => t.parentId).forEach(child => {
        if (child.parentId) {
            if (!childrenMap.has(child.parentId)) childrenMap.set(child.parentId, []);
            childrenMap.get(child.parentId)?.push(child);
        }
    });

    // Sort Parents
    parents.sort((a, b) => {
      // (Sorting logic same as before)
      if (sortField === 'endDate') return sortDirection === 'asc' ? a.endDate.localeCompare(b.endDate) : b.endDate.localeCompare(a.endDate);
      if (sortField === 'progress') return sortDirection === 'asc' ? a.progress - b.progress : b.progress - a.progress;
      if (sortField === 'projectName') {
          const nameA = getProjectName(a.projectId).toLowerCase();
          const nameB = getProjectName(b.projectId).toLowerCase();
          return sortDirection === 'asc' ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
      }
      return 0; // Default
    });

    const result: Task[] = [];
    parents.forEach(parent => {
        result.push(parent);
        const children = childrenMap.get(parent.id);
        if (children) {
            children.sort((a,b) => a.endDate.localeCompare(b.endDate));
            result.push(...children);
        }
    });

    return result;
  }, [tasks, filterProjectId, sortField, sortDirection, projects]);

  // --- Badges Helpers (same as before) ---
  const getStatusBadge = (status: Task['status']) => { 
     switch (status) {
       case 'Completed': return <span className="flex items-center text-emerald-600 text-xs font-bold bg-emerald-50 px-2 py-1 rounded border border-emerald-100"><CheckCircle2 className="h-3 w-3 mr-1"/> Completada</span>;
       case 'In Progress': return <span className="flex items-center text-blue-600 text-xs font-bold bg-blue-50 px-2 py-1 rounded border border-blue-100"><PlayCircle className="h-3 w-3 mr-1"/> En Progreso</span>;
       case 'Delayed': return <span className="flex items-center text-rose-600 text-xs font-bold bg-rose-50 px-2 py-1 rounded border border-rose-100"><AlertCircle className="h-3 w-3 mr-1"/> Retrasada</span>;
       default: return <span className="flex items-center text-slate-500 text-xs font-bold bg-slate-50 px-2 py-1 rounded border border-slate-200"><Circle className="h-3 w-3 mr-1"/> Por Iniciar</span>;
     }
  };
  const getPriorityBadge = (priority: string) => { 
    const styles = { 'High': 'text-rose-700 bg-rose-50', 'Medium': 'text-orange-700 bg-orange-50', 'Low': 'text-slate-600 bg-slate-50' };
    return <span className={`px-2 py-0.5 rounded text-xs font-medium border ${styles[priority as keyof typeof styles]} border-opacity-50`}>{priority === 'High' ? 'Alta' : priority === 'Medium' ? 'Media' : 'Baja'}</span>;
  };

  const getDifficultyBadge = (difficulty?: string) => {
    const styles = {
      'High': 'text-purple-700 bg-purple-50 border border-purple-100',
      'Medium': 'text-indigo-700 bg-indigo-50 border border-indigo-100',
      'Low': 'text-slate-600 bg-slate-50 border border-slate-200'
    };
    const labels = { 'High': 'Alta', 'Medium': 'Media', 'Low': 'Baja' };
    const val = (difficulty as keyof typeof styles) || 'Medium';
    return (
      <span className={`px-2 py-0.5 rounded text-xs font-medium ${styles[val]}`}>
        {labels[val]}
      </span>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4 border-b border-slate-200 pb-6">
        <div>
           <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Tareas</h2>
           <p className="text-slate-500 mt-2">Gestión detallada de actividades y entregables.</p>
        </div>
        
        <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
            <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <select
                    value={filterProjectId}
                    onChange={(e) => setFilterProjectId(e.target.value)}
                    className="pl-9 pr-8 py-2.5 rounded-lg border-slate-200 text-sm shadow-sm focus:border-brand-500 focus:ring-brand-500 bg-white min-w-[200px]"
                >
                    <option value="all">Ver Todos los Proyectos</option>
                    {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
            </div>

            <button
                onClick={openNew}
                className="flex items-center justify-center space-x-2 px-5 py-2.5 rounded-lg transition-all shadow-sm font-medium bg-brand-800 hover:bg-brand-900 text-white hover:shadow-md"
            >
                <Plus className="h-4 w-4" />
                <span>Nueva Tarea</span>
            </button>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-slate-50 p-6 rounded-xl shadow-inner border border-slate-200 mb-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-brand-500"></div>
          
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-800 flex items-center">
                {editingId ? <ListTodo className="h-5 w-5 mr-2 text-brand-600"/> : <Plus className="h-5 w-5 mr-2 text-brand-600"/>}
                {editingId ? 'Editar Actividad' : 'Crear Nueva Actividad'}
            </h3>
            <button onClick={resetForm} className="text-slate-400 hover:text-slate-600"><X className="h-5 w-5" /></button>
          </div>

          <form onSubmit={handleSubmit}>
             {/* Type Selector */}
             <div className="mb-6">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Tipo de Actividad</label>
                <div className="flex gap-4">
                    <button
                        type="button"
                        onClick={() => { setTaskType('task'); setNewTask({...newTask, parentId: null}); }}
                        className={`flex-1 flex items-center justify-center p-3 rounded-lg border transition-all ${taskType === 'task' 
                            ? 'bg-white border-brand-500 text-brand-700 ring-1 ring-brand-500 shadow-sm' 
                            : 'bg-slate-100 border-transparent text-slate-500 hover:bg-white hover:border-slate-300'}`}
                    >
                        <LayoutList className="h-5 w-5 mr-2" />
                        <span className="font-semibold">Tarea Principal</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => { setTaskType('subtask'); setNewTask({...newTask, parentId: ''}); }}
                        className={`flex-1 flex items-center justify-center p-3 rounded-lg border transition-all ${taskType === 'subtask' 
                            ? 'bg-white border-brand-500 text-brand-700 ring-1 ring-brand-500 shadow-sm' 
                            : 'bg-slate-100 border-transparent text-slate-500 hover:bg-white hover:border-slate-300'}`}
                    >
                        <Layers className="h-5 w-5 mr-2" />
                        <span className="font-semibold">Subtarea</span>
                    </button>
                </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                
                {/* Project or Parent Selection based on Type */}
                {taskType === 'task' ? (
                    <div className="lg:col-span-1">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Proyecto</label>
                        <select
                            value={newTask.projectId}
                            onChange={(e) => setNewTask({...newTask, projectId: e.target.value})}
                            className="w-full rounded-md border-slate-300 p-2 text-sm"
                            required
                        >
                            <option value="">Seleccionar Proyecto...</option>
                            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                    </div>
                ) : (
                    <div className="lg:col-span-1">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Tarea Principal (Padre)</label>
                        <select
                            value={newTask.parentId || ''}
                            onChange={(e) => {
                                const parent = tasks.find(t => t.id === e.target.value);
                                setNewTask({
                                    ...newTask, 
                                    parentId: e.target.value, 
                                    projectId: parent?.projectId || newTask.projectId 
                                });
                            }}
                            className="w-full rounded-md border-slate-300 p-2 text-sm bg-blue-50/50 border-blue-200 text-blue-900"
                            required
                        >
                            <option value="">Seleccionar Tarea Padre...</option>
                            {availableParents.map(t => (
                                <option key={t.id} value={t.id}>{t.title} ({getProjectName(t.projectId)})</option>
                            ))}
                        </select>
                    </div>
                )}

                <div className="lg:col-span-3">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                        {taskType === 'task' ? 'Nombre de la Tarea' : 'Nombre de la Subtarea'}
                    </label>
                    <textarea 
                        rows={1}
                        placeholder="Descripción corta..."
                        value={newTask.title}
                        onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                        className="w-full rounded-md border-slate-300 p-2 text-sm resize-y"
                        required
                    />
                </div>
                
                {/* Standard Fields */}
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Responsable</label>
                    <input type="text" value={newTask.assignee} onChange={(e) => setNewTask({...newTask, assignee: e.target.value})} className="w-full rounded-md border-slate-300 p-2 text-sm" />
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Fecha Inicio</label>
                    <input type="date" value={newTask.startDate} onChange={(e) => setNewTask({...newTask, startDate: e.target.value})} className="w-full rounded-md border-slate-300 p-2 text-sm" />
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Fecha Fin</label>
                    <input type="date" value={newTask.endDate} onChange={(e) => setNewTask({...newTask, endDate: e.target.value})} className="w-full rounded-md border-slate-300 p-2 text-sm" />
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Estado</label>
                    <select value={newTask.status} onChange={(e) => setNewTask({...newTask, status: e.target.value as any})} className="w-full rounded-md border-slate-300 p-2 text-sm">
                        <option value="Ready to Start">Listo para iniciar</option>
                        <option value="In Progress">En Progreso</option>
                        <option value="Delayed">Retrasado</option>
                        <option value="Completed">Completado</option>
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Prioridad</label>
                    <select value={newTask.priority} onChange={(e) => setNewTask({...newTask, priority: e.target.value as any})} className="w-full rounded-md border-slate-300 p-2 text-sm">
                        <option value="High">Alta</option>
                        <option value="Medium">Media</option>
                        <option value="Low">Baja</option>
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Dificultad</label>
                    <select value={newTask.difficulty || 'Medium'} onChange={(e) => setNewTask({...newTask, difficulty: e.target.value as any})} className="w-full rounded-md border-slate-300 p-2 text-sm">
                        <option value="High">Alta</option>
                        <option value="Medium">Media</option>
                        <option value="Low">Baja</option>
                    </select>
                </div>
                <div className="lg:col-span-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Dependencias</label>
                    <input type="text" placeholder="Ej. Tarea A" value={newTask.dependencies} onChange={(e) => setNewTask({...newTask, dependencies: e.target.value})} className="w-full rounded-md border-slate-300 p-2 text-sm" />
                </div>

                {/* Progress */}
                <div className="lg:col-span-4">
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center">
                        {hasSubtasks ? (
                            <>
                                Progreso General
                                <span className="ml-2 text-[10px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded flex items-center normal-case font-normal">
                                    <Calculator className="h-3 w-3 mr-1" /> Automático (Promedio de Subtareas)
                                </span>
                            </>
                        ) : (
                            'Progreso Manual'
                        )}
                    </label>
                    <span className="text-sm font-bold text-accent-600 bg-accent-50 px-2 py-0.5 rounded">{newTask.progress || 0}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    step="10" 
                    disabled={hasSubtasks}
                    value={newTask.progress || 0} 
                    onChange={(e) => setNewTask({...newTask, progress: Number(e.target.value)})} 
                    className={`w-full h-2 rounded-lg appearance-none cursor-pointer accent-accent-600 ${hasSubtasks ? 'bg-slate-200 cursor-not-allowed opacity-60' : 'bg-slate-200'}`} 
                  />
                  {hasSubtasks && (
                      <p className="text-[10px] text-slate-400 mt-1 italic">
                          El progreso de esta tarea se calcula automáticamente basado en el avance de sus subtareas. Edita las subtareas para actualizar este valor.
                      </p>
                  )}
                </div>
             </div>

             {/* Checklist & Attachments UI */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-white p-4 rounded-lg border border-slate-200">
                    <h4 className="text-sm font-bold text-slate-700 mb-3 flex items-center"><CheckSquare className="h-4 w-4 mr-2" /> Checklist</h4>
                    <div className="flex gap-2 mb-3">
                        <input type="text" placeholder="Nuevo item..." value={checklistItemInput} onChange={(e) => setChecklistItemInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addChecklistItem())} className="flex-1 rounded-md border-slate-300 p-2 text-xs" />
                        <button type="button" onClick={addChecklistItem} className="bg-brand-100 p-2 rounded text-brand-700"><Plus className="h-4 w-4" /></button>
                    </div>
                    <div className="space-y-1 max-h-40 overflow-y-auto">
                        {(newTask.checklist || []).map(item => (
                            <div key={item.id} className="flex items-center text-sm"><button type="button" onClick={() => toggleChecklistItem(item.id)} className={`mr-2 ${item.completed ? 'text-green-500' : 'text-slate-300'}`}>{item.completed ? <CheckCircle2 className="h-4 w-4"/> : <Circle className="h-4 w-4"/>}</button><span className={item.completed ? 'line-through text-slate-400' : ''}>{item.text}</span><button type="button" onClick={() => removeChecklistItem(item.id)} className="ml-auto text-slate-300 hover:text-red-500"><X className="h-3 w-3"/></button></div>
                        ))}
                    </div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-slate-200">
                    <h4 className="text-sm font-bold text-slate-700 mb-3 flex items-center"><Paperclip className="h-4 w-4 mr-2" /> Archivos</h4>
                    <div className="flex items-center gap-2 mb-3">
                        <button type="button" onClick={() => fileInputRef.current?.click()} className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded border">Subir Archivo</button>
                        <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" />
                    </div>
                    <div className="space-y-1 max-h-40 overflow-y-auto">
                        {(newTask.attachments || []).map(file => (
                            <div key={file.id} className="flex items-center text-sm p-1 bg-slate-50 rounded"><FileIcon className="h-3 w-3 mr-2 text-brand-400"/><span className="truncate flex-1">{file.name}</span><button type="button" onClick={() => removeAttachment(file.id)} className="ml-2 text-slate-400 hover:text-red-500"><X className="h-3 w-3"/></button></div>
                        ))}
                    </div>
                </div>
             </div>

             <div className="flex justify-end pt-4 border-t border-slate-200">
                <button type="button" onClick={() => setShowForm(false)} className="mr-3 px-4 py-2 text-slate-600 font-medium">Cancelar</button>
                <button type="submit" className="bg-brand-700 text-white px-6 py-2 rounded-lg hover:bg-brand-800 font-bold shadow-md">Guardar</button>
             </div>
          </form>
        </div>
      )}

      {/* Task Table */}
      <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100">
                <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                        <th onClick={() => { setSortField('projectName'); setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc'); }} className="px-4 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider cursor-pointer min-w-[140px]">Proyecto</th>
                        <th onClick={() => { setSortField('title'); setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc'); }} className="px-4 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider cursor-pointer min-w-[300px]">Tarea / Subtarea</th>
                        <th className="px-4 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Responsable</th>
                        <th className="px-4 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider min-w-[120px]">Fechas</th>
                        <th className="px-4 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Estado</th>
                        <th onClick={() => { setSortField('progress'); setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc'); }} className="px-4 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider cursor-pointer">Progreso</th>
                        <th className="px-4 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Dificultad</th>
                        <th className="px-4 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Prioridad</th>
                        <th className="px-4 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Acciones</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                    {processedTasks.length === 0 ? (
                        <tr><td colSpan={9} className="px-6 py-12 text-center text-slate-400">No hay tareas registradas.</td></tr>
                    ) : (
                        processedTasks.map((task) => {
                            const isSubtask = !!task.parentId;
                            return (
                                <tr 
                                    key={task.id} 
                                    onClick={() => openEdit(task)}
                                    className={`hover:bg-slate-50 transition-colors cursor-pointer group ${isSubtask ? 'bg-slate-50/40' : 'bg-white'}`}
                                >
                                    {/* Project Name: Only show for Parents to reduce noise */}
                                    <td className="px-4 py-4 whitespace-nowrap text-sm font-semibold text-brand-900 align-top opacity-80">
                                        {!isSubtask ? getProjectName(task.projectId) : ''}
                                    </td>
                                    
                                    {/* Title with distinct hierarchy indentation */}
                                    <td className="px-4 py-3 align-top">
                                        <div className={`flex flex-col relative ${isSubtask ? 'pl-10 ml-2' : ''}`}>
                                            {/* Connector Line for Subtasks */}
                                            {isSubtask && (
                                                <div className="absolute left-0 top-0 bottom-0 w-8 flex items-center justify-center">
                                                    <div className="h-full w-px bg-slate-200 absolute left-3 top-[-50%]"></div>
                                                    <div className="w-4 h-px bg-slate-200 absolute left-3"></div>
                                                    <CornerDownRight className="h-4 w-4 text-brand-300 absolute left-3 top-[10px]" />
                                                </div>
                                            )}
                                            
                                            <div className="flex items-start">
                                                <div className="flex-1">
                                                    <span className={`text-sm ${isSubtask ? 'text-slate-600 font-normal' : 'text-slate-900 font-bold'} whitespace-pre-wrap block mb-1`}>
                                                        {task.title}
                                                    </span>
                                                    {(task.checklist?.length || 0) > 0 && (
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <div className="h-1.5 w-16 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-emerald-400" style={{width: `${(task.checklist!.filter(i=>i.completed).length / task.checklist!.length)*100}%`}}></div></div>
                                                            <span className="text-[10px] text-slate-400">{task.checklist!.filter(i=>i.completed).length}/{task.checklist!.length}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </td>

                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-600 align-top">{task.assignee || '--'}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-xs text-slate-500 align-top flex flex-col">
                                        <span>{task.startDate}</span>
                                        <span className="text-slate-300 mx-auto">|</span>
                                        <span>{task.endDate}</span>
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap align-top" onClick={(e) => { e.stopPropagation(); toggleStatus(task); }}>
                                        <div className="cursor-pointer hover:opacity-80">{getStatusBadge(task.status)}</div>
                                    </td>
                                    
                                    {/* Progress Column */}
                                    <td className="px-4 py-4 whitespace-nowrap align-top">
                                        <div className="flex items-center gap-2">
                                            <div className="w-16 bg-slate-100 rounded-full h-1.5 overflow-hidden border border-slate-200">
                                                <div 
                                                    className="h-full bg-accent-600 rounded-full" 
                                                    style={{ width: `${task.progress}%` }}
                                                />
                                            </div>
                                            <span className="text-xs text-slate-600 font-bold">{task.progress}%</span>
                                        </div>
                                    </td>

                                    {/* Difficulty Column */}
                                    <td className="px-4 py-4 whitespace-nowrap align-top">
                                        {getDifficultyBadge(task.difficulty)}
                                    </td>

                                    <td className="px-4 py-4 whitespace-nowrap align-top">{getPriorityBadge(task.priority)}</td>
                                    
                                    <td className="px-4 py-4 whitespace-nowrap text-right text-sm align-top">
                                        <div className="flex items-center justify-end space-x-1">
                                            {!isSubtask && (
                                                <button onClick={(e) => { e.stopPropagation(); openSubtaskCreate(task); }} className="text-slate-400 hover:text-brand-600 p-1.5 rounded-full hover:bg-brand-50" title="Añadir Subtarea"><ListTodo className="h-4 w-4" /></button>
                                            )}
                                            <button onClick={(e) => { e.stopPropagation(); openEdit(task); }} className="text-slate-400 hover:text-brand-600 p-1.5 rounded-full hover:bg-brand-50"><MoreHorizontal className="h-4 w-4" /></button>
                                            <button onClick={(e) => { e.stopPropagation(); handleDelete(task.id); }} className="text-slate-300 hover:text-rose-600 p-1.5 rounded-full hover:bg-rose-50"><Trash2 className="h-4 w-4" /></button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })
                    )}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};