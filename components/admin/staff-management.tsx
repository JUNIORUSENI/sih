"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Pencil, Trash2, Eye } from "lucide-react";
import { toast } from "sonner";

interface Centre {
  id: string;
  name: string;
}

interface Profile {
  id: string;
  role: string;
  email: string;
  specialty?: string;
  phone_work?: string;
}

interface UserWithProfile {
  id: string;
  email: string;
  created_at: string;
  profile: Profile | null;
  centres: Centre[];
}

export function StaffManagement() {
  const [staff, setStaff] = useState<UserWithProfile[]>([]);
  const [centres, setCentres] = useState<Centre[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<UserWithProfile | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    role: "",
    specialty: "",
    phone_work: "",
    centre_ids: [] as string[]
  });

  const supabase = createClient();

  useEffect(() => {
    fetchStaffAndCentres();
  }, []);

  const fetchStaffAndCentres = async () => {
    try {
      // Récupérer les centres
      const { data: centresData, error: centresError } = await supabase
        .from('centres')
        .select('*')
        .order('name');

      if (centresError) throw centresError;

      setCentres(centresData || []);

      // Récupérer les utilisateurs avec leurs profils et centres
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          role,
          specialty,
          phone_work,
          auth_users:auth.users!id(email, created_at)
        `)
        .order('created_at', { foreignTable: 'auth.users' });

      if (error) throw error;

      // Formatter les données
      const staffWithDetails = await Promise.all(
        data.map(async (item: any) => {
          // Récupérer les centres associés à l'utilisateur
          const { data: userCentres, error: centreError } = await supabase
            .from('profile_centres')
            .select('centre_id')
            .eq('profile_id', item.id);

          if (centreError) {
            console.error('Erreur lors de la récupération des centres:', centreError);
          }

          const centreIds = userCentres ? userCentres.map((uc: any) => uc.centre_id) : [];
          
          // Récupérer les détails des centres
          const centreDetails = centreIds.length > 0 
            ? await Promise.all(
                centreIds.map(async (centreId: string) => {
                  const { data: centreData, error: centreDetailError } = await supabase
                    .from('centres')
                    .select('id, name')
                    .eq('id', centreId)
                    .single();
                  
                  if (centreDetailError) {
                    console.error('Erreur lors de la récupération du centre:', centreDetailError);
                    return null;
                  }
                  
                  return centreData;
                })
              ).then(results => results.filter(Boolean) as Centre[])
            : [];

          return {
            id: item.id,
            email: item.auth_users?.email || 'N/A',
            created_at: item.auth_users?.created_at || '',
            profile: {
              id: item.id,
              role: item.role,
              email: item.auth_users?.email || 'N/A',
              specialty: item.specialty,
              phone_work: item.phone_work
            },
            centres: centreDetails
          };
        })
      );

      setStaff(staffWithDetails);
    } catch (error: any) {
      console.error('Erreur lors de la récupération des données:', error);
      toast.error("Erreur lors de la récupération des données du personnel");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRoleChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      role: value
    }));
  };

  const handleCentreChange = (centreId: string) => {
    setFormData(prev => {
      const newCentreIds = prev.centre_ids.includes(centreId)
        ? prev.centre_ids.filter(id => id !== centreId)
        : [...prev.centre_ids, centreId];
      return { ...prev, centre_ids: newCentreIds };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Créer l'utilisateur dans Supabase Auth s'il n'existe pas
      let userId = editingUser?.id;
      let email = formData.email;
      
      if (!editingUser) {
        // Créer un nouvel utilisateur dans Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email: formData.email,
          password: Math.random().toString(36).slice(-12) + "!Aa1", // Mot de passe temporaire
          email_confirm: true // Confirmer automatiquement l'email
        });

        if (authError) throw authError;

        userId = authData.user?.id;
        email = authData.user?.email || formData.email;
      }

      if (!userId) throw new Error("L'ID utilisateur n'a pas été retourné");

      // Mettre à jour le profil de l'utilisateur
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert([{
          id: userId,
          role: formData.role,
          specialty: formData.specialty || null,
          phone_work: formData.phone_work || null
        }]);

      if (profileError) throw profileError;

      // Mettre à jour les associations centre-utilisateur
      if (formData.centre_ids.length > 0) {
        // Supprimer les associations existantes
        await supabase
          .from('profile_centres')
          .delete()
          .eq('profile_id', userId);

        // Créer les nouvelles associations
        const centreAssociations = formData.centre_ids.map((centre_id: string) => ({
          profile_id: userId,
          centre_id
        }));

        if (centreAssociations.length > 0) {
          const { error: associationError } = await supabase
            .from('profile_centres')
            .insert(centreAssociations)
            .select();

          if (associationError) throw associationError;
        }
      } else {
        // Si aucun centre n'est sélectionné, supprimer toutes les associations existantes
        await supabase
          .from('profile_centres')
          .delete()
          .eq('profile_id', userId);
      }

      toast.success(editingUser ? "Profil mis à jour avec succès" : "Utilisateur créé avec succès");
      
      // Réinitialiser le formulaire et fermer la modale
      setFormData({ 
        email: "", 
        role: "", 
        specialty: "", 
        phone_work: "", 
        centre_ids: [] 
      });
      setEditingUser(null);
      setIsDialogOpen(false);
      
      // Recharger la liste du personnel
      fetchStaffAndCentres();
    } catch (error: any) {
      console.error('Erreur lors de la sauvegarde de l\'utilisateur:', error);
      toast.error(editingUser ? "Erreur lors de la mise à jour du profil" : "Erreur lors de la création de l'utilisateur");
    }
  };

  const handleEdit = (user: UserWithProfile) => {
    setEditingUser(user);
    setFormData({
      email: user.email,
      role: user.profile?.role || "",
      specialty: user.profile?.specialty || "",
      phone_work: user.profile?.phone_work || "",
      centre_ids: user.centres.map(c => c.id)
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (userId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce membre du personnel ? Cette action est irréversible.")) return;

    try {
      // Supprimer l'utilisateur de la table profiles
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (profileError) throw profileError;

      // Supprimer les associations centre-utilisateur
      await supabase
        .from('profile_centres')
        .delete()
        .eq('profile_id', userId);

      toast.success("Membre du personnel supprimé avec succès");
      fetchStaffAndCentres();
    } catch (error: any) {
      console.error('Erreur lors de la suppression de l\'utilisateur:', error);
      toast.error("Erreur lors de la suppression du membre du personnel");
    }
  };

  const handleNewStaff = () => {
    setEditingUser(null);
    setFormData({ 
      email: "", 
      role: "", 
      specialty: "", 
      phone_work: "", 
      centre_ids: [] 
    });
    setIsDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestion du Personnel</h1>
          <p className="text-muted-foreground">Créer, modifier et gérer les membres du personnel</p>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <p>Chargement du personnel...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Gestion du Personnel</h1>
        <p className="text-muted-foreground">Créer, modifier et gérer les membres du personnel</p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Personnel Hospitalier</CardTitle>
            <CardDescription>Gérer les utilisateurs et leurs rôles</CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleNewStaff}>
                <Plus className="mr-2 h-4 w-4" />
                Nouveau Personnel
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>
                  {editingUser ? "Modifier un membre du personnel" : "Créer un nouveau membre du personnel"}
                </DialogTitle>
                <DialogDescription>
                  {editingUser 
                    ? "Modifiez les informations du membre du personnel"
                    : "Créez un nouveau compte pour un membre du personnel"}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    placeholder="prenom.nom@centre-hospitalier.fr"
                    disabled={!!editingUser} // Ne pas permettre de modifier l'email pour les utilisateurs existants
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="role">Rôle</Label>
                    <Select value={formData.role} onValueChange={handleRoleChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un rôle" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ADMIN_SYS">Administrateur Système</SelectItem>
                        <SelectItem value="GENERAL_DOCTOR">Médecin Généraliste</SelectItem>
                        <SelectItem value="DOCTOR">Médecin Spécialiste</SelectItem>
                        <SelectItem value="NURSE">Infirmier(ère)</SelectItem>
                        <SelectItem value="SECRETARY">Secrétaire Médicale</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone_work">Téléphone professionnel</Label>
                    <Input
                      id="phone_work"
                      name="phone_work"
                      value={formData.phone_work}
                      onChange={handleInputChange}
                      placeholder="+33 1 23 45 67 89"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="specialty">Spécialité (si applicable)</Label>
                  <Input
                    id="specialty"
                    name="specialty"
                    value={formData.specialty}
                    onChange={handleInputChange}
                    placeholder="Cardiologie, Pédiatrie, etc."
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Centres d'affectation</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {centres.map((centre) => (
                      <div key={centre.id} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`centre-${centre.id}`}
                          checked={formData.centre_ids.includes(centre.id)}
                          onChange={() => handleCentreChange(centre.id)}
                          className="mr-2 h-4 w-4"
                        />
                        <label htmlFor={`centre-${centre.id}`} className="text-sm">
                          {centre.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Annuler
                  </Button>
                  <Button type="submit">
                    {editingUser ? "Mettre à jour" : "Créer le membre"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Rôle</TableHead>
                <TableHead>Spécialité</TableHead>
                <TableHead>Centres</TableHead>
                <TableHead>Date d'inscription</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {staff.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.email}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {user.profile?.role === 'ADMIN_SYS' ? 'Admin Système' :
                       user.profile?.role === 'GENERAL_DOCTOR' ? 'Médecin Généraliste' :
                       user.profile?.role === 'DOCTOR' ? 'Médecin Spécialiste' :
                       user.profile?.role === 'NURSE' ? 'Infirmier(ère)' :
                       user.profile?.role === 'SECRETARY' ? 'Secrétaire' : user.profile?.role}
                    </Badge>
                  </TableCell>
                  <TableCell>{user.profile?.specialty || '-'}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {user.centres.length > 0 ? (
                        user.centres.map((centre) => (
                          <Badge key={centre.id} variant="secondary" className="text-xs">
                            {centre.name}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-xs text-muted-foreground">Aucun</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {user.created_at ? new Date(user.created_at).toLocaleDateString() : '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(user)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(user.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {staff.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Aucun membre du personnel trouvé. Créez votre premier membre du personnel en cliquant sur le bouton "Nouveau Personnel".
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}