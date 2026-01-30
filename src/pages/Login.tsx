import { useState } from 'react';
import { Lock, AtSign } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signIn } = useAuth();

  // Como o sistema é gerencial, o login é simplificado (e-mail fixo ou preenchido)
  const [formData, setFormData] = useState({
    email: 'dono@venturas.com.br',
    password: ''
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error: signInError } = await signIn(formData.email, formData.password);
    if (signInError) {
      setError('Acesso Negado. Verifique os dados.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden font-['Outfit']">
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_120%,rgba(245,158,11,0.08),transparent)] pointer-events-none"></div>

      <div className="w-full max-w-md animate-premium-in">
        <div className="premium-card p-12 border-2 relative">
          <div className="flex flex-col items-center mb-10">
            <div className="w-40 h-40 bg-white rounded-none shadow-[16px_16px_0px_#f59e0b] border-4 border-slate-900 flex items-center justify-center mb-10 overflow-hidden p-4 rotate-3">
              <img src="/logo.png" alt="Logo" className="w-full h-full object-contain -rotate-3 scale-110" />
            </div>
            <h1 className="text-3xl font-black text-slate-900 text-center uppercase tracking-tight">
              VENTURAS <span className="text-amber-500">BARBEARIA</span>
            </h1>
            <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[10px] mt-2">Sistema Administrativo</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="label-premium">E-mail de Acesso</label>
              <div className="relative">
                <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="premium-input pl-12"
                  placeholder="admin@barbearia.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="label-premium">Sua Senha</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="premium-input pl-12"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {error && <p className="text-red-500 text-xs font-black uppercase text-center">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-5 bg-slate-900 hover:bg-black text-white rounded-2xl font-black text-lg shadow-2xl transition-all uppercase tracking-widest disabled:opacity-50"
            >
              {loading ? 'Validando...' : 'ENTRAR NO SISTEMA'}
            </button>

            <div className="pt-4 border-t-2 border-slate-50 mt-6">
              <a
                href="#agendar"
                className="flex items-center justify-center gap-3 w-full py-4 bg-white border-2 border-slate-900 text-slate-900 font-black text-xs uppercase tracking-[0.2em] hover:bg-slate-50 transition-all shadow-[4px_4px_0px_black] active:shadow-none active:translate-x-1 active:translate-y-1"
              >
                Sou Cliente - Agendar Horário
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
