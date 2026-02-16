import { createContext, useState, useContext, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

const TaskContext = createContext();

const INITIAL_DATA = {
  tasks: {},
  columns: {
    'todo': { id: 'todo', title: 'To Do', taskIds: [] },
    'doing': { id: 'doing', title: 'Doing', taskIds: [] },
    'done': { id: 'done', title: 'Done', taskIds: [] },
  }, 
  columnOrder: ['todo', 'doing', 'done'],
  activityLog: []
};

export const TaskProvider = ({ children }) => {
  const [data, setData] = useState(INITIAL_DATA);

  // Load from LocalStorage 
  useEffect(() => {
    const savedData = localStorage.getItem('taskBoardData');
    if (savedData) {
      setData(JSON.parse(savedData));
    }
  }, []);

  // Save to LocalStorage
  useEffect(() => {
    localStorage.setItem('taskBoardData', JSON.stringify(data));
  }, [data]);

  const logActivity = (action) => {
    const newLog = {
      id: uuidv4(),
      action,
      timestamp: new Date().toISOString()
    };
    setData(prev => ({
      ...prev,
      activityLog: [newLog, ...prev.activityLog].slice(0, 50) 
    }));
  };

  const addTask = (task) => {
    const id = uuidv4();
    const newTask = { ...task, id, createdAt: new Date().toISOString() }; 
    
    setData(prev => ({
      ...prev,
      tasks: { ...prev.tasks, [id]: newTask },
      columns: {
        ...prev.columns,
        todo: {
          ...prev.columns.todo,
          taskIds: [id, ...prev.columns.todo.taskIds]
        }
      }
    }));
    logActivity(`Created task "${task.title}"`); 
  };

  const updateTask = (id, updatedFields) => {
    setData(prev => ({
      ...prev,
      tasks: { ...prev.tasks, [id]: { ...prev.tasks[id], ...updatedFields } }
    }));
    logActivity(`Edited task "${updatedFields.title || 'Unknown'}"`); 
  };

  const deleteTask = (taskId, columnId) => {
    setData(prev => {
      const newTasks = { ...prev.tasks };
      delete newTasks[taskId];
      
      const newColumn = {
        ...prev.columns[columnId],
        taskIds: prev.columns[columnId].taskIds.filter(id => id !== taskId)
      };

      return {
        ...prev,
        tasks: newTasks,
        columns: { ...prev.columns, [columnId]: newColumn }
      };
    });
    logActivity('Deleted a task'); 
  };

  const resetBoard = () => {
    if(window.confirm("Are you sure? This will delete all data.")) { 
      setData(INITIAL_DATA);
      localStorage.removeItem('taskBoardData');
    }
  };

 
  const moveTask = (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const start = data.columns[source.droppableId];
    const finish = data.columns[destination.droppableId];

    
    if (start === finish) {
      const newTaskIds = Array.from(start.taskIds);
      newTaskIds.splice(source.index, 1);
      newTaskIds.splice(destination.index, 0, draggableId);

      const newColumn = { ...start, taskIds: newTaskIds };
      setData(prev => ({
        ...prev,
        columns: { ...prev.columns, [newColumn.id]: newColumn }
      }));
      return;
    }

  
    const startTaskIds = Array.from(start.taskIds);
    startTaskIds.splice(source.index, 1);
    const newStart = { ...start, taskIds: startTaskIds };

    const finishTaskIds = Array.from(finish.taskIds);
    finishTaskIds.splice(destination.index, 0, draggableId);
    const newFinish = { ...finish, taskIds: finishTaskIds };

    setData(prev => ({
      ...prev,
      columns: { ...prev.columns, [newStart.id]: newStart, [newFinish.id]: newFinish }
    }));
    logActivity(`Moved task to ${finish.title}`); 
  };

  return (
    <TaskContext.Provider value={{ data, addTask, updateTask, deleteTask, moveTask, resetBoard }}>
      {children}
    </TaskContext.Provider>
  );
};

export const useTask = () => useContext(TaskContext);
