'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const [status, setStatus] = useState<'loading' | 'authenticated' | 'unauthenticated'>('loading');

    useEffect(() => {
        const token = localStorage.getItem('token');

        if (!token) {
            setStatus('unauthenticated');
            router.replace('/login');
            return;
        }

        // ✅ Empêche le retour arrière vers le dashboard après logout
        window.history.pushState(null, '', window.location.href);
        window.onpopstate = () => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            router.replace('/login');
        };

        setStatus('authenticated');

        return () => {
            window.onpopstate = null;
        };
    }, [router]);

    if (status === 'loading') {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (status === 'unauthenticated') return null;

    return <>{children}</>;
}