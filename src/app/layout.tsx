import { AuthProvider } from '@/context/AuthContext';
import './globals.css';
import 'bootstrap-icons/font/bootstrap-icons.css'; // <--- AJOUTE CETTE LIGNE

export const metadata = {
  title: 'EduPulse - Gestion Académique',
  description: 'Plateforme de suivi des notes académiques',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}