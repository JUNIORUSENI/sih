import { createClient } from "@/lib/supabase/client";

/**
 * Récupère le rôle de l'utilisateur connecté à partir de la table profiles
 * NOTE: Cette fonction peut être utilisée dans les composants client
 */
export async function getUserRoleClient(): Promise<string | null> {
  const supabase = createClient();
  
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
 * NOTE: Cette fonction peut être utilisée dans les composants client
 */
export async function getUserProfileClient() {
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('id, role, specialty, phone_work, email')
    .eq('id', user.id)
    .single();

  if (error) {
    console.error('Erreur lors de la récupération du profil utilisateur:', error);
    return null;
  }

  return data;
}

/**
 * Vérifie si l'utilisateur a un rôle spécifique
 * NOTE: Cette fonction peut être utilisée dans les composants client
 */
export async function hasRoleClient(requiredRole: string): Promise<boolean> {
  const userRole = await getUserRoleClient();
  return userRole === requiredRole;
}

/**
 * Vérifie si l'utilisateur a l'un des rôles spécifiés
 * NOTE: Cette fonction peut être utilisée dans les composants client
 */
export async function hasAnyRoleClient(requiredRoles: string[]): Promise<boolean> {
  const userRole = await getUserRoleClient();
  return userRole ? requiredRoles.includes(userRole) : false;
}

/**
 * Vérifie si l'utilisateur est un administrateur
 * NOTE: Cette fonction peut être utilisée dans les composants client
 */
export async function isAdminClient(): Promise<boolean> {
  const userRole = await getUserRoleClient();
  return userRole === 'ADMIN_SYS' || userRole === 'GENERAL_DOCTOR';
}

/**
 * Vérifie si l'utilisateur est du personnel médical
 * NOTE: Cette fonction peut être utilisée dans les composants client
 */
export async function isMedicalStaffClient(): Promise<boolean> {
  const userRole = await getUserRoleClient();
  return ['DOCTOR', 'NURSE', 'GENERAL_DOCTOR'].includes(userRole || '');
}

/**
 * Vérifie si l'utilisateur est un médecin
 * NOTE: Cette fonction peut être utilisée dans les composants client
 */
export async function isDoctorClient(): Promise<boolean> {
  const userRole = await getUserRoleClient();
  return ['DOCTOR', 'GENERAL_DOCTOR'].includes(userRole || '');
}