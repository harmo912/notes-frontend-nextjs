'use client';
import Footer from '@/components/Footer';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import AuthGuard from '@/components/AuthGuard';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Note {
    id: number;
    valeur: string;
    coefficient: number;
    type: 'devoir' | 'examen';
    date_evaluation: string;
    matiere: { nom: string; code: string; };
    enseignant: { name: string; };
}

interface MoyenneMatiere {
    matiere_id: number;
    matiere_nom: string;
    matiere_code: string;
    moyenne: number;
    nb_notes: number;
}

interface MoyennesData {
    moyennes_par_matiere: MoyenneMatiere[];
    moyenne_generale: number | null;
}

export default function EtudiantDashboard() {
    const { user, logout } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [darkMode, setDarkMode] = useState(false);
    const [notes, setNotes] = useState<Note[]>([]);
    const [moyennesData, setMoyennesData] = useState<MoyennesData | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const headerImages = [
        '/images/images.jpg', '/images/img2.jpg', '/images/img3.jpg',
        '/images/img4.jpg', '/images/img5.jpg', '/images/img6.jpg'
    ];

    const [pdfLoading, setPdfLoading] = useState(false);

    const handleLogout = () => {
        logout();
        localStorage.removeItem('token');
        window.location.href = '/login';
    };

    const generatePDF = () => {
        setPdfLoading(true);
        try {
            const doc = new jsPDF();
            const dateGen = new Date().toLocaleDateString('fr-FR');
            const moyenneG = moyenneGenerale !== null && moyenneGenerale !== undefined
                ? Number(moyenneGenerale).toFixed(2)
                : '--';

            // ── EN-TÊTE ──
            doc.setFillColor(15, 23, 42); // slate-900
            doc.rect(0, 0, 210, 40, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(22);
            doc.setFont('helvetica', 'bold');
            doc.text('EDUPULSE', 14, 18);
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.text('Plateforme de Gestion Académique', 14, 26);
            doc.text(`Généré le : ${dateGen}`, 14, 33);

            // ── TITRE BULLETIN ──
            doc.setTextColor(15, 23, 42);
            doc.setFontSize(16);
            doc.setFont('helvetica', 'bold');
            doc.text('BULLETIN DE NOTES', 105, 55, { align: 'center' });

            // ── INFOS ÉTUDIANT ──
            doc.setFillColor(248, 250, 252); // slate-50
            doc.roundedRect(14, 62, 182, 22, 3, 3, 'F');
            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(15, 23, 42);
            doc.text(`Étudiant : ${user?.name || ''}`, 20, 72);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(100, 116, 139);
            doc.text(`Email : ${user?.email || ''}`, 20, 79);
            doc.text(`Année académique : 2025-2026`, 130, 72);
            doc.text(`Moyenne générale : ${moyenneG}/20`, 130, 79);

            // ── TABLEAU MOYENNES PAR MATIÈRE ──
            doc.setFontSize(11);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(15, 23, 42);
            doc.text('Moyennes par matière', 14, 96);

            autoTable(doc, {
                startY: 100,
                head: [['Code', 'Matière', 'Nb évals', 'Moyenne /20', 'Mention']],
                body: moyennesParMatiere.map((m) => {
                    const moy = Number(m.moyenne);
                    const mention = moy >= 16 ? 'Très Bien' : moy >= 14 ? 'Bien' : moy >= 12 ? 'Assez Bien' : moy >= 10 ? 'Passable' : 'Insuffisant';
                    return [m.matiere_code, m.matiere_nom, m.nb_notes, moy.toFixed(2), mention];
                }),
                headStyles: { fillColor: [15, 23, 42], textColor: 255, fontStyle: 'bold', fontSize: 9 },
                bodyStyles: { fontSize: 9, textColor: [15, 23, 42] },
                alternateRowStyles: { fillColor: [248, 250, 252] },
                columnStyles: { 3: { fontStyle: 'bold', halign: 'center' }, 4: { halign: 'center' } },
            });

            // ── TABLEAU DÉTAIL NOTES ──
            const finalY = (doc as any).lastAutoTable.finalY + 12;
            doc.setFontSize(11);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(15, 23, 42);
            doc.text('Détail des évaluations', 14, finalY);

            autoTable(doc, {
                startY: finalY + 4,
                head: [['Matière', 'Type', 'Coeff.', 'Date', 'Note /20']],
                body: notes.map((n) => [
                    n.matiere?.nom || '',
                    n.type.toUpperCase(),
                    n.coefficient,
                    new Date(n.date_evaluation).toLocaleDateString('fr-FR'),
                    parseFloat(n.valeur).toFixed(2),
                ]),
                headStyles: { fillColor: [59, 130, 246], textColor: 255, fontStyle: 'bold', fontSize: 9 },
                bodyStyles: { fontSize: 9, textColor: [15, 23, 42] },
                alternateRowStyles: { fillColor: [248, 250, 252] },
                columnStyles: { 4: { fontStyle: 'bold', halign: 'center' } },
            });

            // ── PIED DE PAGE ──
            const pageCount = doc.getNumberOfPages();
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                doc.setFontSize(8);
                doc.setTextColor(148, 163, 184);
                doc.text(`EduPulse — Document généré automatiquement — Page ${i}/${pageCount}`, 105, 290, { align: 'center' });
            }

            doc.save(`bulletin_${user?.name?.replace(/\s+/g, '_')}_${dateGen.replace(/\//g, '-')}.pdf`);
        } catch (e) {
            console.error('Erreur génération PDF :', e);
        } finally {
            setPdfLoading(false);
        }
    };

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImageIndex((prev) => (prev + 1) % headerImages.length);
        }, 4000);
        return () => clearInterval(interval);
    }, [headerImages.length]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [resNotes, resMoyennes] = await Promise.all([
                    api.get('/notes'),
                    api.get('/notes/moyennes'),
                ]);
                setNotes(resNotes.data);
                setMoyennesData(resMoyennes.data);
            } catch (error) {
                console.error("Erreur chargement données étudiant :", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const graphData = [...notes]
        .sort((a, b) => new Date(a.date_evaluation).getTime() - new Date(b.date_evaluation).getTime())
        .map((n) => ({
            date: new Date(n.date_evaluation).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
            note: parseFloat(n.valeur),
            matiere: n.matiere?.code || '',
        }));

    const moyenneGenerale = moyennesData?.moyenne_generale;
    const moyennesParMatiere = moyennesData?.moyennes_par_matiere || [];

    const getMoyenneColor = (m: number) => {
        if (m >= 14) return 'text-green-600';
        if (m >= 10) return 'text-blue-600';
        return 'text-red-500';
    };

    const card = darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100';

    return (
        <AuthGuard>
            <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css" />
            <div className={`min-h-screen ${darkMode ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}`}>

                {/* HEADER CARROUSEL */}
                <header className="relative w-full h-[320px] md:h-[420px] flex items-center justify-center overflow-hidden bg-slate-900">
                    <div className="absolute inset-0 z-0">
                        {headerImages.map((src, idx) => (
                            <img
                                key={idx} src={src}
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
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="w-14 h-14 flex flex-col justify-center items-center bg-white/10 backdrop-blur-md rounded-xl border border-white/20 transition-all hover:bg-white/20 shadow-lg"
                        >
                            <span className={`block w-6 h-0.5 bg-white transition-all ${isMenuOpen ? 'rotate-45 translate-y-[5px]' : '-translate-y-1'}`}></span>
                            <span className={`block w-6 h-0.5 bg-white my-0.5 transition-all ${isMenuOpen ? 'opacity-0' : 'opacity-100'}`}></span>
                            <span className={`block w-6 h-0.5 bg-white transition-all ${isMenuOpen ? '-rotate-45 -translate-y-[5px]' : 'translate-y-1'}`}></span>
                        </button>

                        {isMenuOpen && (
                            <div className="absolute top-20 right-4 w-56 bg-white rounded-2xl shadow-2xl p-4 flex flex-col gap-2 z-50 text-slate-800">
                                <div className="px-3 py-2 border-b mb-1">
                                    <p className="text-xs font-bold text-slate-900">{user?.name || 'Étudiant'}</p>
                                    <p className="text-xs text-slate-400">{user?.email}</p>
                                </div>
                                <button onClick={() => { window.location.href = '/etudiant/dashboard'; }} className="flex items-center gap-3 px-3 py-2 hover:bg-slate-100 rounded-lg text-sm font-semibold">
    <i className="bi bi-grid-1x2"></i> Tableau de bord
</button>
                                <button onClick={() => setDarkMode(!darkMode)} className="flex items-center gap-3 px-3 py-2 hover:bg-slate-100 rounded-lg text-sm font-semibold">
                                    <i className="bi bi-circle-half"></i> Mode {darkMode ? 'Clair' : 'Sombre'}
                                </button>
                                <button onClick={generatePDF} disabled={pdfLoading || loading} className="flex items-center gap-3 px-3 py-2 hover:bg-blue-50 rounded-lg text-sm font-semibold text-blue-600 disabled:opacity-50">
                                    <i className="bi bi-file-earmark-pdf"></i> {pdfLoading ? 'Génération...' : 'Télécharger bulletin'}
                                </button>
                                <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2 hover:bg-red-50 rounded-lg text-sm font-semibold text-red-600">
                                    <i className="bi bi-box-arrow-left"></i> Déconnexion
                                </button>
                            </div>
                        )}
                    </nav>

                    <div className="relative z-10 text-center text-white px-4 max-w-5xl mx-auto w-full">
                        <p className="text-sm font-bold tracking-[0.2em] uppercase text-blue-400 mb-4">
                            Plateforme de Suivi Académique
                        </p>
                        <h1 className="text-3xl md:text-4xl md:text-5xl font-black uppercase drop-shadow-2xl mb-4">
                            Espace Numérique d'Évaluation
                        </h1>
                        <p className="text-sm md:text-base text-slate-200 max-w-2xl mx-auto">
                            Bienvenue, <span className="font-bold text-white">{user?.name}</span> — consultez vos notes et moyennes ci-dessous.
                        </p>
                    </div>
                </header>

                <main className="max-w-7xl mx-auto px-3 md:px-6 py-6 md:py-12">

                    {/* STATS CARDS */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                        <div className={`p-5 md:p-8 rounded-3xl shadow-sm border ${card}`}>
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-3">Moyenne Générale</p>
                            <p className={`text-4xl md:text-5xl font-black ${getMoyenneColor(moyenneGenerale ?? 0)}`}>
                                {loading ? '...' : moyenneGenerale !== null && moyenneGenerale !== undefined ? moyenneGenerale.toFixed(2) : '--'}
                                <span className="text-sm font-normal text-slate-400 ml-1">/ 20</span>
                            </p>
                        </div>
                        <div className={`p-5 md:p-8 rounded-3xl shadow-sm border ${card}`}>
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-3">Notes enregistrées</p>
                            <p className="text-4xl md:text-5xl font-black text-slate-800">
                                {loading ? '...' : notes.length}
                                <span className="text-sm font-normal text-slate-400 ml-1">éval.</span>
                            </p>
                        </div>
                        <div className={`p-5 md:p-8 rounded-3xl shadow-sm border ${card}`}>
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-3">Matières évaluées</p>
                            <p className="text-4xl md:text-5xl font-black text-slate-800">
                                {loading ? '...' : moyennesParMatiere.length}
                                <span className="text-sm font-normal text-slate-400 ml-1">matières</span>
                            </p>
                        </div>
                    </div>

                    {/* BOUTON BULLETIN PDF */}
                    <div className="flex justify-end mb-10">
                        <button
                            onClick={generatePDF}
                            disabled={pdfLoading || loading || notes.length === 0}
                            className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-slate-800 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <i className="bi bi-file-earmark-pdf-fill text-base"></i>
                            {pdfLoading ? 'Génération en cours...' : 'Télécharger mon bulletin PDF'}
                        </button>
                    </div>

                    {/* MOYENNES PAR MATIÈRE */}
                    {moyennesParMatiere.length > 0 && (
                        <div className={`rounded-3xl shadow-sm border overflow-hidden mb-10 ${card}`}>
                            <div className="px-8 py-5 border-b border-slate-100">
                                <h3 className="font-bold text-sm uppercase tracking-wider text-slate-400">Moyennes par matière</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
                                {moyennesParMatiere.map((m) => (
                                    <div key={m.matiere_id} className={`p-5 rounded-2xl border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <p className="font-bold text-sm">{m.matiere_nom}</p>
                                                <p className="text-xs text-slate-400 font-mono">{m.matiere_code}</p>
                                            </div>
                                            <span className={`text-2xl font-black ${getMoyenneColor(m.moyenne)}`}>
                                                {typeof m.moyenne === 'number' ? m.moyenne.toFixed(2) : parseFloat(m.moyenne || 0).toFixed(2)}
                                            </span>
                                        </div>
                                        <div className="w-full bg-slate-200 rounded-full h-1.5 mt-3">
                                            <div
                                                className={`h-1.5 rounded-full ${m.moyenne >= 14 ? 'bg-green-500' : m.moyenne >= 10 ? 'bg-blue-500' : 'bg-red-400'}`}
                                                style={{ width: `${(m.moyenne / 20) * 100}%` }}
                                            />
                                        </div>
                                        <p className="text-xs text-slate-400 mt-2">{m.nb_notes} évaluation{m.nb_notes > 1 ? 's' : ''}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* GRAPHIQUE ÉVOLUTION */}
                    {graphData.length > 1 && (
                        <div className={`rounded-3xl shadow-sm border overflow-hidden mb-10 ${card}`}>
                            <div className="px-8 py-5 border-b border-slate-100">
                                <h3 className="font-bold text-sm uppercase tracking-wider text-slate-400">Évolution des notes</h3>
                            </div>
                            <div className="p-6">
                                <ResponsiveContainer width="100%" height={280}>
                                    <LineChart data={graphData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#334155' : '#f1f5f9'} />
                                        <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                                        <YAxis domain={[0, 20]} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                                        <Tooltip
                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                                            formatter={(value: any) => [`${value}/20`, 'Note']}
                                        />
                                        <Legend />
                                        <Line
                                            type="monotone"
                                            dataKey="note"
                                            stroke="#3b82f6"
                                            strokeWidth={2.5}
                                            dot={{ r: 5, fill: '#3b82f6' }}
                                            activeDot={{ r: 7 }}
                                            name="Note obtenue"
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    )}

                    {/* TABLEAU DÉTAIL NOTES */}
                    <div className={`rounded-3xl shadow-sm border overflow-hidden ${card}`}>
                        <div className="px-8 py-5 border-b border-slate-100">
                            <h3 className="font-bold text-sm uppercase tracking-wider text-slate-400">Détail des évaluations</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className={`text-xs font-bold uppercase tracking-wider ${darkMode ? 'bg-slate-950 text-slate-500' : 'bg-slate-50 text-slate-400'}`}>
                                        <th className="px-3 md:px-8 py-3 md:py-4">Matière</th>
                                        <th className="px-3 md:px-8 py-3 md:py-4">Enseignant</th>
                                        <th className="px-3 md:px-8 py-3 md:py-4">Type</th>
                                        <th className="px-3 md:px-8 py-3 md:py-4">Coefficient</th>
                                        <th className="px-3 md:px-8 py-3 md:py-4">Date</th>
                                        <th className="px-8 py-4 text-right">Note</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {loading ? (
                                        <tr><td colSpan={6} className="px-8 py-10 text-center animate-pulse text-slate-400">Chargement...</td></tr>
                                    ) : notes.length === 0 ? (
                                        <tr><td colSpan={6} className="px-8 py-10 text-center text-slate-400">Aucune note disponible.</td></tr>
                                    ) : (
                                        notes.map((note) => (
                                            <tr key={note.id} className={`transition-colors ${darkMode ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50/70'}`}>
                                                <td className="px-8 py-5 font-bold">{note.matiere?.nom}</td>
                                                <td className="px-8 py-5 text-sm text-slate-400">{note.enseignant?.name}</td>
                                                <td className="px-8 py-5">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${note.type === 'examen' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                                        {note.type}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-5 font-medium">{note.coefficient}</td>
                                                <td className="px-8 py-5 text-sm text-slate-400">
                                                    {new Date(note.date_evaluation).toLocaleDateString('fr-FR')}
                                                </td>
                                                <td className="px-8 py-5 text-right">
                                                    <span className={`text-lg font-black ${getMoyenneColor(parseFloat(note.valeur))}`}>
                                                        {parseFloat(note.valeur).toFixed(2)}
                                                    </span>
                                                    <span className="text-xs text-slate-400 ml-1">/20</span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </main>
                <Footer></Footer>

            </div>
        </AuthGuard>
    );
}
