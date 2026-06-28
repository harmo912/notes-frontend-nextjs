export default function Footer() {
    return (
        <footer className="bg-slate-900 text-white py-10 px-6 mt-auto">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-3 font-black text-lg uppercase tracking-tighter">
                    <i className="bi bi-mortarboard-fill text-blue-400"></i> EDUPULSE
                </div>
               <p className="text-slate-400 text-xs text-center">
    EduPulse © 2026 - Votre partenaire numérique pour une gestion académique simplifiée.
</p>
                <div className="flex items-center gap-1 text-slate-400 text-xs">
    <span>Gestion sécurisée</span>
    <span className="text-white font-bold ml-1">par EduPulse</span>
</div>
            </div>
        </footer>
    );
}