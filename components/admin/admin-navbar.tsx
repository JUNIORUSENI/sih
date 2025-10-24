"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { ThemeSwitcher } from "@/components/theme-switcher";

interface UserProfile {
  name: string;
  postname?: string;
  surname?: string;
  role: string;
  email: string;
}

export function AdminNavbar() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('name, postname, surname, role')
          .eq('id', user.id)
          .single();

        if (profileData) {
          setProfile({
            ...profileData,
            email: user.email || ''
          });
        }
      }
    };

    fetchProfile();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/auth/login');
  };

  const getDisplayName = () => {
    if (!profile) return 'Chargement...';
    
    const parts = [
      profile.surname,
      profile.postname,
      profile.name
    ].filter(Boolean);
    
    return parts.length > 0 ? parts.join(' ') : profile.email;
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'ADMIN_SYS': return 'Administrateur Système';
      case 'GENERAL_DOCTOR': return 'Médecin Général';
      case 'DOCTOR': return 'Médecin Spécialiste';
      case 'NURSE': return 'Infirmier(ère)';
      case 'SECRETARY': return 'Secrétaire Médicale';
      default: return role;
    }
  };

  return (
    <header className="fixed top-0 left-64 right-0 h-16 bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 z-10">
      <div className="h-full px-6 flex items-center justify-between">
        {/* Title - could be dynamic based on the current page */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Tableau de bord
          </h2>
        </div>

        {/* Right side - User menu */}
        <div className="flex items-center gap-4">
          <ThemeSwitcher />
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                className="flex items-center gap-3 px-4 h-10 border-gray-200 dark:border-gray-800 hover:bg-hover hover:border-gold transition-all"
              >
                <div className="w-8 h-8 rounded-full bg-navy flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div className="text-left hidden md:block">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {getDisplayName()}
                  </p>
                  {profile && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {getRoleLabel(profile.role)}
                    </p>
                  )}
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Mon compte</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {profile && (
                <div className="px-2 py-2">
                  <p className="text-sm font-medium">{getDisplayName()}</p>
                  <p className="text-xs text-muted-foreground">{profile.email}</p>
                  <p className="text-xs text-muted-foreground mt-1">{getRoleLabel(profile.role)}</p>
                </div>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600 dark:text-red-400">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Se déconnecter</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}