
import React, { useState } from 'react';
import { User } from '../types';
import { dataService } from '../services/dataService';
import { TrendingUp, Lock, Mail, ChevronRight } from 'lucide-react';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const users = dataService.getUsers();
    
    // Simple validation: Super user fixed password
    if (email === 'super@gmail.com' && password === '12345678') {
      const superUser = users.find(u => u.email === 'super@gmail.com');
      if (superUser) {
        onLogin(superUser);
        return;
      }
    }

    // Normal users validation
    const found = users.find(u => u.email === email && u.password === password);
    if (found) {
      onLogin(found);
    } else {
      setError('Credenciais inválidas. Verifique seu e-mail e senha.');
    }
  };

  return (
    <div className="min-h-screen bg-rose-600 flex items-center justify-center p-6">
      <div className="bg-white w-full max-w-md rounded-[3rem] shadow-2xl overflow-hidden p-8 md:p-12 space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-500">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center bg-rose-50 p-4 rounded-3xl shadow-sm">
            <TrendingUp className="text-rose-600 w-10 h-10" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">CMV PRO</h1>
            <p className="text-slate-400 font-medium text-lg mt-2">Inteligência para o seu restaurante.</p>
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-4">
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-rose-500 transition-colors w-5 h-5" />
              <input 
                type="email" 
                placeholder="E-mail de acesso"
                value={email}
                onChange={e => { setEmail(e.target.value); setError(''); }}
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all font-medium text-slate-700"
                required
              />
            </div>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-rose-500 transition-colors w-5 h-5" />
              <input 
                type="password" 
                placeholder="Senha"
                value={password}
                onChange={e => { setPassword(e.target.value); setError(''); }}
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all font-medium text-slate-700"
                required
              />
            </div>
          </div>

          {error && (
            <div className="text-rose-500 text-sm font-bold text-center bg-rose-50 py-3 rounded-xl">
              {error}
            </div>
          )}

          <button className="w-full bg-rose-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-rose-700 shadow-xl shadow-rose-600/20 transform active:scale-95 transition-all flex items-center justify-center space-x-2">
            <span>Entrar no Dashboard</span>
            <ChevronRight className="w-5 h-5" />
          </button>
        </form>

        <div className="pt-4 text-center">
          <p className="text-slate-400 text-sm">
            Dificuldades no acesso? <br/>
            <span className="text-rose-600 font-bold cursor-pointer hover:underline">Fale com seu consultor</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
