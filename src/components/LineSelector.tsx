import React, { useState } from 'react';
import { WorkLine } from '../types';
import { Plus, Trash2, FolderOpen, Calendar, ChevronRight, Briefcase } from 'lucide-react';

interface LineSelectorProps {
  lines: WorkLine[];
  onSelectLine: (lineId: string) => void;
  onAddLine: (line: WorkLine) => void;
  onDeleteLine: (id: string) => void;
}

export const LineSelector: React.FC<LineSelectorProps> = ({ lines, onSelectLine, onAddLine, onDeleteLine }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    
    onAddLine({
      id: crypto.randomUUID(),
      name: newName,
      description: newDesc,
      createdAt: new Date().toISOString()
    });
    setNewName('');
    setNewDesc('');
    setIsAdding(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col relative overflow-hidden">
      {/* Background using inline styles to force dark color */}
      <div className="absolute top-0 left-0 w-full h-64 shadow-xl z-0" style={{ backgroundColor: '#0f172a' }}></div>
      <div className="absolute top-0 right-0 w-1/3 h-64 opacity-50 skew-x-12 z-0" style={{ backgroundColor: '#1e293b' }}></div>

      <div className="relative z-10 max-w-6xl w-full mx-auto px-6 pt-16 pb-12 flex-1 flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-end mb-10 text-white">
          <div>
            <h1 className="text-lg font-semibold text-slate-300 uppercase tracking-widest mb-2">Plataforma</h1>
            <h2 className="text-4xl font-bold tracking-tight text-white">Gestión de Líneas Ius</h2>
            <p className="text-slate-300 mt-2 max-w-xl text-lg font-light">
              Gestión estratégica de proyectos y despachos internacionales.
            </p>
          </div>
          <button
            onClick={() => setIsAdding(true)}
            className="group flex items-center space-x-2 bg-white text-slate-900 px-6 py-3 rounded-lg font-semibold hover:bg-slate-50 transition-all shadow-lg active:scale-95"
          >
            <Plus className="h-5 w-5 text-blue-600 group-hover:rotate-90 transition-transform duration-300" />
            <span>Nueva Línea</span>
          </button>
        </div>

        {/* List Container */}
        <div className="bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden flex-1 flex flex-col">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 px-8 py-4 bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <div className="col-span-5 md:col-span-4">Nombre de la Línea</div>
                <div className="col-span-5 md:col-span-5 hidden md:block">Descripción</div>
                <div className="col-span-3 md:col-span-2 hidden md:block text-right">Fecha Creación</div>
                <div className="col-span-7 md:col-span-1 text-right"></div>
            </div>

            {/* List Items */}
            <div className="overflow-y-auto flex-1">
                {lines.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full p-12 text-center">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                            <Briefcase className="h-8 w-8 text-slate-400" />
                        </div>
                        <h3 className="text-lg font-medium text-slate-900">No hay líneas activas</h3>
                        <p className="text-slate-500 mt-1 max-w-xs mx-auto">Comienza creando una nueva línea de trabajo para gestionar tus proyectos.</p>
                        <button 
                            onClick={() => setIsAdding(true)}
                            className="mt-6 text-blue-600 hover:text-blue-700 font-medium hover:underline"
                        >
                            Crear primera línea &rarr;
                        </button>
                    </div>
                ) : (
                    lines.map((line) => (
                        <div 
                            key={line.id} 
                            onClick={() => onSelectLine(line.id)}
                            className="group grid grid-cols-12 gap-4 px-8 py-5 border-b border-slate-100 items-center hover:bg-slate-50 cursor-pointer transition-colors"
                        >
                            <div className="col-span-12 md:col-span-4 flex items-center min-w-0">
                                <div className="p-2 bg-slate-100 text-slate-700 rounded-lg mr-4 group-hover:bg-slate-200 transition-colors">
                                    <FolderOpen className="h-5 w-5" />
                                </div>
                                <div className="truncate">
                                    <h3 className="text-base font-bold text-slate-800 group-hover:text-slate-900 transition-colors truncate">{line.name}</h3>
                                    <p className="text-xs text-slate-400 md:hidden mt-1 truncate">{line.description}</p>
                                </div>
                            </div>
                            
                            <div className="col-span-5 hidden md:block">
                                <p className="text-sm text-slate-600 truncate pr-4">{line.description || <span className="text-slate-400 italic">Sin descripción</span>}</p>
                            </div>

                            <div className="col-span-2 hidden md:block text-right">
                                <div className="flex items-center justify-end text-sm text-slate-500">
                                    <Calendar className="h-3 w-3 mr-1.5 opacity-70" />
                                    {new Date(line.createdAt).toLocaleDateString()}
                                </div>
                            </div>

                            <div className="col-span-12 md:col-span-1 flex items-center justify-end space-x-2">
                                <button 
                                    onClick={(e) => { e.stopPropagation(); onDeleteLine(line.id); }}
                                    className="p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-full transition-all"
                                    title="Eliminar Línea"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                                <div className="p-2 text-slate-300 group-hover:text-slate-600 transition-colors">
                                    <ChevronRight className="h-5 w-5" />
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
        
        <div className="text-center mt-6 text-sm text-slate-400">
             &copy; {new Date().getFullYear()} Gestión de Líneas Ius. Todos los derechos reservados.
        </div>
      </div>

      {/* Modal for creating line */}
      {isAdding && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-slate-50 px-8 py-6 border-b border-slate-100">
                <h2 className="text-xl font-bold text-slate-900">Nueva Línea de Trabajo</h2>
                <p className="text-sm text-slate-500 mt-1">Define el área estratégica o cliente principal.</p>
            </div>
            
            <form onSubmit={handleCreate} className="p-8 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Nombre de la Línea</label>
                <input
                  autoFocus
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full rounded-lg border-slate-300 shadow-sm focus:border-slate-500 focus:ring-slate-500 py-3 px-4 text-slate-900 placeholder:text-slate-400 border bg-white"
                  placeholder="Ej. Consultoría Fiscal Internacional"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Descripción</label>
                <textarea
                  rows={3}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full rounded-lg border-slate-300 shadow-sm focus:border-slate-500 focus:ring-slate-500 py-3 px-4 text-slate-900 placeholder:text-slate-400 border bg-white resize-none"
                  placeholder="Objetivos clave y alcance del proyecto..."
                />
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-5 py-2.5 text-slate-600 hover:text-slate-900 font-medium hover:bg-slate-50 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 text-white rounded-lg font-medium shadow-md transition-all active:scale-95"
                  style={{ backgroundColor: '#1e293b' }}
                >
                  Crear Línea
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};