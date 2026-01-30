import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  CreditCard,
  Wallet,
  Trash2
} from 'lucide-react';

interface Stats {
  totalRevenue: number;
  totalExpenses: number;
  profit: number;
  totalAppointments: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({
    totalRevenue: 0,
    totalExpenses: 0,
    profit: 0,
    totalAppointments: 0,
  });
  const [serviceStats, setServiceStats] = useState<any[]>([]);
  const [filter, setFilter] = useState({
    period: 'month',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  });

  const [showRevenueModal, setShowRevenueModal] = useState(false);
  const [revenueHistory, setRevenueHistory] = useState<any[]>([]);

  const [showQuickPayment, setShowQuickPayment] = useState(false);
  const [quickPaymentData, setQuickPaymentData] = useState({
    amount: '',
    payment_method: 'cash',
    notes: ''
  });

  useEffect(() => {
    loadStats();
  }, [filter]);

  const getDateRange = () => {
    const { period, month, year } = filter;
    const today = new Date();

    const formatLocal = (date: Date) => {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const d = String(date.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    };

    if (period === 'day') {
      const date = formatLocal(today);
      return { start: date, end: date };
    } else if (period === 'week') {
      const start = new Date(today);
      start.setDate(today.getDate() - 7);
      return { start: formatLocal(start), end: formatLocal(today) };
    } else {
      const start = `${year}-${month.toString().padStart(2, '0')}-01`;
      // Criar data baseada nos componentes locais para evitar shifts de timezone
      const lastDayDate = new Date(year, month, 0);
      const end = formatLocal(lastDayDate);
      return { start, end };
    }
  };

  const loadStats = async () => {
    const { start, end } = getDateRange();

    // Corrigindo o erro de tipagem com 'as any'
    const { data: payments } = await (supabase
      .from('payments')
      .select('*')
      .gte('created_at', `${start}T00:00:00`)
      .lte('created_at', `${end}T23:59:59`) as any);

    const { data: apps } = await (supabase
      .from('appointments')
      .select('*, services(name, price), barbers(name)')
      .eq('status', 'completed')
      .gte('appointment_date', start)
      .lte('appointment_date', end) as any);

    const { data: expenses } = await (supabase
      .from('expenses')
      .select('amount')
      .gte('expense_date', start)
      .lte('expense_date', end) as any);

    const totalPayments = payments?.reduce((sum: number, p: any) => sum + Number(p.amount), 0) || 0;
    const totalAppointmentsRevenue = apps?.reduce((sum: number, app: any) => sum + (Number(app.services?.price) || 0), 0) || 0;

    const totalRevenue = totalPayments + totalAppointmentsRevenue;
    const totalExpenses = expenses?.reduce((sum: number, exp: any) => sum + Number(exp.amount), 0) || 0;

    setStats({
      totalRevenue,
      totalExpenses,
      profit: totalRevenue - totalExpenses,
      totalAppointments: apps?.length || 0,
    });

    // Consolidar Histórico
    const history = [
      ...(payments || []).map((p: any) => ({ ...p, type: 'payment' })),
      ...(apps || []).map((a: any) => ({ ...a, type: 'appointment', amount: a.services?.price }))
    ].sort((a, b) => new Date(b.created_at || b.appointment_date).getTime() - new Date(a.created_at || a.appointment_date).getTime());

    setRevenueHistory(history);

    const servicesMap = new Map();
    apps?.forEach((app: any) => {
      const name = app.services?.name || 'Geral';
      const current = servicesMap.get(name) || { total: 0, count: 0 };
      servicesMap.set(name, { total: current.total + (app.services?.price || 0), count: current.count + 1 });
    });
    setServiceStats(
      Array.from(servicesMap.entries())
        .map(([name, data]) => ({ name, ...data }))
        .sort((a, b) => b.count - a.count)
    );
  };

  const clearFinancialData = async () => {
    if (!window.confirm("⚠️ ATENÇÃO: Deseja apagar TODO o histórico financeiro e de serviços?")) return;
    if (!window.confirm("🛑 Confirmação final: Zerar tudo?")) return;

    try {
      await supabase.from('payments').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('expenses').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('appointments').delete().eq('status', 'completed');
      loadStats();
    } catch (error: any) {
      alert("Erro: " + error.message);
    }
  };

  const handleQuickPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from('payments').insert([{
      amount: parseFloat(quickPaymentData.amount),
      payment_method: quickPaymentData.payment_method,
      notes: quickPaymentData.notes
    }] as any);

    if (error) alert('Erro: ' + error.message);
    else {
      setShowQuickPayment(false);
      setQuickPaymentData({ amount: '', payment_method: 'cash', notes: '' });
      loadStats();
    }
  };

