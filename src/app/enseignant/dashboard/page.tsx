'use client';
import Footer from '@/components/Footer';
import { useState, useEffect } from 'react';
import AuthGuard from '@/components/AuthGuard';
import api from '@/lib/api';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Cell
} from 'recharts';

interface Classe { id: number; nom: string; }
interface Matiere { id: number; nom: string; code: string; }
interface Etudiant { id: number; name: string; email: string; }
interface MoyenneClasse { matiere_nom: string; matiere_code: string; moyenne: number; nb_notes: number; }

export default function EnseignantDashboard() {
    const [user, setUser] = useState<any>(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [darkMode, setDarkMode] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const [classes, setClasses] = useState<Classe[]>([]);
    const [matieres, setMatieres] = useState<Matiere[]>([]);
    const [etudiants, setEtudiants] = useState<Etudiant[]>([]);
    const [moyennesClasse, setMoyennesClasse] = useState<MoyenneClasse[]>([]);

    const [selectedClasse, setSelectedClasse] = useState('');
    const [selectedMatiere, setSelectedMatiere] = useState('');
    const [evalType, setEvalType] = useState<'devoir' | 'examen'>('devoir');
    const [coefficient, setCoefficient] = useState(1);
    const [evalDate, setEvalDate] = useState(new Date().toISOString().split('T')[0]);
    const [notesSaisies, setNotesSaisies] = useState<{ [key: number]: string }>({});

    const [loadingData, setLoadingData] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const headerImages = [
        '/images/images.jpg', '/images/img2.jpg', '/images/img3.jpg',
        '/images/img4.jpg', '/images/img5.jpg', '/images/img6.jpg'
    ];

    const handleLogout = () => {
        localStorage.clear();
        window.location.href = '/login';
    };

    // Carrousel
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImageIndex((prev) => (prev + 1) % headerImages.length);
        }, 4000);
        return () => clearInterval(interval);
    }, [headerImages.length]);

    // Chargement initial
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) setUser(JSON.parse(storedUser));

        const extractData = (res: any, key: string) => {
            if (Array.isArray(res.data)) return res.data;
            if (res.data?.data && Array.isArray(res.data.data)) return res.data.data;
            if (res.data?.[key] && Array.isArray(res.data[key])) return res.data[key];
            return null;
        };

        const fetchInit = async () => {
            try {
                const [resClasses, resMatieres] = await Promise.all([
                    api.get('/classes'),
                    api.get('/matieres'),
                ]);
                setClasses(extractData(resClasses, 'classes') || []);
                setMatieres(extractData(resMatieres, 'matieres') || []);
            } catch (err) {
                console.error('Erreur chargement initial :', err);
            }
        };
        fetchInit();
    }, []);

    // Étudiants + moyennes quand classe change
    useEffect(() => {
        if (!selectedClasse) { setEtudiants([]); setMoyennesClasse([]); return; }

        const fetchClasseData = async () => {
            setLoadingData(true);
            try {
                const [resEtudiants, resMoyennes] = await Promise.all([
                    api.get(`/classes/${selectedClasse}/etudiants`),
                    api.get(`/notes/moyennes`),
                ]);
                setEtudiants(Array.isArray(resEtudiants.data) ? resEtudiants.data : []);

                // Moyennes par matière de l'enseignant pour cette classe
                const moys = resMoyennes.data?.moyennes_par_matiere || [];
                setMoyennesClasse(moys.map((m: any) => ({
                    matiere_nom: m.matiere_nom,
                    matiere_code: m.matiere_code,
                    moyenne: Number(m.moyenne),
                    nb_notes: m.nb_notes,
                })));
            } catch (err) {
                console.error('Erreur chargement classe :', err);
                setEtudiants([]);
            } finally {
                setLoadingData(false);
            }
        };
        fetchClasseData();
    }, [selectedClasse]);

    // Auto-dismiss message après 4s
    useEffect(() => {
        if (!message) return;
        const t = setTimeout(() => setMessage(null), 4000);
        return () => clearTimeout(t);
    }, [message]);

    const handleNoteChange = (etudiantId: number, val: string) => {
        if (val === '' || (parseFloat(val) >= 0 && parseFloat(val) <= 20)) {
            setNotesSaisies(prev => ({ ...prev, [etudiantId]: val }));
        }
    };

    const handleSaveNotes = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedClasse || !selectedMatiere) {
            setMessage({ type: 'error', text: 'Veuillez sélectionner une classe et une matière.' });
            return;
        }
        setSubmitting(true);
        setMessage(null);
        try {
            await api.post('/notes', {
                matiere_id: parseInt(selectedMatiere),
                classe_id: parseInt(selectedClasse),
                type: evalType,
                coefficient: parseFloat(coefficient.toString()),
                date_evaluation: evalDate,
                notes: Object.entries(notesSaisies).map(([id, val]) => ({
                    etudiant_id: parseInt(id),
                    valeur: parseFloat(val) || 0,
                })),
            });
            setMessage({ type: 'success', text: 'Notes enregistrées avec succès !' });
            setNotesSaisies({});
        } catch (err: any) {
            setMessage({ type: 'error', text: 'Erreur lors de l\'enregistrement.' });
        } finally {
            setSubmitting(false);
        }
    };

    const getBarColor = (moy: number) => moy >= 14 ? '#22c55e' : moy >= 10 ? '#3b82f6' : '#ef4444';
    const card = darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100';

    return (
        <AuthGuard>
            <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css" />
            <div className={`min-h-screen ${darkMode ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}`}>

                {/* ── HEADER CARROUSEL ── */}
                <header className="relative w-full h-[420px] flex items-center justify-center overflow-hidden bg-slate-900">
                    <div className="absolute inset-0 z-0">
                        {headerImages.map((src, idx) => (
                            <img
                                key={idx} src={src}
                                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${idx === currentImageIndex ? 'opacity-40' : 'opacity-0'}`}
                                onError={(e) => { e.currentTarget.style.display = 'none'; }}
                            />
                        ))}
                        <div className="absolute inset-0 bg-black/50" />
                    </div>

                    <nav className="absolute top-0 left-0 w-full p-8 flex justify-between items-center z-50">
                        <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-5 py-3 rounded-xl border border-white/20 text-white font-black text-xl uppercase tracking-tighter shadow-lg">
                            <i className="bi bi-mortarboard-fill"></i> EDUPULSE
                        </div>
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="w-14 h-14 flex flex-col justify-center items-center bg-white/10 backdrop-blur-md rounded-xl border border-white/20 transition-all hover:bg-white/20 shadow-lg"
                        >
                            <span className={`block w-6 h-0.5 bg-white transition-all ${isMenuOpen ? 'rotate-45 translate-y-[5px]' : '-translate-y-1'}`}></span>
                            <span className={`block w-6 h-0.5 bg-white my-0.5 transition-all ${isMenuOpen ? 'opacity-0' : 'opacity-100'}`}></span>
                            <span className={`block w-6 h-0.5 bg-white transition-all ${isMenuOpen ? '-rotate-45 -translate-y-[5px]' : 'translate-y-1'}`}></span>
                        </button>

                        {isMenuOpen && (
                            <div className="absolute top-24 right-8 w-60 bg-white rounded-2xl shadow-2xl p-4 flex flex-col gap-2 z-50 text-slate-800">
                                <div className="px-3 py-2 border-b mb-1">
                                    <p className="text-xs font-bold text-slate-900">{user?.name || 'Enseignant'}</p>
                                    <p className="text-xs text-slate-400">{user?.email}</p>
                                </div>
                                <button onClick={() => window.location.href = '/enseignant/dashboard'} className="flex items-center gap-3 px-3 py-2 hover:bg-slate-100 rounded-lg text-sm font-semibold">
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

                    <div className="relative z-10 text-center text-white px-6 max-w-5xl mx-auto w-full">
                        <p className="text-sm font-bold tracking-[0.2em] uppercase text-blue-400 mb-4">
                            Espace Enseignant
                        </p>
                        <h1 className="text-3xl md:text-5xl font-black uppercase drop-shadow-2xl mb-4">
                            Prof. {user?.name || ''}
                        </h1>
                        <p className="text-sm md:text-base text-slate-200 max-w-2xl mx-auto">
                            Saisie des notes, visualisation des moyennes et suivi de vos classes.
                        </p>
                    </div>
                </header>

                <main className="max-w-7xl mx-auto px-6 py-12">

                    {/* STATS CARDS */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                        <div className={`p-8 rounded-3xl shadow-sm border ${card}`}>
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-3">Classes attribuées</p>
                            <p className="text-5xl font-black text-slate-800">{classes.length}<span className="text-sm font-normal text-slate-400 ml-1">classes</span></p>
                        </div>
                        <div className={`p-8 rounded-3xl shadow-sm border ${card}`}>
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-3">Matières enseignées</p>
                            <p className="text-5xl font-black text-slate-800">{matieres.length}<span className="text-sm font-normal text-slate-400 ml-1">matières</span></p>
                        </div>
                        <div className={`p-8 rounded-3xl shadow-sm border ${card}`}>
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-3">Étudiants dans la classe</p>
                            <p className="text-5xl font-black text-slate-800">{etudiants.length}<span className="text-sm font-normal text-slate-400 ml-1">étudiants</span></p>
                        </div>
                    </div>

                    {/* TOAST */}
                    {message && (
                        <div className={`mb-6 p-4 rounded-xl text-sm font-semibold flex items-center gap-2 border ${message.type === 'success' ? 'bg-green-50 border-green-100 text-green-700' : 'bg-red-50 border-red-100 text-red-600'}`}>
                            <i className={`bi ${message.type === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'}`}></i>
                            {message.text}
                        </div>
                    )}

                    {/* CONFIGURATION ÉVALUATION */}
                    <div className={`p-6 rounded-3xl border shadow-sm mb-8 ${card}`}>
                        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">Configuration de l'Évaluation</h3>
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                            <div>
                                <label className="block text-xs font-bold uppercase text-slate-400 mb-2">Classe</label>
                                <select value={selectedClasse} onChange={(e) => setSelectedClasse(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-slate-900 transition-all">
                                    <option value="">Sélectionner...</option>
                                    {classes.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase text-slate-400 mb-2">Matière</label>
                                <select value={selectedMatiere} onChange={(e) => setSelectedMatiere(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-slate-900 transition-all">
                                    <option value="">Sélectionner...</option>
                                    {matieres.map(m => <option key={m.id} value={m.id}>[{m.code}] {m.nom}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase text-slate-400 mb-2">Type</label>
                                <select value={evalType} onChange={(e) => setEvalType(e.target.value as any)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-slate-900 transition-all">
                                    <option value="devoir">Devoir</option>
                                    <option value="examen">Examen</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase text-slate-400 mb-2">Coefficient</label>
                                <input type="number" min={1} max={10} value={coefficient} onChange={(e) => setCoefficient(parseInt(e.target.value) || 1)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-slate-900 transition-all" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase text-slate-400 mb-2">Date d'évaluation</label>
                                <input type="date" value={evalDate} onChange={(e) => setEvalDate(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-slate-900 transition-all" />
                            </div>
                        </div>
                    </div>

                    {/* GRAPHIQUE MOYENNES PAR MATIÈRE */}
                    {moyennesClasse.length > 0 && (
                        <div className={`rounded-3xl shadow-sm border overflow-hidden mb-8 ${card}`}>
                            <div className="px-8 py-5 border-b border-slate-100">
                                <h3 className="font-bold text-sm uppercase tracking-wider text-slate-400">Moyennes par matière — Ma classe</h3>
                            </div>
                            <div className="p-6">
                                <ResponsiveContainer width="100%" height={260}>
                                    <BarChart data={moyennesClasse} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#334155' : '#f1f5f9'} />
                                        <XAxis dataKey="matiere_code" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                                        <YAxis domain={[0, 20]} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                                        <Tooltip
                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                                            formatter={(value: any, name: any, props: any) => [
                                                `${Number(value).toFixed(2)}/20`,
                                                props.payload.matiere_nom
                                            ]}
                                        />
                                        <Bar dataKey="moyenne" radius={[8, 8, 0, 0]} name="Moyenne">
                                            {moyennesClasse.map((entry, index) => (
                                                <Cell key={index} fill={getBarColor(entry.moyenne)} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                                <div className="flex items-center gap-6 mt-3 justify-center text-xs text-slate-400 font-semibold">
                                    <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-green-500 inline-block"></span> ≥ 14 Bien</span>
                                    <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-blue-500 inline-block"></span> ≥ 10 Passable</span>
                                    <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-400 inline-block"></span> &lt; 10 Insuffisant</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* GRILLE DE SAISIE */}
                    <form onSubmit={handleSaveNotes} className={`rounded-3xl border shadow-sm overflow-hidden ${card}`}>
                        <div className="px-8 py-5 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="font-bold text-sm uppercase tracking-wider text-slate-400">Grille des Étudiants</h3>
                            {etudiants.length > 0 && (
                                <span className="text-xs font-bold bg-slate-100 px-3 py-1 rounded-full text-slate-500">{etudiants.length} étudiant{etudiants.length > 1 ? 's' : ''}</span>
                            )}
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className={`text-xs font-bold uppercase tracking-wider border-b ${darkMode ? 'bg-slate-950 text-slate-500 border-slate-800' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
                                        <th className="px-8 py-4">Nom complet</th>
                                        <th className="px-8 py-4">Adresse Email</th>
                                        <th className="px-8 py-4 text-right w-44">Note (/20)</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {loadingData ? (
                                        <tr><td colSpan={3} className="px-8 py-12 text-center text-sm text-slate-400 animate-pulse">Chargement...</td></tr>
                                    ) : etudiants.length === 0 ? (
                                        <tr><td colSpan={3} className="px-8 py-12 text-center text-sm text-slate-400">Veuillez sélectionner une classe pour afficher les étudiants.</td></tr>
                                    ) : (
                                        etudiants.map(et => (
                                            <tr key={et.id} className={`transition-colors ${darkMode ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50/50'}`}>
                                                <td className="px-8 py-4 font-bold">{et.name}</td>
                                                <td className="px-8 py-4 text-sm text-slate-400">{et.email}</td>
                                                <td className="px-8 py-4 text-right">
                                                    <input
                                                        type="number" step="0.25" min="0" max="20" required
                                                        placeholder="--.--"
                                                        value={notesSaisies[et.id] || ''}
                                                        onChange={(e) => handleNoteChange(et.id, e.target.value)}
                                                        className="w-28 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-right font-black text-slate-900 outline-none focus:border-blue-500 focus:bg-white text-lg transition-all"
                                                    />
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {etudiants.length > 0 && (
                            <div className={`px-8 py-5 border-t flex justify-end ${darkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-100'}`}>
                                <button type="submit" disabled={submitting} className="px-6 py-3.5 bg-slate-950 text-white rounded-xl font-bold hover:bg-slate-900 transition-all shadow-md flex items-center gap-2 text-sm uppercase tracking-wider disabled:opacity-50">
                                    {submitting ? (
                                        <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span> Enregistrement...</>
                                    ) : (
                                        <><i className="bi bi-cloud-arrow-up-fill"></i> Sauvegarder les notes</>
                                    )}
                                </button>
                            </div>
                        )}
                    </form>
                </main>
                <Footer></Footer>

            </div>
        </AuthGuard>
    );
}
