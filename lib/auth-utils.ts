import { createClient } from "@/lib/supabase/server";

/**
 * Récupère le rôle de l'utilisateur connecté à partir de la table profiles
 * NOTE: Cette fonction ne peut être utilisée que dans un composant serveur
 */
export async function getUserRoleServer(): Promise<string | null> {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (error) {
    console.error('Erreur lors de la récupération du rôle utilisateur:', error);
    return null;
  }

  return data?.role || null;
}

/**
 * Récupère les informations complètes du profil utilisateur
 * NOTE: Cette fonction ne peut être utilisée que dans un composant serveur
 */
export async function getUserProfileServer() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('id, role, specialty, phone_work')
    .eq('id', user.id)
    .single();

  if (error) {
    console.error('Erreur lors de la récupération du profil utilisateur:', error);
    return null;
  }

  return {
    ...data,
    email: user.email
  };
}

/**
 * Rôles disponibles dans le système hospitalier
 */
export const ROLES = {
  ADMIN_SYS: 'ADMIN_SYS',
  GENERAL_DOCTOR: 'GENERAL_DOCTOR',
  DOCTOR: 'DOCTOR',
  NURSE: 'NURSE',
  SECRETARY: 'SECRETARY'
} as const;

export type UserRole = keyof typeof ROLES;

/**
 * Obtient la description du rôle pour l'affichage
 */
export function getRoleDescription(role: string): string {
  switch(role) {
    case 'ADMIN_SYS':
      return 'Administrateur Système';
    case 'GENERAL_DOCTOR':
      return 'Médecin Général';
    case 'DOCTOR':
      return 'Médecin Spécialiste';
    case 'NURSE':
      return 'Infirmier(ère)';
    case 'SECRETARY':
      return 'Secrétaire Médicale';
    default:
      return 'Rôle inconnu';
  }
}