
import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Settings from './components/Settings';
import Admin from './components/Admin';
import { User, AuthState } from './types';

const App: React.FC = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
  });
  
  const [currentView, setCurrentView] = useState<'dashboard' | 'admin'>('dashboard');
  const [showSettings, setShowSettings] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Restore session if exists
  useEffect(() => {
    const saved = localStorage.getItem('cmv_pro_session');
    if (saved) {
      setAuthState({
        user: JSON.parse(saved),
        isAuthenticated: true
      });
    }
  }, []);

  const handleLogin = (user: User) => {
    setAuthState({ user, isAuthenticated: true });
    localStorage.setItem('cmv_pro_session', JSON.stringify(user));
  };

  const handleLogout = () => {
    setAuthState({ user: null, isAuthenticated: false });
    localStorage.removeItem('cmv_pro_session');
    setCurrentView('dashboard');
  };

  const handleSettingsUpdated = () => {
    setShowSettings(false);
    setRefreshKey(prev => prev + 1); // Incrementa a chave para forçar o Dashboard a recarregar os dados
  };

  if (!authState.isAuthenticated || !authState.user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="antialiased text-slate-900">
      {currentView === 'admin' ? (
        <Admin onClose={() => setCurrentView('dashboard')} />
      ) : (
        <Dashboard 
          user={authState.user} 
          onLogout={handleLogout} 
          onOpenSettings={() => setShowSettings(true)}
          onOpenAdmin={() => setCurrentView('admin')}
          refreshKey={refreshKey}
        />
      )}

      {showSettings && (
        <Settings 
          userId={authState.user.id} 
          onClose={() => setShowSettings(false)} 
          onUpdated={handleSettingsUpdated}
        />
      )}
    </div>
  );
};

export default App;
