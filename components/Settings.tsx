
import React, { useState } from 'react';
import { UserSettings } from '../types';
import { dataService } from '../services/dataService';
import { XCircle, Save, Percent, Target } from 'lucide-react';

interface SettingsProps {
  userId: string;
  onClose: () => void;
  onUpdated: () => void;
}

const Settings: React.FC<SettingsProps> = ({ userId, onClose, onUpdated }) => {
  const [settings, setSettings] = useState<UserSettings>(dataService.getSettings(userId));

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    dataService.updateSettings(settings);
    onUpdated();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="bg-slate-800 p-6 text-white flex justify-between items-center">
          <h3 className="text-xl font-bold">Configurações de Metas</h3>
          <button onClick={onClose} className="hover:bg-slate-700 rounded-lg p-1">
            <XCircle className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={handleSave} className="p-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="flex items-center space-x-2 text-sm font-bold text-slate-700 mb-2">
                <Target className="w-4 h-4 text-rose-600" />
                <span>Meta de Faturamento (R$)</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">R$</span>
                <input 
                  type="number" 
                  value={settings.salesGoal}
                  onChange={e => setSettings({...settings, salesGoal: parseFloat(e.target.value)})}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-rose-500 outline-none transition-all font-bold text-slate-800"
                  required
                />
              </div>
              <p className="mt-1 text-xs text-slate-400">O valor total de vendas esperado para o período.</p>
            </div>

            <div>
              <label className="flex items-center space-x-2 text-sm font-bold text-slate-700 mb-2">
                <Percent className="w-4 h-4 text-rose-600" />
                <span>Meta de CMV (%)</span>
              </label>
              <div className="relative">
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">%</span>
                <input 
                  type="number" 
                  step="0.1"
                  value={settings.cmvTarget}
                  onChange={e => setSettings({...settings, cmvTarget: parseFloat(e.target.value)})}
                  className="w-full px-4 py-4 bg-slate-50 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-rose-500 outline-none transition-all font-bold text-slate-800"
                  required
                />
              </div>
              <p className="mt-1 text-xs text-slate-400">Porcentagem ideal do custo sobre o faturamento.</p>
            </div>
          </div>

          <button className="w-full py-4 bg-rose-600 text-white rounded-2xl font-bold flex items-center justify-center space-x-2 hover:bg-rose-700 shadow-lg transition-all active:scale-95">
            <Save className="w-5 h-5" />
            <span>Salvar Configurações</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default Settings;
