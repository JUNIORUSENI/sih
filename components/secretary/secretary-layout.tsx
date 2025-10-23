"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Moon, Sun, Users, Calendar, Stethoscope, FileText, LogOut, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useTheme } from "next-themes";
import { signOut } from "@/lib/auth-actions";
import { createClient } from "@/lib/supabase/client";
import { getUserRoleClient } from "@/lib/auth-utils-client";

interface SecretaryLayoutProps {
  children: React.ReactNode;
}

export function SecretaryLayout({ children }: SecretaryLayoutProps) {
  const [isOpen, setIsOpen] = useState(true);
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      const role = await getUserRoleClient();
      setUserRole(role);
      setLoading(false);
    };
    
    fetchUserRole();
  }, []);

  // Navigation de base pour secrétariat
  let navItems = [
    { href: "/secretary", label: "Tableau de bord", icon: FileText },
    { href: "/patients", label: "Patients", icon: Users },
    { href: "/appointments", label: "Rendez-vous", icon: Calendar },
    { href: "/consultations", label: "Consultations", icon: Stethoscope },
  ];

  // Ajouter les items médicaux pour les rôles médicaux
  if (userRole && ['DOCTOR', 'NURSE', 'GENERAL_DOCTOR'].includes(userRole)) {
    navItems.push({ href: "/medical", label: "Médecine", icon: Stethoscope });
  }

  const handleSignOut = async () => {
    await signOut();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Chargement...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-muted/40">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-10 w-64 bg-background border-r transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}>
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="border-b p-4">
            <div className="flex items-center gap-2">
              <Users className="h-6 w-6" />
              <span className="font-bold text-lg">Secrétariat</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex flex-1 flex-col p-4">
            <ul className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <li key={item.href}>
                    <Link href={item.href}>
                      <Button
                        variant={isActive ? "secondary" : "ghost"}
                        className={`w-full justify-start ${
                          isActive ? "bg-muted" : ""
                        }`}
                      >
                        <Icon className="mr-2 h-4 w-4" />
                        {item.label}
                      </Button>
                    </Link>
                  </li>
                );
              })}
            </ul>

            <div className="mt-auto pt-4 border-t">
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              >
                {theme === "dark" ? (
                  <Sun className="mr-2 h-4 w-4" />
                ) : (
                  <Moon className="mr-2 h-4 w-4" />
                )}
                {theme === "dark" ? "Mode clair" : "Mode sombre"}
              </Button>
              
              <Button
                variant="ghost"
                className="w-full justify-start mt-2"
                onClick={handleSignOut}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Déconnexion
              </Button>
            </div>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-col lg:pl-64 flex-1">
        {/* Header */}
        <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur">
          <div className="flex h-14 items-center justify-between px-4">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setIsOpen(!isOpen)}
              >
                <span className="sr-only">Toggle sidebar</span>
                {isOpen ? (
                  <Users className="h-5 w-5" />
                ) : (
                  <Users className="h-5 w-5" />
                )}
              </Button>
              <h1 className="text-xl font-semibold">Secrétariat</h1>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}