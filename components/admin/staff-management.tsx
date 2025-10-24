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
import { Plus, Pencil, Trash2, Users } from "lucide-react";
import { toast } from "sonner";
import { ErrorDisplay } from "@/components/ui/error-display";

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
  name: string;
  postname?: string;
  surname?: string;
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
  const [error, setError] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<UserWithProfile | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    role: "",
    specialty: "",
    phone_work: "",
    name: "",
    postname: "",
    surname: "",
    password: "",
    centre_ids: [] as string[]
  });

  const supabase = createClient();

  useEffect(() => {
    fetchStaffAndCentres();
  }, []);

  const fetchStaffAndCentres = async () => {
    try {
      setError(null);
      
      // Récupérer les centres
      const { data: centresData, error: centresError } = await supabase
        .from('centres')
        .select('*')
        .order('name');

      if (centresError) {
        console.error('Erreur centres:', centresError);
        throw new Error(`Erreur lors de la récupération des centres: ${centresError.message}`);
      }

      setCentres(centresData || []);

      // Récupérer les utilisateurs via l'API
      const response = await fetch('/api/admin/users');
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Erreur de connexion au serveur' }));
        throw new Error(errorData.error || 'Erreur lors de la récupération du personnel');
      }

      const { staff: staffData } = await response.json();
      setStaff(staffData || []);
    } catch (error: any) {
      console.error('Erreur lors de la récupération des données:', error);
      const errorMessage = error.message || "Erreur lors de la récupération des données du personnel";
      setError(errorMessage);
      toast.error(errorMessage);
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
      if (!editingUser) {
        // Créer un nouvel utilisateur via l'API
        const response = await fetch('/api/admin/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: formData.email,
            role: formData.role,
            specialty: formData.specialty,
            phone_work: formData.phone_work,
            name: formData.name,
            postname: formData.postname,
            surname: formData.surname,
            password: formData.password,
            centre_ids: formData.centre_ids
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Erreur lors de la création de l\'utilisateur');
        }

        toast.success("Utilisateur créé avec succès");
      } else {
        // Mettre à jour un utilisateur existant via l'API
        const response = await fetch(`/api/admin/users/${editingUser.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            role: formData.role,
            specialty: formData.specialty,
            phone_work: formData.phone_work,
            name: formData.name,
            postname: formData.postname,
            surname: formData.surname,
            centre_ids: formData.centre_ids
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Erreur lors de la mise à jour du profil');
        }

        toast.success("Profil mis à jour avec succès");
      }
      
      // Réinitialiser le formulaire et fermer la modale
      setFormData({
        email: "",
        role: "",
        specialty: "",
        phone_work: "",
        name: "",
        postname: "",
        surname: "",
        password: "",
        centre_ids: []
      });
      setEditingUser(null);
      setIsDialogOpen(false);
      
      // Recharger la liste du personnel
      fetchStaffAndCentres();
    } catch (error: any) {
      console.error('Erreur lors de la sauvegarde de l\'utilisateur:', error);
      toast.error(error.message || "Erreur lors de l'opération");
    }
  };

  const handleEdit = (user: UserWithProfile) => {
    setEditingUser(user);
    setFormData({
      email: user.email,
      role: user.profile?.role || "",
      specialty: user.profile?.specialty || "",
      phone_work: user.profile?.phone_work || "",
      name: user.profile?.name || "",
      postname: user.profile?.postname || "",
      surname: user.profile?.surname || "",
      password: "",
      centre_ids: user.centres.map(c => c.id)
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (userId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce membre du personnel ? Cette action est irréversible.")) return;

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la suppression');
      }

      toast.success("Membre du personnel supprimé avec succès");
      fetchStaffAndCentres();
    } catch (error: any) {
      console.error('Erreur lors de la suppression de l\'utilisateur:', error);
      toast.error(error.message || "Erreur lors de la suppression du membre du personnel");
    }
  };

  const handleNewStaff = () => {
    setEditingUser(null);
    setFormData({
      email: "",
      role: "",
      specialty: "",
      phone_work: "",
      name: "",
      postname: "",
      surname: "",
      password: "",
      centre_ids: []
    });
    setIsDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Gestion du Personnel</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Créer, modifier et gérer les membres du personnel</p>
          </div>
        </div>
        <Card className="border-gray-200 dark:border-gray-800">
          <CardContent className="flex items-center justify-center h-64">
            <p className="text-gray-600 dark:text-gray-400">Chargement du personnel...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <ErrorDisplay
          title="Erreur de chargement"
          message={error}
          type="error"
          onRetry={() => {
            setLoading(true);
            fetchStaffAndCentres();
          }}
          onDismiss={() => setError(null)}
        />
      )}
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Gestion du Personnel</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Créer, modifier et gérer les membres du personnel</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleNewStaff} className="bg-gold hover:bg-gold-dark text-white">
              <Plus className="mr-2 h-4 w-4" />
              Nouveau Personnel
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
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
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  placeholder="prenom.nom@centre-hospitalier.fr"
                  disabled={!!editingUser}
                />
              </div>

              {!editingUser && (
                <div className="space-y-2">
                  <Label htmlFor="password">Mot de passe *</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    placeholder="Minimum 8 caractères"
                    minLength={8}
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    L'utilisateur pourra modifier ce mot de passe après sa première connexion
                  </p>
                </div>
              )}
              
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="Dupont"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="postname">Postnom</Label>
                  <Input
                    id="postname"
                    name="postname"
                    value={formData.postname}
                    onChange={handleInputChange}
                    placeholder="Marie"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="surname">Prénom</Label>
                  <Input
                    id="surname"
                    name="surname"
                    value={formData.surname}
                    onChange={handleInputChange}
                    placeholder="Jean"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="role">Rôle *</Label>
                  <Select value={formData.role} onValueChange={handleRoleChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un rôle" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ADMIN_SYS">Administrateur Système</SelectItem>
                      <SelectItem value="GENERAL_DOCTOR">Médecin Général</SelectItem>
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
                <Button type="submit" className="bg-gold hover:bg-gold-dark">
                  {editingUser ? "Mettre à jour" : "Créer le membre"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-gray-200 dark:border-gray-800 shadow-sm">
        <CardHeader className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl text-gray-900 dark:text-white">Personnel Hospitalier</CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                {staff.length} membre{staff.length > 1 ? 's' : ''} du personnel
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-900">
                  <TableHead className="font-semibold text-gray-900 dark:text-white">Nom</TableHead>
                  <TableHead className="font-semibold text-gray-900 dark:text-white">Email</TableHead>
                  <TableHead className="font-semibold text-gray-900 dark:text-white">Rôle</TableHead>
                  <TableHead className="font-semibold text-gray-900 dark:text-white">Spécialité</TableHead>
                  <TableHead className="font-semibold text-gray-900 dark:text-white">Centres</TableHead>
                  <TableHead className="font-semibold text-gray-900 dark:text-white">Date</TableHead>
                  <TableHead className="text-right font-semibold text-gray-900 dark:text-white">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {staff.map((user) => (
                  <TableRow key={user.id} className="hover:bg-hover dark:hover:bg-gray-800 transition-colors">
                    <TableCell className="font-medium text-gray-900 dark:text-white">
                      {[user.profile?.surname, user.profile?.postname, user.profile?.name].filter(Boolean).join(' ') || 'N/A'}
                    </TableCell>
                    <TableCell className="text-gray-600 dark:text-gray-400">{user.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="border-navy text-navy dark:border-gold dark:text-gold">
                        {user.profile?.role === 'ADMIN_SYS' ? 'Admin' :
                         user.profile?.role === 'GENERAL_DOCTOR' ? 'Méd. Gén.' :
                         user.profile?.role === 'DOCTOR' ? 'Médecin' :
                         user.profile?.role === 'NURSE' ? 'Infirmier' :
                         user.profile?.role === 'SECRETARY' ? 'Secrétaire' : user.profile?.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-600 dark:text-gray-400">{user.profile?.specialty || '-'}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {user.centres.length > 0 ? (
                          user.centres.map((centre) => (
                            <Badge key={centre.id} variant="secondary" className="text-xs bg-gold/10 text-gold border-gold/20">
                              {centre.name}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-xs text-gray-400 dark:text-gray-500">Aucun</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-600 dark:text-gray-400 text-sm">
                      {user.created_at ? new Date(user.created_at).toLocaleDateString('fr-FR') : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(user)}
                          className="hover:bg-navy/10 hover:text-navy dark:hover:bg-gold/10 dark:hover:text-gold"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(user.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {staff.length === 0 && (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">Aucun membre du personnel</p>
              <p className="text-sm">Créez votre premier membre du personnel en cliquant sur le bouton "Nouveau Personnel".</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}