import React, { useState, useMemo, useCallback, memo } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { motion } from 'framer-motion';
import { useTask } from '../context/TaskContext';
import { useAuth } from '../context/AuthContext';
import TaskModal from './TaskModal';
import { 
  Trash2, Edit2, Plus, LogOut, RotateCcw, 
  Search, Calendar, Filter, Terminal, Cpu 
} from 'lucide-react';

// styling
const styles = `
  :root {
    --c1: #38bdf8; --c2: #a855f7; --c3: #22c55e;
    --bg-dark: oklch(0.145 0 0); --noise: rgba(255, 255, 255, 0.05);
  }
  .cyber-bg {
    background-color: var(--bg-dark);
    background-image: radial-gradient(circle at 50% 0%, #1e293b, transparent 70%), radial-gradient(circle at 80% 90%, #020617, transparent 70%);
    min-height: 100vh; position: relative; color: white; overflow-x: hidden;
  }
  .cyber-bg::before {
    content: ""; position: fixed; inset: 0;
    background: repeating-radial-gradient(circle, var(--noise) 0 1px, transparent 1px 2px);
    mix-blend-mode: overlay; pointer-events: none; opacity: 0.3; z-index: 0;
  }
  .glass-panel {
    background: rgba(255, 255, 255, 0.03); backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.08); box-shadow: 0 4px 30px rgba(0, 0, 0, 0.5);
  }
  .custom-scrollbar::-webkit-scrollbar { width: 6px; }
  .custom-scrollbar::-webkit-scrollbar-track { background: rgba(0,0,0,0.2); }
  .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
`;



//  extracted and memoized to prevent re-renders of cardds
const TaskCard = memo(({ task, index, columnId, onEdit, onDelete }) => {
  const priorityStyle = useMemo(() => {
    switch (task.priority) {
      case 'High': return 'text-red-400 border-red-500/50 bg-red-500/10 shadow-[0_0_10px_rgba(248,113,113,0.2)]';
      case 'Medium': return 'text-amber-400 border-amber-500/50 bg-amber-500/10 shadow-[0_0_10px_rgba(251,191,36,0.2)]';
      case 'Low': return 'text-emerald-400 border-emerald-500/50 bg-emerald-500/10 shadow-[0_0_10px_rgba(52,211,153,0.2)]';
      default: return 'text-slate-400 border-slate-500/50 bg-slate-500/10';
    }
  }, [task.priority]);

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          style={{ ...provided.draggableProps.style }}
          className={`group relative mb-3 p-4 rounded-xl border transition-all duration-200 backdrop-blur-md
            ${snapshot.isDragging 
              ? 'bg-slate-900/90 border-cyan-500 shadow-[0_0_30px_rgba(6,182,212,0.3)] rotate-2 z-50' 
              : 'bg-white/5 border-white/5 hover:border-white/20 hover:bg-white/10'
            }`}
        >
          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          
          <div className="flex justify-between items-start mb-2 relative z-10">
            <span className={`text-[10px] px-2 py-0.5 rounded border uppercase tracking-wider font-bold ${priorityStyle}`}>
              {task.priority}
            </span>
            <div className="opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
              <button onClick={() => onEdit(task)} className="text-slate-500 hover:text-cyan-400 p-1">
                <Edit2 size={14} />
              </button>
              <button onClick={() => onDelete(task.id, columnId)} className="text-slate-500 hover:text-red-400 p-1">
                <Trash2 size={14} />
              </button>
            </div>
          </div>

          <h4 className="font-semibold text-slate-100 mb-1 leading-tight text-sm sm:text-base relative z-10">{task.title}</h4>
          <p className="text-xs text-slate-400 line-clamp-2 mb-3 leading-relaxed relative z-10 font-light">
            {task.description || "No data available."}
          </p>

          <div className="flex items-center justify-between pt-2 border-t border-white/5 mt-2 relative z-10">
            <div className="flex items-center text-[10px] text-slate-500 gap-1 font-mono">
              <Calendar size={10} />
              <span>{task.dueDate ? new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }).toUpperCase() : 'N/A'}</span>
            </div>
            {task.tags?.length > 0 && (
              <div className="flex gap-1 overflow-hidden justify-end max-w-[50%]">
                 {task.tags.slice(0, 2).map(tag => (
                    <div key={tag} className="text-[9px] text-cyan-300/80 px-1 border border-cyan-900/50 rounded bg-cyan-900/20 truncate">
                      #{tag}
                    </div>
                 ))}
              </div>
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
});