  return (
    <div className="space-y-12">
      {/* Header com Contexto */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 lg:gap-10">
        <div className="relative">
          <span className="premium-label">Fluxo de Caixa Operacional</span>
          <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tighter uppercase leading-none">
            Visão <br /><span className="text-amber-500">Geral</span>
          </h1>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 bg-white border-2 border-slate-900 p-2 shadow-[8px_8px_0px_rgba(2,6,23,0.05)] w-full lg:w-auto">
          <div className="flex divide-x-2 divide-slate-100 flex-1 sm:flex-none">
            <button
              onClick={() => setFilter({ ...filter, period: 'day' })}
              className={`flex-1 px-4 sm:px-6 py-3 font-black text-[10px] uppercase tracking-widest transition-all ${filter.period === 'day' ? 'bg-slate-900 text-white' : 'text-slate-400 hover:bg-slate-50'}`}
            >Hoje</button>
            <button
              onClick={() => setFilter({ ...filter, period: 'month' })}
              className={`flex-1 px-4 sm:px-6 py-3 font-black text-[10px] uppercase tracking-widest transition-all ${filter.period === 'month' ? 'bg-slate-900 text-white' : 'text-slate-400 hover:bg-slate-50'}`}
            >Mês</button>
          </div>
          <button onClick={() => setShowQuickPayment(true)} className="px-8 py-4 bg-emerald-500 text-white font-black text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-emerald-500/20 active:scale-95 transition-all text-center">
            Venda Avulsa +
          </button>
        </div>
      </div>

      {/* Grid de Métricas de Precisão */}
      <div className="grid gap-6 sm:gap-10 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Entradas Reais', value: stats.totalRevenue, icon: TrendingUp, color: 'text-emerald-500', onClick: () => setShowRevenueModal(true) },
          { label: 'Custos Fixos/Var', value: stats.totalExpenses, icon: TrendingDown, color: 'text-red-500' },
          { label: 'Lucro Líquido', value: stats.profit, icon: DollarSign, color: 'text-amber-500' },
          { label: 'Tickets Gerados', value: stats.totalAppointments, icon: Users, color: 'text-slate-900' },
        ].map((item, idx) => (
          <div
            key={idx}
            onClick={item.onClick}
            className={`monolith-card p-6 sm:p-10 group relative overflow-hidden ${item.onClick ? 'cursor-pointer hover:shadow-lg transition-all active:scale-95' : ''}`}
          >
            <div className="flex flex-col relative z-10">
              <span className="premium-label !mb-4 sm:!mb-6">{item.label}</span>
              <div className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tighter mb-2">
                {item.label === 'Tickets Gerados' ? item.value : `R$ ${item.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
              </div>
              <div className={`flex items-center gap-2 text-[10px] font-black uppercase ${item.color}`}>
                <item.icon className="w-4 h-4" />
                <span>Consolidado</span>
              </div>
            </div>
            {/* Massive Icon in Background */}
            <item.icon className="absolute -bottom-6 -right-6 w-24 sm:w-32 h-24 sm:h-32 text-slate-50 opacity-[0.05] group-hover:scale-110 transition-transform duration-700" />
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-10">
        {/* Top Serviços */}
        <div className="lg:col-span-2 monolith-card p-10">
          <div className="flex items-center justify-between mb-10">
            <span className="premium-label">RANKING DE CORTES MAIS PEDIDOS</span>
            <div className="w-12 h-1 bg-amber-500" />
          </div>
          <div className="space-y-6">
            {serviceStats.length > 0 ? serviceStats.map((s, i) => (
              <div key={i} className="flex items-center justify-between p-6 bg-slate-50 border-2 border-transparent hover:border-slate-900 transition-all cursor-default group">
                <div className="flex items-center gap-6">
                  <span className="text-2xl font-black text-slate-200 group-hover:text-amber-500 transition-colors">0{i + 1}</span>
                  <div className="flex flex-col">
                    <span className="font-black text-slate-900 uppercase text-xs tracking-widest">{s.name}</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">{s.count} ATENDIMENTOS</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-black text-slate-900">R$ {s.total.toFixed(2)}</div>
                </div>
              </div>
            )) : (
              <div className="text-center py-20 text-slate-300 font-black uppercase tracking-widest text-xs">Aguardando dados...</div>
            )}
          </div>
        </div>

        {/* Painel de Controle Adicional */}
        <div className="space-y-6">
          <div className="monolith-card p-10 bg-[#020617] text-white">
            <span className="premium-label !text-slate-600">Gestão de Dados</span>
            <h3 className="text-xl font-black uppercase tracking-tighter mb-8">Zona de Perigo</h3>
            <button onClick={clearFinancialData} className="w-full py-5 border-2 border-red-900/50 hover:bg-red-900/20 text-red-500 transition-all font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-4">
              <Trash2 size={20} />
              Zerar Histórico
            </button>
          </div>
        </div>
      </div>

      {/* Modal Histórico de Receitas */}
      {showRevenueModal && (
        <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-md flex items-center justify-center p-4 z-[200]">
          <div className="monolith-card !bg-white w-full max-w-4xl p-8 sm:p-12 max-h-[90vh] overflow-y-auto animate-reveal relative flex flex-col">
            <div className="flex items-center justify-between mb-8 sticky top-0 bg-white z-20 pb-4 border-b-2 border-slate-50">
              <span className="premium-label !mb-0 text-emerald-500">Histórico de Entradas</span>
              <button onClick={() => setShowRevenueModal(false)} className="w-10 h-10 flex items-center justify-center bg-slate-100 hover:bg-black hover:text-white transition-all font-black">X</button>
            </div>

            <div className="space-y-4">
              {revenueHistory.length > 0 ? revenueHistory.map((item: any, i: number) => (
                <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-6 bg-slate-50 border-l-4 border-emerald-500 text-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 mb-2 sm:mb-0">
                    <span className="font-bold text-slate-400 text-[10px] uppercase tracking-widest">
                      {new Date(item.created_at || item.appointment_date).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })}
                    </span>
                    <span className="font-black text-slate-900 uppercase">
                      {item.description || (item.services ? `Agendamento: ${item.services.name}` : 'Venda Avulsa')}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 justify-between sm:justify-end">
                    <span className="font-bold text-slate-500 text-[10px] uppercase tracking-widest bg-emerald-100/50 px-2 py-1 text-emerald-700">
                      {item.payment_method || 'PIX/DINHEIRO'}
                    </span>
                    <span className="font-black text-emerald-600">
                      R$ {Number(item.amount || item.services?.price).toFixed(2)}
                    </span>
                  </div>
                </div>
              )) : (
                <div className="text-center py-20 text-slate-300 font-black uppercase tracking-widest">Nenhuma entrada encontrada no período.</div>
              )}
            </div>

            <div className="text-center mt-8 pt-6 border-t font-black text-slate-300 uppercase text-[10px] tracking-widest">
              Mostrando todas as entradas de {Object.values(getDateRange()).map(d => d.split('-').reverse().join('/')).join(' até ')}
            </div>
          </div>
        </div>
      )}

      {/* Modal Monolito para Venda Avulsa */}
      {showQuickPayment && (
        <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-md flex items-center justify-center p-4 z-[200]">
          <div className="monolith-card !bg-white w-full max-w-xl p-8 sm:p-16 max-h-[90vh] overflow-y-auto animate-reveal relative">
            <div className="flex items-center justify-between mb-8 sm:mb-12 sticky top-0 bg-white z-20 pb-4 border-b-2 border-slate-50 sm:border-none">
              <span className="premium-label !mb-0">Registro de Venda Rápida</span>
              <button onClick={() => setShowQuickPayment(false)} className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-slate-100 hover:bg-black hover:text-white transition-all">X</button>
            </div>

            <form onSubmit={handleQuickPayment} className="space-y-10">
              <div className="space-y-4">
                <span className="premium-label">Valor do Recebimento</span>
                <input
                  type="number" step="0.01" autoFocus required
                  placeholder="0,00"
                  value={quickPaymentData.amount}
                  onChange={(e) => setQuickPaymentData({ ...quickPaymentData, amount: e.target.value })}
                  className="w-full text-7xl font-black p-0 bg-transparent border-none outline-none tracking-tighter focus:ring-0 text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { id: 'cash', label: 'Dinheiro', icon: Wallet },
                  { id: 'pix', label: 'Pix', icon: DollarSign },
                  { id: 'credit_card', label: 'Cartão Crd', icon: CreditCard },
                  { id: 'debit_card', label: 'Cartão Deb', icon: CreditCard },
                ].map(m => (
                  <button
                    key={m.id} type="button"
                    onClick={() => setQuickPaymentData({ ...quickPaymentData, payment_method: m.id })}
                    className={`p-6 border-2 transition-all flex flex-col items-center gap-3 ${quickPaymentData.payment_method === m.id ? 'bg-slate-900 border-black text-white shadow-[8px_8px_0px_rgba(245,158,11,1)]' : 'bg-white border-slate-100 text-slate-400 hover:border-slate-900'}`}
                  >
                    <m.icon size={24} />
                    <span className="font-black text-[9px] uppercase tracking-widest">{m.label}</span>
                  </button>
                ))}
              </div>

              <button type="submit" className="monolith-btn w-full !bg-emerald-500 !text-black !py-8 !text-lg">
                CONFIRMAR ENTRADA NO CAIXA
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
