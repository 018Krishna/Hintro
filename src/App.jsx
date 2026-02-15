import { useAuth } from './context/AuthContext';
import Login from './components/Login';
import Board from './components/Board';

function App() {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  return user ? <Board /> : <Login />;
}

export default App;