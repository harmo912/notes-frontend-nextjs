'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
    const router = useRouter();
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const headerImages = [
        '/images/images.jpg', '/images/img2.jpg', '/images/img3.jpg',
        '/images/img4.jpg', '/images/img5.jpg', '/images/img6.jpg'
    ];

    useEffect(() => {
        // Si déjà connecté, rediriger vers le bon dashboard
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('user');
        if (token && user) {
            const parsed = JSON.parse(user);
            if (parsed.role === 'admin') router.replace('/admin/dashboard');
            else if (parsed.role === 'enseignant') router.replace('/enseignant/dashboard');
            else router.replace('/etudiant/dashboard');
        }
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImageIndex(prev => (prev + 1) % headerImages.length);
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    return (
        <>
            <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css" />
            <div className="min-h-screen bg-slate-50 text-slate-900">

                {/* ── HERO ── */}
                <header className="relative w-full h-screen flex items-center justify-center overflow-hidden bg-slate-900">
                    <div className="absolute inset-0 z-0">
                        {headerImages.map((src, idx) => (
                            <img key={idx} src={src}
                                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${idx === currentImageIndex ? 'opacity-30' : 'opacity-0'}`}
                                onError={(e) => { e.currentTarget.style.display = 'none'; }}
                            />
                        ))}
                        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-slate-900" />
                    </div>

                    {/* NAV */}
                    <nav className="absolute top-0 left-0 w-full p-8 flex justify-between items-center z-50">
                        <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-5 py-3 rounded-xl border border-white/20 text-white font-black text-xl uppercase tracking-tighter shadow-lg">
                            <i className="bi bi-mortarboard-fill"></i> EDUPULSE
                        </div>
                        <button
                            onClick={() => router.push('/login')}
                            className="flex items-center gap-2 bg-white text-slate-900 px-6 py-3 rounded-xl font-bold text-sm hover:bg-slate-100 transition-all shadow-lg"
                        >
                            <i className="bi bi-box-arrow-in-right"></i> Se connecter
                        </button>
                    </nav>

                    {/* HERO CONTENT */}
                    <div className="relative z-10 text-center text-white px-6 max-w-5xl mx-auto">
                        <div className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-8">
                            <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></span>
                            Plateforme de Gestion Académique
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black uppercase drop-shadow-2xl mb-6 leading-tight">
                            Gérez vos notes.<br />
                            <span className="text-blue-400">Simplement.</span>
                        </h1>
                        <p className="text-base md:text-lg text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed">
                            EduPulse centralise la saisie des notes, le calcul des moyennes et le suivi académique pour les enseignants, étudiants et administrateurs.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button
                                onClick={() => router.push('/login')}
                                className="flex items-center justify-center gap-2 bg-white text-slate-900 px-8 py-4 rounded-xl font-black text-sm uppercase tracking-wider hover:bg-slate-100 transition-all shadow-xl"
                            >
                                <i className="bi bi-box-arrow-in-right"></i> Accéder à la plateforme
                            </button>
                            <a href="#features"
                                className="flex items-center justify-center gap-2 bg-white/10 border border-white/20 text-white px-8 py-4 rounded-xl font-bold text-sm uppercase tracking-wider hover:bg-white/20 transition-all backdrop-blur-md"
                            >
                                <i className="bi bi-info-circle"></i> En savoir plus
                            </a>
                        </div>
                    </div>

                    {/* SCROLL INDICATOR */}
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 text-white/40 text-xs">
                        <span>Défiler</span>
                        <i className="bi bi-chevron-down animate-bounce"></i>
                    </div>
                </header>

                {/* ── FEATURES ── */}
                <section id="features" className="max-w-7xl mx-auto px-6 py-24">
                    <div className="text-center mb-16">
                        <p className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-3">Fonctionnalités</p>
                        <h2 className="text-4xl font-black uppercase">Tout ce dont vous avez besoin</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: 'bi-person-badge-fill',
                                title: 'Espace Enseignant',
                                desc: 'Saisie de notes en masse, visualisation des moyennes de classe avec graphiques interactifs.',
                                color: 'bg-green-50 text-green-600',
                            },
                            {
                                icon: 'bi-mortarboard-fill',
                                title: 'Espace Étudiant',
                                desc: 'Consultation des notes par matière, graphique d\'évolution et téléchargement du bulletin PDF.',
                                color: 'bg-blue-50 text-blue-600',
                            },
                            {
                                icon: 'bi-gear-fill',
                                title: 'Espace Admin',
                                desc: 'Gestion complète des utilisateurs, classes, matières et affectations depuis un panneau centralisé.',
                                color: 'bg-purple-50 text-purple-600',
                            },
                        ].map((f, i) => (
                            <div key={i} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
                                <div className={`w-14 h-14 ${f.color} rounded-2xl flex items-center justify-center text-2xl mb-6`}>
                                    <i className={`bi ${f.icon}`}></i>
                                </div>
                                <h3 className="text-lg font-black mb-3">{f.title}</h3>
                                <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ── STATS ── */}
                <section className="bg-slate-900 text-white py-20">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                            {[
                                { value: '3', label: 'Rôles distincts' },
                                { value: '100%', label: 'Sécurisé Bearer Token' },
                                { value: 'PDF', label: 'Bulletins générés' },
                                { value: 'REST', label: 'API Laravel 11' },
                            ].map((s, i) => (
                                <div key={i}>
                                    <p className="text-4xl font-black text-blue-400 mb-2">{s.value}</p>
                                    <p className="text-slate-400 text-sm font-semibold">{s.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── CTA ── */}
                <section className="max-w-3xl mx-auto px-6 py-24 text-center">
                    <h2 className="text-4xl font-black uppercase mb-4">Prêt à commencer ?</h2>
                    <p className="text-slate-400 mb-8">Connectez-vous avec votre compte enseignant, étudiant ou administrateur.</p>
                    <button
                        onClick={() => router.push('/login')}
                        className="inline-flex items-center gap-2 bg-slate-900 text-white px-10 py-4 rounded-xl font-black text-sm uppercase tracking-wider hover:bg-slate-800 transition-all shadow-xl"
                    >
                        <i className="bi bi-box-arrow-in-right"></i> Se connecter maintenant
                    </button>
                </section>

                {/* ── FOOTER ── */}
                <footer className="bg-slate-900 text-white py-10 px-6">
                    <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="flex items-center gap-3 font-black text-lg uppercase tracking-tighter">
                            <i className="bi bi-mortarboard-fill text-blue-400"></i> EDUPULSE
                        </div>
                        <p className="text-slate-400 text-xs text-center">
                            Plateforme de Gestion Académique — Projet de soutenance ENEAM © {new Date().getFullYear()}
                        </p>
                        <div className="flex items-center gap-1 text-slate-400 text-xs">
                            <span>Propulsé par</span>
                            <span className="text-white font-bold ml-1">Laravel 11</span>
                            <span className="mx-1">+</span>
                            <span className="text-white font-bold">Next.js 14</span>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
