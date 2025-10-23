"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Calendar, Mail, Phone, User, MapPin } from "lucide-react";

interface Centre {
  id: string;
  name: string;
  address: string;
}

interface Profile {
  id: string;
  role: string;
  specialty?: string;
  phone_work?: string;
}

interface UserWithProfile {
  id: string;
  email: string;
  created_at: string;
  profile: Profile;
  centres: Centre[];
}

export function UserProfile({ userId }: { userId: string }) {
  const [user, setUser] = useState<UserWithProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      // Récupérer le profil de l'utilisateur
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select(`
          id,
          role,
          specialty,
          phone_work
        `)
        .eq('id', userId)
        .single();

      if (profileError) throw profileError;

      // Récupérer l'email de l'utilisateur depuis auth
      const { data: userData, error: userError } = await supabase
        .from('auth.users')
        .select('email, created_at')
        .eq('id', userId)
        .single();

      if (userError) throw userError;

      // Récupérer les centres associés à l'utilisateur
      const { data: centreIds, error: centreError } = await supabase
        .from('profile_centres')
        .select('centre_id')
        .eq('profile_id', userId);

      if (centreError) throw centreError;

      let centres: Centre[] = [];
      if (centreIds.length > 0) {
        const centreIdsList = centreIds.map(c => c.centre_id);
        const { data: centresData, error: centresError } = await supabase
          .from('centres')
          .select('id, name, address')
          .in('id', centreIdsList);

        if (centresError) throw centresError;

        centres = centresData || [];
      }

      setUser({
        id: userId,
        email: userData.email,
        created_at: userData.created_at,
        profile: profileData,
        centres: centres
      });
    } catch (error: any) {
      console.error('Erreur lors de la récupération du profil utilisateur:', error);
      toast.error("Erreur lors de la récupération du profil utilisateur");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Profil Utilisateur</h1>
          <p className="text-muted-foreground">Détails du membre du personnel</p>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <p>Chargement du profil...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Profil Utilisateur</h1>
          <p className="text-muted-foreground">Détails du membre du personnel</p>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <p>Utilisateur non trouvé</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profil Utilisateur</h1>
        <p className="text-muted-foreground">Détails du membre du personnel</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Informations Personnelles</CardTitle>
            <CardDescription>Données de base du personnel</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="bg-muted rounded-full p-3">
                <User className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Nom d'utilisateur</p>
                <p className="font-medium">{user.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="bg-muted rounded-full p-3">
                <Mail className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{user.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="bg-muted rounded-full p-3">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Date d'inscription</p>
                <p className="font-medium">{new Date(user.created_at).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="bg-muted rounded-full p-3">
                <Phone className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Téléphone professionnel</p>
                <p className="font-medium">{user.profile.phone_work || "Non renseigné"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Rôles et Spécialités</CardTitle>
            <CardDescription>Informations professionnelles</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Rôle principal</p>
              <Badge variant="outline">
                {user.profile.role === 'ADMIN_SYS' ? 'Administrateur Système' :
                 user.profile.role === 'GENERAL_DOCTOR' ? 'Médecin Généraliste' :
                 user.profile.role === 'DOCTOR' ? 'Médecin Spécialiste' :
                 user.profile.role === 'NURSE' ? 'Infirmier(ère)' :
                 user.profile.role === 'SECRETARY' ? 'Secrétaire Médicale' : user.profile.role}
              </Badge>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-2">Spécialité</p>
              <p className="font-medium">{user.profile.specialty || "Non renseignée"}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-2">Centres d'affectation</p>
              <div className="flex flex-wrap gap-2">
                {user.centres.length > 0 ? (
                  user.centres.map((centre) => (
                    <Badge key={centre.id} variant="secondary">
                      {centre.name}
                    </Badge>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">Aucun centre affecté</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Centres d'affectation</CardTitle>
            <CardDescription>Emplacements professionnels du personnel</CardDescription>
          </CardHeader>
          <CardContent>
            {user.centres.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {user.centres.map((centre) => (
                  <div key={centre.id} className="border rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="bg-muted rounded-full p-2 mt-1">
                        <MapPin className="h-4 w-4" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{centre.name}</h3>
                        <p className="text-sm text-muted-foreground">{centre.address}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">Cet utilisateur n'est affecté à aucun centre.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}