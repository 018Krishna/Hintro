import { useState, useEffect, useRef, useCallback, memo } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Check, AlertCircle, ArrowRight, Loader2, Eye, EyeOff } from 'lucide-react';

// it preveent from re render
const NeonBackground = memo(() => {
  const canvasRef = useRef(null);
  const animationApp = useRef(null);
  const initialized = useRef(false);

  useEffect(() => {
    let mounted = true;

    const initAnimation = async () => {
      // prevent double logic
      if (initialized.current) return;

      try {
        const module = await import('https://cdn.jsdelivr.net/npm/threejs-components@0.0.19/build/cursors/tubes1.min.js');
        const TubesCursor = module.default;

        if (canvasRef.current && mounted) {
          animationApp.current = TubesCursor(canvasRef.current, {
            tubes: {
              colors: ["#f967fb", "#53bc28", "#6958d5"],
              lights: {
                intensity: 200,
                colors: ["#83f36e", "#fe8a2e", "#ff008a", "#60aed5"]
              }
            }
          });
          initialized.current = true;
        }
      } catch (err) {
        console.error("Failed to load animation:", err);
      }
    };

    initAnimation();

    return () => {
      mounted = false;
      
      initialized.current = false;
    };
  }, []);

  // prevention from recreated
  const handleBackgroundClick = useCallback(() => {
    if (animationApp.current) {
      const randomColors = (count) => 
        new Array(count).fill(0).map(() => "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0'));
      
      const colors = randomColors(3);
      const lightsColors = randomColors(4);
      
      animationApp.current.tubes.setColors(colors);
      animationApp.current.tubes.setLightsColors(lightsColors);
    }
  }, []);

  return (
    <div 
      className="fixed inset-0 z-0 w-full h-full"
      onClick={handleBackgroundClick}
    >
      <canvas 
        ref={canvasRef} 
        className="w-full h-full pointer-events-none"
        style={{ touchAction: 'none' }}
      />
    </div>
  );
});


const LoginForm = () => {
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [status, setStatus] = useState({ loading: false, error: '' });

  // state handler to reduce setter calls
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, error: '' });

   
    setTimeout(() => {
      const result = login(formData.email, formData.password, remember);
      if (!result.success) {
        setStatus({ loading: false, error: result.message });
      } else {
        setStatus({ loading: false, error: '' });
      }
    }, 800);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="relative z-10 w-full max-w-md p-8 bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl shadow-[0_0_50px_-12px_rgba(255,255,255,0.2)]"
      onClick={(e) => e.stopPropagation()} // Stop click propagation to background
    >
      {/* header */}
      <div className="text-center mb-8">
        <motion.div 
          whileHover={{ scale: 1.1, rotate: 10 }}
          className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/10 border border-white/20 shadow-lg shadow-purple-500/20 mb-4"
        >
          <span className="text-white font-bold text-2xl drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]">T</span>
        </motion.div>
        <h2 className="text-3xl font-bold text-white tracking-tight">Welcome Back</h2>
        <p className="text-slate-400 mt-2 text-sm font-medium">Todo</p>
      </div>

      {/* Error  */}
      <AnimatePresence mode="wait">
        {status.error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-xl flex items-center gap-3 text-red-200 overflow-hidden"
          >
            <AlertCircle size={20} className="text-red-400 shrink-0" />
            <span className="text-sm">{status.error}</span>
          </motion.div>
        )}
      </AnimatePresence>
      
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* gmail */}
        <div className="space-y-1">
          <label htmlFor="email" className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Email</label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-purple-400 transition-colors">
              <Mail size={20} />
            </div>
            <input 
              id="email"
              name="email"
              type="email" 
              value={formData.email} 
              onChange={handleChange}
              className="w-full pl-11 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl focus:bg-white/10 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 outline-none transition-all text-white placeholder:text-slate-600"
              required 
              placeholder="name@company.com"
            />
          </div>
        </div>
        
        {/* passs */}
        <div className="space-y-1">
          <div className="flex justify-between items-center ml-1">
            <label htmlFor="password" className="text-xs font-bold text-slate-400 uppercase tracking-wider">Password</label>
            <button type="button" className="text-xs text-purple-400 hover:text-purple-300 font-bold hover:underline transition-colors">Forgot password?</button>
          </div>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-purple-400 transition-colors">
              <Lock size={20} />
            </div>
            <input 
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={formData.password} 
              onChange={handleChange}
              className="w-full pl-11 pr-12 py-3.5 bg-white/5 border border-white/10 rounded-xl focus:bg-white/10 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 outline-none transition-all text-white placeholder:text-slate-600"
              required 
              placeholder="Enter your password"
            />
            <button 
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-white transition-colors cursor-pointer"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        {/* rem me */}
        <div className="flex items-center">
          <label className="relative flex items-center cursor-pointer group select-none">
            <input 
              type="checkbox" 
              checked={remember} 
              onChange={(e) => setRemember(e.target.checked)}
              className="peer sr-only" 
            />
            <div className={`w-5 h-5 border-2 rounded-md transition-all flex items-center justify-center
              ${remember ? 'bg-purple-600 border-purple-600' : 'bg-transparent border-slate-600 peer-hover:border-purple-400'}`}
            >
              <Check size={12} className={`text-white transition-transform ${remember ? 'scale-100' : 'scale-0'}`} />
            </div>
            <span className="ml-2.5 text-sm text-slate-400 font-medium group-hover:text-white transition-colors">Remember me</span>
          </label>
        </div>

        {/* submit */}
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit" 
          disabled={status.loading}
          className="w-full py-3.5 px-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold rounded-xl shadow-[0_0_20px_-5px_rgba(147,51,234,0.5)] flex items-center justify-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {status.loading ? (
            <Loader2 size={22} className="animate-spin" />
          ) : (
            <>
              Sign In <ArrowRight size={20} />
            </>
          )}
        </motion.button>
      </form>

      <div className="mt-8 text-center text-sm text-slate-500 font-medium">
        Don't have an account?{' '}
        <button className="text-purple-400 font-bold hover:text-purple-300 hover:underline">
          Create an account
        </button>
      </div>
    </motion.div>
  );
};


export default function Login() {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-black overflow-hidden font-sans">
      <NeonBackground />
      <LoginForm />
    </div>
  );
}
