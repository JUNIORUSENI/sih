import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

// Vérifier que l'utilisateur est admin
async function checkAdminAccess() {
  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    return { authorized: false, error: 'Non authentifié' };
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profileError || !profile) {
    return { authorized: false, error: 'Profil non trouvé' };
  }

  const isAdmin = profile.role === 'ADMIN_SYS' || profile.role === 'GENERAL_DOCTOR';
  
  if (!isAdmin) {
    return { authorized: false, error: 'Accès refusé' };
  }

  return { authorized: true, userId: user.id };
}

// GET - Récupérer les logs d'audit
export async function GET(request: NextRequest) {
  try {
    const authCheck = await checkAdminAccess();
    if (!authCheck.authorized) {
      return NextResponse.json(
        { error: authCheck.error },
        { status: 403 }
      );
    }

    const supabase = await createClient();
    const adminClient = createAdminClient();

    // Récupérer les logs d'audit
    const { data: logsData, error: logsError } = await supabase
      .from('audit_logs')
      .select(`
        id,
        user_id,
        action,
        resource_type,
        resource_id,
        old_values,
        new_values,
        ip_address,
        user_agent,
        created_at
      `)
      .order('created_at', { ascending: false })
      .limit(100);

    if (logsError) {
      console.error('Erreur récupération logs:', logsError);
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des logs d\'audit' },
        { status: 500 }
      );
    }

    // Récupérer les emails des utilisateurs
    const logsWithEmails = await Promise.all(
      (logsData || []).map(async (log) => {
        let user_email = 'Utilisateur inconnu';
        
        if (log.user_id) {
          try {
            const { data: userData, error: userError } = await adminClient.auth.admin.getUserById(log.user_id);
            if (!userError && userData?.user) {
              user_email = userData.user.email || 'Utilisateur inconnu';
            }
          } catch (error) {
            console.error('Erreur récupération utilisateur:', error);
          }
        }
        
        return {
          ...log,
          user_email
        };
      })
    );

    return NextResponse.json({ logs: logsWithEmails });

  } catch (error: any) {
    console.error('Erreur serveur:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}