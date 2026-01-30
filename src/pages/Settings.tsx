import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Shield, Lock, Save, Palette } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export default function Settings() {
    const { updatePassword } = useAuth();
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const { colors, updateColors, resetColors } = useTheme();

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setMessage({ type: 'error', text: 'As senhas não coincidem.' });
            return;
        }
        if (newPassword.length < 6) {
            setMessage({ type: 'error', text: 'A senha deve ter no mínimo 6 caracteres.' });
            return;
        }

        setLoading(true);
        const { error } = await updatePassword(newPassword);
        setLoading(false);

        if (error) {
            setMessage({ type: 'error', text: 'Erro ao atualizar: ' + error.message });
        } else {
            setMessage({ type: 'success', text: 'Senha atualizada com sucesso!' });
            setNewPassword('');
            setConfirmPassword('');
        }
    };

    return (
        <div className="space-y-12">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 lg:gap-10">
                <div className="relative">
                    <span className="premium-label">Preferências de Sistema</span>
                    <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tighter uppercase leading-none">
                        Ajustes <br /><span className="text-amber-500">Mestres</span>
                    </h1>
                </div>
            </div>

            <div className="grid gap-10 max-w-5xl">
                {/* Alterar Senha */}
                <div className="monolith-card p-12 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 text-[100px] font-black text-slate-900 opacity-[0.03] select-none pointer-events-none -mr-4 mt-2">
                        KEY
                    </div>

                    <div className="flex items-center gap-4 sm:gap-6 mb-8 sm:mb-12 relative z-10">
                        <div className="w-14 h-14 sm:w-16 sm:h-16 bg-[#020617] text-amber-500 flex items-center justify-center rotate-3 shadow-[4px_4px_0px_#F59E0B] shrink-0">
                            <Lock size={28} className="-rotate-3 sm:w-8 sm:h-8" />
                        </div>
                        <div>
                            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 uppercase tracking-tighter">Segurança</h2>
                            <span className="premium-label !mb-0 !text-slate-400">Credenciais de Acesso</span>
                        </div>
                    </div>

                    <form onSubmit={handleUpdatePassword} className="space-y-8 max-w-xl relative z-10">
                        <div className="space-y-2">
                            <label className="premium-label">Nova Frase de Segurança</label>
                            <input
                                type="password"
                                placeholder="MÍNIMO 6 CARACTERES"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="monolith-input"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="premium-label">Confirmação de Integridade</label>
                            <input
                                type="password"
                                placeholder="REPITA A SEQUÊNCIA"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="monolith-input"
                                required
                            />
                        </div>

                        {message.text && (
                            <div className={`px-6 py-4 border-2 font-black text-[10px] uppercase tracking-[0.2em] animate-reveal ${message.type === 'success' ? 'bg-emerald-500 border-black text-black shadow-[4px_4px_0px_white]' : 'bg-red-600 border-black text-white shadow-[4px_4px_0px_white]'}`}>
                                {message.text}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="monolith-btn !bg-[#020617] !text-white !py-4 sm:!py-6 !text-xs !w-full sm:!w-auto"
                        >
                            <Save size={18} />
                            {loading ? 'SINCRONIZANDO...' : 'ATUALIZAR CHAVE DE ACESSO'}
                        </button>
                    </form>
                </div>

                <div className="grid md:grid-cols-2 gap-10">
                    {/* Dados da Unidade */}
                    <div className="monolith-card p-10">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 bg-slate-100 flex items-center justify-center">
                                <Shield size={24} className="text-slate-900" />
                            </div>
                            <h3 className="text-xl font-black uppercase tracking-tighter">Identidade</h3>
                        </div>
                        <div className="space-y-6">
                            <div>
                                <span className="premium-label">Unidade</span>
                                <div className="text-slate-900 font-black uppercase tracking-widest text-sm">Venturas Barbearia - Mineiros</div>
                            </div>
                            <div>
                                <span className="premium-label">Proprietário</span>
                                <div className="text-slate-900 font-black uppercase tracking-widest text-sm text-reveal">admin@venturas.com.br</div>
                            </div>
                        </div>
                    </div>

                    {/* Personalização de Cores */}
                    <div className="monolith-card p-10">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 bg-amber-500 flex items-center justify-center">
                                <Palette size={24} className="text-black" />
                            </div>
                            <h3 className="text-xl font-black uppercase tracking-tighter">Paleta Visual</h3>
                        </div>

                        <div className="space-y-6">
                            <div className="flex items-center justify-between gap-4 p-4 border-2 border-slate-50">
                                <div>
                                    <span className="premium-label !mb-0">Obsidiana (Dark)</span>
                                    <div className="text-[10px] font-bold text-slate-400 font-mono">{colors.obsidian}</div>
                                </div>
                                <input
                                    type="color"
                                    value={colors.obsidian}
                                    onChange={(e) => updateColors({ obsidian: e.target.value })}
                                    className="w-12 h-12 cursor-pointer bg-transparent border-none"
                                />
                            </div>

                            <div className="flex items-center justify-between gap-4 p-4 border-2 border-slate-50">
                                <div>
                                    <span className="premium-label !mb-0">Cromo (Amber)</span>
                                    <div className="text-[10px] font-bold text-slate-400 font-mono">{colors.amber_chrome}</div>
                                </div>
                                <input
                                    type="color"
                                    value={colors.amber_chrome}
                                    onChange={(e) => updateColors({ amber_chrome: e.target.value })}
                                    className="w-12 h-12 cursor-pointer bg-transparent border-none"
                                />
                            </div>

                            <div className="flex items-center justify-between gap-4 p-4 border-2 border-slate-50">
                                <div>
                                    <span className="premium-label !mb-0">Bone White (BG)</span>
                                    <div className="text-[10px] font-bold text-slate-400 font-mono">{colors.bone}</div>
                                </div>
                                <input
                                    type="color"
                                    value={colors.bone}
                                    onChange={(e) => updateColors({ bone: e.target.value })}
                                    className="w-12 h-12 cursor-pointer bg-transparent border-none"
                                />
                            </div>

                            <button
                                onClick={resetColors}
                                className="w-full py-4 border-2 border-slate-900 text-slate-900 font-black text-[10px] uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all"
                            >
                                Restaurar Padrão de Fábrica
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