// renderlogic
const BoardColumn = memo(({ column, tasks, onDeleteTask, onEditTask }) => {
  const getColumnColor = (title) => {
    if (title === 'To Do') return 'border-t-4 border-slate-500';
    if (title === 'Doing') return 'border-t-4 border-cyan-500 shadow-[0_-5px_20px_rgba(6,182,212,0.3)]';
    if (title === 'Done') return 'border-t-4 border-purple-500 shadow-[0_-5px_20px_rgba(168,85,247,0.3)]';
    return '';
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`glass-panel rounded-2xl p-4 flex flex-col max-h-screen md:h-full md:min-h-[500px] ${getColumnColor(column.title)}`}
    >
      <div className="flex justify-between items-center mb-4 px-2 border-b border-white/5 pb-3">
        <h2 className="font-bold text-slate-300 text-sm uppercase tracking-[0.2em] flex items-center gap-2">
           {column.title}
        </h2>
        <span className="bg-white/5 border border-white/10 px-2 py-0.5 rounded text-[10px] font-mono text-cyan-400">
          [{tasks.length.toString().padStart(2, '0')}]
        </span>
      </div>

      <Droppable droppableId={column.id}>
        {(provided, snapshot) => (
          <div 
            ref={provided.innerRef} 
            {...provided.droppableProps} 
            className={`flex-1 transition-colors rounded-xl p-2 min-h-[150px] ${
              snapshot.isDraggingOver ? 'bg-cyan-500/5 ring-1 ring-cyan-500/20' : ''
            }`}
          >
            {tasks.map((task, index) => (
              <TaskCard 
                key={task.id} 
                task={task} 
                index={index} 
                columnId={column.id}
                onEdit={onEditTask}
                onDelete={onDeleteTask}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </motion.div>
  );
});

// maincomp
export default function Board() {
  const { data, moveTask, addTask, updateTask, deleteTask, resetBoard } = useTask();
  const { logout, user } = useAuth();
  
  const [search, setSearch] = useState('');
  const [filterPriority, setFilterPriority] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

 
  const onDragEnd = useCallback((result) => moveTask(result), [moveTask]);

  // handle for childrenn
  const handleEditClick = useCallback((task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  }, []);

  const handleDeleteClick = useCallback((taskId, colId) => {
    deleteTask(taskId, colId);
  }, [deleteTask]);

  const handleSaveTask = useCallback((taskData) => {
    if (editingTask) updateTask(editingTask.id, taskData);
    else addTask(taskData);
  }, [editingTask, updateTask, addTask]);

  const handleNewTask = useCallback(() => {
    setEditingTask(null);
    setIsModalOpen(true);
  }, []);

  // filtering ka logic
  const filteredData = useMemo(() => {
    const result = {};
    data.columnOrder.forEach(colId => {
      const column = data.columns[colId];
      result[colId] = column.taskIds
        .map(id => data.tasks[id])
        .filter(task => {
          if (!task) return false;
          const matchSearch = task.title.toLowerCase().includes(search.toLowerCase());
          const matchPriority = filterPriority === 'All' || task.priority === filterPriority;
          return matchSearch && matchPriority;
        })
        .sort((a, b) => {
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate) - new Date(b.dueDate);
        });
    });
    return result;
  }, [data.tasks, data.columns, data.columnOrder, search, filterPriority]);

  return (
    <div className="cyber-bg font-sans selection:bg-cyan-500/30 selection:text-cyan-100 min-h-screen flex flex-col">
      <style>{styles}</style>
      
     {/** for filteringg */}
      <nav className="sticky top-0 z-30 glass-panel border-b-0 border-b-white/10 px-4 sm:px-6 py-3 sm:py-4 relative">
        <div className="absolute inset-x-0 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent"></div>
        <div className="flex flex-wrap justify-between items-center gap-y-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center border border-cyan-500/50 bg-cyan-900/20 shadow-[0_0_15px_rgba(6,182,212,0.4)]">
              <Cpu className="text-cyan-400" size={18} />
            </div>
            <h1 className="text-lg sm:text-2xl font-bold tracking-widest uppercase text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-white">
              TaskFlow<span className="text-[10px] align-top opacity-70 ml-1">v2.0</span>
            </h1>
          </div>

          <div className="flex items-center gap-2 sm:gap-6 ml-auto">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-sm font-semibold text-cyan-100 tracking-wide">{user?.name}</span>
              <span className="text-[10px] text-cyan-500/70 font-mono uppercase">Operator Level</span>
            </div>
            <button onClick={resetBoard} className="p-2 text-slate-400 hover:text-cyan-400 transition-all hover:rotate-180 duration-500">
              <RotateCcw size={18} />
            </button>
            <button onClick={logout} className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full border border-white/10 hover:border-red-500/50 hover:bg-red-500/10 hover:text-red-400 text-slate-400 text-xs sm:text-sm font-medium transition-all group">
              <LogOut size={14} className="group-hover:-translate-x-1 transition-transform" />
              <span className="hidden sm:inline">DISCONNECT</span>
            </button>
          </div>
        </div>
      </nav>

      <main className="flex-1 p-4 sm:p-6 max-w-[1600px] mx-auto w-full relative z-10 flex flex-col">
        {/* vontrols */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-stretch md:items-center mb-6 sm:mb-8 gap-4"
        >
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto glass-panel p-2 sm:p-1 rounded-xl">
            <div className="relative w-full sm:w-auto flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-500/50" size={16} />
              <input 
                placeholder="SCAN DATABASE..." 
                className="pl-9 pr-4 py-2 bg-transparent outline-none text-sm w-full sm:w-64 placeholder:text-slate-600 text-cyan-100"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div className="hidden sm:block h-6 w-[1px] bg-white/10 self-center"></div>
            <div className="relative flex items-center w-full sm:w-auto">
              <Filter className="absolute left-3 text-cyan-500/50" size={14} />
              <select 
                className="pl-8 pr-4 py-2 w-full sm:w-auto bg-transparent outline-none text-sm text-slate-400 cursor-pointer appearance-none hover:text-cyan-300 border-t sm:border-t-0 border-white/10 sm:border-none" 
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
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={handleNewTask}
            className="w-full md:w-auto relative px-6 py-3 rounded-full font-bold uppercase tracking-wider text-sm overflow-hidden group flex justify-center items-center"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-purple-600 opacity-80 group-hover:opacity-100 transition-opacity"></span>
            <span className="absolute inset-0 border border-white/20 rounded-full"></span>
            <span className="relative z-10 flex items-center gap-2 text-white"><Plus size={18} /> Initialize Task</span>
            <span className="absolute bottom-0 left-0 w-full h-[2px] bg-cyan-300 shadow-[0_0_10px_#38bdf8]"></span>
          </motion.button>
        </motion.div>

        {/* board */}
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start h-full">
            {data.columnOrder.map((colId) => (
              <BoardColumn 
                key={colId}
                column={data.columns[colId]}
                tasks={filteredData[colId]}
                onEditTask={handleEditClick}
                onDeleteTask={handleDeleteClick}
              />
            ))}
          </div>
        </DragDropContext>
        
        {/* systemm log */}
        <div className="mt-8 border-t border-white/10 pt-6 pb-6">
          <div className="glass-panel rounded-xl p-0 max-w-full md:max-w-2xl overflow-hidden mx-auto md:mx-0">
            <div className="bg-black/40 px-4 py-2 border-b border-white/5 flex items-center gap-2">
               <Terminal size={14} className="text-green-500" />
               <span className="text-xs font-mono text-green-500/80 uppercase">System_Log.txt</span>
            </div>
            <div className="h-32 overflow-y-auto p-4 custom-scrollbar font-mono text-[10px] sm:text-xs">
              <ul className="space-y-1">
                {data.activityLog.map(log => (
                  <li key={log.id} className="text-slate-400 flex flex-wrap items-start gap-2 sm:gap-3">
                    <span className="text-slate-600 select-none whitespace-nowrap">
                      [{new Date(log.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'})}]
                    </span>
                    <span className="text-slate-300 break-all">
                      <span className="text-purple-400 mr-2">{'>'}</span>{log.action}
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
