import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { Plus, Clock, User, BellRing, X, Trash2 } from 'lucide-react';
import PaymentModal from '../components/PaymentModal';

export default function Appointments() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [barbers, setBarbers] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentModal, setPaymentModal] = useState<any>({ show: false });
  const [formData, setFormData] = useState<any>({
    client_id: '', client_name: '', client_phone: '', barber_id: '', service_id: '',
    appointment_date: new Date().toISOString().split('T')[0], start_time: '', notes: '',
  });
  const [newOrderAlert, setNewOrderAlert] = useState({ show: false, client: '', time: '' });
  const [rtStatus, setRtStatus] = useState('connecting');
  const [soundEnabled, setSoundEnabled] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const workHours = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00'
  ];

  useEffect(() => { loadData(); }, [selectedDate]);

  useEffect(() => {
    // Inicializar áudio de notificação
    const audioSrc = "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3";
    audioRef.current = new Audio(audioSrc);
    audioRef.current.volume = 0.5;

    // Inscrição em Tempo Real (Supabase Realtime)
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'appointments' },
        (payload) => {
          loadData();
          const newApp = payload.new as any;
          setNewOrderAlert({
            show: true,
            client: newApp.client_name || 'Alguém',
            time: newApp.start_time || '??:??'
          });

          if (audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch(() => {
              console.log('Sons bloqueados pelo navegador.');
              setSoundEnabled(false);
            });
          }

          setTimeout(() => setNewOrderAlert({ show: false, client: '', time: '' }), 8000);
        }
      )
      .subscribe((status) => {
        setRtStatus(status);
        console.log('Realtime Status:', status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedDate]);

  const toggleSound = () => {
    if (audioRef.current) {
      audioRef.current.play().then(() => {
        setSoundEnabled(true);
      }).catch(e => {
        console.error("Erro ao ativar som:", e);
        alert("Clique na página primeiro para permitir sons.");
      });
    }
  };

  const loadData = async () => {
    const { data: apps } = await supabase.from('appointments').select('*, clients(*), barbers(name), services(name, price, duration_minutes)').eq('appointment_date', selectedDate).order('start_time');
    const { data: dba } = await supabase.from('barbers').select('*').eq('is_active', true);
    const { data: dsv } = await supabase.from('services').select('*').eq('is_active', true);
    setAppointments(apps || []);
    setBarbers(dba || []);
    setServices(dsv || []);
  };

  const isSlotBusy = (time: string) => {
    const todayStr = new Date().toLocaleDateString('en-CA');
    if (selectedDate === todayStr) {
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      if (time < currentTime) return true;
    }

    // 2. Bloquear Horário de Almoço do Barbeiro
    const barber = barbers.find(b => b.id === formData.barber_id);
    if (barber && barber.lunch_start && barber.lunch_end) {
      const lStart = barber.lunch_start.slice(0, 5);
      const lEnd = barber.lunch_end.slice(0, 5);
      if (time >= lStart && time < lEnd) return true;
    }

    // 3. Bloquear se o barbeiro já estiver ocupado
    if (!formData.barber_id) return false;
    return appointments.some(app => {
      if (app.barber_id !== formData.barber_id || app.status === 'cancelled') return false;
      const appStart = app.start_time.slice(0, 5);
      const appEnd = app.end_time.slice(0, 5);
      return time >= appStart && time < appEnd;
    });
  };

  const calculateEndTime = (startTime: string, serviceId: string) => {
    const srv = services.find(s => s.id === serviceId);
    const duration = srv?.duration_minutes || 30;
    const [h, m] = startTime.split(':').map(Number);
    const total = h * 60 + m + duration;
    return `${Math.floor(total / 60).toString().padStart(2, '0')}:${(total % 60).toString().padStart(2, '0')}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let cId = formData.client_id;
    if (!cId && formData.client_name) {
      const { data } = await (supabase.from('clients').insert([{ name: formData.client_name, phone: formData.client_phone }] as any).select().single() as any);
      if (data) cId = data.id;
    }
    const endTime = calculateEndTime(formData.start_time, formData.service_id);
    await (supabase.from('appointments').insert([{ ...formData, client_id: cId || null, end_time: endTime, status: 'scheduled' }] as any) as any);
    setShowModal(false);
    loadData();
  };

  const handleDeleteAppointment = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este agendamento? Esta ação não pode ser desfeita.')) return;
    const { error } = await supabase.from('appointments').delete().eq('id', id);
    if (error) {
      alert('Erro ao excluir agendamento: ' + error.message);
    } else {
      loadData();
    }
  };

  return (
    <div className="space-y-12">
      {/* Alerta de Nova Reserva */}
      {newOrderAlert.show && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 lg:top-10 lg:right-10 lg:left-auto lg:translate-x-0 z-[300] animate-premium-in w-[90%] lg:w-96">
          <div className="monolith-card !bg-amber-500 !border-black !shadow-[12px_12px_0px_white] p-6 flex items-center gap-6">
            <div className="w-16 h-16 bg-white flex items-center justify-center shrink-0 rotate-3 shadow-[4px_4px_0px_black]">
              <BellRing className="text-amber-500 animate-bounce" size={32} />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-black/60">Novo Agendamento!</span>
              <h3 className="text-xl font-black text-black leading-tight uppercase">{newOrderAlert.client}</h3>
              <p className="text-[10px] font-bold text-black/80 mt-1 uppercase">ÀS {newOrderAlert.time} • Verifique a Agenda</p>
            </div>
            <button
              onClick={() => setNewOrderAlert({ show: false, client: '', time: '' })}
              className="absolute top-2 right-2 p-1 hover:bg-black/10"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 lg:gap-10">
        <div className="relative">
          <div className="flex items-center gap-3 mb-2">
            <span className="premium-label !mb-0">Fluxo de Atendimento</span>
            <div className={`flex items-center gap-1.5 px-3 py-1 border text-[8px] font-black uppercase tracking-widest ${rtStatus === 'SUBSCRIBED' ? 'bg-emerald-500/10 border-emerald-500 text-emerald-500' : 'bg-red-500/10 border-red-500 text-red-500'
              }`}>
              <div className={`w-1.5 h-1.5 rounded-full ${rtStatus === 'SUBSCRIBED' ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
              {rtStatus === 'SUBSCRIBED' ? 'Realtime Ativo' : 'Realtime Offline'}
            </div>

            <button
              onClick={toggleSound}
              className={`flex items-center gap-2 px-3 py-1 border text-[8px] font-black uppercase tracking-widest transition-all ${soundEnabled ? 'bg-amber-500 border-black text-black' : 'bg-white border-slate-200 text-slate-400 hover:border-slate-900'
                }`}
            >
              <BellRing size={10} className={soundEnabled ? 'animate-pulse' : ''} />
              {soundEnabled ? 'Som Ativo' : 'Ativar Som'}
            </button>
          </div>
          <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tighter uppercase leading-none">
            Agenda <br /><span className="text-amber-500">Mestra</span>
          </h1>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 bg-white border-2 border-slate-900 p-2 shadow-[8px_8px_0px_rgba(2,6,23,0.05)] w-full lg:w-auto">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="flex-1 sm:flex-none px-6 py-3 font-black text-[10px] uppercase tracking-widest outline-none bg-transparent"
          />
          <div className="w-[2px] h-8 bg-slate-100 hidden md:block" />
          <button onClick={() => setShowModal(true)} className="monolith-btn !w-full sm:!w-auto !px-8 !py-4 !text-[10px]">
            <Plus size={16} /> NOVO AGENDAMENTO
          </button>
        </div>
      </div>

      <div className="grid gap-10">
        {appointments.length > 0 ? appointments.map((app) => (
          <div key={app.id} className="monolith-card p-6 sm:p-10 group relative overflow-hidden">
            {/* Massive Time BG */}
            <div className="absolute top-0 right-0 text-[60px] sm:text-[100px] font-black text-slate-900 opacity-[0.03] select-none pointer-events-none leading-none -mr-4 mt-4">
              {app.start_time.slice(0, 5)}
            </div>

            <div className="flex flex-col lg:flex-row justify-between items-center gap-6 sm:gap-12 relative z-10">
              <div className="flex items-center gap-4 sm:gap-8 flex-1 w-full lg:w-auto">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#020617] text-white flex items-center justify-center rotate-3 shadow-[4px_4px_0px_#F59E0B] shrink-0">
                  <User size={32} className="-rotate-3" />
                </div>
                <div className="min-w-0">
                  <span className="premium-label !mb-1 sm:!mb-2">Cliente VIP</span>
                  <h3 className="text-xl sm:text-3xl font-black text-slate-900 uppercase tracking-tighter leading-none truncate">{app.clients?.name}</h3>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-2 sm:mt-3">
                    <span className="px-2 sm:px-3 py-1 bg-slate-100 text-[8px] font-black uppercase tracking-widest text-slate-500 whitespace-nowrap">{app.barbers?.name}</span>
                    <span className="px-2 sm:px-3 py-1 bg-amber-500 text-[8px] font-black uppercase tracking-widest text-black whitespace-nowrap">{app.services?.name}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center px-6 sm:px-10 py-4 sm:py-6 bg-slate-50 border-2 border-slate-900 shadow-[8px_8px_0px_black] w-full lg:w-auto">
                <span className="premium-label !mb-1 sm:!mb-2 !text-slate-400">Horário Reservado</span>
                <div className="flex items-center gap-3 font-black text-2xl sm:text-3xl text-slate-900 tracking-tighter">
                  <Clock size={20} className="text-amber-500 sm:w-6 sm:h-6" />
                  {app.start_time.slice(0, 5)} <span className="text-slate-200">/</span> {app.end_time.slice(0, 5)}
                </div>
              </div>

              <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between lg:justify-end gap-4 w-full lg:w-auto lg:min-w-[200px]">
                <div className="text-left lg:text-right">
                  <span className="premium-label !mb-0">Ticket</span>
                  <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tighter">R$ {app.services?.price?.toFixed(2)}</div>
                </div>
                {app.status === 'scheduled' && (
                  <button
                    onClick={() => setPaymentModal({ show: true, appointmentId: app.id, servicePrice: app.services.price })}
                    className="monolith-btn !bg-emerald-500 !text-black !px-6 !py-4 !text-[9px] !rounded-none shadow-[4px_4px_0px_black] active:shadow-none active:translate-x-1 active:translate-y-1"
                  >CONCLUIR SERVIÇO</button>
                )}
                {app.status === 'completed' && (
                  <div className="flex items-center gap-2 px-6 py-3 border-2 border-emerald-500 text-emerald-500 font-black text-[10px] uppercase tracking-widest">
                    PAGO ✓
                  </div>
                )}
                <button
                  onClick={() => handleDeleteAppointment(app.id)}
                  className="p-3 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                  title="Excluir Agendamento"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </div>
        )) : (
          <div className="monolith-card p-24 text-center">
            <span className="text-slate-300 font-black uppercase tracking-[0.5em] text-xs">Nenhum agendamento para este ciclo</span>
          </div>
        )}
      </div>

      {/* Modal Industrial de Agendamento */}
      {
        showModal && (
          <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-md flex items-center justify-center p-4 z-[200]">
            <div className="monolith-card !bg-white w-full max-w-2xl p-8 sm:p-16 max-h-[90vh] overflow-y-auto animate-reveal relative">
              <div className="flex items-center justify-between mb-8 sm:mb-12 sticky top-0 bg-white z-20 pb-4 border-b-2 border-slate-50 sm:border-none">
                <span className="premium-label !mb-0">Reserva de Horário</span>
                <button onClick={() => setShowModal(false)} className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-slate-50 hover:bg-black hover:text-white transition-all font-black">X</button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-10">
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="premium-label">Barbeiro</label>
                    <select
                      value={formData.barber_id}
                      onChange={(e) => setFormData({ ...formData, barber_id: e.target.value, start_time: '' })}
                      className="monolith-input" required
                    >
                      <option value="">Selecionar...</option>
                      {barbers.map(b => <option key={b.id} value={b.id}>{b.name.toUpperCase()}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="premium-label">Corte</label>
                    <select
                      value={formData.service_id}
                      onChange={(e) => setFormData({ ...formData, service_id: e.target.value })}
                      className="monolith-input" required
                    >
                      <option value="">Selecionar...</option>
                      {services.map(s => <option key={s.id} value={s.id}>{s.name.toUpperCase()}</option>)}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="premium-label">Nome do Cliente</label>
                  <input
                    type="text" required
                    className="monolith-input"
                    placeholder="NOME COMPLETO"
                    value={formData.client_name}
                    onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                  />
                </div>

                {formData.barber_id && (
                  <div className="space-y-4">
                    <span className="premium-label">Slots Disponíveis</span>
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                      {workHours.map(time => {
                        const busy = isSlotBusy(time);
                        return (
                          <button
                            key={time} type="button" disabled={busy}
                            onClick={() => setFormData({ ...formData, start_time: time })}
                            className={`py-4 border-2 font-black text-[10px] transition-all ${busy
                              ? 'opacity-10 border-transparent cursor-not-allowed'
                              : formData.start_time === time
                                ? 'bg-amber-500 border-black text-black shadow-[4px_4px_0px_black]'
                                : 'bg-white border-slate-100 text-slate-400 hover:border-slate-900'}`}
                          >
                            {time}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <button type="submit" className="monolith-btn w-full !bg-[#020617] !text-white !py-8 !text-lg !rounded-none">
                  PROCESSAR RESERVA
                </button>
              </form>
            </div>
          </div>
        )
      }

      {
        paymentModal.show && (
          <PaymentModal
            appointmentId={paymentModal.appointmentId}
            servicePrice={paymentModal.servicePrice}
            onClose={() => setPaymentModal({ show: false })}
            onSuccess={() => { setPaymentModal({ show: false }); loadData(); }}
          />
        )
      }
    </div >
  );
}
