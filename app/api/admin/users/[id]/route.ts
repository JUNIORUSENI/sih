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

// PUT - Mettre à jour un utilisateur
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authCheck = await checkAdminAccess();
    if (!authCheck.authorized) {
      return NextResponse.json(
        { error: authCheck.error },
        { status: 403 }
      );
    }

    const userId = params.id;
    const body = await request.json();
    const { role, specialty, phone_work, name, postname, surname, centre_ids } = body;

    if (!role) {
      return NextResponse.json(
        { error: 'Le rôle est requis' },
        { status: 400 }
      );
    }

    if (!name) {
      return NextResponse.json(
        { error: 'Le nom est requis' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Mettre à jour le profil
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        role,
        specialty: specialty || null,
        phone_work: phone_work || null,
        name,
        postname: postname || null,
        surname: surname || null
      })
      .eq('id', userId);

    if (profileError) {
      console.error('Erreur mise à jour profil:', profileError);
      return NextResponse.json(
        { error: 'Erreur lors de la mise à jour du profil' },
        { status: 500 }
      );
    }

    // Mettre à jour les associations avec les centres
    // D'abord supprimer les associations existantes
    await supabase
      .from('profile_centres')
      .delete()
      .eq('profile_id', userId);

    // Créer les nouvelles associations
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
        return NextResponse.json(
          { error: 'Erreur lors de la mise à jour des centres' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Profil mis à jour avec succès'
    });

  } catch (error: any) {
    console.error('Erreur serveur:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer un utilisateur
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authCheck = await checkAdminAccess();
    if (!authCheck.authorized) {
      return NextResponse.json(
        { error: authCheck.error },
        { status: 403 }
      );
    }

    const userId = params.id;
    const supabase = await createClient();
    const adminClient = createAdminClient();

    // Supprimer les associations centre-utilisateur
    await supabase
      .from('profile_centres')
      .delete()
      .eq('profile_id', userId);

    // Supprimer le profil
    const { error: profileError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId);

    if (profileError) {
      console.error('Erreur suppression profil:', profileError);
      return NextResponse.json(
        { error: 'Erreur lors de la suppression du profil' },
        { status: 500 }
      );
    }

    // Supprimer l'utilisateur de auth
    const { error: authError } = await adminClient.auth.admin.deleteUser(userId);

    if (authError) {
      console.error('Erreur suppression utilisateur auth:', authError);
      // On continue même si la suppression de auth échoue
    }

    return NextResponse.json({
      success: true,
      message: 'Utilisateur supprimé avec succès'
    });

  } catch (error: any) {
    console.error('Erreur serveur:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}