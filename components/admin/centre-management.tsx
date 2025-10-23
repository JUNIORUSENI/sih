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
import { Plus, Pencil, Trash2, Eye } from "lucide-react";
import { toast } from "sonner";

interface Centre {
  id: string;
  name: string;
  address: string;
  phone?: string;
  email?: string;
}

export function CentreManagement() {
  const [centres, setCentres] = useState<Centre[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCentre, setEditingCentre] = useState<Centre | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone: "",
    email: ""
  });

  const supabase = createClient();

  useEffect(() => {
    fetchCentres();
  }, []);

  const fetchCentres = async () => {
    try {
      const { data, error } = await supabase
        .from('centres')
        .select('*')
        .order('name');

      if (error) throw error;

      setCentres(data || []);
    } catch (error: any) {
      console.error('Erreur lors de la récupération des centres:', error);
      toast.error("Erreur lors de la récupération des centres");
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingCentre) {
        // Mise à jour d'un centre existant
        const { error } = await supabase
          .from('centres')
          .update({
            name: formData.name,
            address: formData.address,
            phone: formData.phone,
            email: formData.email
          })
          .eq('id', editingCentre.id);

        if (error) throw error;
        
        toast.success("Centre mis à jour avec succès");
      } else {
        // Création d'un nouveau centre
        const { error } = await supabase
          .from('centres')
          .insert([{
            name: formData.name,
            address: formData.address,
            phone: formData.phone,
            email: formData.email
          }]);

        if (error) throw error;
        
        toast.success("Centre créé avec succès");
      }

      // Réinitialiser le formulaire et fermer la modale
      setFormData({ name: "", address: "", phone: "", email: "" });
      setEditingCentre(null);
      setIsDialogOpen(false);
      
      // Recharger la liste des centres
      fetchCentres();
    } catch (error: any) {
      console.error('Erreur lors de la sauvegarde du centre:', error);
      toast.error(editingCentre ? "Erreur lors de la mise à jour du centre" : "Erreur lors de la création du centre");
    }
  };

  const handleEdit = (centre: Centre) => {
    setEditingCentre(centre);
    setFormData({
      name: centre.name,
      address: centre.address,
      phone: centre.phone || "",
      email: centre.email || ""
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce centre ?")) return;

    try {
      const { error } = await supabase
        .from('centres')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success("Centre supprimé avec succès");
      fetchCentres();
    } catch (error: any) {
      console.error('Erreur lors de la suppression du centre:', error);
      toast.error("Erreur lors de la suppression du centre");
    }
  };

  const handleNewCentre = () => {
    setEditingCentre(null);
    setFormData({ name: "", address: "", phone: "", email: "" });
    setIsDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestion des Centres</h1>
          <p className="text-muted-foreground">Créer, modifier et gérer les centres hospitaliers</p>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <p>Chargement des centres...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Gestion des Centres</h1>
        <p className="text-muted-foreground">Créer, modifier et gérer les centres hospitaliers</p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Liste des Centres</CardTitle>
            <CardDescription>Gérer les centres hospitaliers</CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleNewCentre}>
                <Plus className="mr-2 h-4 w-4" />
                Nouveau Centre
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>
                  {editingCentre ? "Modifier un centre" : "Créer un nouveau centre"}
                </DialogTitle>
                <DialogDescription>
                  {editingCentre 
                    ? "Modifiez les informations du centre"
                    : "Remplissez les détails du nouveau centre"}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom du centre</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="Centre Hospitalier Universitaire"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Adresse</Label>
                  <Input
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                    placeholder="123 Rue de l'Hôpital, 75000 Paris"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+33 1 23 45 67 89"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="contact@centre-hospitalier.fr"
                  />
                </div>
                
                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Annuler
                  </Button>
                  <Button type="submit">
                    {editingCentre ? "Mettre à jour" : "Créer le centre"}
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
                <TableHead>Nom</TableHead>
                <TableHead>Adresse</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {centres.map((centre) => (
                <TableRow key={centre.id}>
                  <TableCell className="font-medium">{centre.name}</TableCell>
                  <TableCell>{centre.address}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {centre.phone && <div className="text-sm">{centre.phone}</div>}
                      {centre.email && <div className="text-sm text-muted-foreground">{centre.email}</div>}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(centre)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(centre.id)}
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
          
          {centres.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Aucun centre trouvé. Créez votre premier centre en cliquant sur le bouton "Nouveau Centre".
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}