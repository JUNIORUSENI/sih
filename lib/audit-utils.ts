import { createClient } from "@/lib/supabase/server";

/**
 * Fonction utilitaire pour enregistrer un événement d'audit
 */
export async function logAuditEvent(
  action: string,
  resourceType: string,
  resourceId: string,
  oldValues?: any,
  newValues?: any
) {
  const supabase = await createClient();
  
  try {
    // Utiliser la fonction PostgreSQL que nous avons créée
    const { error } = await supabase
      .rpc('log_audit_event', {
        p_action: action,
        p_resource_type: resourceType,
        p_resource_id: resourceId,
        p_old_values: oldValues || null,
        p_new_values: newValues || null
      });

    if (error) {
      console.error('Erreur lors de l\'enregistrement du log d\'audit:', error);
    }
  } catch (error) {
    console.error('Erreur lors de l\'appel de la fonction d\'audit:', error);
  }
}

/**
 * Fonction pour enregistrer une tentative de connexion
 */
export async function logLoginAttempt(userId: string, success: boolean, ipAddress?: string) {
  const supabase = await createClient();
  
  try {
    // Enregistrement dans la table audit_logs
    const { error } = await supabase
      .from('audit_logs')
      .insert([{
        user_id: userId,
        action: success ? 'LOGIN' : 'FAILED_LOGIN',
        resource_type: 'auth',
        resource_id: 'session',
        ip_address: ipAddress ? ipAddress.replace('::ffff:', '') : undefined, // Supprimer le préfixe IPv4 s'il existe
        user_agent: typeof window !== 'undefined' ? navigator.userAgent : undefined
      }]);

    if (error) {
      console.error('Erreur lors de l\'enregistrement de la tentative de connexion:', error);
    }
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement de la tentative de connexion:', error);
  }
}

/**
 * Fonction pour enregistrer une déconnexion
 */
export async function logLogout(userId: string, ipAddress?: string) {
  const supabase = await createClient();
  
  try {
    // Enregistrement dans la table audit_logs
    const { error } = await supabase
      .from('audit_logs')
      .insert([{
        user_id: userId,
        action: 'LOGOUT',
        resource_type: 'auth',
        resource_id: 'session',
        ip_address: ipAddress ? ipAddress.replace('::ffff:', '') : undefined,
        user_agent: typeof window !== 'undefined' ? navigator.userAgent : undefined
      }]);

    if (error) {
      console.error('Erreur lors de l\'enregistrement de la déconnexion:', error);
    }
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement de la déconnexion:', error);
  }
}