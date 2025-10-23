"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Eye, AlertTriangle, Calendar, FileText } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface Patient {
  id: string;
  first_name: string;
  last_name: string;
  medical_record_number: string;
}

interface Profile {
  id: string;
  first_name: string;
  last_name: string;
}

interface Centre {
  id: string;
  name: string;
}

interface Emergency {
  id: string;
  patient_id: string;
  doctor_in_charge_id?: string;
  centre_id: string;
  admission_time: string;
  discharge_time?: string;
  reason: string;
  triage_level: string;
  first_aid_notes?: string;
  medical_notes?: string;
  orientation?: string;
  patient: Patient;
  doctor_in_charge?: Profile;
  centre: Centre;
}

export function EmergencyManagement() {
  const [emergencies, setEmergencies] = useState<Emergency[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Profile[]>([]);
  const [centres, setCentres] = useState<Centre[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    patient_id: "",
    doctor_in_charge_id: "",
    centre_id: "",
    reason: "",
    triage_level: "LOW",
    first_aid_notes: "",
    medical_notes: ""
  });
  
  // États pour la pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTriage, setFilterTriage] = useState("all");
  
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    fetchEmergenciesAndRelatedData();
  }, []);

  const fetchEmergenciesAndRelatedData = async () => {
    try {
      // Calculer l'offset pour la pagination
      const offset = (currentPage - 1) * itemsPerPage;

      // Récupérer le nombre total d'urgences pour la pagination
      const { count, error: countError } = await supabase
        .from('emergencies')
        .select('*', { count: 'exact', head: true });

      if (countError) throw countError;
      setTotalItems(count || 0);

      // Récupérer les urgences avec les informations liées
      const { data: emergenciesData, error: emergenciesError } = await supabase
        .from('emergencies')
        .select(`
          id,
          patient_id,
          doctor_in_charge_id,
          centre_id,
          admission_time,
          discharge_time,
          reason,
          triage_level,
          first_aid_notes,
          medical_notes,
          orientation,
          patient:patients!patient_id(first_name, last_name, medical_record_number),
          doctor_in_charge:profiles!doctor_in_charge_id(first_name, last_name),
          centre:centres!centre_id(name)
        `)
        .order('admission_time', { ascending: false })
        .range(offset, offset + itemsPerPage - 1);

      if (emergenciesError) throw emergenciesError;

      // Transformer les données pour correspondre aux interfaces TypeScript
      // En Supabase, les jointures peuvent retourner des tableaux d'objets au lieu d'objets uniques
      const transformedEmergencies: Emergency[] = (emergenciesData || []).map((emerg: any) => ({
        id: emerg.id,
        patient_id: emerg.patient_id,
        doctor_in_charge_id: emerg.doctor_in_charge_id,
        centre_id: emerg.centre_id,
        admission_time: emerg.admission_time,
        discharge_time: emerg.discharge_time,
        reason: emerg.reason,
        triage_level: emerg.triage_level,
        first_aid_notes: emerg.first_aid_notes,
        medical_notes: emerg.medical_notes,
        orientation: emerg.orientation,
        patient: Array.isArray(emerg.patient) && emerg.patient.length > 0 ? emerg.patient[0] : emerg.patient,
        doctor_in_charge: Array.isArray(emerg.doctor_in_charge) && emerg.doctor_in_charge.length > 0 ? emerg.doctor_in_charge[0] : emerg.doctor_in_charge,
        centre: Array.isArray(emerg.centre) && emerg.centre.length > 0 ? emerg.centre[0] : emerg.centre,
      }));

      setEmergencies(transformedEmergencies);

      // Récupérer les patients
      const { data: patientsData, error: patientsError } = await supabase
        .from('patients')
        .select('id, first_name, last_name, medical_record_number')
        .order('last_name');

      if (patientsError) throw patientsError;

      setPatients(patientsData || []);

      // Récupérer les médecins
      const { data: doctorsData, error: doctorsError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
        .in('role', ['DOCTOR', 'GENERAL_DOCTOR'])
        .order('last_name');

      if (doctorsError) throw doctorsError;

      setDoctors(doctorsData || []);

      // Récupérer les centres
      const { data: centresData, error: centresError } = await supabase
        .from('centres')
        .select('id, name')
        .order('name');

      if (centresError) throw centresError;

      setCentres(centresData || []);
    } catch (error: any) {
      console.error('Erreur lors de la récupération des données:', error);
      toast.error("Erreur lors de la récupération des données d'urgence");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Création d'une nouvelle urgence
      const { error } = await supabase
        .from('emergencies')
        .insert([{
          patient_id: formData.patient_id,
          doctor_in_charge_id: user?.id, // Le médecin connecté est automatiquement assigné
          centre_id: formData.centre_id,
          reason: formData.reason,
          triage_level: formData.triage_level,
          first_aid_notes: formData.first_aid_notes || null,
          medical_notes: formData.medical_notes || null,
          admission_time: new Date().toISOString()
        }]);

      if (error) throw error;

      toast.success("Cas d'urgence enregistré avec succès");
      
      // Réinitialiser le formulaire et fermer la modale
      setFormData({
        patient_id: "",
        doctor_in_charge_id: "",
        centre_id: "",
        reason: "",
        triage_level: "LOW",
        first_aid_notes: "",
        medical_notes: ""
      });
      setIsDialogOpen(false);
      
      // Recharger les données
      fetchEmergenciesAndRelatedData();
    } catch (error: any) {
      console.error('Erreur lors de l\'enregistrement de l\'urgence:', error);
      toast.error("Erreur lors de l'enregistrement de l'urgence");
    }
  };

  const handleViewDetails = (id: string) => {
    router.push(`/emergencies/${id}`);
  };

  const getTriageColor = (level: string) => {
    switch (level) {
      case 'IMMEDIATE': return 'bg-red-100 text-red-800 border-red-200';
      case 'URGENT': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'DELAYED': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'LOW': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTriageLabel = (level: string) => {
    switch (level) {
      case 'IMMEDIATE': return 'Immédiat (Rouge)';
      case 'URGENT': return 'Urgent (Orange)';
      case 'DELAYED': return 'Différé (Jaune)';
      case 'LOW': return 'Bas (Vert)';
      default: return level;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestion des Urgences</h1>
          <p className="text-muted-foreground">Créer, modifier et gérer les cas d'urgence</p>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <p>Chargement des urgences...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Gestion des Urgences</h1>
        <p className="text-muted-foreground">Créer, modifier et gérer les cas d'urgence</p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Urgences</CardTitle>
            <CardDescription>Gérer les cas d'urgence médicaux</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Input
                placeholder="Rechercher des urgences..."
                className="pl-8 w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <FileText className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            </div>
            <Select value={filterTriage} onValueChange={setFilterTriage}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Tous les triages" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les triages</SelectItem>
                <SelectItem value="IMMEDIATE">Immédiat</SelectItem>
                <SelectItem value="URGENT">Urgent</SelectItem>
                <SelectItem value="DELAYED">Différé</SelectItem>
                <SelectItem value="LOW">Bas</SelectItem>
              </SelectContent>
            </Select>
            <Select value={itemsPerPage.toString()} onValueChange={(value) => {
              setItemsPerPage(parseInt(value));
              setCurrentPage(1); // Réinitialiser à la première page lors du changement de taille
            }}>
              <SelectTrigger className="w-20">
                <SelectValue placeholder="10" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  Nouvelle Urgence
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Enregistrer un nouveau cas d'urgence</DialogTitle>
                  <DialogDescription>
                    Remplissez les détails du cas d'urgence
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="patient_id">Patient</Label>
                    <Select value={formData.patient_id} onValueChange={(value) => handleSelectChange('patient_id', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un patient" />
                      </SelectTrigger>
                      <SelectContent>
                        {patients.map((patient) => (
                          <SelectItem key={patient.id} value={patient.id}>
                            {patient.first_name} {patient.last_name} ({patient.medical_record_number})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="centre_id">Centre hospitalier</Label>
                    <Select value={formData.centre_id} onValueChange={(value) => handleSelectChange('centre_id', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un centre" />
                      </SelectTrigger>
                      <SelectContent>
                        {centres.map((centre) => (
                          <SelectItem key={centre.id} value={centre.id}>
                            {centre.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="triage_level">Niveau de triage</Label>
                    <Select value={formData.triage_level} onValueChange={(value) => handleSelectChange('triage_level', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner le niveau de triage" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="IMMEDIATE">Immédiat (Rouge) - Vie menacée</SelectItem>
                        <SelectItem value="URGENT">Urgent (Orange) - Urgent mais pas immédiat</SelectItem>
                        <SelectItem value="DELAYED">Différé (Jaune) - Pas urgent mais nécessite évaluation</SelectItem>
                        <SelectItem value="LOW">Bas (Vert) - Moins urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reason">Raison de l'urgence</Label>
                    <Textarea
                      id="reason"
                      name="reason"
                      value={formData.reason}
                      onChange={handleInputChange}
                      required
                      placeholder="Décrivez la raison de l'urgence"
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="first_aid_notes">Notes des premiers soins</Label>
                    <Textarea
                      id="first_aid_notes"
                      name="first_aid_notes"
                      value={formData.first_aid_notes}
                      onChange={handleInputChange}
                      placeholder="Notes sur les premiers soins prodigués"
                      rows={2}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="medical_notes">Notes médicales</Label>
                    <Textarea
                      id="medical_notes"
                      name="medical_notes"
                      value={formData.medical_notes}
                      onChange={handleInputChange}
                      placeholder="Notes médicales complémentaires"
                      rows={2}
                    />
                  </div>
                  
                  <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Annuler
                    </Button>
                    <Button type="submit">
                      <AlertTriangle className="mr-2 h-4 w-4" />
                      Enregistrer l'urgence
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
                <TableHead>Patient</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Médecin</TableHead>
                <TableHead>Centre</TableHead>
                <TableHead>Raison</TableHead>
                <TableHead>Triage</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {emergencies.map((emergency) => (
                <TableRow key={emergency.id}>
                  <TableCell>
                    <div className="font-medium">
                      {emergency.patient.first_name} {emergency.patient.last_name}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {emergency.patient.medical_record_number}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      {new Date(emergency.admission_time).toLocaleDateString('fr-FR')}
                    </div>
                  </TableCell>
                  <TableCell>
                    {emergency.doctor_in_charge 
                      ? `${emergency.doctor_in_charge.first_name} ${emergency.doctor_in_charge.last_name}`
                      : "Non assigné"}
                  </TableCell>
                  <TableCell>{emergency.centre.name}</TableCell>
                  <TableCell className="max-w-xs truncate">{emergency.reason}</TableCell>
                  <TableCell>
                    <Badge className={getTriageColor(emergency.triage_level)}>
                      {getTriageLabel(emergency.triage_level)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {emergency.discharge_time ? (
                      <Badge variant="outline">Terminée</Badge>
                    ) : (
                      <Badge variant="default">En cours</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewDetails(emergency.id)}
                    >
                      <Eye className="h-4 w-4" />
                      Détails
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {emergencies.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              {totalItems === 0 
                ? "Aucun cas d'urgence trouvé. Enregistrez votre premier cas d'urgence en cliquant sur le bouton 'Nouvelle Urgence'."
                : "Aucun cas d'urgence ne correspond à vos critères de filtrage."}
            </div>
          )}
          
          {/* Contrôles de pagination */}
          {totalItems > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between pt-4 gap-4">
              <div className="text-sm text-muted-foreground">
                Affichage de {(currentPage - 1) * itemsPerPage + 1} à {Math.min(currentPage * itemsPerPage, totalItems)} sur {totalItems} résultats
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Précédent
                </Button>
                
                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, Math.ceil(totalItems / itemsPerPage)) }, (_, i) => {
                    const startPage = Math.max(1, currentPage - 2);
                    const endPage = Math.min(Math.ceil(totalItems / itemsPerPage), startPage + 4);
                    const pageNum = startPage + i;
                    
                    if (pageNum > endPage) return null;
                    
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                        className={currentPage === pageNum ? "bg-blue-600" : ""}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(totalItems / itemsPerPage)))}
                  disabled={currentPage === Math.ceil(totalItems / itemsPerPage)}
                >
                  Suivant
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}