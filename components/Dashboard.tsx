
import React, { useState, useEffect, useCallback } from 'react';
import { Purchase, Sale, UserSettings, User } from '../types';
import { dataService } from '../services/dataService';
import { parseVoiceTranscript } from '../services/geminiService';
import Gauge from './Gauge';
import { 
  Plus, 
  Mic, 
  Settings as SettingsIcon, 
  LogOut, 
  TrendingUp, 
  ShoppingCart, 
  Trash2,
  Calendar,
  CheckCircle2,
  XCircle,
  Users,
  Download
} from 'lucide-react';

interface DashboardProps {
  user: User;
  onLogout: () => void;
  onOpenSettings: () => void;
  onOpenAdmin: () => void;
  refreshKey?: number;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onLogout, onOpenSettings, onOpenAdmin, refreshKey = 0 }) => {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [settings, setSettings] = useState<UserSettings>(dataService.getSettings(user.id));
  
  const [isRecording, setIsRecording] = useState(false);
  const [showPurchaseForm, setShowPurchaseForm] = useState(false);
  const [showSalesForm, setShowSalesForm] = useState(false);
  
  // Form States
  const [newPurchase, setNewPurchase] = useState({ category: 'comida' as const, product: '', value: '', date: new Date().toISOString().split('T')[0] });
  const [newSale, setNewSale] = useState({ value: '', date: new Date().toISOString().split('T')[0] });

  const loadData = useCallback(() => {
    setPurchases(dataService.getPurchases(user.id));
    setSales(dataService.getSales(user.id));
    setSettings(dataService.getSettings(user.id));
  }, [user.id]);

  useEffect(() => {
    loadData();
  }, [loadData, refreshKey]);

  // Calculations
  const totalPurchases = purchases.reduce((acc, p) => acc + p.value, 0);
  const totalSales = sales.reduce((acc, s) => acc + s.value, 0);
  
  // Projected CMV: (Total Purchases / Sales Goal) * 100
  const projectedCmv = settings.salesGoal > 0 ? (totalPurchases / settings.salesGoal) * 100 : 0;
  
  // Real CMV: (Total Purchases / Actual Sales) * 100
  const realCmv = totalSales > 0 ? (totalPurchases / totalSales) * 100 : 0;

  const handleAddPurchase = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newPurchase.product || !newPurchase.value) return;
    
    const purchase: Purchase = {
      id: Math.random().toString(36).substr(2, 9),
      userId: user.id,
      category: newPurchase.category,
      product: newPurchase.product,
      date: newPurchase.date,
      value: parseFloat(newPurchase.value)
    };
    
    dataService.addPurchase(purchase);
    setNewPurchase({ category: 'comida', product: '', value: '', date: new Date().toISOString().split('T')[0] });
    setShowPurchaseForm(false);
    loadData();
  };

  const handleAddSale = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSale.value) return;
    
    const sale: Sale = {
      id: Math.random().toString(36).substr(2, 9),
      userId: user.id,
      date: newSale.date,
      value: parseFloat(newSale.value)
    };
    
    dataService.addSale(sale);
    setNewSale({ value: '', date: new Date().toISOString().split('T')[0] });
    setShowSalesForm(false);
    loadData();
  };

  const handleDeletePurchase = (id: string) => {
    dataService.deletePurchase(id);
    loadData();
  };

  const exportToCSV = () => {
    // 1. Preparar seção de Compras
    const purchaseHeaders = ['ID', 'Produto', 'Categoria', 'Data', 'Valor (R$)'];
    const purchaseRows = purchases.map(p => [
      p.id, 
      p.product, 
      p.category, 
      p.date, 
      p.value.toFixed(2).replace('.', ',')
    ]);
    
    // 2. Preparar seção de Vendas
    const salesHeaders = ['ID', 'Data', 'Valor (R$)'];
    const salesRows = sales.map(s => [
      s.id, 
      s.date, 
      s.value.toFixed(2).replace('.', ',')
    ]);

    // 3. Consolidar em um único CSV
    let csvContent = '\uFEFF'; // BOM para Excel identificar UTF-8
    
    // Título e Compras
    csvContent += 'RELATÓRIO DE COMPRAS\n';
    csvContent += purchaseHeaders.join(';') + '\n';
    purchaseRows.forEach(row => {
      csvContent += row.join(';') + '\n';
    });
    csvContent += `\nTOTAL COMPRAS:; ; ; ;${totalPurchases.toFixed(2).replace('.', ',')}\n\n`;

    // Espaçador e Vendas
    csvContent += 'RELATÓRIO DE VENDAS (FATURAMENTO)\n';
    csvContent += salesHeaders.join(';') + '\n';
    salesRows.forEach(row => {
      csvContent += row.join(';') + '\n';
    });
    csvContent += `\nTOTAL VENDAS:; ;${totalSales.toFixed(2).replace('.', ',')}\n\n`;

    // Resumo de CMV
    csvContent += 'INDICADORES DE CMV\n';
    csvContent += `CMV Projetado (Baseado na Meta);${projectedCmv.toFixed(2)}%\n`;
    csvContent += `CMV Real (Baseado em Vendas Reais);${realCmv.toFixed(2)}%\n`;

    // 4. Download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `CMV_PRO_Relatorio_${user.company.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const startVoiceCapture = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Seu navegador não suporta reconhecimento de voz.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'pt-BR';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsRecording(true);
    recognition.onend = () => setIsRecording(false);
    recognition.onerror = () => setIsRecording(false);

    recognition.onresult = async (event: any) => {
      const transcript = event.results[0][0].transcript;
      setIsRecording(false);
      
      const structured = await parseVoiceTranscript(transcript);
      if (structured) {
        const purchase: Purchase = {
          id: Math.random().toString(36).substr(2, 9),
          userId: user.id,
          ...structured
        };
        dataService.addPurchase(purchase);
        loadData();
        alert(`Lançado: ${structured.product} - R$ ${structured.value}`);
      } else {
        alert("Não consegui entender o lançamento. Tente novamente.");
      }
    };

    recognition.start();
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-rose-600 text-white shadow-lg sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="bg-white p-1.5 rounded-lg">
              <TrendingUp className="text-rose-600 w-6 h-6" />
            </div>
            <span className="text-xl font-bold tracking-tight">CMV PRO</span>
          </div>
          
          <div className="flex items-center space-x-3">
            {user.role === 'admin' && (
              <button onClick={onOpenAdmin} className="p-2 hover:bg-rose-700 rounded-full transition-colors" title="Administração">
                <Users className="w-5 h-5" />
              </button>
            )}
            <button onClick={onOpenSettings} className="p-2 hover:bg-rose-700 rounded-full transition-colors" title="Configurações">
              <SettingsIcon className="w-5 h-5" />
            </button>
            <button onClick={onLogout} className="p-2 hover:bg-rose-700 rounded-full transition-colors" title="Sair">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Welcome Section */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Olá, {user.name}</h1>
            <p className="text-slate-500 font-medium">Acompanhe o desempenho de <span className="text-rose-600 font-bold">{user.company}</span>.</p>
          </div>
          <div className="flex flex-wrap gap-3">
             <button 
              onClick={exportToCSV}
              className="flex items-center justify-center space-x-2 bg-slate-100 text-slate-700 px-5 py-2.5 rounded-2xl font-bold hover:bg-slate-200 transition-all active:scale-95 border border-slate-200"
              title="Exportar Relatório Consolidado (Excel/CSV)"
            >
              <Download className="w-4 h-4" />
              <span>Exportar Dados</span>
            </button>
             <button 
              onClick={() => setShowPurchaseForm(true)}
              className="flex-1 md:flex-none flex items-center justify-center space-x-2 bg-rose-600 text-white px-5 py-2.5 rounded-2xl font-bold hover:bg-rose-700 transition-all shadow-lg active:scale-95"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Nova Compra</span>
            </button>
            <button 
              onClick={() => setShowSalesForm(true)}
              className="flex-1 md:flex-none flex items-center justify-center space-x-2 bg-slate-900 text-white px-5 py-2.5 rounded-2xl font-bold hover:bg-black transition-all shadow-lg active:scale-95"
            >
              <TrendingUp className="w-4 h-4" />
              <span>Lançar Venda</span>
            </button>
          </div>
        </div>

        {/* Gauges Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Gauge 
            label="CMV Projetado (Meta)" 
            value={projectedCmv} 
            max={settings.cmvTarget * 2 || 100} 
            unit="%" 
            type="cmv" 
            threshold={settings.cmvTarget}
          />
          <Gauge 
            label="CMV Real (Atual)" 
            value={realCmv} 
            max={settings.cmvTarget * 2 || 100} 
            unit="%" 
            type="cmv" 
            threshold={settings.cmvTarget}
          />
          <Gauge 
            label="Meta de Faturamento" 
            value={totalSales} 
            max={settings.salesGoal} 
            unit="R$" 
            type="progress" 
          />
        </div>

        {/* Purchase Voice/List Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Purchases List */}
          <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h2 className="font-bold text-slate-800 flex items-center space-x-2">
                <ShoppingCart className="w-5 h-5 text-rose-600" />
                <span>Histórico de Compras</span>
              </h2>
              <span className="text-xs font-black text-rose-600 bg-rose-50 px-4 py-1.5 rounded-full border border-rose-100">
                TOTAL: R$ {totalPurchases.toLocaleString('pt-BR')}
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-400 text-[10px] uppercase font-black tracking-widest">
                  <tr>
                    <th className="px-8 py-4">Produto</th>
                    <th className="px-8 py-4">Categoria</th>
                    <th className="px-8 py-4 text-center">Data</th>
                    <th className="px-8 py-4 text-right">Valor</th>
                    <th className="px-8 py-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {purchases.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-16 text-center text-slate-400 font-medium">Nenhuma compra registrada para este restaurante.</td>
                    </tr>
                  ) : (
                    purchases.sort((a,b) => b.date.localeCompare(a.date)).map(p => (
                      <tr key={p.id} className="hover:bg-rose-50/20 transition-colors group">
                        <td className="px-8 py-5 font-bold text-slate-700">{p.product}</td>
                        <td className="px-8 py-5 capitalize">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${p.category === 'comida' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                            {p.category}
                          </span>
                        </td>
                        <td className="px-8 py-5 text-slate-400 text-sm text-center font-medium">{new Date(p.date).toLocaleDateString('pt-BR')}</td>
                        <td className="px-8 py-5 font-black text-slate-800 text-right">R$ {p.value.toLocaleString('pt-BR')}</td>
                        <td className="px-8 py-5 text-right">
                          <button 
                            onClick={() => handleDeletePurchase(p.id)}
                            className="p-2 text-slate-200 hover:text-rose-600 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Voice Input Assistant */}
          <div className="bg-rose-600 rounded-3xl p-8 shadow-xl flex flex-col items-center justify-center text-center text-white space-y-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 rotate-12 group-hover:rotate-0 transition-transform">
              <Mic className="w-32 h-32" />
            </div>
            
            <div className={`p-8 rounded-full transition-all duration-500 z-10 ${isRecording ? 'bg-white text-rose-600 scale-110 shadow-2xl' : 'bg-rose-500 shadow-lg'}`}>
              <Mic className={`w-14 h-14 ${isRecording ? 'animate-pulse' : ''}`} />
            </div>
            
            <div className="z-10">
              <h3 className="text-2xl font-black tracking-tight">Comando de Voz</h3>
              <p className="text-rose-100 text-sm mt-2 font-medium leading-relaxed opacity-90">
                Fale naturalmente seus lançamentos:<br/>
                <span className="bg-rose-700/50 px-2 py-0.5 rounded inline-block mt-1 italic">"Batata frita, 50 reais, comida"</span>
              </p>
            </div>
            
            <button 
              onClick={startVoiceCapture}
              disabled={isRecording}
              className={`w-full py-4 rounded-2xl font-black text-rose-600 bg-white hover:bg-rose-50 transition-all shadow-xl z-10 ${isRecording ? 'opacity-50 cursor-not-allowed' : 'active:scale-95'}`}
            >
              {isRecording ? 'ESTOU OUVINDO...' : 'GRAVAR AGORA'}
            </button>
          </div>
        </div>
      </main>

      {/* Forms Modals */}
      {showPurchaseForm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-rose-600 p-8 text-white flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-black tracking-tight">Registrar Compra</h3>
                <p className="text-rose-100 text-xs font-bold opacity-80 uppercase tracking-widest mt-1">Entrada de estoque</p>
              </div>
              <button onClick={() => setShowPurchaseForm(false)} className="bg-rose-700/50 hover:bg-rose-700 rounded-full p-2 transition-colors">
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleAddPurchase} className="p-8 space-y-6">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Descrição do Produto</label>
                <input 
                  type="text" 
                  value={newPurchase.product}
                  onChange={e => setNewPurchase({...newPurchase, product: e.target.value})}
                  className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none transition-all font-bold text-slate-800 placeholder:text-slate-300"
                  placeholder="Ex: Coca-Cola 350ml"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Categoria</label>
                  <select 
                    value={newPurchase.category}
                    onChange={e => setNewPurchase({...newPurchase, category: e.target.value as any})}
                    className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none transition-all font-bold text-slate-800"
                  >
                    <option value="comida">🍔 Comida</option>
                    <option value="bebida">🥤 Bebida</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Valor Pago</label>
                  <input 
                    type="number" 
                    step="0.01"
                    value={newPurchase.value}
                    onChange={e => setNewPurchase({...newPurchase, value: e.target.value})}
                    className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none transition-all font-bold text-slate-800"
                    placeholder="0,00"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Data da Nota</label>
                <input 
                  type="date" 
                  value={newPurchase.date}
                  onChange={e => setNewPurchase({...newPurchase, date: e.target.value})}
                  className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none transition-all font-bold text-slate-800"
                  required
                />
              </div>
              <button className="w-full py-5 bg-rose-600 text-white rounded-2xl font-black text-lg hover:bg-rose-700 shadow-xl shadow-rose-600/20 transition-all active:scale-95">
                Confirmar Lançamento
              </button>
            </form>
          </div>
        </div>
      )}

      {showSalesForm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-slate-900 p-8 text-white flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-black tracking-tight text-white">Lançar Faturamento</h3>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Resultado do dia</p>
              </div>
              <button onClick={() => setShowSalesForm(false)} className="bg-slate-800 hover:bg-slate-700 rounded-full p-2 transition-colors">
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleAddSale} className="p-8 space-y-6">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Faturamento Total (R$)</label>
                <input 
                  type="number" 
                  step="0.01"
                  value={newSale.value}
                  onChange={e => setNewSale({...newSale, value: e.target.value})}
                  className="w-full px-6 py-5 rounded-2xl bg-slate-50 border border-slate-100 focus:ring-2 focus:ring-slate-500/20 focus:border-slate-800 outline-none transition-all font-black text-2xl text-slate-800"
                  placeholder="0,00"
                  required
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Data da Operação</label>
                <input 
                  type="date" 
                  value={newSale.date}
                  onChange={e => setNewSale({...newSale, date: e.target.value})}
                  className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:ring-2 focus:ring-slate-500/20 focus:border-slate-800 outline-none transition-all font-bold text-slate-800"
                  required
                />
              </div>
              <button className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-lg hover:bg-black shadow-xl shadow-slate-900/20 transition-all active:scale-95">
                Salvar Faturamento
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
