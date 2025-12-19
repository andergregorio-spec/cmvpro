
import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { dataService } from '../services/dataService';
import { XCircle, UserPlus, Phone, Mail, Building, Users, ArrowLeft, Lock } from 'lucide-react';

interface AdminProps {
  onClose: () => void;
}

const Admin: React.FC<AdminProps> = ({ onClose }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', phone: '', company: '' });

  useEffect(() => {
    setUsers(dataService.getUsers());
  }, []);

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    const user: User = {
      id: Math.random().toString(36).substr(2, 9),
      ...newUser,
      role: 'user'
    };
    dataService.addUser(user);
    setUsers(dataService.getUsers());
    setNewUser({ name: '', email: '', password: '', phone: '', company: '' });
    setIsAdding(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-slate-900 text-white p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button onClick={onClose} className="flex items-center space-x-2 hover:bg-slate-800 px-4 py-2 rounded-xl transition-all">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-bold">Painel Admin</span>
          </button>
          <div className="flex items-center space-x-2">
             <span className="text-xs font-bold bg-amber-500 px-3 py-1 rounded-full text-slate-900">ACESSO SUPERUSER</span>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800">Controle de Parceiros</h1>
            <p className="text-slate-500">Gerencie todos os restaurantes cadastrados no sistema.</p>
          </div>
          <button 
            onClick={() => setIsAdding(true)}
            className="flex items-center space-x-2 bg-rose-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-rose-700 shadow-lg active:scale-95 transition-all"
          >
            <UserPlus className="w-5 h-5" />
            <span>Novo Cliente</span>
          </button>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center space-x-2">
            <Users className="w-6 h-6 text-rose-600" />
            <h2 className="text-xl font-bold text-slate-800">Usuários Ativos</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-8 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">Empresa / Nome</th>
                  <th className="px-8 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">Contato</th>
                  <th className="px-8 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">Tipo</th>
                  <th className="px-8 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-rose-50/30 transition-colors">
                    <td className="px-8 py-5">
                      <div className="font-bold text-slate-800">{u.company}</div>
                      <div className="text-sm text-slate-500">{u.name}</div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center text-sm text-slate-600">
                        <Mail className="w-3.5 h-3.5 mr-1.5" /> {u.email}
                      </div>
                      <div className="flex items-center text-sm text-slate-600 mt-1">
                        <Phone className="w-3.5 h-3.5 mr-1.5" /> {u.phone}
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${u.role === 'admin' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-xs font-mono text-slate-400">#{u.id}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {isAdding && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
             <div className="bg-slate-900 p-6 text-white flex justify-between items-center">
              <h3 className="text-xl font-bold">Cadastrar Novo Restaurante</h3>
              <button onClick={() => setIsAdding(false)} className="hover:bg-slate-800 rounded-lg p-1">
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleAddUser} className="p-8 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-bold text-slate-700">Nome Responsável</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      value={newUser.name}
                      onChange={e => setNewUser({...newUser, name: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-bold text-slate-700">Empresa (Restaurante)</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      value={newUser.company}
                      onChange={e => setNewUser({...newUser, company: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-bold text-slate-700">Email Comercial</label>
                  <input 
                    type="email" 
                    value={newUser.email}
                    onChange={e => setNewUser({...newUser, email: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-bold text-slate-700">Senha de Acesso</label>
                  <input 
                    type="password" 
                    value={newUser.password}
                    onChange={e => setNewUser({...newUser, password: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none"
                    placeholder="Mín. 8 caracteres"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-bold text-slate-700">Telefone / WhatsApp</label>
                <input 
                  type="tel" 
                  value={newUser.phone}
                  onChange={e => setNewUser({...newUser, phone: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none"
                  required
                />
              </div>

              <button className="w-full py-4 bg-rose-600 text-white rounded-2xl font-bold flex items-center justify-center space-x-2 hover:bg-rose-700 transition-all shadow-lg">
                <UserPlus className="w-5 h-5" />
                <span>Confirmar Cadastro de Usuário</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
