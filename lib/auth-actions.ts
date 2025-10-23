"use server";

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ROLES, type UserRole } from "@/lib/auth-utils";
import { logLogout } from "@/lib/audit-utils";

/**
 * Actions d'authentification côté serveur pour le système hospitalier
 */

/**
 * Vérifie si l'utilisateur est authentifié
 */
export async function isAuthenticated(): Promise<boolean> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return !!user;
}

/**
 * Vérifie si l'utilisateur a un rôle spécifique
 */
export async function hasRole(requiredRole: UserRole): Promise<boolean> {
  const userRole = await getUserRole();
  return userRole === requiredRole;
}

/**
 * Vérifie si l'utilisateur a l'un des rôles spécifiés
 */
export async function hasAnyRole(requiredRoles: UserRole[]): Promise<boolean> {
  const userRole = await getUserRole();
  return userRole ? requiredRoles.includes(userRole as UserRole) : false;
}

/**
 * Récupère le rôle de l'utilisateur connecté
 */
export async function getUserRole(): Promise<string | null> {
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

  return data?.role ?? null;
}

/**
 * Redirige l'utilisateur en fonction de son rôle
 */
export async function redirectToDashboard() {
  const userRole = await getUserRole();
  
  switch(userRole) {
    case 'ADMIN_SYS':
    case 'GENERAL_DOCTOR':
      redirect("/admin");
      break;
    case 'DOCTOR':
      redirect("/medical");
      break;
    case 'NURSE':
      redirect("/nurse");
      break;
    case 'SECRETARY':
      redirect("/secretary");
      break;
    default:
      redirect("/protected");
  }
}

/**
 * Vérifie l'accès pour un rôle spécifique et redirige si non autorisé
 */
export async function requireRole(requiredRole: UserRole, redirectTo: string = "/protected") {
  const hasAccess = await hasRole(requiredRole);
  if (!hasAccess) {
    redirect(redirectTo);
  }
}

/**
 * Vérifie l'accès pour un ou plusieurs rôles et redirige si non autorisé
 */
export async function requireAnyRole(requiredRoles: UserRole[], redirectTo: string = "/protected") {
  const hasAccess = await hasAnyRole(requiredRoles);
  if (!hasAccess) {
    redirect(redirectTo);
  }
}

/**
 * Vérifie si l'utilisateur est un administrateur
 */
export async function isAdmin(): Promise<boolean> {
  const userRole = await getUserRole();
  return userRole === 'ADMIN_SYS' || userRole === 'GENERAL_DOCTOR';
}

/**
 * Vérifie si l'utilisateur est du personnel médical
 */
export async function isMedicalStaff(): Promise<boolean> {
  const userRole = await getUserRole();
  return ['DOCTOR', 'NURSE', 'GENERAL_DOCTOR'].includes(userRole || '');
}

/**
 * Déconnecte l'utilisateur
 */
export async function signOut() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  const { error } = await supabase.auth.signOut();
  
  if (error) {
    console.error('Erreur lors de la déconnexion:', error);
  }
  
  // Enregistrer la déconnexion dans les logs d'audit si l'utilisateur était connecté
  if (user) {
    await logLogout(user.id);
  }
  
  // Rediriger vers la page de connexion
  redirect('/auth/login');
}

/**
 * Invite un nouvel utilisateur (cette fonction est réservée aux administrateurs)
 */
export async function inviteUser(email: string, role: string) {
  const supabase = await createClient();
  
  // Vérifier que l'utilisateur actuel est un administrateur
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('Utilisateur non authentifié');
  }
  
  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();
  
  if (profileError || !profileData) {
    throw new Error('Profil utilisateur non trouvé');
  }
  
  const currentUserRole = profileData.role;
  if (currentUserRole !== 'ADMIN_SYS' && currentUserRole !== 'GENERAL_DOCTOR') {
    throw new Error('Accès refusé: Seuls les administrateurs peuvent inviter de nouveaux utilisateurs');
  }
  
  try {
    // Créer l'utilisateur via l'API d'authentification Supabase
    // Utiliser un mot de passe temporaire qui devra être changé à la première connexion
    const tempPassword = Math.random().toString(36).slice(-12) + "!Aa1";
    
    const { data, error } = await supabase.auth.admin.createUser({
      email: email,
      password: tempPassword, // Mot de passe temporaire
      email_confirm: true, // L'email est considéré comme confirmé pour les invitations admin
    });
    
    if (error) {
      console.error('Erreur lors de la création de l\'utilisateur:', error);
      throw error;
    }
    
    const userId = data.user?.id;
    if (!userId) {
      throw new Error('L\'ID utilisateur n\'a pas été retourné après la création');
    }
    
    // Créer le profil avec le rôle approprié
    const { error: profileError } = await supabase
      .from('profiles')
      .insert([{ 
        id: userId, 
        role: role 
      }]);
    
    if (profileError) {
      console.error('Erreur lors de la création du profil utilisateur:', profileError);
      // Si le profil échoue, on supprime l'utilisateur créé
      await supabase.auth.admin.deleteUser(userId);
      throw profileError;
    }
    
    // Dans une implémentation complète, vous voudriez envoyer un email
    // avec les instructions de réinitialisation de mot de passe
    // Cela nécessiterait une configuration de service d'email
    
    return { success: true, userId };
  } catch (error) {
    console.error('Erreur lors de l\'invitation de l\'utilisateur:', error);
    throw error;
  }
}