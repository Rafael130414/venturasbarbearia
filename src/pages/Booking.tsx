import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { User, CheckCircle2, ChevronRight, ChevronLeft } from 'lucide-react';

export default function Booking() {
    const [step, setStep] = useState(1);
    const [services, setServices] = useState<any[]>([]);
    const [barbers, setBarbers] = useState<any[]>([]);
    const [appointments, setAppointments] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const [selection, setSelection] = useState({
        serviceId: '',
        barberId: '',
        date: new Date().toISOString().split('T')[0],
        time: '',
        clientName: '',
        clientPhone: ''
    });

    const workHours = [
        '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
        '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00'
    ];

    useEffect(() => {
        loadBaseData();
    }, []);

    useEffect(() => {
        if (selection.date && selection.barberId) {
            loadDayAppointments();
        }
    }, [selection.date, selection.barberId]);

    const loadBaseData = async () => {
        const { data: srv } = await supabase.from('services').select('*').eq('is_active', true);
        const { data: brb } = await supabase.from('barbers').select('*').eq('is_active', true);
        setServices(srv || []);
        setBarbers(brb || []);
    };

    const loadDayAppointments = async () => {
        const { data } = await supabase
            .from('appointments')
            .select('start_time, end_time, barber_id, status')
            .eq('appointment_date', selection.date)
            .eq('barber_id', selection.barberId)
            .neq('status', 'cancelled');
        setAppointments(data || []);
    };

    const isSlotBusy = (time: string) => {
        // 1. Bloquear horários que já passaram
        const todayStr = new Date().toLocaleDateString('en-CA');
        if (selection.date === todayStr) {
            const now = new Date();
            const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
            if (time < currentTime) return true;
        }

        // 2. Bloquear Horário de Almoço do Barbeiro
        const barber = barbers.find(b => b.id === selection.barberId);
        if (barber && barber.lunch_start && barber.lunch_end) {
            const lStart = barber.lunch_start.slice(0, 5);
            const lEnd = barber.lunch_end.slice(0, 5);
            if (time >= lStart && time < lEnd) return true;
        }

        // 3. Bloquear se já estiver agendado
        return appointments.some(app => {
            const appStart = app.start_time.slice(0, 5);
            const appEnd = app.end_time.slice(0, 5);
            return time >= appStart && time < appEnd;
        });
    };

    const handleFinish = async () => {
        setLoading(true);
        try {
            // 1. Check or Create Client
            let clientId = null;
            const { data: existingClient } = await supabase
                .from('clients')
                .select('id')
                .eq('phone', selection.clientPhone)
                .single();

            if (existingClient) {
                clientId = existingClient.id;
            } else {
                const { data: newClient } = await supabase
                    .from('clients')
                    .insert([{ name: selection.clientName, phone: selection.clientPhone }] as any)
                    .select()
                    .single() as any;
                if (newClient) clientId = newClient.id;
            }

            // 2. Calculate End Time
            const service = services.find(s => s.id === selection.serviceId);
            const duration = service?.duration_minutes || 30;
            const [h, m] = selection.time.split(':').map(Number);
            const total = h * 60 + m + duration;
            const endTime = `${Math.floor(total / 60).toString().padStart(2, '0')}:${(total % 60).toString().padStart(2, '0')}`;

            // 3. Create Appointment
            await supabase.from('appointments').insert([{
                client_id: clientId,
                barber_id: selection.barberId,
                service_id: selection.serviceId,
                appointment_date: selection.date,
                start_time: selection.time,
                end_time: endTime,
                status: 'scheduled'
            }] as any);

            setSuccess(true);
        } catch (err) {
            console.error(err);
            alert('Erro ao agendar. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-6">
                <div className="monolith-card !bg-white p-12 max-w-md w-full text-center animate-reveal">
                    <div className="w-24 h-24 bg-emerald-500 text-white flex items-center justify-center rotate-3 shadow-[8px_8px_0px_black] mx-auto mb-10">
                        <CheckCircle2 size={48} className="-rotate-3" />
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter mb-4">Agendado!</h1>
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-xs mb-10">Sua reserva foi confirmada com sucesso em nossa unidade.</p>
                    <button onClick={() => window.location.reload()} className="monolith-btn w-full">NOVO AGENDAMENTO</button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f8fafc] flex flex-col font-['Outfit']">
            {/* Header VIP */}
            <header className="bg-[#020617] p-8 lg:p-12 flex flex-col items-center border-b-8 border-amber-500">
                <div className="w-20 h-20 bg-white rotate-3 shadow-[8px_8px_0px_#f59e0b] flex items-center justify-center mb-6 overflow-hidden p-3 border-2 border-slate-900">
                    <img src="/logo.png" alt="Logo" className="w-full h-full object-contain -rotate-3" />
                </div>
                <h1 className="text-3xl font-black text-white uppercase tracking-tighter text-center">
                    Agendamento <span className="text-amber-500">Online</span>
                </h1>
                <p className="text-slate-400 text-[10px] uppercase tracking-[0.4em] mt-2 font-black">Reserve seu horário de elite</p>
            </header>

            {/* Wizard Steps */}
            <main className="flex-1 max-w-2xl mx-auto w-full p-6 py-12">
                {/* Progress Bar */}
                <div className="flex justify-between mb-12 relative">
                    <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-200 -translate-y-1/2 -z-10" />
                    {[1, 2, 3, 4].map(s => (
                        <div
                            key={s}
                            className={`w-10 h-10 flex items-center justify-center font-black transition-all ${step >= s ? 'bg-amber-500 text-black shadow-[4px_4px_0px_black]' : 'bg-white text-slate-300 border-2 border-slate-200'}`}
                        >
                            {s}
                        </div>
                    ))}
                </div>

                {/* Step 1: Services */}
                {step === 1 && (
                    <div className="space-y-8 animate-reveal">
                        <div className="text-center">
                            <span className="premium-label">PASSO 01</span>
                            <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tighter">Escolha o Corte</h2>
                        </div>
                        <div className="grid gap-4">
                            {services.map(s => (
                                <button
                                    key={s.id}
                                    onClick={() => { setSelection({ ...selection, serviceId: s.id }); setStep(2); }}
                                    className={`monolith-card !p-8 flex justify-between items-center group text-left ${selection.serviceId === s.id ? 'bg-amber-500 border-black' : ''}`}
                                >
                                    <div>
                                        <h3 className="text-xl font-black uppercase tracking-tight">{s.name}</h3>
                                        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1 group-hover:text-black">{s.duration_minutes} MIN</p>
                                    </div>
                                    <div className="text-2xl font-black">R$ {s.price.toFixed(2)}</div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Step 2: Barbers */}
                {step === 2 && (
                    <div className="space-y-8 animate-reveal">
                        <div className="text-center">
                            <span className="premium-label">PASSO 02</span>
                            <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tighter">Escolha o Barbeiro</h2>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-6">
                            {barbers.map(b => (
                                <button
                                    key={b.id}
                                    onClick={() => { setSelection({ ...selection, barberId: b.id }); setStep(3); }}
                                    className={`monolith-card !p-8 flex flex-col items-center text-center gap-4 ${selection.barberId === b.id ? 'bg-amber-500 border-black' : ''}`}
                                >
                                    <div className="w-20 h-20 bg-slate-900 text-white flex items-center justify-center rotate-3 shadow-[4px_4px_0px_#f59e0b] mb-2">
                                        <User size={32} className="-rotate-3" />
                                    </div>
                                    <h3 className="text-xl font-black uppercase tracking-tight">{b.name}</h3>
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Especialista</span>
                                </button>
                            ))}
                        </div>
                        <button onClick={() => setStep(1)} className="flex items-center gap-2 text-slate-400 font-black uppercase text-[10px] tracking-widest pt-4">
                            <ChevronLeft size={16} /> Voltar
                        </button>
                    </div>
                )}

                {/* Step 3: Date & Slots */}
                {step === 3 && (
                    <div className="space-y-8 animate-reveal">
                        <div className="text-center">
                            <span className="premium-label">PASSO 03</span>
                            <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tighter">Data e Horário</h2>
                        </div>

                        <div className="monolith-card !p-8">
                            <label className="premium-label">Selecione o Dia</label>
                            <input
                                type="date"
                                min={new Date().toISOString().split('T')[0]}
                                value={selection.date}
                                onChange={(e) => setSelection({ ...selection, date: e.target.value })}
                                className="monolith-input mb-8"
                            />

                            <label className="premium-label">Horários Disponíveis</label>
                            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                                {workHours.map(time => {
                                    const busy = isSlotBusy(time);
                                    return (
                                        <button
                                            key={time}
                                            disabled={busy}
                                            onClick={() => setSelection({ ...selection, time })}
                                            className={`py-4 font-black text-xs transition-all border-2 ${busy
                                                ? 'opacity-10 border-transparent cursor-not-allowed'
                                                : selection.time === time
                                                    ? 'bg-amber-500 border-black text-black shadow-[4px_4px_0px_black]'
                                                    : 'bg-white border-slate-100 text-slate-400 hover:border-slate-800'
                                                }`}
                                        >
                                            {time}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="flex justify-between items-center">
                            <button onClick={() => setStep(2)} className="flex items-center gap-2 text-slate-400 font-black uppercase text-[10px] tracking-widest">
                                <ChevronLeft size={16} /> Voltar
                            </button>
                            <button
                                disabled={!selection.time}
                                onClick={() => setStep(4)}
                                className="monolith-btn !px-12 disabled:opacity-30"
                            >
                                Próximo <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 4: Confirm Data */}
                {step === 4 && (
                    <div className="space-y-8 animate-reveal">
                        <div className="text-center">
                            <span className="premium-label">PASSO FINAL</span>
                            <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tighter">Seus Dados</h2>
                        </div>

                        <div className="monolith-card !p-8 space-y-8">
                            <div className="space-y-2">
                                <label className="premium-label">Seu Nome Completo</label>
                                <input
                                    type="text"
                                    placeholder="EX: JOÃO SILVA"
                                    value={selection.clientName}
                                    onChange={(e) => setSelection({ ...selection, clientName: e.target.value.toUpperCase() })}
                                    className="monolith-input"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="premium-label">WhatsApp para Confirmação</label>
                                <input
                                    type="tel"
                                    placeholder="(00) 00000-0000"
                                    value={selection.clientPhone}
                                    onChange={(e) => setSelection({ ...selection, clientPhone: e.target.value })}
                                    className="monolith-input"
                                />
                            </div>

                            <div className="bg-slate-50 p-6 border-l-4 border-amber-500 space-y-2">
                                <span className="premium-label !mb-1 !text-slate-400">Resumo da Reserva</span>
                                <div className="font-black text-slate-900 uppercase text-sm">
                                    {services.find(s => s.id === selection.serviceId)?.name}
                                    <span className="text-slate-300 mx-2">|</span>
                                    {barbers.find(b => b.id === selection.barberId)?.name}
                                </div>
                                <div className="font-bold text-slate-500 text-xs">
                                    {new Date(selection.date).toLocaleDateString('pt-BR')} ÀS {selection.time}
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-between items-center">
                            <button onClick={() => setStep(3)} className="flex items-center gap-2 text-slate-400 font-black uppercase text-[10px] tracking-widest">
                                <ChevronLeft size={16} /> Voltar
                            </button>
                            <button
                                disabled={!selection.clientName || !selection.clientPhone || loading}
                                onClick={handleFinish}
                                className="monolith-btn !bg-emerald-500 !text-black !px-12 shadow-[8px_8px_0px_black] active:shadow-none hover:bg-emerald-400"
                            >
                                {loading ? 'PROCESSANDO...' : 'CONFIRMAR AGENDAMENTO VIP'}
                            </button>
                        </div>
                    </div>
                )}
            </main>

            {/* Footer Industrial */}
            <footer className="p-8 text-center bg-white border-t-2 border-slate-100">
                <p className="text-[8px] font-black text-slate-300 uppercase tracking-[0.5em]">Powered by Venturas Elite OS v2</p>
            </footer>
        </div>
    );
}
