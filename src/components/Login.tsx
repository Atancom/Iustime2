import React, { useState } from 'react';
import { User } from '../types';
import { LogIn, Lock, Mail, Eye, EyeOff, ShieldCheck } from 'lucide-react';

interface LoginProps {
  users: User[];
  onLogin: (user: User) => void;
}

export const Login: React.FC<LoginProps> = ({ users, onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleManualLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const lowerEmail = email.trim().toLowerCase();
    
    if (lowerEmail === 'usuario@iustime.com') {
        setError('Para la demo usa: admin@iustime.com');
        return;
    }

    const user = users.find(u => u.email.toLowerCase() === lowerEmail);
    
    if (user && user.password === password) {
      onLogin(user);
      return;
    } 

    if (lowerEmail === 'admin@iustime.com' && password === 'admin') {
        onLogin({
            id: 'admin-master',
            name: 'Administrador',
            email: 'admin@iustime.com',
            role: 'ADMIN',
            password: 'admin'
        });
        return;
    }

    setError('Credenciales incorrectas.');
  };

  const handleAutoLogin = () => {
    onLogin({
        id: 'admin-force',
        name: 'Administrador (Acceso Rápido)',
        email: 'admin@iustime.com',
        role: 'ADMIN',
        password: 'admin'
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[url('https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1600')] bg-cover bg-center">
      {/* Overlay oscuro para legibilidad */}
      <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm"></div>

      <div className="relative w-full max-w-md bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden border border-white/20 animate-in fade-in zoom-in duration-300">
        
        {/* Header con gradiente */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-8 text-center border-b border-slate-700 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-400 via-accent-500 to-brand-400"></div>
            <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Gestión Ius</h1>
            <p className="text-slate-300 text-sm font-light tracking-wide">Plataforma de Estrategia Legal</p>
        </div>

        <div className="p-8">
            
            {/* Botón de acceso rápido destacado */}
            <button 
                onClick={handleAutoLogin}
                type="button"
                className="w-full group bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl shadow-lg hover:shadow-emerald-900/20 transition-all active:scale-[0.98] flex items-center justify-center gap-3 mb-6 border border-emerald-500"
            >
                <div className="bg-emerald-500/30 p-1.5 rounded-full group-hover:bg-emerald-500/50 transition-colors">
                    <ShieldCheck className="h-5 w-5" />
                </div>
                <span className="tracking-wide">ENTRAR COMO ADMIN</span>
            </button>

            <div className="relative flex py-3 items-center mb-6">
                <div className="flex-grow border-t border-slate-200"></div>
                <span className="flex-shrink-0 mx-4 text-[10px] text-slate-400 uppercase font-bold tracking-widest">Acceso Manual</span>
                <div className="flex-grow border-t border-slate-200"></div>
            </div>

            <form onSubmit={handleManualLogin} className="space-y-5">
                <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase ml-1">Usuario</label>
                    <div className="relative group">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-brand-600 transition-colors" />
                        <input 
                            type="text" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all bg-slate-50 focus:bg-white text-slate-900 placeholder:text-slate-400"
                            placeholder="admin@iustime.com"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase ml-1">Contraseña</label>
                    <div className="relative group">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-brand-600 transition-colors" />
                        <input 
                            type={showPassword ? "text" : "password"} 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full pl-10 pr-12 py-3 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all bg-slate-50 focus:bg-white text-slate-900 placeholder:text-slate-400"
                            placeholder="••••••••"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="bg-rose-50 border border-rose-100 text-rose-600 text-sm p-3 rounded-xl text-center font-medium animate-in slide-in-from-top-2">
                        {error}
                    </div>
                )}

                <button 
                    type="submit"
                    className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-3.5 rounded-xl shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2 mt-2"
                >
                    <LogIn className="h-5 w-5" />
                    Iniciar Sesión
                </button>
            </form>
        </div>
        
        <div className="bg-slate-50 p-4 text-center border-t border-slate-100">
            <p className="text-[10px] text-slate-400 font-medium">
                © {new Date().getFullYear()} Gestión de Líneas Ius. v2.0
            </p>
        </div>
      </div>
    </div>
  );
};