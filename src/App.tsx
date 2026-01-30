import { useState, useEffect } from 'react';
import { useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import { ThemeProvider } from './contexts/ThemeContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Services from './pages/Services';
import Barbers from './pages/Barbers';
import Appointments from './pages/Appointments';
import Expenses from './pages/Expenses';
import Settings from './pages/Settings';
import Booking from './pages/Booking';

function App() {
  const { user, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');

  // Router simples por hash para o Portal do Cliente
  useEffect(() => {
    const handleHash = () => {
      if (window.location.hash === '#agendar') {
        setCurrentPage('booking');
      }
    };
    window.addEventListener('hashchange', handleHash);
    handleHash();
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  if (currentPage === 'booking') {
    return <Booking />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Carregando...</div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'services':
        return <Services />;
      case 'barbers':
        return <Barbers />;
      case 'appointments':
        return <Appointments />;
      case 'expenses':
        return <Expenses />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <ThemeProvider>
      <Layout currentPage={currentPage} onNavigate={setCurrentPage}>
        {renderPage()}
      </Layout>
    </ThemeProvider>
  );
}

export default App;
