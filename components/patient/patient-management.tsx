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
import { Textarea } from "@/components/ui/textarea";
import { Plus, Pencil, Trash2, Search, Eye } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface Patient {
  id: string;
  medical_record_number: string;
  first_name: string;
  postname?: string;
  surname?: string;
  last_name: string;
  date_of_birth: string;
  gender: string;
  phone?: string;
  email?: string;
  address?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  is_subscriber: boolean;
  blood_group?: string;
  default_centre_id?: string;
  created_at: string;
}

export function PatientManagement() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    medical_record_number: "",
    first_name: "",
    postname: "",
    surname: "",
    last_name: "",
    date_of_birth: "",
    gender: "",
    phone: "",
    email: "",
    address: "",
    emergency_contact_name: "",
    emergency_contact_phone: "",
    is_subscriber: false,
    blood_group: "",
    default_centre_id: ""
  });
  
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .order('last_name');

      if (error) throw error;

      setPatients(data || []);
    } catch (error: any) {
      console.error('Erreur lors de la récupération des patients:', error);
      toast.error("Erreur lors de la récupération des patients");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingPatient) {
        // Mise à jour d'un patient existant
        const { error } = await supabase
          .from('patients')
          .update({
            medical_record_number: formData.medical_record_number,
            first_name: formData.first_name,
            postname: formData.postname || null,
            surname: formData.surname || null,
            last_name: formData.last_name,
            date_of_birth: formData.date_of_birth,
            gender: formData.gender,
            phone: formData.phone || null,
            email: formData.email || null,
            address: formData.address || null,
            emergency_contact_name: formData.emergency_contact_name || null,
            emergency_contact_phone: formData.emergency_contact_phone || null,
            is_subscriber: formData.is_subscriber,
            blood_group: formData.blood_group || null,
            default_centre_id: formData.default_centre_id || null
          })
          .eq('id', editingPatient.id);

        if (error) throw error;
        
        toast.success("Patient mis à jour avec succès");
      } else {
        // Création d'un nouveau patient
        const { error } = await supabase
          .from('patients')
          .insert([{
            medical_record_number: formData.medical_record_number,
            first_name: formData.first_name,
            postname: formData.postname || null,
            surname: formData.surname || null,
            last_name: formData.last_name,
            date_of_birth: formData.date_of_birth,
            gender: formData.gender,
            phone: formData.phone || null,
            email: formData.email || null,
            address: formData.address || null,
            emergency_contact_name: formData.emergency_contact_name || null,
            emergency_contact_phone: formData.emergency_contact_phone || null,
            is_subscriber: formData.is_subscriber,
            blood_group: formData.blood_group || null,
            default_centre_id: formData.default_centre_id || null
          }]);

        if (error) throw error;
        
        toast.success("Patient créé avec succès");
      }

      // Réinitialiser le formulaire et fermer la modale
      setFormData({ 
        medical_record_number: "",
        first_name: "",
        postname: "",
        surname: "",
        last_name: "",
        date_of_birth: "",
        gender: "",
        phone: "",
        email: "",
        address: "",
        emergency_contact_name: "",
        emergency_contact_phone: "",
        is_subscriber: false,
        blood_group: "",
        default_centre_id: ""
      });
      setEditingPatient(null);
      setIsDialogOpen(false);
      
      // Recharger la liste des patients
      fetchPatients();
    } catch (error: any) {
      console.error('Erreur lors de la sauvegarde du patient:', error);
      toast.error(editingPatient ? "Erreur lors de la mise à jour du patient" : "Erreur lors de la création du patient");
    }
  };

  const handleEdit = (patient: Patient) => {
    setEditingPatient(patient);
    setFormData({
      medical_record_number: patient.medical_record_number || "",
      first_name: patient.first_name,
      postname: patient.postname || "",
      surname: patient.surname || "",
      last_name: patient.last_name,
      date_of_birth: patient.date_of_birth,
      gender: patient.gender,
      phone: patient.phone || "",
      email: patient.email || "",
      address: patient.address || "",
      emergency_contact_name: patient.emergency_contact_name || "",
      emergency_contact_phone: patient.emergency_contact_phone || "",
      is_subscriber: patient.is_subscriber,
      blood_group: patient.blood_group || "",
      default_centre_id: patient.default_centre_id || ""
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce patient ? Cette action est irréversible.")) return;

    try {
      const { error } = await supabase
        .from('patients')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success("Patient supprimé avec succès");
      fetchPatients();
    } catch (error: any) {
      console.error('Erreur lors de la suppression du patient:', error);
      toast.error("Erreur lors de la suppression du patient");
    }
  };

  const handleNewPatient = () => {
    setEditingPatient(null);
    setFormData({ 
      medical_record_number: "",
      first_name: "",
      postname: "",
      surname: "",
      last_name: "",
      date_of_birth: "",
      gender: "",
      phone: "",
      email: "",
      address: "",
      emergency_contact_name: "",
      emergency_contact_phone: "",
      is_subscriber: false,
      blood_group: "",
      default_centre_id: ""
    });
    setIsDialogOpen(true);
  };

  const handleViewDetails = (id: string) => {
    router.push(`/patients/${id}`);
  };

  // Filtrer les patients en fonction du terme de recherche
  const filteredPatients = patients.filter(patient => {
    const fullName = `${patient.first_name} ${patient.last_name}`.toLowerCase();
    const recordNumber = patient.medical_record_number?.toLowerCase() || '';
    const searchTermLower = searchTerm.toLowerCase();
    
    return (
      fullName.includes(searchTermLower) ||
      recordNumber.includes(searchTermLower) ||
      patient.phone?.toLowerCase().includes(searchTermLower) ||
      patient.email?.toLowerCase().includes(searchTermLower)
    );
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestion des Patients</h1>
          <p className="text-muted-foreground">Créer, modifier et gérer les dossiers patients</p>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <p>Chargement des patients...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Gestion des Patients</h1>
        <p className="text-muted-foreground">Créer, modifier et gérer les dossiers patients</p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Dossiers Patients</CardTitle>
            <CardDescription>Rechercher et gérer les informations des patients</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par nom, numéro de dossier, téléphone ou email..."
                className="pl-8 w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={handleNewPatient}>
                  <Plus className="mr-2 h-4 w-4" />
                  Nouveau Patient
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingPatient ? "Modifier un patient" : "Créer un nouveau patient"}
                  </DialogTitle>
                  <DialogDescription>
                    {editingPatient 
                      ? "Modifiez les informations du patient"
                      : "Remplissez les détails du nouveau patient"}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="medical_record_number">N° Dossier Médical</Label>
                      <Input
                        id="medical_record_number"
                        name="medical_record_number"
                        value={formData.medical_record_number}
                        onChange={handleInputChange}
                        required
                        placeholder="Ex: PAT-2025-001"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="first_name">Prénom</Label>
                      <Input
                        id="first_name"
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleInputChange}
                        required
                        placeholder="Prénom"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="surname">Nom de famille</Label>
                      <Input
                        id="surname"
                        name="surname"
                        value={formData.surname}
                        onChange={handleInputChange}
                        placeholder="Nom de famille"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="last_name">Nom usuel</Label>
                      <Input
                        id="last_name"
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleInputChange}
                        required
                        placeholder="Nom usuel"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="date_of_birth">Date de naissance</Label>
                      <Input
                        id="date_of_birth"
                        name="date_of_birth"
                        type="date"
                        value={formData.date_of_birth}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="gender">Sexe</Label>
                      <Select value={formData.gender} onValueChange={(value) => setFormData(prev => ({...prev, gender: value}))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner le sexe" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="MALE">Homme</SelectItem>
                          <SelectItem value="FEMALE">Femme</SelectItem>
                          <SelectItem value="OTHER">Autre</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
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
                        placeholder="patient@example.com"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Adresse</Label>
                    <Textarea
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="Adresse complète du patient"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="emergency_contact_name">Contact d'urgence - Nom</Label>
                      <Input
                        id="emergency_contact_name"
                        name="emergency_contact_name"
                        value={formData.emergency_contact_name}
                        onChange={handleInputChange}
                        placeholder="Nom du contact d'urgence"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="emergency_contact_phone">Contact d'urgence - Téléphone</Label>
                      <Input
                        id="emergency_contact_phone"
                        name="emergency_contact_phone"
                        value={formData.emergency_contact_phone}
                        onChange={handleInputChange}
                        placeholder="+33 1 23 45 67 89"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="blood_group">Groupe sanguin</Label>
                      <Select value={formData.blood_group} onValueChange={(value) => setFormData(prev => ({...prev, blood_group: value}))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner le groupe sanguin" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="A+">A+</SelectItem>
                          <SelectItem value="A-">A-</SelectItem>
                          <SelectItem value="B+">B+</SelectItem>
                          <SelectItem value="B-">B-</SelectItem>
                          <SelectItem value="AB+">AB+</SelectItem>
                          <SelectItem value="AB-">AB-</SelectItem>
                          <SelectItem value="O+">O+</SelectItem>
                          <SelectItem value="O-">O-</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="is_subscriber">Abonné</Label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="is_subscriber"
                          name="is_subscriber"
                          checked={formData.is_subscriber}
                          onChange={handleInputChange}
                          className="h-4 w-4"
                        />
                        <Label htmlFor="is_subscriber" className="text-sm font-normal">
                          Le patient est abonné à un plan de santé
                        </Label>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Annuler
                    </Button>
                    <Button type="submit">
                      {editingPatient ? "Mettre à jour" : "Créer le patient"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>N° Dossier</TableHead>
                <TableHead>Nom</TableHead>
                <TableHead>Date de naissance</TableHead>
                <TableHead>Sexe</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Abonné</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPatients.map((patient) => (
                <TableRow key={patient.id}>
                  <TableCell className="font-medium">{patient.medical_record_number || 'N/A'}</TableCell>
                  <TableCell>{patient.first_name} {patient.last_name}</TableCell>
                  <TableCell>{new Date(patient.date_of_birth).toLocaleDateString()}</TableCell>
                  <TableCell>
                    {patient.gender === 'MALE' ? 'Homme' : 
                     patient.gender === 'FEMALE' ? 'Femme' : 'Autre'}
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {patient.phone && <div className="text-sm">{patient.phone}</div>}
                      {patient.email && <div className="text-sm text-muted-foreground">{patient.email}</div>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={patient.is_subscriber ? "default" : "outline"}>
                      {patient.is_subscriber ? "Oui" : "Non"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewDetails(patient.id)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(patient)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(patient.id)}
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
          
          {filteredPatients.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              {patients.length === 0 
                ? "Aucun patient trouvé. Créez votre premier patient en cliquant sur le bouton 'Nouveau Patient'."
                : "Aucun patient ne correspond à votre recherche."}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}