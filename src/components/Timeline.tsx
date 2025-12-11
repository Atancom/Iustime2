import React, { useMemo } from 'react';
import { Task } from '../types';
import { CornerDownRight, CalendarClock } from 'lucide-react';

interface TimelineProps {
  tasks: Task[];
}

interface MonthCol {
  key: string; // YYYY-MM
  label: string;
  year: number;
  month: number;
  date: Date;
}

export const Timeline: React.FC<TimelineProps> = ({ tasks }) => {
  
  const orderedTasks = useMemo(() => {
    const parents = tasks.filter(t => !t.parentId);
    const childrenMap = new Map<string, Task[]>();
    
    tasks.filter(t => t.parentId).forEach(child => {
        if (child.parentId) {
            if (!childrenMap.has(child.parentId)) childrenMap.set(child.parentId, []);
            childrenMap.get(child.parentId)?.push(child);
        }
    });

    const result: Task[] = [];
    parents.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

    parents.forEach(parent => {
        result.push(parent);
        const children = childrenMap.get(parent.id);
        if (children) {
            children.sort((a,b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
            result.push(...children);
        }
    });
    return result;
  }, [tasks]);

  const { monthCols } = useMemo(() => {
    if (tasks.length === 0) return { monthCols: [], totalMonths: 0 };

    const startDates = tasks.map(t => new Date(t.startDate).getTime());
    const endDates = tasks.map(t => new Date(t.endDate).getTime());
    
    const validStartDates = startDates.filter(d => !isNaN(d));
    const validEndDates = endDates.filter(d => !isNaN(d));

    if (validStartDates.length === 0) return { monthCols: [], totalMonths: 0 };

    const minTime = Math.min(...validStartDates);
    const maxTime = Math.max(...validEndDates);

    const start = new Date(minTime);
    start.setDate(1); 
    
    const end = new Date(maxTime);
    end.setDate(1); 
    end.setMonth(end.getMonth() + 1);

    const cols: MonthCol[] = [];
    const current = new Date(start);

    while (current < end) {
        cols.push({
            key: `${current.getFullYear()}-${current.getMonth()}`,
            label: current.toLocaleDateString('es-ES', { month: 'short' }),
            year: current.getFullYear(),
            month: current.getMonth(),
            date: new Date(current)
        });
        current.setMonth(current.getMonth() + 1);
    }
    
    if (cols.length < 6) { 
        const needed = 6 - cols.length;
        for (let i = 0; i < needed; i++) {
             cols.push({
                key: `${current.getFullYear()}-${current.getMonth()}`,
                label: current.toLocaleDateString('es-ES', { month: 'short' }),
                year: current.getFullYear(),
                month: current.getMonth(),
                date: new Date(current)
             });
             current.setMonth(current.getMonth() + 1);
        }
    }

    return { monthCols: cols, totalMonths: cols.length };
  }, [tasks]);


  const getBarStyles = (task: Task) => {
    if (monthCols.length === 0) return {};

    const timelineStart = monthCols[0].date.getTime();
    const lastMonthDate = new Date(monthCols[monthCols.length - 1].date);
    lastMonthDate.setMonth(lastMonthDate.getMonth() + 1);
    const timelineEnd = lastMonthDate.getTime();
    const totalDuration = timelineEnd - timelineStart;

    const taskStart = new Date(task.startDate).getTime();
    const taskEnd = new Date(task.endDate).getTime();

    if (isNaN(taskStart) || isNaN(taskEnd)) return { display: 'none' };

    const effectiveStart = Math.max(taskStart, timelineStart);
    const effectiveEnd = Math.min(taskEnd, timelineEnd);

    if (effectiveEnd < effectiveStart) return { display: 'none' };

    const left = ((effectiveStart - timelineStart) / totalDuration) * 100;
    const width = ((effectiveEnd - effectiveStart) / totalDuration) * 100;

    return {
        left: `${left}%`,
        width: `${width}%`
    };
  };

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl">
        <CalendarClock className="h-12 w-12 text-slate-300 mb-2" />
        <p className="text-slate-500 font-medium">No hay tareas para mostrar en la línea de tiempo.</p>
        <p className="text-sm text-slate-400 mt-1">Crea tareas con fechas de inicio y fin para verlas aquí.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div>
        <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Gantt de Tareas</h2>
        <p className="text-slate-500 mt-2">Visualización mensual de ejecución de tareas y subtareas.</p>
      </div>
      
      <div className="bg-white rounded-xl shadow-lg border border-slate-200 flex-1 overflow-hidden flex flex-col">
        <div className="overflow-x-auto flex-1 custom-scrollbar">
            <div className="inline-block w-full min-w-max"> 
                
                <div className="flex border-b border-slate-200 bg-slate-50 sticky top-0 z-20 shadow-sm">
                    <div className="w-80 flex-shrink-0 px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider bg-slate-50 sticky left-0 border-r border-slate-200 z-30 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                        Tarea
                    </div>
                    <div className="flex-1 flex relative">
                        {monthCols.map(col => (
                            <div key={col.key} className="flex-1 px-0.5 py-2 text-center border-r border-slate-200 min-w-[40px] flex flex-col justify-center">
                                <span className="text-[10px] text-slate-400 font-medium leading-none mb-0.5">{col.year}</span>
                                <span className="text-[10px] font-bold text-slate-600 uppercase leading-none">{col.label.replace('.', '')}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="relative">
                    <div className="absolute inset-0 flex pl-80 pointer-events-none z-0">
                        {monthCols.map(col => (
                             <div key={col.key} className="flex-1 border-r border-slate-100 h-full min-w-[40px]"></div>
                        ))}
                    </div>

                    {orderedTasks.map((task, index) => {
                        const isSubtask = !!task.parentId;
                        const barStyle = getBarStyles(task);
                        
                        return (
                            <div key={task.id} className={`flex border-b border-slate-50 hover:bg-slate-50/50 transition-colors relative h-10 items-center group ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}`}>
                                <div className="w-80 flex-shrink-0 px-4 py-2 flex items-center border-r border-slate-200 bg-white sticky left-0 z-30 group-hover:bg-slate-50 transition-colors h-full shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                                    {isSubtask ? (
                                        <div className="flex items-center pl-6 text-slate-500 truncate w-full" title={task.title}>
                                            <CornerDownRight className="h-3 w-3 mr-2 flex-shrink-0 text-slate-300" />
                                            <span className="text-xs truncate">{task.title}</span>
                                        </div>
                                    ) : (
                                        <div className="text-sm font-bold text-slate-800 truncate w-full" title={task.title}>
                                            {task.title}
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1 relative h-full z-10">
                                    <div 
                                        className={`absolute top-1/2 -translate-y-1/2 rounded-md shadow-sm transition-all hover:scale-y-110 cursor-pointer flex items-center px-1 overflow-hidden
                                            ${isSubtask ? 'bg-sky-400 opacity-90 h-4 border border-sky-500' : 'bg-blue-600 h-5 border border-blue-700'}
                                        `}
                                        style={{ ...barStyle, minWidth: '4px' }}
                                        title={`${task.title}: ${task.startDate} - ${task.endDate} (${task.progress}%)`}
                                    >
                                        {parseInt(barStyle.width as string) > 10 && (
                                            <span className="text-[9px] font-bold text-white whitespace-nowrap drop-shadow-md truncate">
                                                {task.progress > 0 && `${task.progress}%`}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};