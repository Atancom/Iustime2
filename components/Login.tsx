import React, { useState } from 'react';
import { User } from '../types';
import { LogIn, Lock, Mail, Eye, EyeOff } from 'lucide-react';

interface LoginProps {
  users: User[];
  onLogin: (user: User) => void;
}

export const Login: React.FC<LoginProps> = ({ users, onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    // Simple mock validation
    if (user && user.password === password) {
      onLogin(user);
    } else {
      setError('Credenciales incorrectas. Intente nuevamente.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col border border-slate-200">
        {/* Header */}
        <div className="bg-slate-900 p-8 text-center">
            <h1 className="text-3xl font-bold text-white mb-2">Gestión de Líneas Ius</h1>
            <p className="text-slate-300 text-sm">Plataforma de Gestión Estratégica</p>
        </div>

        {/* Form */}
        <div className="p-8 bg-white">
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Correo Electrónico</label>
                    <div className="relative group">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 z-10" />
                        <input 
                            type="email" 
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-300 focus:border-slate-500 focus:ring-slate-500 transition-colors bg-white text-slate-900 shadow-sm relative z-10"
                            placeholder="usuario@iustime.com"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Contraseña</label>
                    <div className="relative group">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 z-10" />
                        <input 
                            type={showPassword ? "text" : "password"} 
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full pl-10 pr-12 py-3 rounded-lg border border-slate-300 focus:border-slate-500 focus:ring-slate-500 transition-colors bg-white text-slate-900 shadow-sm relative z-10"
                            placeholder="••••••••"
                        />
                        <button
                            type="button"
                            onClick={(e) => {
                                e.preventDefault();
                                setShowPassword(!showPassword);
                            }}
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-slate-600 hover:text-slate-900 focus:outline-none rounded-full hover:bg-slate-100 transition-colors cursor-pointer flex items-center justify-center bg-transparent"
                            style={{ zIndex: 100 }}
                            title={showPassword ? "Ocultar contraseña" : "Ver contraseña"}
                        >
                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="bg-rose-50 text-rose-600 text-sm p-3 rounded-lg flex items-center justify-center border border-rose-200">
                        {error}
                    </div>
                )}

                <button 
                    type="submit" 
                    className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-3 rounded-lg shadow-lg hover:shadow-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                >
                    <LogIn className="h-5 w-5" />
                    Iniciar Sesión
                </button>
            </form>

            <div className="mt-8 text-center border-t border-slate-100 pt-4">
                <p className="text-xs text-slate-400 mb-2">
                    Acceso restringido a personal autorizado.
                </p>
                <div className="bg-slate-50 p-3 rounded text-xs text-slate-600 border border-slate-200 text-left">
                    <p className="font-bold text-slate-800 mb-1">Credenciales Demo:</p>
                    <p className="mb-0.5">admin@iustime.com / admin</p>
                    <p>ana.tanco@solfico.es / An@t4505</p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};