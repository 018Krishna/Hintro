import { useState, useEffect, useCallback, memo } from 'react';
import { createPortal } from 'react-dom';


const styles = `
  :root { --c1: #38bdf8; --c2: #a855f7; --c3: #22c55e; --noise: rgba(255, 255, 255, 0.05); }
  .cyber-overlay {
    background-color: #020617;
    background-image: radial-gradient(circle at 20% 10%, #1e293b, transparent 60%), radial-gradient(circle at 80% 90%, #020617, transparent 70%);
    position: fixed; inset: 0; z-index: 9999; display: flex; align-items: center; justify-content: center;
    padding: 1rem; perspective: 1000px;
  }
  .cyber-overlay::after {
    content: ""; position: absolute; inset: 0;
    background: repeating-radial-gradient(circle, var(--noise) 0 1px, transparent 1px 2px);
    mix-blend-mode: overlay; pointer-events: none; opacity: 0.35; animation: grain 0.25s steps(2) infinite;
  }
  @keyframes grain { to { transform: translate(2px, -2px); } }
  .cyber-card {
    width: 100%; max-width: 32rem; padding: 2.5rem; border-radius: 28px;
    background: linear-gradient(120deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.02));
    backdrop-filter: blur(16px);
    box-shadow: 0 0 50px rgba(56, 189, 248, 0.35), inset 0 0 35px rgba(255, 255, 255, 0.15);
    transform-style: preserve-3d; animation: float 6s ease-in-out infinite;
    position: relative; border: 1px solid rgba(255,255,255,0.1); z-index: 51;
  }
  .cyber-card::before {
    content: ""; position: absolute; inset: -2px;
    background: linear-gradient(120deg, transparent 20%, var(--c1), var(--c2), var(--c3), transparent 80%);
    filter: blur(25px); opacity: 0.4; z-index: -1; animation: holo 4s linear infinite;
    background-size: 400% 100%; border-radius: 30px;
  }
  @keyframes holo { to { background-position: 400% 0; } }
  @keyframes float {
    0%, 100% { transform: rotateX(2deg) rotateY(-2deg) translateY(0); }
    50% { transform: rotateX(-2deg) rotateY(2deg) translateY(-10px); }
  }
  .glitch { position: relative; font-size: 1.8rem; font-weight: 900; letter-spacing: 0.08em; color: white; margin-bottom: 1.5rem; }
  .glitch::before, .glitch::after { content: attr(data-text); position: absolute; inset: 0; opacity: 0.8; }
  .glitch::before { color: var(--c1); transform: translate(3px, -2px); mix-blend-mode: screen; animation: glitch 2s infinite alternate; }
  .glitch::after { color: var(--c2); transform: translate(-3px, 2px); mix-blend-mode: screen; animation: glitch 1.5s infinite alternate-reverse; }
  .cyber-input {
    background: rgba(0, 0, 0, 0.3); border: 1px solid rgba(255, 255, 255, 0.1); color: white; transition: all 0.3s ease;
  }
  .cyber-input:focus { outline: none; border-color: var(--c1); box-shadow: 0 0 15px rgba(56, 189, 248, 0.3); background: rgba(0, 0, 0, 0.5); }
  .cyber-input::-webkit-calendar-picker-indicator { filter: invert(1); cursor: pointer; }
  .cyber-btn {
    padding: 0.8rem 1.8rem; border-radius: 999px; font-weight: 600; letter-spacing: 0.08em; color: white;
    background: linear-gradient(90deg, var(--c1), var(--c2), var(--c3)); background-size: 300% 100%;
    animation: holo 3s linear infinite; box-shadow: 0 0 25px rgba(168, 85, 247, 0.4);
    border: none; cursor: pointer; transition: transform 0.2s; white-space: nowrap;
  }
  .cyber-btn:hover { transform: scale(1.05); }
  .cyber-btn-ghost {
    background: transparent; color: rgba(255,255,255,0.6); border: 1px solid rgba(255,255,255,0.2);
    padding: 0.8rem 1.8rem; border-radius: 999px; cursor: pointer; transition: all 0.3s; white-space: nowrap;
  }
  .cyber-btn-ghost:hover { color: white; border-color: var(--c1); box-shadow: 0 0 15px rgba(56, 189, 248, 0.2); }
  @media (max-width: 640px) {
    .cyber-card { padding: 1.5rem; margin: 1rem; animation: none; transform: none; }
    .glitch { font-size: 1.4rem; text-align: center; margin-bottom: 1rem; }
    .cyber-btn, .cyber-btn-ghost { width: 100%; justify-content: center; display: flex; }
  }
`;

const INITIAL_STATE = { title: '', description: '', priority: 'Medium', dueDate: '', tags: '' };

const TaskModal = memo(({ isOpen, onClose, taskToEdit, onSave }) => {
  const [formData, setFormData] = useState(INITIAL_STATE);

  // initialise for task chnge
  useEffect(() => {
    if (isOpen) {
      if (taskToEdit) {
        setFormData({
          ...taskToEdit,
       
          tags: Array.isArray(taskToEdit.tags) ? taskToEdit.tags.join(', ') : (taskToEdit.tags || '')
        });
      } else {
        setFormData(INITIAL_STATE);
      }
    }
  }, [taskToEdit, isOpen]);

  
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  // chnge handler
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    onSave({
      ...formData,
      
      tags: typeof formData.tags === 'string' 
        ? formData.tags.split(',').map(t => t.trim()).filter(t => t !== '') 
        : formData.tags
    });
    onClose();
  }, [formData, onSave, onClose]);

  if (!isOpen) return null;

  const modalTitle = taskToEdit ? 'EDIT_TASK' : 'NEW_TASK';

  
  return createPortal(
    <>
      <style>{styles}</style>
      
      <div className="cyber-overlay" onClick={onClose}>
        
        {/* Stop  */}
        <form onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit} className="cyber-card flex flex-col gap-4">
          
          <h3 className="glitch" data-text={modalTitle}>
            {modalTitle}
          </h3>
          
          <input 
            name="title"
            className="w-full p-3 rounded cyber-input" 
            placeholder="Title (Required)" 
            value={formData.title} 
            onChange={handleChange}
            required 
            autoFocus
          />
          
          <textarea 
            name="description"
            className="w-full p-3 rounded cyber-input min-h-[100px]" 
            placeholder="Description" 
            value={formData.description}
            onChange={handleChange}
          />

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="text-xs text-gray-400 mb-1 block ml-1">Priority</label>
              <select 
                name="priority"
                className="w-full p-3 rounded cyber-input"
                value={formData.priority}
                onChange={handleChange}
              >
                <option className="text-black">Low</option>
                <option className="text-black">Medium</option>
                <option className="text-black">High</option>
              </select>
            </div>

            <div className="flex-1">
              <label className="text-xs text-gray-400 mb-1 block ml-1">Due Date</label>
              <input 
                name="dueDate"
                type="date" 
                className="w-full p-3 rounded cyber-input"
                value={formData.dueDate}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
             <input 
              name="tags"
              className="w-full p-3 rounded cyber-input" 
              placeholder="Tags (comma separated)" 
              value={formData.tags} 
              onChange={handleChange}
            />
          </div>

          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 mt-4">
            <button type="button" onClick={onClose} className="cyber-btn-ghost">
              CANCEL
            </button>
            <button type="submit" className="cyber-btn">
              SAVE SYSTEM
            </button>
          </div>
        </form>
      </div>
    </>,
    document.body
  );
});

export default TaskModal;
