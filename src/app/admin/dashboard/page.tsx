'use client';
import Footer from '@/components/Footer';
import { useState, useEffect } from 'react';
import AuthGuard from '@/components/AuthGuard';
import api from '@/lib/api';

// ─── Types ───────────────────────────────────────────────
interface User { id: number; name: string; email: string; role: string; }
interface Classe { id: number; nom: string; annee_academique: string; }
interface Matiere { id: number; nom: string; code: string; coefficient_defaut: number; }
interface Affectation {
    id: number;
    enseignant_nom: string; enseignant_id: number;
    matiere_nom: string; matiere_code: string; matiere_id: number;
    classe_nom: string; classe_id: number; annee: string;
}
interface Stats { nb_etudiants: number; nb_enseignants: number; nb_admins: number; nb_total: number; }

type Tab = 'dashboard' | 'users' | 'classes' | 'matieres' | 'affectations';

export default function AdminDashboard() {
    const [user, setUser] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<Tab>('dashboard');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [darkMode, setDarkMode] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    // Données
    const [stats, setStats] = useState<Stats | null>(null);
    const [users, setUsers] = useState<User[]>([]);
    const [classes, setClasses] = useState<Classe[]>([]);
    const [matieres, setMatieres] = useState<Matiere[]>([]);
    const [affectations, setAffectations] = useState<Affectation[]>([]);
    const [nbNotes, setNbNotes] = useState(0);

    // Modals
    const [modal, setModal] = useState<null | 'user' | 'classe' | 'matiere' | 'affectation'>(null);
    const [editItem, setEditItem] = useState<any>(null);
    const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [loading, setLoading] = useState(false);

    // Formulaires
    const [formUser, setFormUser] = useState({ name: '', email: '', password: '', role: 'etudiant' });
    const [formClasse, setFormClasse] = useState({ nom: '', annee_academique: '2025-2026' });
    const [formMatiere, setFormMatiere] = useState({ nom: '', code: '', coefficient_defaut: 1 });
    const [formAffectation, setFormAffectation] = useState({ enseignant_id: '', matiere_id: '', classe_id: '', annee: '2025-2026' });

    const headerImages = [
        '/images/images.jpg', '/images/img2.jpg', '/images/img3.jpg',
        '/images/img4.jpg', '/images/img5.jpg', '/images/img6.jpg'
    ];

    const showToast = (type: 'success' | 'error', text: string) => {
        setToast({ type, text });
        setTimeout(() => setToast(null), 4000);
    };

    const handleLogout = () => { localStorage.clear(); window.location.href = '/login'; };

    // Carrousel
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImageIndex(prev => (prev + 1) % headerImages.length);
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    // Chargement initial
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) setUser(JSON.parse(storedUser));
        fetchAll();
    }, []);

    const fetchAll = async () => {
        setLoading(true);
        try {
            const [resStats, resUsers, resClasses, resMatieres, resAffect, resNotes] = await Promise.all([
                api.get('/users/stats'),
                api.get('/users'),
                api.get('/classes'),
                api.get('/matieres'),
                api.get('/affectations'),
                api.get('/notes'),
            ]);
            setStats(resStats.data);
            setUsers(resUsers.data);
            setClasses(Array.isArray(resClasses.data) ? resClasses.data : []);
            setMatieres(Array.isArray(resMatieres.data) ? resMatieres.data : []);
            setAffectations(resAffect.data);
            setNbNotes(Array.isArray(resNotes.data) ? resNotes.data.length : 0);
        } catch (e) {
            console.error('Erreur chargement admin :', e);
        } finally {
            setLoading(false);
        }
    };

    // ─── CRUD Users ───────────────────────────────────────
    const saveUser = async () => {
        try {
            if (editItem) {
                await api.put(`/users/${editItem.id}`, formUser);
                showToast('success', 'Utilisateur modifié.');
            } else {
                await api.post('/users', formUser);
                showToast('success', 'Utilisateur créé.');
            }
            setModal(null); setEditItem(null);
            setFormUser({ name: '', email: '', password: '', role: 'etudiant' });
            fetchAll();
        } catch (e: any) {
            showToast('error', e.response?.data?.message || 'Erreur.');
        }
    };

    const deleteUser = async (id: number) => {
        if (!confirm('Supprimer cet utilisateur ?')) return;
        try {
            await api.delete(`/users/${id}`);
            showToast('success', 'Utilisateur supprimé.');
            fetchAll();
        } catch { showToast('error', 'Erreur suppression.'); }
    };

    // ─── CRUD Classes ─────────────────────────────────────
    const saveClasse = async () => {
        try {
            if (editItem) {
                await api.put(`/classes/${editItem.id}`, formClasse);
                showToast('success', 'Classe modifiée.');
            } else {
                await api.post('/classes', formClasse);
                showToast('success', 'Classe créée.');
            }
            setModal(null); setEditItem(null);
            setFormClasse({ nom: '', annee_academique: '2025-2026' });
            fetchAll();
        } catch (e: any) {
            showToast('error', e.response?.data?.message || 'Erreur.');
        }
    };

    const deleteClasse = async (id: number) => {
        if (!confirm('Supprimer cette classe ?')) return;
        try {
            await api.delete(`/classes/${id}`);
            showToast('success', 'Classe supprimée.');
            fetchAll();
        } catch { showToast('error', 'Erreur suppression.'); }
    };

    // ─── CRUD Matières ────────────────────────────────────
    const saveMatiere = async () => {
        try {
            if (editItem) {
                await api.put(`/matieres/${editItem.id}`, formMatiere);
                showToast('success', 'Matière modifiée.');
            } else {
                await api.post('/matieres', formMatiere);
                showToast('success', 'Matière créée.');
            }
            setModal(null); setEditItem(null);
            setFormMatiere({ nom: '', code: '', coefficient_defaut: 1 });
            fetchAll();
        } catch (e: any) {
            showToast('error', e.response?.data?.message || 'Erreur.');
        }
    };

    const deleteMatiere = async (id: number) => {
        if (!confirm('Supprimer cette matière ?')) return;
        try {
            await api.delete(`/matieres/${id}`);
            showToast('success', 'Matière supprimée.');
            fetchAll();
        } catch { showToast('error', 'Erreur suppression.'); }
    };

    // ─── Affectations ─────────────────────────────────────
    const saveAffectation = async () => {
        try {
            await api.post('/affectations', formAffectation);
            showToast('success', 'Affectation créée.');
            setModal(null);
            setFormAffectation({ enseignant_id: '', matiere_id: '', classe_id: '', annee: '2025-2026' });
            fetchAll();
        } catch (e: any) {
            showToast('error', e.response?.data?.message || 'Erreur.');
        }
    };

    const deleteAffectation = async (id: number) => {
        if (!confirm('Supprimer cette affectation ?')) return;
        try {
            await api.delete(`/affectations/${id}`);
            showToast('success', 'Affectation supprimée.');
            fetchAll();
        } catch { showToast('error', 'Erreur suppression.'); }
    };

    const card = darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100';
    const inputCls = 'w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-slate-900 transition-all';
    const labelCls = 'block text-xs font-bold uppercase text-slate-400 mb-2';
    const enseignants = users.filter(u => u.role === 'enseignant');

    return (
        <AuthGuard>
            <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css" />
            <div className={`min-h-screen ${darkMode ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}`}>

                {/* ── HEADER CARROUSEL ── */}
                <header className="relative w-full h-[300px] md:h-[420px] flex items-center justify-center overflow-hidden bg-slate-900">
                    <div className="absolute inset-0 z-0">
                        {headerImages.map((src, idx) => (
                            <img key={idx} src={src}
                                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${idx === currentImageIndex ? 'opacity-70' : 'opacity-0'}`}
                                onError={(e) => { e.currentTarget.style.display = 'none'; }}
                            />
                        ))}
                        <div className="absolute inset-0 bg-black/25" />
                    </div>

                    <nav className="absolute top-0 left-0 w-full p-4 md:p-8 flex justify-between items-center z-50">
                        <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-5 py-3 rounded-xl border border-white/20 text-white font-black text-xl uppercase tracking-tighter shadow-lg">
                            <i className="bi bi-mortarboard-fill"></i> EDUPULSE
                        </div>
                        <button onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="w-14 h-14 flex flex-col justify-center items-center bg-white/10 backdrop-blur-md rounded-xl border border-white/20 hover:bg-white/20 shadow-lg">
                            <span className={`block w-6 h-0.5 bg-white transition-all ${isMenuOpen ? 'rotate-45 translate-y-[5px]' : '-translate-y-1'}`}></span>
                            <span className={`block w-6 h-0.5 bg-white my-0.5 transition-all ${isMenuOpen ? 'opacity-0' : 'opacity-100'}`}></span>
                            <span className={`block w-6 h-0.5 bg-white transition-all ${isMenuOpen ? '-rotate-45 -translate-y-[5px]' : 'translate-y-1'}`}></span>
                        </button>

                        {isMenuOpen && (
                            <div className="absolute top-20 right-4 w-56 bg-white rounded-2xl shadow-2xl p-4 flex flex-col gap-2 z-50 text-slate-800">
                                <div className="px-3 py-2 border-b mb-1">
                                    <p className="text-xs font-bold text-slate-900">{user?.name || 'Admin'}</p>
                                    <p className="text-xs text-slate-400">{user?.email}</p>
                                </div>
  <button onClick={() => setActiveTab('dashboard')} className="flex items-center gap-3 px-3 py-2 hover:bg-slate-100 rounded-lg text-sm font-semibold">
    <i className="bi bi-grid-1x2"></i> Tableau de bord
</button>
                                <button onClick={() => setDarkMode(!darkMode)} className="flex items-center gap-3 px-3 py-2 hover:bg-slate-100 rounded-lg text-sm font-semibold">
                                    <i className="bi bi-circle-half"></i> Mode {darkMode ? 'Clair' : 'Sombre'}
                                </button>
                                <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2 hover:bg-red-50 rounded-lg text-sm font-semibold text-red-600">
                                    <i className="bi bi-box-arrow-left"></i> Déconnexion
                                </button>
                            </div>
                        )}
                    </nav>

                    <div className="relative z-10 text-center text-white px-6 max-w-5xl mx-auto">
                        <p className="text-sm font-bold tracking-[0.2em] uppercase text-blue-400 mb-4">Espace Administrateur</p>
                        <h1 className="text-3xl md:text-4xl md:text-5xl font-black uppercase drop-shadow-2xl mb-4">Panneau de Contrôle</h1>
                        <p className="text-sm text-slate-200 max-w-2xl mx-auto">
                            Gérez les utilisateurs, classes, matières et affectations de la plateforme.
                        </p>
                    </div>
                </header>

                <main className="max-w-7xl mx-auto px-3 md:px-6 py-6 md:py-12">

                    {/* TOAST */}
                    {toast && (
                        <div className={`mb-6 p-4 rounded-xl text-sm font-semibold flex items-center gap-2 border ${toast.type === 'success' ? 'bg-green-50 border-green-100 text-green-700' : 'bg-red-50 border-red-100 text-red-600'}`}>
                            <i className={`bi ${toast.type === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'}`}></i>
                            {toast.text}
                        </div>
                    )}

                    {/* TABS NAVIGATION */}
                    <div className={`flex gap-1 mb-6 p-1.5 rounded-2xl border w-full overflow-x-auto ${card}`}>
                        {([
                            { key: 'dashboard', label: 'Dashboard', icon: 'bi-grid-1x2' },
                            { key: 'users', label: 'Utilisateurs', icon: 'bi-people' },
                            { key: 'classes', label: 'Classes', icon: 'bi-building' },
                            { key: 'matieres', label: 'Matières', icon: 'bi-book' },
                            { key: 'affectations', label: 'Affectations', icon: 'bi-diagram-3' },
                        ] as { key: Tab; label: string; icon: string }[]).map(t => (
                            <button key={t.key} onClick={() => setActiveTab(t.key)}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === t.key ? 'bg-slate-900 text-white shadow' : 'text-slate-400 hover:text-slate-700'}`}>
                                <i className={`bi ${t.icon}`}></i>
                                <span className="hidden md:inline">{t.label}</span>
                            </button>
                        ))}
                    </div>

                    {/* ── TAB DASHBOARD ── */}
                    {activeTab === 'dashboard' && (
                        <div>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                                {[
                                    { label: 'Étudiants', value: stats?.nb_etudiants ?? '...', icon: 'bi-mortarboard', color: 'text-blue-600' },
                                    { label: 'Enseignants', value: stats?.nb_enseignants ?? '...', icon: 'bi-person-badge', color: 'text-green-600' },
                                    { label: 'Notes saisies', value: nbNotes, icon: 'bi-pencil-square', color: 'text-purple-600' },
                                    { label: 'Classes', value: classes.length, icon: 'bi-building', color: 'text-amber-600' },
                                ].map((s, i) => (
                                    <div key={i} className={`p-5 md:p-8 rounded-3xl shadow-sm border ${card}`}>
                                        <div className="flex justify-between items-start mb-3">
                                            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">{s.label}</p>
                                            <i className={`bi ${s.icon} text-xl ${s.color}`}></i>
                                        </div>
                                        <p className={`text-4xl md:text-5xl font-black ${s.color}`}>{s.value}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Accès rapides */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {[
                                    { label: 'Gérer les utilisateurs', tab: 'users' as Tab, icon: 'bi-people-fill', desc: `${stats?.nb_total ?? 0} utilisateurs enregistrés` },
                                    { label: 'Gérer les classes', tab: 'classes' as Tab, icon: 'bi-building-fill', desc: `${classes.length} classes actives` },
                                    { label: 'Gérer les affectations', tab: 'affectations' as Tab, icon: 'bi-diagram-3-fill', desc: `${affectations.length} affectations configurées` },
                                ].map((a, i) => (
                                    <button key={i} onClick={() => setActiveTab(a.tab)}
                                        className={`p-6 rounded-2xl border text-left transition-all hover:shadow-md ${card}`}>
                                        <i className={`bi ${a.icon} text-2xl text-slate-600 mb-3 block`}></i>
                                        <p className="font-bold text-sm mb-1">{a.label}</p>
                                        <p className="text-xs text-slate-400">{a.desc}</p>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ── TAB UTILISATEURS ── */}
                    {activeTab === 'users' && (
                        <div>
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-black uppercase">Utilisateurs</h2>
                                <button onClick={() => { setEditItem(null); setFormUser({ name: '', email: '', password: '', role: 'etudiant' }); setModal('user'); }}
                                    className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-800 transition-all">
                                    <i className="bi bi-plus-lg"></i> Nouvel utilisateur
                                </button>
                            </div>
                            <div className={`rounded-3xl border shadow-sm overflow-hidden ${card}`}>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className={`text-xs font-bold uppercase tracking-wider ${darkMode ? 'bg-slate-950 text-slate-500' : 'bg-slate-50 text-slate-400'}`}>
                                                <th className="px-6 py-4">Nom</th>
                                                <th className="px-6 py-4">Email</th>
                                                <th className="px-6 py-4">Rôle</th>
                                                <th className="px-6 py-4 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {users.map(u => (
                                                <tr key={u.id} className={`transition-colors ${darkMode ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'}`}>
                                                    <td className="px-3 md:px-6 py-3 md:py-4 font-bold">{u.name}</td>
                                                    <td className="px-6 py-4 text-sm text-slate-400">{u.email}</td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${u.role === 'admin' ? 'bg-red-100 text-red-700' : u.role === 'enseignant' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                                                            {u.role}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right flex justify-end gap-2">
                                                        <button onClick={() => { setEditItem(u); setFormUser({ name: u.name, email: u.email, password: '', role: u.role }); setModal('user'); }}
                                                            className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-all">
                                                            <i className="bi bi-pencil"></i>
                                                        </button>
                                                        <button onClick={() => deleteUser(u.id)}
                                                            className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-all">
                                                            <i className="bi bi-trash"></i>
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── TAB CLASSES ── */}
                    {activeTab === 'classes' && (
                        <div>
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-black uppercase">Classes</h2>
                                <button onClick={() => { setEditItem(null); setFormClasse({ nom: '', annee_academique: '2025-2026' }); setModal('classe'); }}
                                    className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-800 transition-all">
                                    <i className="bi bi-plus-lg"></i> Nouvelle classe
                                </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {classes.map(c => (
                                    <div key={c.id} className={`p-6 rounded-2xl border ${card}`}>
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-bold">{c.nom}</p>
                                                <p className="text-xs text-slate-400 mt-1">{c.annee_academique}</p>
                                            </div>
                                            <div className="flex gap-2">
                                                <button onClick={() => { setEditItem(c); setFormClasse({ nom: c.nom, annee_academique: c.annee_academique }); setModal('classe'); }}
                                                    className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-900">
                                                    <i className="bi bi-pencil"></i>
                                                </button>
                                                <button onClick={() => deleteClasse(c.id)}
                                                    className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600">
                                                    <i className="bi bi-trash"></i>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ── TAB MATIÈRES ── */}
                    {activeTab === 'matieres' && (
                        <div>
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-black uppercase">Matières</h2>
                                <button onClick={() => { setEditItem(null); setFormMatiere({ nom: '', code: '', coefficient_defaut: 1 }); setModal('matiere'); }}
                                    className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-800 transition-all">
                                    <i className="bi bi-plus-lg"></i> Nouvelle matière
                                </button>
                            </div>
                            <div className={`rounded-3xl border shadow-sm overflow-hidden ${card}`}>
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className={`text-xs font-bold uppercase tracking-wider ${darkMode ? 'bg-slate-950 text-slate-500' : 'bg-slate-50 text-slate-400'}`}>
                                            <th className="px-6 py-4">Code</th>
                                            <th className="px-6 py-4">Nom</th>
                                            <th className="px-6 py-4">Coeff. défaut</th>
                                            <th className="px-6 py-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {matieres.map(m => (
                                            <tr key={m.id} className={`transition-colors ${darkMode ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'}`}>
                                                <td className="px-6 py-4 font-mono font-bold text-blue-600">{m.code}</td>
                                                <td className="px-3 md:px-6 py-3 md:py-4 font-bold">{m.nom}</td>
                                                <td className="px-6 py-4 text-slate-400">{m.coefficient_defaut}</td>
                                                <td className="px-6 py-4 text-right flex justify-end gap-2">
                                                    <button onClick={() => { setEditItem(m); setFormMatiere({ nom: m.nom, code: m.code, coefficient_defaut: m.coefficient_defaut }); setModal('matiere'); }}
                                                        className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-900">
                                                        <i className="bi bi-pencil"></i>
                                                    </button>
                                                    <button onClick={() => deleteMatiere(m.id)}
                                                        className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600">
                                                        <i className="bi bi-trash"></i>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* ── TAB AFFECTATIONS ── */}
                    {activeTab === 'affectations' && (
                        <div>
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-black uppercase">Affectations</h2>
                                <button onClick={() => { setFormAffectation({ enseignant_id: '', matiere_id: '', classe_id: '', annee: '2025-2026' }); setModal('affectation'); }}
                                    className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-800 transition-all">
                                    <i className="bi bi-plus-lg"></i> Nouvelle affectation
                                </button>
                            </div>
                            <div className={`rounded-3xl border shadow-sm overflow-hidden ${card}`}>
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className={`text-xs font-bold uppercase tracking-wider ${darkMode ? 'bg-slate-950 text-slate-500' : 'bg-slate-50 text-slate-400'}`}>
                                            <th className="px-6 py-4">Enseignant</th>
                                            <th className="px-6 py-4">Matière</th>
                                            <th className="px-6 py-4">Classe</th>
                                            <th className="px-6 py-4">Année</th>
                                            <th className="px-6 py-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {affectations.map(a => (
                                            <tr key={a.id} className={`transition-colors ${darkMode ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'}`}>
                                                <td className="px-3 md:px-6 py-3 md:py-4 font-bold">{a.enseignant_nom}</td>
                                                <td className="px-6 py-4"><span className="font-mono text-xs text-blue-600 mr-2">[{a.matiere_code}]</span>{a.matiere_nom}</td>
                                                <td className="px-6 py-4 text-slate-400">{a.classe_nom}</td>
                                                <td className="px-6 py-4 text-slate-400">{a.annee}</td>
                                                <td className="px-6 py-4 text-right">
                                                    <button onClick={() => deleteAffectation(a.id)}
                                                        className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600">
                                                        <i className="bi bi-trash"></i>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </main>
                <Footer></Footer>

                


                {/* ══ MODALS ══════════════════════════════════════════ */}
                {modal && (
                    <div className="fixed inset-0 bg-black/25 z-50 flex items-center justify-center p-4" onClick={() => setModal(null)}>
                        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8" onClick={e => e.stopPropagation()}>

                            {/* Modal User */}
                            {modal === 'user' && (
                                <>
                                    <h3 className="text-lg font-black mb-6">{editItem ? 'Modifier' : 'Nouvel'} utilisateur</h3>
                                    <div className="space-y-4">
                                        <div><label className={labelCls}>Nom complet</label><input className={inputCls} value={formUser.name} onChange={e => setFormUser(p => ({ ...p, name: e.target.value }))} /></div>
                                        <div><label className={labelCls}>Email</label><input type="email" className={inputCls} value={formUser.email} onChange={e => setFormUser(p => ({ ...p, email: e.target.value }))} /></div>
                                        <div><label className={labelCls}>Mot de passe {editItem && '(laisser vide = inchangé)'}</label><input type="password" className={inputCls} value={formUser.password} onChange={e => setFormUser(p => ({ ...p, password: e.target.value }))} /></div>
                                        <div><label className={labelCls}>Rôle</label>
                                            <select className={inputCls} value={formUser.role} onChange={e => setFormUser(p => ({ ...p, role: e.target.value }))}>
                                                <option value="etudiant">Étudiant</option>
                                                <option value="enseignant">Enseignant</option>
                                                <option value="admin">Admin</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="flex gap-3 mt-6">
                                        <button onClick={() => setModal(null)} className="flex-1 py-3 rounded-xl border font-bold text-sm text-slate-600 hover:bg-slate-50">Annuler</button>
                                        <button onClick={saveUser} className="flex-1 py-3 rounded-xl bg-slate-900 text-white font-bold text-sm hover:bg-slate-800">{editItem ? 'Modifier' : 'Créer'}</button>
                                    </div>
                                </>
                            )}

                            {/* Modal Classe */}
                            {modal === 'classe' && (
                                <>
                                    <h3 className="text-lg font-black mb-6">{editItem ? 'Modifier' : 'Nouvelle'} classe</h3>
                                    <div className="space-y-4">
                                        <div><label className={labelCls}>Nom de la classe</label><input className={inputCls} placeholder="ex: Licence 2 Informatique" value={formClasse.nom} onChange={e => setFormClasse(p => ({ ...p, nom: e.target.value }))} /></div>
                                        <div><label className={labelCls}>Année académique</label><input className={inputCls} value={formClasse.annee_academique} onChange={e => setFormClasse(p => ({ ...p, annee_academique: e.target.value }))} /></div>
                                    </div>
                                    <div className="flex gap-3 mt-6">
                                        <button onClick={() => setModal(null)} className="flex-1 py-3 rounded-xl border font-bold text-sm text-slate-600 hover:bg-slate-50">Annuler</button>
                                        <button onClick={saveClasse} className="flex-1 py-3 rounded-xl bg-slate-900 text-white font-bold text-sm hover:bg-slate-800">{editItem ? 'Modifier' : 'Créer'}</button>
                                    </div>
                                </>
                            )}

                            {/* Modal Matière */}
                            {modal === 'matiere' && (
                                <>
                                    <h3 className="text-lg font-black mb-6">{editItem ? 'Modifier' : 'Nouvelle'} matière</h3>
                                    <div className="space-y-4">
                                        <div><label className={labelCls}>Code</label><input className={inputCls} placeholder="ex: BDD" value={formMatiere.code} onChange={e => setFormMatiere(p => ({ ...p, code: e.target.value.toUpperCase() }))} /></div>
                                        <div><label className={labelCls}>Nom</label><input className={inputCls} placeholder="ex: Base de données" value={formMatiere.nom} onChange={e => setFormMatiere(p => ({ ...p, nom: e.target.value }))} /></div>
                                        <div><label className={labelCls}>Coefficient par défaut</label><input type="number" min={1} max={10} className={inputCls} value={formMatiere.coefficient_defaut} onChange={e => setFormMatiere(p => ({ ...p, coefficient_defaut: parseInt(e.target.value) || 1 }))} /></div>
                                    </div>
                                    <div className="flex gap-3 mt-6">
                                        <button onClick={() => setModal(null)} className="flex-1 py-3 rounded-xl border font-bold text-sm text-slate-600 hover:bg-slate-50">Annuler</button>
                                        <button onClick={saveMatiere} className="flex-1 py-3 rounded-xl bg-slate-900 text-white font-bold text-sm hover:bg-slate-800">{editItem ? 'Modifier' : 'Créer'}</button>
                                    </div>
                                </>
                            )}

                            {/* Modal Affectation */}
                            {modal === 'affectation' && (
                                <>
                                    <h3 className="text-lg font-black mb-6">Nouvelle affectation</h3>
                                    <div className="space-y-4">
                                        <div><label className={labelCls}>Enseignant</label>
                                            <select className={inputCls} value={formAffectation.enseignant_id} onChange={e => setFormAffectation(p => ({ ...p, enseignant_id: e.target.value }))}>
                                                <option value="">Sélectionner...</option>
                                                {enseignants.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                                            </select>
                                        </div>
                                        <div><label className={labelCls}>Matière</label>
                                            <select className={inputCls} value={formAffectation.matiere_id} onChange={e => setFormAffectation(p => ({ ...p, matiere_id: e.target.value }))}>
                                                <option value="">Sélectionner...</option>
                                                {matieres.map(m => <option key={m.id} value={m.id}>[{m.code}] {m.nom}</option>)}
                                            </select>
                                        </div>
                                        <div><label className={labelCls}>Classe</label>
                                            <select className={inputCls} value={formAffectation.classe_id} onChange={e => setFormAffectation(p => ({ ...p, classe_id: e.target.value }))}>
                                                <option value="">Sélectionner...</option>
                                                {classes.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
                                            </select>
                                        </div>
                                        <div><label className={labelCls}>Année</label><input className={inputCls} value={formAffectation.annee} onChange={e => setFormAffectation(p => ({ ...p, annee: e.target.value }))} /></div>
                                    </div>
                                    <div className="flex gap-3 mt-6">
                                        <button onClick={() => setModal(null)} className="flex-1 py-3 rounded-xl border font-bold text-sm text-slate-600 hover:bg-slate-50">Annuler</button>
                                        <button onClick={saveAffectation} className="flex-1 py-3 rounded-xl bg-slate-900 text-white font-bold text-sm hover:bg-slate-800">Créer</button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </AuthGuard>
    );
}
