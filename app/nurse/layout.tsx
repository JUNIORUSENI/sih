import { requireRole } from "@/lib/auth-actions";
import { AuthButton } from "@/components/auth-button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import Link from "next/link";

export default async function NurseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Vérifier que l'utilisateur a le rôle requis pour accéder à cette section
  await requireRole("NURSE", "/protected");

  return (
    <main className="min-h-screen flex flex-col items-center">
      <div className="flex-1 w-full flex flex-col gap-20 items-center">
        <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
          <div className="w-full max-w-5xl flex justify-between items-center p-3 px-5 text-sm">
            <div className="flex gap-5 items-center font-semibold">
              <Link href="/">Système de Gestion Hospitalière</Link>
              <div className="flex gap-2">
                <Link href="/nurse" className="hover:underline">Infirmier</Link>
                <Link href="/protected" className="hover:underline">Accueil</Link>
              </div>
            </div>
            <AuthButton />
          </div>
        </nav>
        <div className="flex-1 flex flex-col gap-20 max-w-5xl p-5">
          {children}
        </div>

        <footer className="w-full flex items-center justify-center border-t mx-auto text-center text-xs gap-8 py-16">
          <p>
            Système de Gestion Hospitalière
          </p>
          <ThemeSwitcher />
        </footer>
      </div>
    </main>
  );
}