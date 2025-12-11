import React, { useState } from 'react';
import { User, UserRole, WorkLine } from '../types';
import { Plus, Trash2, Edit2, X, Shield, User as UserIcon, Lock, Eye, EyeOff } from 'lucide-react';

interface UserManagementProps {
  users: User[];
  lines: WorkLine[];
  onAddUser: (user: User) => void;
  onUpdateUser: (user: User) => void;
  onDeleteUser: (id: string) => void;
}

export const UserManagement: React.FC<UserManagementProps> = ({ users, lines, onAddUser, onUpdateUser, onDeleteUser }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState<Partial<User>>({
    name: '', email: '', password: '', role: 'USER', assignedLineId: ''
  });

  const resetForm = () => {
    setFormData({ name: '', email: '', password: '', role: 'USER', assignedLineId: '' });
    setEditingId(null);
    setShowForm(false);
    setShowPassword(false);
  };

  const handleEdit = (user: User) => {
    setFormData({ ...user });
    setEditingId(user.id);
    setShowForm(true);
    setShowPassword(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.name || !formData.password) return;
    if (formData.role === 'USER' && !formData.assignedLineId) {
        alert("Un usuario estándar debe tener una línea de trabajo asignada.");
        return;
    }
    const userData: User = {
      id: editingId || crypto.randomUUID(),
      name: formData.name!,
      email: formData.email!,
      password: formData.password!,
      role: formData.role as UserRole,
      assignedLineId: formData.role === 'USER' ? formData.assignedLineId : undefined
    };
    if (editingId) onUpdateUser(userData);
    else onAddUser(userData);
    resetForm();
  };

  const getLineName = (lineId?: string) => {
    if (!lineId) return <span className="text-zinc-400 italic">N/A</span>;
    const line = lines.find(l => l.id === lineId);
    return line ? <span className="text-blue-600 font-medium">{line.name}</span> : <span className="text-rose-400">Línea eliminada</span>;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center border-b border-zinc-200 pb-6">
        <div>
            <h2 className="text-3xl font-bold text-zinc-800 tracking-tight">Configuración</h2>
            <p className="text-zinc-500 mt-2">Gestión de usuarios y permisos.</p>
        </div>
        <button onClick={() => { if (showForm) resetForm(); else setShowForm(true); }} className={`flex items-center space-x-2 px-5 py-2.5 rounded-lg transition-all shadow-sm font-medium ${showForm ? 'bg-zinc-100 text-zinc-600' : 'bg-zinc-800 text-white'}`}>
          {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          <span>{showForm ? 'Cancelar' : 'Nuevo Usuario'}</span>
        </button>
      </div>

      {showForm && (
        <div className="bg-zinc-50 p-8 rounded-xl shadow-inner border border-zinc-200 mb-8">
            <h3 className="text-lg font-bold text-zinc-800 mb-6 flex items-center">
                <div className="bg-zinc-100 p-2 rounded-lg mr-3"><UserIcon className="h-5 w-5 text-zinc-700" /></div>
                {editingId ? 'Editar Usuario' : 'Registrar Nuevo Usuario'}
            </h3>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Nombre</label>
                    <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full rounded-lg border-zinc-300 p-3 text-sm bg-white" placeholder="Ej. Juan Pérez" />
                </div>
                <div>
                    <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Email</label>
                    <input type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full rounded-lg border-zinc-300 p-3 text-sm bg-white" />
                </div>
                <div>
                    <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Contraseña</label>
                    <div className="relative group">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 z-10" />
                        <input type={showPassword ? "text" : "password"} required value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} className="w-full rounded-lg border-zinc-300 p-3 pl-9 pr-12 text-sm bg-white relative z-10" />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-zinc-500 cursor-pointer" style={{ zIndex: 100 }}>
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Rol</label>
                    <select value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value as UserRole})} className="w-full rounded-lg border-zinc-300 p-3 text-sm bg-white">
                        <option value="USER">Usuario (Limitado)</option>
                        <option value="ADMIN">Administrador</option>
                    </select>
                </div>
                {formData.role === 'USER' && (
                    <div className="md:col-span-2 bg-blue-50 p-4 rounded-lg border border-blue-100">
                        <label className="block text-xs font-bold text-blue-700 uppercase tracking-wider mb-2">Asignar Línea</label>
                        <select value={formData.assignedLineId} onChange={(e) => setFormData({...formData, assignedLineId: e.target.value})} className="w-full rounded-lg border-blue-200 p-3 text-sm bg-white text-blue-900" required>
                            <option value="">-- Seleccionar --</option>
                            {lines.map(l => (<option key={l.id} value={l.id}>{l.name}</option>))}
                        </select>
                    </div>
                )}
                <div className="md:col-span-2 flex justify-end pt-4 border-t border-zinc-200 mt-2">
                    <button type="submit" className="bg-zinc-700 text-white px-8 py-2.5 rounded-lg shadow-md font-bold">{editingId ? 'Actualizar' : 'Crear'}</button>
                </div>
            </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-lg border border-zinc-200 overflow-hidden">
        <table className="min-w-full divide-y divide-zinc-100">
            <thead className="bg-zinc-50">
                <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-zinc-500 uppercase tracking-wider">Usuario</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-zinc-500 uppercase tracking-wider">Rol</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-zinc-500 uppercase tracking-wider">Línea</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-zinc-500 uppercase tracking-wider">Acciones</th>
                </tr>
            </thead>
            <tbody className="bg-white divide-y divide-zinc-100">
                {users.map((user) => (
                    <tr key={user.id} className="hover:bg-zinc-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap"><div className="flex items-center"><div className={`h-8 w-8 rounded-full flex items-center justify-center text-white font-bold text-xs mr-3 ${user.role === 'ADMIN' ? 'bg-zinc-800' : 'bg-zinc-400'}`}>{user.name.charAt(0).toUpperCase()}</div><div className="text-sm font-bold text-zinc-900">{user.name}</div></div></td>
                        <td className="px-6 py-4 whitespace-nowrap">{user.role === 'ADMIN' ? <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-100 text-zinc-800"><Shield className="h-3 w-3 mr-1" /> Admin</span> : <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-100 text-zinc-600"><UserIcon className="h-3 w-3 mr-1" /> Usuario</span>}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{user.role === 'ADMIN' ? <span className="text-xs text-zinc-400 font-medium">Total</span> : getLineName(user.assignedLineId)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end space-x-2">
                                <button onClick={() => handleEdit(user)} className="p-2 text-zinc-400 hover:text-blue-600 rounded-full"><Edit2 className="h-4 w-4" /></button>
                                <button onClick={() => onDeleteUser(user.id)} className="p-2 text-zinc-400 hover:text-rose-600 rounded-full"><Trash2 className="h-4 w-4" /></button>
                            </div>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
      </div>
    </div>
  );
};