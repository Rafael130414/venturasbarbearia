import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Plus, Scissors, X, Trash2 } from 'lucide-react';

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration_minutes: number;
  is_active: boolean;
}

export default function Services() {
  const [services, setServices] = useState<Service[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    duration_minutes: '30',
  });

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    const { data } = await supabase
      .from('services')
      .select('*')
      .order('name');
    if (data) setServices(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Corrigindo erro de tipagem com 'as any'
    const { error } = await supabase.from('services').insert([
      {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        duration_minutes: parseInt(formData.duration_minutes),
      }
    ]);

    if (error) alert(error.message);
    else {
      setShowModal(false);
      setFormData({ name: '', description: '', price: '', duration_minutes: '30' });
      loadServices();
    }
  };

  const toggleActive = async (id: string, current: boolean) => {
    await supabase
      .from('services')
      .update({ is_active: !current } as any)
      .eq('id', id);
    loadServices();
  };

  const handleDeleteService = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir permanentemente este serviço?')) return;
    const { error } = await supabase.from('services').delete().eq('id', id);
    if (error) {
      alert('Erro ao excluir serviço: Pode haver agendamentos vinculados a este serviço. Tente desativá-lo em vez de excluir.');
    } else {
      loadServices();
    }
  };

  return (
    <div className="space-y-12">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 lg:gap-10">
        <div className="relative">
          <span className="premium-label">Catálogo de Cortes</span>
          <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tighter uppercase leading-none">
            Nossos <br /><span className="text-amber-500">Serviços</span>
          </h1>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="monolith-btn !w-full sm:!w-auto !py-4"
        >
          <Plus className="w-6 h-6" />
          ADICIONAR SERVIÇO
        </button>
      </div>

      <div className="grid gap-6 sm:gap-10 md:grid-cols-2 lg:grid-cols-3">
        {services.map((service) => (
          <div key={service.id} className={`monolith-card p-6 sm:p-10 group relative overflow-hidden ${!service.is_active ? 'opacity-30 grayscale' : ''}`}>
            {/* Massive BG Icon */}
            <Scissors className="absolute -bottom-6 -right-6 w-24 sm:w-32 h-24 sm:h-32 text-slate-50 opacity-[0.05] group-hover:scale-110 transition-transform duration-700" />

            <div className="flex justify-between items-start mb-8 sm:mb-10 relative z-10">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-[#020617] text-amber-500 flex items-center justify-center rotate-3 shadow-[4px_4px_0px_#F59E0B] shrink-0">
                <Scissors className="w-6 h-6 sm:w-8 sm:h-8 -rotate-3" />
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleActive(service.id, service.is_active)}
                  className={`px-3 py-1 sm:px-4 sm:py-2 text-[8px] font-black uppercase tracking-[0.3em] border-2 transition-all ${service.is_active
                    ? 'bg-emerald-500 border-black text-black shadow-[4px_4px_0px_black]'
                    : 'bg-slate-100 border-slate-200 text-slate-400'
                    }`}
                >
                  {service.is_active ? 'Ativo' : 'Offline'}
                </button>
                <button
                  onClick={() => handleDeleteService(service.id)}
                  className="w-10 h-10 flex items-center justify-center bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all rounded-none border-2 border-transparent hover:border-black"
                  title="Excluir Permanente"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <div className="relative z-10">
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900 uppercase tracking-tighter mb-4 truncate">{service.name}</h3>
              <p className="text-slate-500 font-bold text-xs uppercase tracking-tight line-clamp-2 h-10 mb-8 sm:mb-10">{service.description}</p>

              <div className="grid grid-cols-2 gap-4 sm:gap-8 pt-6 sm:pt-8 border-t-2 border-slate-100">
                <div>
                  <span className="premium-label !mb-1">Valor Final</span>
                  <span className="text-xl sm:text-2xl font-black text-slate-900 whitespace-nowrap">R$ {service.price.toFixed(2)}</span>
                </div>
                <div className="text-right">
                  <span className="premium-label !mb-1">Tempo Est.</span>
                  <span className="text-xl sm:text-2xl font-black text-slate-900 whitespace-nowrap">{service.duration_minutes} MIN</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-md flex items-center justify-center p-4 z-[200]">
          <div className="monolith-card !bg-white w-full max-w-xl p-8 sm:p-16 max-h-[90vh] overflow-y-auto animate-reveal relative text-reveal">
            <div className="flex items-center justify-between mb-8 sm:mb-12 sticky top-0 bg-white z-20 pb-4 border-b-2 border-slate-50 sm:border-none">
              <span className="premium-label !mb-0">Novo Corte</span>
              <button onClick={() => setShowModal(false)} className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-slate-50 hover:bg-black hover:text-white transition-all font-black">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-2">
                <label className="premium-label">Nome Comercial</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="monolith-input" required placeholder="EX: CORTE DEGRADÊ" />
              </div>
              <div className="space-y-2">
                <label className="premium-label">Descrição Breve</label>
                <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="monolith-input h-32 resize-none" placeholder="DESCREVA O DIFERENCIAL..." />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="premium-label">Preço (R$)</label>
                  <input type="number" step="0.01" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} className="monolith-input" required />
                </div>
                <div className="space-y-2">
                  <label className="premium-label">Minutos</label>
                  <input type="number" value={formData.duration_minutes} onChange={(e) => setFormData({ ...formData, duration_minutes: e.target.value })} className="monolith-input" required />
                </div>
              </div>
              <button type="submit" className="monolith-btn w-full !bg-amber-500 !text-black !py-6 sm:!py-8 !text-lg !rounded-none">CONFIRMAR E PUBLICAR</button>
            </form>
          </div>
        </div>
      )
      }
    </div >
  );
}
