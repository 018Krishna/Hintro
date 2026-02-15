import { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { motion } from 'framer-motion';
import { useTask } from '../context/TaskContext';
import { useAuth } from '../context/AuthContext';
import TaskModal from './TaskModal';
import { 
  Trash2, Edit2, Plus, LogOut, RotateCcw, 
  Search, Calendar, Activity, Filter, Terminal, Cpu 
} from 'lucide-react';

// --- STYLES & ASSETS ---
const styles = `
  :root {
    --c1: #38bdf8; /* Cyan */
    --c2: #a855f7; /* Purple */
    --c3: #22c55e; /* Green */
    --bg-dark: oklch(0.145 0 0);
    --noise: rgba(255, 255, 255, 0.05);
  }

  /* Grainy Background Animation */
  .cyber-bg {
    background-color: var(--bg-dark);
    background-image: 
      radial-gradient(circle at 50% 0%, #1e293b, transparent 70%),
      radial-gradient(circle at 80% 90%, #020617, transparent 70%);
    min-height: 100vh;
    position: relative;
    color: white;
  }
  
  .cyber-bg::before {
    content: "";
    position: fixed;
    inset: 0;
    background: repeating-radial-gradient(circle, var(--noise) 0 1px, transparent 1px 2px);
    mix-blend-mode: overlay;
    pointer-events: none;
    opacity: 0.3;
    z-index: 0;
  }

  /* Glass Panels */
  .glass-panel {
    background: rgba(255, 255, 255, 0.03);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.08);
    box-shadow: 0 4px 30px rgba(0, 0, 0, 0.5);
  }

  /* Neon Text */
  .text-neon-blue {
    color: var(--c1);
    text-shadow: 0 0 10px rgba(56, 189, 248, 0.5);
  }

  /* Custom Inputs */
  .cyber-input {
    background: rgba(0, 0, 0, 0.4);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: white;
    transition: all 0.3s ease;
  }
  .cyber-input:focus {
    outline: none;
    border-color: var(--c1);
    box-shadow: 0 0 15px rgba(56, 189, 248, 0.2);
  }

  /* Custom Scrollbar */
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: rgba(0,0,0,0.2);
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(255,255,255,0.1);
    border-radius: 10px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: rgba(255,255,255,0.2);
  }
`;

// Priority Color Mapping for Neon styles
const getPriorityStyle = (priority) => {
  switch (priority) {
    case 'High': return 'text-red-400 border-red-500/50 bg-red-500/10 shadow-[0_0_10px_rgba(248,113,113,0.2)]';
    case 'Medium': return 'text-amber-400 border-amber-500/50 bg-amber-500/10 shadow-[0_0_10px_rgba(251,191,36,0.2)]';
    case 'Low': return 'text-emerald-400 border-emerald-500/50 bg-emerald-500/10 shadow-[0_0_10px_rgba(52,211,153,0.2)]';
    default: return 'text-slate-400 border-slate-500/50 bg-slate-500/10';
  }
};

const getColumnColor = (title) => {
  if (title === 'To Do') return 'border-t-4 border-slate-500';
  if (title === 'In Progress') return 'border-t-4 border-cyan-500 shadow-[0_-5px_20px_rgba(6,182,212,0.3)]';
  if (title === 'Done') return 'border-t-4 border-purple-500 shadow-[0_-5px_20px_rgba(168,85,247,0.3)]';
  return '';
};

export default function Board() {
  const { data, moveTask, addTask, updateTask, deleteTask, resetBoard } = useTask();
  const { logout, user } = useAuth();
  
  const [search, setSearch] = useState('');
  const [filterPriority, setFilterPriority] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const onDragEnd = (result) => moveTask(result);

  const handleSaveTask = (taskData) => {
    if (editingTask) updateTask(editingTask.id, taskData);
    else addTask(taskData);
  };

  const getFilteredTasks = (taskIds) => {
    return taskIds
      .map(id => data.tasks[id])
      .filter(task => {
        const matchSearch = task.title.toLowerCase().includes(search.toLowerCase());
        const matchPriority = filterPriority === 'All' || task.priority === filterPriority;
        return matchSearch && matchPriority;
      })
      .sort((a, b) => {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate) - new Date(b.dueDate);
      });
  };

  return (
    <div className="cyber-bg font-sans selection:bg-cyan-500/30 selection:text-cyan-100">
      <style>{styles}</style>
      
      {/* Top Navigation Bar */}
      <nav className="sticky top-0 z-20 glass-panel border-b-0 border-b-white/10 px-6 py-4 flex justify-between items-center relative">
        <div className="absolute inset-x-0 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent"></div>
        
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center border border-cyan-500/50 bg-cyan-900/20 shadow-[0_0_15px_rgba(6,182,212,0.4)]">
            <Cpu className="text-cyan-400" size={20} />
          </div>
          <h1 className="text-2xl font-bold tracking-widest uppercase text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-white">
            TaskFlow<span className="text-[10px] align-top opacity-70">v2.0</span>
          </h1>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden md:flex flex-col items-end">
            <span className="text-sm font-semibold text-cyan-100 tracking-wide">{user?.name}</span>
            <span className="text-[10px] text-cyan-500/70 font-mono uppercase">Operator Level</span>
          </div>
          <div className="h-8 w-[1px] bg-white/10 mx-2"></div>
          
          <button 
            onClick={resetBoard} 
            className="p-2 text-slate-400 hover:text-cyan-400 transition-all hover:rotate-180 duration-500"
            title="System Reset"
          >
            <RotateCcw size={18} />
          </button>
          
          <button 
            onClick={logout} 
            className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 hover:border-red-500/50 hover:bg-red-500/10 hover:text-red-400 text-slate-400 text-sm font-medium transition-all group"
          >
            <LogOut size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span>DISCONNECT</span>
          </button>
        </div>
      </nav>

      <main className="p-6 max-w-[1600px] mx-auto relative z-10">
        
        {/* Controls Bar */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4"
        >
          <div className="flex items-center gap-3 w-full md:w-auto glass-panel p-1 rounded-xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-500/50" size={16} />
              <input 
                placeholder="SCAN DATABASE..." 
                className="pl-9 pr-4 py-2 bg-transparent outline-none text-sm w-full md:w-64 placeholder:text-slate-600 text-cyan-100"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div className="h-6 w-[1px] bg-white/10"></div>
            <div className="relative flex items-center pr-2">
              <Filter className="absolute left-3 text-cyan-500/50" size={14} />
              <select 
                className="pl-8 pr-2 py-2 bg-transparent outline-none text-sm text-slate-400 cursor-pointer appearance-none hover:text-cyan-300" 
                value={filterPriority} 
                onChange={e => setFilterPriority(e.target.value)}
              >
                <option value="All" className="bg-slate-900">ALL LEVELS</option>
                <option value="High" className="bg-slate-900">HIGH PRIORITY</option>
                <option value="Medium" className="bg-slate-900">MEDIUM PRIORITY</option>
                <option value="Low" className="bg-slate-900">LOW PRIORITY</option>
              </select>
            </div>
          </div>

          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => { setEditingTask(null); setIsModalOpen(true); }}
            className="relative px-6 py-2.5 rounded-full font-bold uppercase tracking-wider text-sm overflow-hidden group"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-purple-600 opacity-80 group-hover:opacity-100 transition-opacity"></span>
            <span className="absolute inset-0 border border-white/20 rounded-full"></span>
            <span className="relative z-10 flex items-center gap-2 text-white">
               <Plus size={18} /> Initialize Task
            </span>
            <span className="absolute bottom-0 left-0 w-full h-[2px] bg-cyan-300 shadow-[0_0_10px_#38bdf8]"></span>
          </motion.button>
        </motion.div>

        {/* Kanban Board */}
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
            {data.columnOrder.map((colId, index) => {
              const column = data.columns[colId];
              const tasks = getFilteredTasks(column.taskIds);

              return (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  key={column.id} 
                  className={`glass-panel rounded-2xl p-4 flex flex-col h-full min-h-[600px] ${getColumnColor(column.title)}`}
                >
                  {/* Column Header */}
                  <div className="flex justify-between items-center mb-6 px-2 border-b border-white/5 pb-4">
                    <h2 className="font-bold text-slate-300 text-sm uppercase tracking-[0.2em] flex items-center gap-2">
                       {column.title}
                    </h2>
                    <span className="bg-white/5 border border-white/10 px-3 py-1 rounded text-xs font-mono text-cyan-400">
                      [{tasks.length.toString().padStart(2, '0')}]
                    </span>
                  </div>

                  <Droppable droppableId={column.id}>
                    {(provided, snapshot) => (
                      <div 
                        ref={provided.innerRef} 
                        {...provided.droppableProps} 
                        className={`flex-1 transition-all rounded-xl p-2 ${
                          snapshot.isDraggingOver ? 'bg-cyan-500/5 ring-1 ring-cyan-500/20' : ''
                        }`}
                      >
                        {tasks.map((task, index) => (
                          <Draggable key={task.id} draggableId={task.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                style={{ ...provided.draggableProps.style }}
                                className={`group relative mb-4 p-5 rounded-xl border transition-all duration-300 backdrop-blur-md
                                  ${snapshot.isDragging 
                                    ? 'bg-slate-900/90 border-cyan-500 shadow-[0_0_30px_rgba(6,182,212,0.3)] rotate-2 z-50' 
                                    : 'bg-white/5 border-white/5 hover:border-white/20 hover:bg-white/10'
                                  }`}
                              >
                                {/* Card Glow Effect on Hover */}
                                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                                {/* Card Header */}
                                <div className="flex justify-between items-start mb-3 relative z-10">
                                  <span className={`text-[10px] px-2 py-0.5 rounded border uppercase tracking-wider font-bold ${getPriorityStyle(task.priority)}`}>
                                    {task.priority}
                                  </span>
                                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                                    <button 
                                      onClick={() => { setEditingTask(task); setIsModalOpen(true); }} 
                                      className="text-slate-500 hover:text-cyan-400 transition-colors"
                                    >
                                      <Edit2 size={14} />
                                    </button>
                                    <button 
                                      onClick={() => deleteTask(task.id, column.id)} 
                                      className="text-slate-500 hover:text-red-400 transition-colors"
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  </div>
                                </div>

                                {/* Content */}
                                <h4 className="font-semibold text-slate-100 mb-2 leading-tight relative z-10">{task.title}</h4>
                                <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed relative z-10 font-light">
                                  {task.description || "No data available."}
                                </p>

                                {/* Footer info */}
                                <div className="flex items-center justify-between pt-3 border-t border-white/5 mt-2 relative z-10">
                                  <div className="flex items-center text-[10px] text-slate-500 gap-1 font-mono">
                                    <Calendar size={10} />
                                    <span>{task.dueDate ? new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }).toUpperCase() : 'N/A'}</span>
                                  </div>
                                  
                                  {/* Tags */}
                                  {task.tags && task.tags.length > 0 && (
                                    <div className="flex gap-1 overflow-hidden justify-end">
                                       {task.tags.slice(0, 3).map(tag => (
                                          <div key={tag} className="text-[9px] text-cyan-300/80 px-1 border border-cyan-900/50 rounded bg-cyan-900/20">
                                            #{tag}
                                          </div>
                                       ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </motion.div>
              );
            })}
          </div>
        </DragDropContext>
        
        {/* Activity Log - Terminal Style */}
        <div className="mt-10 border-t border-white/10 pt-6">
          <div className="glass-panel rounded-xl p-0 max-w-2xl overflow-hidden">
            <div className="bg-black/40 px-4 py-2 border-b border-white/5 flex items-center gap-2">
               <Terminal size={14} className="text-green-500" />
               <span className="text-xs font-mono text-green-500/80 uppercase">System_Log.txt</span>
            </div>
            <div className="h-32 overflow-y-auto p-4 custom-scrollbar font-mono text-xs">
              <ul className="space-y-1">
                {data.activityLog.map(log => (
                  <li key={log.id} className="text-slate-400 flex items-start gap-3">
                    <span className="text-slate-600 select-none">
                      [{new Date(log.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'})}]
                    </span>
                    <span className="text-slate-300">
                      <span className="text-purple-400 mr-2">{'>'}</span>
                      {log.action}
                    </span>
                  </li>
                ))}
                <li className="text-green-500/50 animate-pulse">_</li>
              </ul>
            </div>
          </div>
        </div>

      </main>

      <TaskModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        taskToEdit={editingTask} 
        onSave={handleSaveTask} 
      />
    </div>
  );
}