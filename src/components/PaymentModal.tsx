import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { CreditCard, Wallet2, QrCode, X } from 'lucide-react';

interface PaymentModalProps {
    appointmentId: string;
    servicePrice: number;
    onClose: () => void;
    onSuccess: () => void;
}

export default function PaymentModal({ appointmentId, servicePrice, onClose, onSuccess }: PaymentModalProps) {
    const [paymentMethod, setPaymentMethod] = useState('');
    const [amount] = useState(servicePrice.toString());
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await (supabase as any).from('payments').insert([{ appointment_id: appointmentId, amount: parseFloat(amount), payment_method: paymentMethod }]);
            await (supabase as any).from('appointments').update({ status: 'completed' }).eq('id', appointmentId);
            onSuccess();
        } catch (error: any) { alert(error.message); }
        finally { setLoading(false); }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-lg flex items-center justify-center p-4 z-[200]">
            <div className="monolith-card !bg-white w-full max-w-md p-8 sm:p-14 max-h-[90vh] overflow-y-auto animate-reveal relative">
                <div className="flex items-center justify-between mb-8 sm:mb-12 sticky top-0 bg-white z-20 pb-4 border-b-2 border-slate-50 sm:border-none">
                    <span className="premium-label !mb-0">Checkout de Serviço</span>
                    <button onClick={onClose} className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-slate-50 hover:bg-black hover:text-white transition-all font-black">
                        <X size={20} />
                    </button>
                </div>

                <div className="text-center mb-10 sm:mb-16">
                    <span className="premium-label !mb-2 !text-slate-400">Total a Receber</span>
                    <div className="text-5xl sm:text-7xl font-black text-slate-900 tracking-tighter leading-none">
                        <span className="text-xl sm:text-2xl text-amber-500 mr-2 -translate-y-4 sm:-translate-y-6 inline-block">R$</span>
                        {parseFloat(amount).toFixed(2)}
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-10">
                    <div className="space-y-4">
                        <span className="premium-label">Selecione o Método</span>
                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { id: 'pix', label: 'PIX TRANSF', icon: QrCode },
                                { id: 'cash', label: 'DINHEIRO', icon: Wallet2 },
                                { id: 'credit_card', label: 'CARTÃO CRÉD', icon: CreditCard },
                                { id: 'debit_card', label: 'CARTÃO DÉB', icon: CreditCard },
                            ].map(m => (
                                <button
                                    key={m.id} type="button"
                                    onClick={() => setPaymentMethod(m.id)}
                                    className={`flex flex-col items-center gap-3 p-6 border-2 transition-all ${paymentMethod === m.id ? 'bg-slate-900 border-black text-white shadow-[8px_8px_0px_rgba(245,158,11,1)]' : 'bg-white border-slate-100 text-slate-400 hover:border-slate-900'}`}
                                >
                                    <m.icon size={20} />
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">{m.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={!paymentMethod || loading}
                        className="monolith-btn w-full !bg-emerald-500 !text-black !py-6 sm:!py-8 !text-lg !rounded-none shadow-[8px_8px_0px_black] active:shadow-none active:translate-x-2 active:translate-y-2"
                    >
                        {loading ? 'PROCESSANDO...' : 'FINALIZAR E EMITIR RECIBO'}
                    </button>
                </form>
            </div>
        </div>
    );
}
