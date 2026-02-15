import { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check local storage for 'Remember me'
    const storedUser = localStorage.getItem('taskUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = (email, password, remember) => {
    // Hardcoded credentials [cite: 13]
    if (email === 'intern@demo.com' && password === 'intern123') {
      const userData = { email, name: 'Intern User' };
      setUser(userData);
      if (remember) {
        localStorage.setItem('taskUser', JSON.stringify(userData)); // [cite: 15]
      }
      return { success: true };
    }
    return { success: false, message: 'Invalid credentials' }; // [cite: 14]
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('taskUser');
    window.location.href = '/'; // Simple redirect
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);