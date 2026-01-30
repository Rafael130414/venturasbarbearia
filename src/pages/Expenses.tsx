import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Plus, TrendingDown, Trash2, Calendar, X } from 'lucide-react';

export default function Expenses() {
    const [expenses, setExpenses] = useState<any[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ description: '', amount: '', expense_date: new Date().toISOString().split('T')[0], category: 'Outros' });

    useEffect(() => { loadExpenses(); }, []);
    const loadExpenses = async () => {
        const { data } = await supabase.from('expenses').select('*').order('expense_date', { ascending: false });
        if (data) setExpenses(data);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await (supabase.from('expenses').insert([{ ...formData, amount: parseFloat(formData.amount) }] as any) as any);
        setShowModal(false);
        setFormData({ description: '', amount: '', expense_date: new Date().toISOString().split('T')[0], category: 'Outros' });
        loadExpenses();
    };

    const handleDelete = async (id: string) => {
        if (confirm('Deletar despesa?')) {
            await (supabase.from('expenses').delete().eq('id', id) as any);
            loadExpenses();
        }
    };

    return (
        <div className="space-y-12">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 lg:gap-10">
                <div className="relative">
                    <span className="premium-label">Gestão de Saídas Operacionais</span>
                    <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tighter uppercase leading-none">
                        Custos <br /><span className="text-red-600">Reais</span>
                    </h1>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="monolith-btn !w-full sm:!w-auto !bg-red-600 hover:!bg-red-700 !py-4"
                >
                    <Plus className="w-6 h-6" />
                    REGISTRAR SAÍDA
                </button>
            </div>

            <div className="grid gap-6 sm:gap-8">
                {expenses.length > 0 ? expenses.map((exp) => (
                    <div key={exp.id} className="monolith-card p-6 sm:p-8 group relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-6 sm:gap-8">
                        {/* Massive Date BG */}
                        <div className="absolute top-0 right-0 text-[60px] sm:text-[80px] font-black text-slate-900 opacity-[0.02] select-none pointer-events-none leading-none -mr-4 mt-2">
                            {new Date(exp.expense_date).getDate()}
                        </div>

                        <div className="flex items-center gap-4 sm:gap-8 relative z-10 w-full lg:w-auto">
                            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-red-100 text-red-600 flex items-center justify-center rotate-3 border-2 border-red-200 shrink-0">
                                <TrendingDown size={24} className="-rotate-3 sm:w-8 sm:h-8" />
                            </div>
                            <div className="min-w-0">
                                <span className="premium-label !mb-1 !text-slate-400">Classificação: {exp.category}</span>
                                <h3 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tighter leading-none truncate">{exp.description}</h3>
                                <div className="flex items-center gap-2 mt-2 sm:mt-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    <Calendar size={12} /> {new Date(exp.expense_date).toLocaleDateString()}
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-row lg:flex-row items-center gap-6 sm:gap-10 relative z-10 w-full lg:w-auto justify-between lg:justify-end">
                            <div className="text-left lg:text-right">
                                <span className="premium-label !mb-0">Valor Debitado</span>
                                <div className="text-2xl sm:text-4xl font-black text-red-600 tracking-tighter font-mono">- R$ {exp.amount.toFixed(2)}</div>
                            </div>
                            <button
                                onClick={() => handleDelete(exp.id)}
                                className="w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center border-2 border-transparent hover:border-red-600 hover:text-red-600 text-slate-300 transition-all rounded-full group/btn shrink-0"
                            >
                                <Trash2 size={20} className="group-hover/btn:scale-110 transition-transform sm:w-6 sm:h-6" />
                            </button>
                        </div>
                    </div>
                )) : (
                    <div className="monolith-card p-24 text-center">
                        <span className="text-slate-300 font-black uppercase tracking-[0.5em] text-xs">Caixa sem histórico de saídas</span>
                    </div>
                )}
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-md flex items-center justify-center p-4 z-[200]">
                    <div className="monolith-card !bg-white w-full max-w-xl p-8 sm:p-16 max-h-[90vh] overflow-y-auto animate-reveal relative">
                        <div className="flex items-center justify-between mb-8 sm:mb-12 sticky top-0 bg-white z-20 pb-4 border-b-2 border-slate-50 sm:border-none">
                            <span className="premium-label !mb-0">Lançamento de Despesa</span>
                            <button onClick={() => setShowModal(false)} className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-slate-50 hover:bg-black hover:text-white transition-all font-black">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-8">
                            <div className="space-y-2">
                                <label className="premium-label">Descrição da Saída</label>
                                <input type="text" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="monolith-input" required placeholder="EX: ALUGUEL, LUZ, PRODUTOS..." />
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="premium-label">Valor (R$)</label>
                                    <input type="number" step="0.01" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} className="monolith-input" required placeholder="0,00" />
                                </div>
                                <div className="space-y-2">
                                    <label className="premium-label">Data de Competência</label>
                                    <input type="date" value={formData.expense_date} onChange={(e) => setFormData({ ...formData, expense_date: e.target.value })} className="monolith-input" required />
                                </div>
                            </div>
                            <button type="submit" className="monolith-btn w-full !bg-red-600 !text-white !py-8 !text-lg !rounded-none">CONFIRMAR DÉBITO</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
