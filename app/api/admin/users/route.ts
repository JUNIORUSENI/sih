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

// POST - Créer un nouvel utilisateur
export async function POST(request: NextRequest) {
  try {
    const authCheck = await checkAdminAccess();
    if (!authCheck.authorized) {
      return NextResponse.json(
        { error: authCheck.error },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { email, role, specialty, phone_work, name, postname, surname, password, centre_ids } = body;

    if (!email || !role) {
      return NextResponse.json(
        { error: 'Email et rôle sont requis' },
        { status: 400 }
      );
    }

    if (!name) {
      return NextResponse.json(
        { error: 'Le nom est requis' },
        { status: 400 }
      );
    }

    if (!password || password.length < 8) {
      return NextResponse.json(
        { error: 'Le mot de passe doit contenir au moins 8 caractères' },
        { status: 400 }
      );
    }

    // Utiliser le client admin pour créer l'utilisateur
    const adminClient = createAdminClient();
    
    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        name,
        postname,
        surname
      }
    });

    if (authError) {
      console.error('Erreur création utilisateur:', authError);
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Utilisateur non créé' },
        { status: 500 }
      );
    }

    const userId = authData.user.id;

    // Créer le profil de l'utilisateur
    const supabase = await createClient();
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        role,
        specialty: specialty || null,
        phone_work: phone_work || null,
        name,
        postname: postname || null,
        surname: surname || null
      });

    if (profileError) {
      console.error('Erreur création profil:', profileError);
      // Supprimer l'utilisateur si le profil n'a pas pu être créé
      await adminClient.auth.admin.deleteUser(userId);
      return NextResponse.json(
        { error: 'Erreur lors de la création du profil' },
        { status: 500 }
      );
    }

    // Créer les associations avec les centres
    if (centre_ids && centre_ids.length > 0) {
      const centreAssociations = centre_ids.map((centre_id: string) => ({
        profile_id: userId,
        centre_id
      }));

      const { error: associationError } = await supabase
        .from('profile_centres')
        .insert(centreAssociations);

      if (associationError) {
        console.error('Erreur associations centres:', associationError);
      }
    }

    return NextResponse.json({
      success: true,
      user: {
        id: userId,
        email: authData.user.email
      }
    });

  } catch (error: any) {
    console.error('Erreur serveur:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

// GET - Récupérer la liste des utilisateurs avec leurs profils
export async function GET(request: NextRequest) {
  try {
    const authCheck = await checkAdminAccess();
    if (!authCheck.authorized) {
      return NextResponse.json(
        { error: authCheck.error },
        { status: 403 }
      );
    }

    const adminClient = createAdminClient();
    const supabase = await createClient();

    // Récupérer tous les profils
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select(`
        id,
        role,
        specialty,
        phone_work,
        name,
        postname,
        surname,
        created_at
      `)
      .order('created_at', { ascending: false });

    if (profilesError) {
      console.error('Erreur récupération profils:', profilesError);
      
      // Message d'erreur détaillé pour aider au débogage
      let errorMessage = 'Erreur lors de la récupération des profils';
      
      if (profilesError.message.includes('column') && profilesError.message.includes('does not exist')) {
        errorMessage = 'Les colonnes name, postname ou surname n\'existent pas dans la table profiles. Veuillez exécuter le script de migration SQL.';
      } else {
        errorMessage = `Erreur lors de la récupération des profils: ${profilesError.message}`;
      }
      
      return NextResponse.json(
        { error: errorMessage, details: profilesError },
        { status: 500 }
      );
    }

    // Récupérer les informations auth pour chaque profil
    const staffWithDetails = await Promise.all(
      (profiles || []).map(async (profile) => {
        // Récupérer l'email depuis auth.users
        const { data: userData, error: userError } = await adminClient.auth.admin.getUserById(profile.id);
        
        const email = userData?.user?.email || 'N/A';
        const created_at = userData?.user?.created_at || profile.created_at;

        // Récupérer les centres associés
        const { data: userCentres } = await supabase
          .from('profile_centres')
          .select('centre_id, centres(id, name)')
          .eq('profile_id', profile.id);

        const centres = userCentres?.map((uc: any) => uc.centres).filter(Boolean) || [];

        return {
          id: profile.id,
          email,
          created_at,
          profile: {
            id: profile.id,
            role: profile.role,
            specialty: profile.specialty,
            phone_work: profile.phone_work,
            name: profile.name,
            postname: profile.postname,
            surname: profile.surname
          },
          centres
        };
      })
    );

    return NextResponse.json({ staff: staffWithDetails });

  } catch (error: any) {
    console.error('Erreur serveur:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}