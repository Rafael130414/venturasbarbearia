import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { Plus, User, Phone, X, Trash2 } from 'lucide-react';

export default function Barbers() {
    const [barbers, setBarbers] = useState<any[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        lunch_start: '12:00',
        lunch_end: '13:00',
        photo_url: ''
    });

    const [uploading, setUploading] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const selectedBarberIdRef = useRef<string | null>(null);

    useEffect(() => { loadBarbers(); }, []);

    const loadBarbers = async () => {
        const { data } = await supabase.from('barbers').select('*').order('name');
        if (data) setBarbers(data);
    };

    const handleFileSelect = (barberId: string) => {
        selectedBarberIdRef.current = barberId;
        fileInputRef.current?.click();
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        const barberId = selectedBarberIdRef.current;

        if (!file || !barberId) return;

        setUploading(barberId);

        try {
            // 1. Upload da imagem
            const fileExt = file.name.split('.').pop();
            const fileName = `${barberId}-${Date.now()}.${fileExt}`;
            const { error: uploadError } = await supabase.storage
                .from('barber-photos')
                .upload(fileName, file);

            if (uploadError) throw uploadError;

            // 2. Pegar URL pública
            const { data: { publicUrl } } = supabase.storage
                .from('barber-photos')
                .getPublicUrl(fileName);

            // 3. Atualizar registro do barbeiro
            const { error: updateError } = await supabase
                .from('barbers')
                .update({ photo_url: publicUrl })
                .eq('id', barberId);

            if (updateError) throw updateError;

            // 4. Atualizar lista
            loadBarbers();
        } catch (error: any) {
            console.error('Erro no upload:', error);
            alert('Erro ao enviar foto: ' + error.message);
        } finally {
            setUploading(null);
            selectedBarberIdRef.current = null;
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Criar objeto de inserção
        const insertData = {
            name: formData.name,
            phone: formData.phone,
            lunch_start: formData.lunch_start,
            lunch_end: formData.lunch_end,
            photo_url: formData.photo_url || null
        };

        const { error } = await supabase.from('barbers').insert([insertData]);

        if (error) {
            console.error('Erro ao cadastrar:', error);
            if (error.message.includes('lunch_start') || error.code === '42703') {
                alert('Erro: Colunas de Almoço não encontradas. Por favor, rode o comando SQL no Supabase Dashboard que eu te passei.');
            } else {
                alert('Erro ao cadastrar barbeiro: ' + error.message);
            }
            return;
        }

        setShowModal(false);
        setFormData({ name: '', phone: '', lunch_start: '12:00', lunch_end: '13:00', photo_url: '' });
        loadBarbers();
    };

    const handleDeleteBarber = async (id: string) => {
        if (!window.confirm('Tem certeza que deseja excluir este barbeiro?')) return;
        const { error } = await supabase.from('barbers').delete().eq('id', id);
        if (error) {
            alert('Erro ao excluir: Este barbeiro pode ter agendamentos vinculados. Tente apenas desativá-lo.');
        } else {
            loadBarbers();
        }
    };

    const toggleActive = async (id: string, current: boolean) => {
        await supabase.from('barbers').update({ is_active: !current } as any).eq('id', id);
        loadBarbers();
    };

    return (
        <div className="space-y-12">
            {/* Hidden Input for File Upload */}
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/*"
                className="hidden"
            />

            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 lg:gap-10">
                <div className="relative">
                    <span className="premium-label">Corpo de Barbeiros</span>
                    <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tighter uppercase leading-none">
                        Nossa <br /><span className="text-amber-500">Equipe</span>
                    </h1>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="monolith-btn !w-full sm:!w-auto !py-4"
                >
                    <Plus className="w-6 h-6" />
                    RECRUTAR TALENTO
                </button>
            </div>

            <div className="grid gap-6 sm:gap-10 md:grid-cols-2 lg:grid-cols-3">
                {barbers.map((barber) => (
                    <div key={barber.id} className="monolith-card p-6 sm:p-10 group relative overflow-hidden">
                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-[40px] sm:text-[60px] font-black text-slate-900 opacity-[0.1] select-none pointer-events-none tracking-tighter uppercase whitespace-nowrap">
                            {barber.name.split(' ')[0]}
                        </div>

                        <div className="flex flex-col items-center relative z-10 text-center">
                            <button
                                onClick={() => handleDeleteBarber(barber.id)}
                                className="absolute top-0 right-0 p-2 text-red-500 hover:bg-red-50 transition-colors"
                                title="Excluir Barbeiro"
                            >
                                <Trash2 size={16} />
                            </button>

                            {/* Photo Area with Click-to-Upload */}
                            <div
                                onClick={() => handleFileSelect(barber.id)}
                                className="w-24 h-24 bg-[#020617] text-white flex items-center justify-center rotate-3 shadow-[6px_6px_0px_#F59E0B] mb-8 group-hover:-rotate-3 transition-transform duration-500 overflow-hidden relative cursor-pointer"
                                title="Clique para alterar a foto"
                            >
                                {uploading === barber.id ? (
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                                ) : barber.photo_url ? (
                                    <img
                                        src={barber.photo_url}
                                        alt={barber.name}
                                        className="w-full h-full object-cover -rotate-3 group-hover:rotate-3 transition-transform duration-500 hover:opacity-80"
                                    />
                                ) : (
                                    <User size={40} className="-rotate-3 group-hover:rotate-3 transition-transform duration-500" />
                                )}

                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity pointer-events-none">
                                    <span className="text-[8px] uppercase font-black tracking-widest text-white">Alterar</span>
                                </div>
                            </div>

                            <h3 className="text-3xl font-black text-slate-900 uppercase tracking-tighter mb-2">{barber.name}</h3>
                            <p className="text-slate-500 font-bold flex items-center gap-2 mb-8 uppercase text-[10px] tracking-widest">
                                <Phone size={14} className="text-amber-500" /> {barber.phone}
                            </p>

                            <button
                                onClick={() => toggleActive(barber.id, barber.is_active)}
                                className={`px-6 py-2 border-2 text-[8px] font-black uppercase tracking-[0.3em] transition-all ${barber.is_active
                                    ? 'bg-emerald-500 border-black text-black shadow-[4px_4px_0px_black]'
                                    : 'bg-slate-100 border-slate-200 text-slate-400'
                                    }`}
                            >
                                {barber.is_active ? 'Disponível ✓' : 'Indisponível'}
                            </button>

                            <div className="mt-6 pt-6 border-t-2 border-slate-50 w-full">
                                <span className="premium-label !mb-1">Horário de Almoço</span>
                                <div className="font-black text-slate-900 text-xs uppercase tracking-tighter">
                                    {barber.lunch_start?.slice(0, 5)} ÀS {barber.lunch_end?.slice(0, 5)}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {
                showModal && (
                    <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-md flex items-center justify-center p-4 z-[200]">
                        <div className="monolith-card !bg-white w-full max-w-xl p-8 sm:p-16 max-h-[90vh] overflow-y-auto animate-reveal relative">
                            <div className="flex items-center justify-between mb-8 sm:mb-12 sticky top-0 bg-white z-20 pb-4 border-b-2 border-slate-50 sm:border-none">
                                <span className="premium-label !mb-0">Novo Barbeiro</span>
                                <button onClick={() => setShowModal(false)} className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-slate-50 hover:bg-black hover:text-white transition-all font-black">
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-8">
                                <div className="space-y-2">
                                    <label className="premium-label">Nome Completo</label>
                                    <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="monolith-input" required placeholder="EX: MARCOS SILVA" />
                                </div>
                                <div className="space-y-2">
                                    <label className="premium-label">WhatsApp Contato</label>
                                    <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="monolith-input" required placeholder="(00) 00000-0000" />
                                </div>
                                <div className="space-y-2">
                                    <label className="premium-label">Foto URL (Opcional)</label>
                                    <input type="url" value={formData.photo_url} onChange={(e) => setFormData({ ...formData, photo_url: e.target.value })} className="monolith-input" placeholder="https://..." />
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="premium-label">Início Almoço</label>
                                        <input type="time" value={formData.lunch_start} onChange={(e) => setFormData({ ...formData, lunch_start: e.target.value })} className="monolith-input" required />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="premium-label">Fim Almoço</label>
                                        <input type="time" value={formData.lunch_end} onChange={(e) => setFormData({ ...formData, lunch_end: e.target.value })} className="monolith-input" required />
                                    </div>
                                </div>
                                <button type="submit" className="monolith-btn w-full !bg-amber-500 !text-black !py-6 sm:!py-8 !text-lg !rounded-none">INCORPORAR À EQUIPE</button>
                            </form>
                        </div>
                    </div>
                )
            }
        </div >
    );
}
