import { createClient } from "@/lib/supabase/client";
import { ROLES, type UserRole } from "@/lib/auth-utils";
import { 
  getUserRoleClient, 
  hasRoleClient, 
  hasAnyRoleClient, 
  isAdminClient, 
  isMedicalStaffClient 
} from "@/lib/auth-utils-client";

/**
 * Service d'authentification côté client pour le système hospitalier
 */
export class AuthService {
  /**
   * Vérifie si l'utilisateur est authentifié
   */
  static async isAuthenticated(): Promise<boolean> {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    return !!session;
  }

  /**
   * Vérifie si l'utilisateur a un rôle spécifique
   */
  static async hasRole(requiredRole: UserRole): Promise<boolean> {
    return await hasRoleClient(requiredRole as string);
  }

  /**
   * Vérifie si l'utilisateur a l'un des rôles spécifiés
   */
  static async hasAnyRole(requiredRoles: UserRole[]): Promise<boolean> {
    // Convert UserRole[] to string[] for client function
    const roleStrings = requiredRoles.map(role => role as string);
    return await hasAnyRoleClient(roleStrings);
  }

  /**
   * Récupère le rôle de l'utilisateur connecté
   */
  static async getUserRole(): Promise<string | null> {
    return await getUserRoleClient();
  }

  /**
   * Vérifie si l'utilisateur est un administrateur
   */
  static async isAdmin(): Promise<boolean> {
    return await isAdminClient();
  }

  /**
   * Vérifie si l'utilisateur est du personnel médical
   */
  static async isMedicalStaff(): Promise<boolean> {
    return await isMedicalStaffClient();
  }

  /**
   * Déconnecte l'utilisateur
   */
  static async signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    
    // Rediriger vers la page de connexion
    if (typeof window !== 'undefined') {
      window.location.href = '/auth/login';
    }
  }
}