import { ReactNode, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  LayoutDashboard,
  Scissors,
  Users,
  Calendar,
  TrendingDown,
  LogOut,
  Menu,
  X,
  Settings as SettingsIcon,
} from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
}

export default function Layout({ children, currentPage, onNavigate }: LayoutProps) {
  const { signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'appointments', label: 'Agenda', icon: Calendar },
    { id: 'services', label: 'Serviços', icon: Scissors },
    { id: 'barbers', label: 'Equipe', icon: Users },
    { id: 'expenses', label: 'Finanças', icon: TrendingDown },
    { id: 'settings', label: 'Ajustes', icon: SettingsIcon },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] flex font-['Outfit'] relative overflow-hidden">
      {/* Background Huge Text */}
      <div className="absolute top-20 right-0 text-[180px] font-black text-slate-900 opacity-[0.03] select-none pointer-events-none leading-none tracking-tighter">
        VENTURAS
      </div>

      {/* Desktop Sidebar (Industrial Monolith) */}
      <aside className="hidden lg:flex flex-col w-72 bg-[#020617] border-r-4 border-slate-900 h-screen sticky top-0 z-50">
        <div className="p-10 flex flex-col items-center border-b-2 border-slate-800/10 mb-8 relative">
          <div className="w-32 h-32 bg-white rounded-none flex items-center justify-center rotate-3 shadow-[8px_8px_0px_#f59e0b] overflow-hidden p-3 border-2 border-slate-900">
            <img src="/logo.png" alt="Logo" className="w-full h-full object-contain -rotate-3 scale-110" />
          </div>
          <h2 className="text-xl font-black text-white mt-6 tracking-tighter uppercase italic">
            Venturas <span className="text-amber-500 block text-xs not-italic tracking-[0.3em]">PRO MASTER</span>
          </h2>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center gap-4 px-6 py-4 transition-all relative overflow-hidden group ${isActive
                  ? 'bg-amber-500 text-black font-black'
                  : 'text-slate-500 hover:text-white hover:bg-slate-800/40 font-bold'
                  }`}
              >
                <Icon className="w-6 h-6 shrink-0" />
                <span className="text-[10px] uppercase tracking-[0.2em]">{item.label}</span>
                {isActive && <div className="absolute right-0 w-1 h-full bg-black" />}
              </button>
            );
          })}
        </nav>

        <div className="p-8 border-t-2 border-slate-800/50">
          <button
            onClick={() => signOut()}
            className="w-full flex items-center gap-4 px-6 py-4 text-slate-500 hover:text-red-400 transition-all font-black"
          >
            <LogOut className="w-6 h-6" />
            <span className="text-[10px] uppercase tracking-widest">Sair</span>
          </button>
        </div>
      </aside>

      {/* Mobile Header (Industrial Style) */}
      <header className="lg:hidden fixed top-0 left-0 w-full bg-[#020617] border-b-4 border-slate-900 p-4 z-[100]">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white rounded-none flex items-center justify-center rotate-3 shadow-[4px_4px_0px_#f59e0b] overflow-hidden p-2 border-2 border-slate-900">
              <img src="/logo.png" alt="Logo" className="w-full h-full object-contain -rotate-3" />
            </div>
            <h1 className="text-lg font-black text-white uppercase tracking-tighter">VENTURAS</h1>
          </div>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 bg-slate-800 text-white border-2 border-slate-700"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {mobileMenuOpen && (
          <nav className="mt-4 pb-4 space-y-1 animate-reveal">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => { onNavigate(item.id); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-4 px-6 py-5 border-2 ${isActive ? 'bg-amber-500 border-black text-black font-black shadow-[4px_4px_0px_white]' : 'bg-slate-900 border-slate-800 text-slate-400 font-bold'
                    }`}
                >
                  <Icon size={20} />
                  <span className="text-xs uppercase tracking-widest">{item.label}</span>
                </button>
              );
            })}
          </nav>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1 min-h-screen pt-20 lg:pt-0 relative">
        <div className="p-4 sm:p-8 lg:p-16 max-w-[1600px] mx-auto animate-reveal">
          <header className="mb-12 hidden lg:flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em] mb-1 text-reveal">Administração de Elite</span>
              <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter">Controle de Unidade</h1>
            </div>
            <div className="flex items-center gap-6">
              <div className="bg-white border-2 border-slate-900 px-6 py-3 flex items-center gap-3 shadow-[4px_4px_0px_black]">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest">Servidor Online</span>
              </div>
            </div>
          </header>
          {children}
        </div>
      </main>
    </div>
  );
}
