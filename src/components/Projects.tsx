import React, { useState } from 'react';
import { Project } from '../types';
import { Plus, Trash2, FileText, ArrowRight, X, ListPlus, MinusCircle, Pencil, Save, Calculator } from 'lucide-react';

interface ProjectsProps {
  projects: Project[];
  lineId: string;
  onAddProject: (project: Project) => void;
  onUpdateProject: (project: Project) => void;
  onDeleteProject: (id: string) => void;
}

export const Projects: React.FC<ProjectsProps> = ({ projects, lineId, onAddProject, onUpdateProject, onDeleteProject }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [currentStepInput, setCurrentStepInput] = useState('');
  
  const [newProject, setNewProject] = useState<Partial<Project>>({
    name: '',
    objective: '',
    assignee: '',
    status: 'Ready to Start',
    priority: 'Medium',
    difficulty: 'Medium',
    budget: 0,
    progress: 0,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    nextSteps: [],
    notes: ''
  });

  const resetForm = () => {
    setNewProject({
      name: '',
      objective: '',
      assignee: '',
      status: 'Ready to Start',
      priority: 'Medium',
      difficulty: 'Medium',
      budget: 0,
      progress: 0,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      nextSteps: [],
      notes: ''
    });
    setEditingId(null);
    setCurrentStepInput('');
    setShowForm(false);
  };

  const handleEdit = (project: Project) => {
    setNewProject({ ...project });
    setEditingId(project.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddStep = () => {
    if (!currentStepInput.trim()) return;
    setNewProject({
      ...newProject,
      nextSteps: [...(newProject.nextSteps || []), currentStepInput.trim()]
    });
    setCurrentStepInput('');
  };

  const handleRemoveStep = (index: number) => {
    const updatedSteps = [...(newProject.nextSteps || [])];
    updatedSteps.splice(index, 1);
    setNewProject({
      ...newProject,
      nextSteps: updatedSteps
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProject.name) return;

    const projectData: Project = {
      id: editingId || crypto.randomUUID(),
      lineId,
      name: newProject.name!,
      objective: newProject.objective || '',
      assignee: newProject.assignee || '',
      status: newProject.status as any || 'Ready to Start',
      priority: newProject.priority as any || 'Medium',
      difficulty: newProject.difficulty as any || 'Medium',
      budget: Number(newProject.budget) || 0,
      progress: Number(newProject.progress) || 0,
      startDate: newProject.startDate || new Date().toISOString().split('T')[0],
      endDate: newProject.endDate || new Date().toISOString().split('T')[0],
      nextSteps: newProject.nextSteps || [],
      notes: newProject.notes || ''
    };

    if (editingId) {
      onUpdateProject(projectData);
    } else {
      onAddProject(projectData);
    }
    
    resetForm();
  };

  const getStatusBadge = (status: Project['status']) => {
    const styles = {
      'Completed': 'bg-emerald-100 text-emerald-700 border-emerald-200',
      'In Progress': 'bg-blue-50 text-blue-700 border-blue-200',
      'Ready to Start': 'bg-zinc-100 text-zinc-600 border-zinc-200',
    };
    const labels = {
      'Completed': 'Completado',
      'In Progress': 'En Progreso',
      'Ready to Start': 'Listo para iniciar',
    };
    return (
      <span className={`px-2.5 py-0.5 rounded text-xs font-semibold border ${styles[status] || styles['Ready to Start']}`}>
        {labels[status] || status}
      </span>
    );
  };

  const getPriorityBadge = (priority: Project['priority']) => {
    const styles = {
      'High': 'text-rose-700 bg-rose-50 border border-rose-100',
      'Medium': 'text-orange-700 bg-orange-50 border border-orange-100',
      'Low': 'text-zinc-600 bg-zinc-50 border border-zinc-200'
    };
    const labels = {
      'High': 'Alta',
      'Medium': 'Media',
      'Low': 'Baja'
    };
    return (
      <span className={`px-2.5 py-0.5 rounded text-xs font-medium ${styles[priority] || styles['Medium']}`}>
        {labels[priority] || priority}
      </span>
    );
  };

  const getDifficultyBadge = (difficulty: Project['difficulty']) => {
    const styles = {
      'High': 'text-purple-700 bg-purple-50 border border-purple-100',
      'Medium': 'text-indigo-700 bg-indigo-50 border border-indigo-100',
      'Low': 'text-zinc-600 bg-zinc-50 border border-zinc-200'
    };
    const labels = {
      'High': 'Alta',
      'Medium': 'Media',
      'Low': 'Baja'
    };
    return (
      <span className={`px-2.5 py-0.5 rounded text-xs font-medium ${styles[difficulty || 'Medium']}`}>
        {labels[difficulty || 'Medium'] || difficulty}
      </span>
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end border-b border-zinc-200 pb-6">
        <div>
            <h2 className="text-3xl font-bold text-zinc-800 tracking-tight">Proyectos</h2>
            <p className="text-zinc-500 mt-2">Visión global de iniciativas y estado de ejecución.</p>
        </div>
        <button
          onClick={() => {
            if (showForm) resetForm();
            else setShowForm(true);
          }}
          className={`flex items-center space-x-2 px-5 py-2.5 rounded-lg transition-all shadow-sm font-medium ${
              showForm ? 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200' : 'bg-zinc-800 hover:bg-zinc-900 text-white hover:shadow-md'
          }`}
        >
          {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          <span>{showForm ? 'Cancelar' : 'Nuevo Proyecto'}</span>
        </button>
      </div>

      {showForm && (
        <div className="bg-zinc-50 p-8 rounded-xl shadow-inner border border-zinc-200 mb-8">
            <h3 className="text-lg font-bold text-zinc-800 mb-6 flex items-center">
                <div className="bg-zinc-100 p-2 rounded-lg mr-3">
                    <FileText className="h-5 w-5 text-zinc-700" />
                </div>
                {editingId ? 'Editar Proyecto' : 'Detalles del Proyecto'}
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="lg:col-span-2">
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Nombre del Proyecto</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Implementación ERP Fase 1"
                    value={newProject.name}
                    onChange={(e) => setNewProject({...newProject, name: e.target.value})}
                    className="w-full rounded-lg border-zinc-200 shadow-sm focus:border-zinc-500 focus:ring-zinc-500 p-3 border bg-white text-zinc-900 placeholder:text-zinc-400"
                  />
                </div>
                <div className="lg:col-span-2">
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Objetivo Principal</label>
                  <textarea
                    rows={3}
                    placeholder="Meta estratégica (se permiten múltiples párrafos)"
                    value={newProject.objective}
                    onChange={(e) => setNewProject({...newProject, objective: e.target.value})}
                    className="w-full rounded-lg border-zinc-200 shadow-sm focus:border-zinc-500 focus:ring-zinc-500 p-3 border bg-white text-zinc-900 placeholder:text-zinc-400 resize-y"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Responsable</label>
                  <input
                    type="text"
                    placeholder="Nombre"
                    value={newProject.assignee}
                    onChange={(e) => setNewProject({...newProject, assignee: e.target.value})}
                    className="w-full rounded-lg border-zinc-200 shadow-sm focus:border-zinc-500 focus:ring-zinc-500 p-3 border bg-white text-zinc-900 placeholder:text-zinc-400"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Estado</label>
                  <select
                    value={newProject.status}
                    onChange={(e) => setNewProject({...newProject, status: e.target.value as any})}
                    className="w-full rounded-lg border-zinc-200 shadow-sm focus:border-zinc-500 focus:ring-zinc-500 p-3 border bg-white text-zinc-900"
                  >
                    <option value="Ready to Start">Listo para iniciar</option>
                    <option value="In Progress">En Progreso</option>
                    <option value="Completed">Completado</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Prioridad</label>
                  <select
                    value={newProject.priority}
                    onChange={(e) => setNewProject({...newProject, priority: e.target.value as any})}
                    className="w-full rounded-lg border-zinc-200 shadow-sm focus:border-zinc-500 focus:ring-zinc-500 p-3 border bg-white text-zinc-900"
                  >
                    <option value="High">Alta</option>
                    <option value="Medium">Media</option>
                    <option value="Low">Baja</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Dificultad</label>
                  <select
                    value={newProject.difficulty || 'Medium'}
                    onChange={(e) => setNewProject({...newProject, difficulty: e.target.value as any})}
                    className="w-full rounded-lg border-zinc-200 shadow-sm focus:border-zinc-500 focus:ring-zinc-500 p-3 border bg-white text-zinc-900"
                  >
                    <option value="High">Alta</option>
                    <option value="Medium">Media</option>
                    <option value="Low">Baja</option>
                  </select>
                </div>

                 <div className="lg:col-span-2">
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center">
                        Progreso
                        <span className="ml-2 text-[10px] bg-zinc-200 text-zinc-600 px-1.5 py-0.5 rounded flex items-center normal-case font-normal">
                             <Calculator className="h-3 w-3 mr-1" /> Automático
                        </span>
                    </label>
                    <span className="text-sm font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{newProject.progress || 0}%</span>
                  </div>
                  <div className="relative pt-1 px-1">
                     <input
                      type="range"
                      min="0"
                      max="100"
                      step="10"
                      disabled
                      value={newProject.progress || 0}
                      className="w-full h-3 bg-zinc-200 rounded-lg appearance-none cursor-not-allowed accent-zinc-400 opacity-70"
                      title="Calculado automáticamente según el progreso de las tareas"
                    />
                     <div className="flex justify-between text-[10px] text-zinc-400 mt-1 select-none font-medium px-0.5">
                        <span>0%</span>
                        <span>20%</span>
                        <span>40%</span>
                        <span>60%</span>
                        <span>80%</span>
                        <span>100%</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Inicio</label>
                  <input
                    type="date"
                    value={newProject.startDate}
                    onChange={(e) => setNewProject({...newProject, startDate: e.target.value})}
                    className="w-full rounded-lg border-zinc-200 shadow-sm focus:border-zinc-500 focus:ring-zinc-500 p-3 border bg-white text-zinc-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Fin Estimado</label>
                  <input
                    type="date"
                    value={newProject.endDate}
                    onChange={(e) => setNewProject({...newProject, endDate: e.target.value})}
                    className="w-full rounded-lg border-zinc-200 shadow-sm focus:border-zinc-500 focus:ring-zinc-500 p-3 border bg-white text-zinc-900"
                  />
                </div>
                
                <div className="lg:col-span-2">
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Próximos pasos (Lista)</label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      placeholder="Añadir un paso..."
                      value={currentStepInput}
                      onChange={(e) => setCurrentStepInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddStep())}
                      className="flex-1 rounded-lg border-zinc-200 shadow-sm focus:border-zinc-500 focus:ring-zinc-500 p-3 border bg-white text-zinc-900 placeholder:text-zinc-400"
                    />
                    <button 
                      type="button" 
                      onClick={handleAddStep}
                      className="bg-zinc-100 text-zinc-700 p-3 rounded-lg hover:bg-zinc-200 transition-colors"
                    >
                      <Plus className="h-5 w-5" />
                    </button>
                  </div>
                  {/* List of steps */}
                  <div className="space-y-2 max-h-32 overflow-y-auto pr-1">
                    {newProject.nextSteps?.map((step, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-white border border-zinc-100 p-2 rounded text-sm text-zinc-700">
                        <div className="flex items-start">
                           <ListPlus className="h-4 w-4 mr-2 text-zinc-400 mt-0.5" />
                           <span>{step}</span>
                        </div>
                        <button 
                          type="button" 
                          onClick={() => handleRemoveStep(idx)}
                          className="text-zinc-400 hover:text-rose-500 p-1"
                        >
                          <MinusCircle className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                    {(!newProject.nextSteps || newProject.nextSteps.length === 0) && (
                      <div className="text-xs text-zinc-400 italic p-1">No hay pasos añadidos</div>
                    )}
                  </div>
                </div>
                
                <div className="lg:col-span-2">
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Notas</label>
                  <textarea
                    rows={4}
                    placeholder="Observaciones y notas detalladas..."
                    value={newProject.notes}
                    onChange={(e) => setNewProject({...newProject, notes: e.target.value})}
                    className="w-full rounded-lg border-zinc-200 shadow-sm focus:border-zinc-500 focus:ring-zinc-500 p-3 border bg-white text-zinc-900 placeholder:text-zinc-400 resize-y"
                  />
                </div>
              </div>
              <div className="flex justify-end border-t border-zinc-200 pt-6">
                <button
                  type="submit"
                  className="bg-zinc-800 hover:bg-zinc-900 text-white px-8 py-3 rounded-lg shadow-md transition-colors font-medium flex items-center"
                >
                  {editingId ? <Save className="h-5 w-5 mr-2" /> : <Plus className="h-5 w-5 mr-2" />}
                  {editingId ? 'Actualizar Proyecto' : 'Guardar Proyecto'}
                </button>
              </div>
            </form>
        </div>
      )}

      {/* Projects Table */}
      <div className="bg-white rounded-xl shadow-lg border border-zinc-200 overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-zinc-100">
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-200">
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-zinc-500 uppercase tracking-wider min-w-[180px]">Proyecto</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-zinc-500 uppercase tracking-wider min-w-[200px]">Objetivo</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-zinc-500 uppercase tracking-wider">Responsable</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-zinc-500 uppercase tracking-wider">Fechas</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-zinc-500 uppercase tracking-wider">Estado / Progreso</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-zinc-500 uppercase tracking-wider">Prioridad</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-zinc-500 uppercase tracking-wider">Dificultad</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-zinc-500 uppercase tracking-wider min-w-[200px]">Siguientes Pasos</th>
                <th scope="col" className="relative px-6 py-4">
                  <span className="sr-only">Acciones</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-zinc-100">
              {projects.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-16 text-center text-zinc-400">
                    <div className="flex flex-col items-center justify-center opacity-60">
                        <FileText className="h-12 w-12 text-zinc-300 mb-3" />
                        <p className="text-lg font-medium text-zinc-600">No hay proyectos activos</p>
                        <p className="text-sm mt-1">Registra un nuevo proyecto para comenzar el seguimiento.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                projects.map((project) => (
                  <tr 
                    key={project.id} 
                    onClick={() => handleEdit(project)}
                    className="hover:bg-zinc-50/80 transition-colors group cursor-pointer"
                  >
                    <td className="px-6 py-5 whitespace-nowrap">
                        <div className="font-bold text-zinc-800 text-sm">{project.name}</div>
                        {project.notes && (
                          <div className="text-xs text-zinc-400 mt-1 line-clamp-2 max-w-[150px]" title={project.notes}>
                            {project.notes}
                          </div>
                        )}
                    </td>
                    <td className="px-6 py-5 text-sm text-zinc-600">
                        <div className="whitespace-pre-wrap line-clamp-3" title={project.objective}>{project.objective || <span className="text-zinc-300 italic">No definido</span>}</div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-sm text-zinc-600">
                        <div className="flex items-center">
                            <div className="h-7 w-7 rounded-full bg-gradient-to-br from-zinc-200 to-zinc-300 flex items-center justify-center text-xs font-bold text-zinc-600 mr-2.5 border border-white shadow-sm">
                                {(project.assignee || 'U').charAt(0).toUpperCase()}
                            </div>
                            <span className="font-medium text-zinc-700">{project.assignee || 'Sin asignar'}</span>
                        </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                        <div className="text-xs text-zinc-500 flex flex-col gap-1">
                            <span className="flex items-center"><span className="w-10 font-medium text-zinc-400">Inicio:</span> {project.startDate}</span>
                            <span className="flex items-center"><span className="w-10 font-medium text-zinc-400">Fin:</span> {project.endDate}</span>
                        </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                        <div className="flex flex-col gap-2">
                             {getStatusBadge(project.status)}
                             {/* Mini progress bar */}
                             <div className="flex items-center gap-2">
                                <div className="w-20 bg-zinc-100 rounded-full h-1.5 overflow-hidden border border-zinc-200">
                                    <div 
                                    className={`h-1.5 rounded-full ${project.status === 'Completed' ? 'bg-emerald-500' : 'bg-blue-500'}`} 
                                    style={{width: `${project.progress || 0}%`}}
                                    ></div>
                                </div>
                                <span className="text-[10px] font-bold text-zinc-500">{project.progress || 0}%</span>
                             </div>
                        </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                        {getPriorityBadge(project.priority)}
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                        {getDifficultyBadge(project.difficulty)}
                    </td>
                    <td className="px-6 py-5 text-sm text-zinc-600">
                        <ul className="list-none space-y-1">
                          {Array.isArray(project.nextSteps) && project.nextSteps.length > 0 ? (
                            project.nextSteps.map((step, i) => (
                              <li key={i} className="flex items-start text-xs text-zinc-600">
                                <ArrowRight className="h-3 w-3 mr-1.5 mt-0.5 text-zinc-400 flex-shrink-0" />
                                <span className="line-clamp-2">{step}</span>
                              </li>
                            ))
                          ) : (
                            <li className="text-xs text-zinc-300 italic">Sin acciones pendientes</li>
                          )}
                        </ul>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-1">
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleEdit(project); }}
                          className="text-zinc-400 hover:text-blue-600 hover:bg-zinc-100 transition-all p-2 rounded-full"
                          title="Editar proyecto"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); onDeleteProject(project.id); }}
                          className="text-zinc-400 hover:text-rose-600 hover:bg-rose-50 transition-all p-2 rounded-full"
                          title="Eliminar proyecto"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
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