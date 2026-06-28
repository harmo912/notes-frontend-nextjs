'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const dernierEmail = localStorage.getItem('dernier_email');
        if (dernierEmail) {
            setEmail(dernierEmail);
        }
    }, []);

   const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    localStorage.setItem('dernier_email', email);

    try {
        const response = await api.post('/login', { email, password });
        const { token, user } = response.data;

        // ✅ Vide tout avant de stocker (force nouvelle session)
        localStorage.clear();
        localStorage.setItem('dernier_email', email);
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));

        if (user.role === 'admin') router.push('/admin/dashboard');
        else if (user.role === 'enseignant') router.push('/enseignant/dashboard');
        else if (user.role === 'etudiant') router.push('/etudiant/dashboard');
        else setError('Rôle utilisateur non reconnu.');

    } catch (err: any) {
        console.error("Erreur de connexion:", err);
        setError(err.response?.data?.message || 'Identifiants incorrects.');
    } finally {
        setLoading(false);
    }
};

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
            <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css" />

            <div className="bg-white p-8 md:p-10 rounded-3xl shadow-xl border border-slate-100 w-full max-w-md">

                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 bg-slate-950 text-white rounded-2xl flex items-center justify-center text-3xl shadow-lg mb-3">
                        <i className="bi bi-mortarboard-fill"></i>
                    </div>
                    <h2 className="text-2xl font-black tracking-tight text-slate-900 uppercase">EDUPULSE</h2>
                    <p className="text-slate-400 text-xs font-semibold mt-1">Portail d'authentification unique</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-semibold flex items-center gap-2">
                        <i className="bi bi-exclamation-triangle-fill"></i>
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-5">
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Adresse Email</label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                                <i className="bi bi-envelope"></i>
                            </span>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="nom@ecole.edu"
                                className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-slate-900 focus:bg-white transition-all text-slate-900"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Mot de passe</label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                                <i className="bi bi-lock"></i>
                            </span>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-slate-900 focus:bg-white transition-all text-slate-900"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-slate-950 text-white py-4 rounded-xl font-bold hover:bg-slate-900 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 mt-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm uppercase tracking-wider"
                    >
                        {loading ? (
                            <>
                                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                Connexion en cours...
                            </>
                        ) : (
                            <>
                                Se connecter <i className="bi bi-arrow-right"></i>
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
