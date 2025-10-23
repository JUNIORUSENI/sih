"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Calendar, Mail, Phone, MapPin, HeartPulse, Syringe, Stethoscope, Activity, Plus } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Centre {
  id: string;
  name: string;
  address: string;
}

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

interface Allergy {
  id: string;
  substance: string;
  severity: string;
  notes?: string;
}

interface MedicalHistory {
  id: string;
  condition_name: string;
  diagnosis_date: string;
  is_active: boolean;
  notes?: string;
}

interface Vaccination {
  id: string;
  vaccine_name: string;
  date_administered: string;
}

interface Appointment {
  id: string;
  start_time: string;
  end_time: string;
  reason?: string;
  status: string;
  doctor: {
    first_name: string;
    last_name: string;
  };
  centre: {
    name: string;
  };
}

export function PatientDetail({ patientId }: { patientId: string }) {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [allergies, setAllergies] = useState<Allergy[]>([]);
  const [medicalHistory, setMedicalHistory] = useState<MedicalHistory[]>([]);
  const [vaccinations, setVaccinations] = useState<Vaccination[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [consultations, setConsultations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // États pour les modales
  const [isAllergyDialogOpen, setIsAllergyDialogOpen] = useState(false);
  const [isMedicalHistoryDialogOpen, setIsMedicalHistoryDialogOpen] = useState(false);
  const [isVaccinationDialogOpen, setIsVaccinationDialogOpen] = useState(false);
  const [isConsultationDialogOpen, setIsConsultationDialogOpen] = useState(false);
  
  // États pour les formulaires
  const [newAllergy, setNewAllergy] = useState({ substance: "", severity: "", notes: "" });
  const [newMedicalHistory, setNewMedicalHistory] = useState({ condition_name: "", diagnosis_date: "", is_active: true, notes: "" });
  const [newVaccination, setNewVaccination] = useState({ vaccine_name: "", date_administered: "" });

  const supabase = createClient();

  useEffect(() => {
    fetchPatientDetails();
  }, []);

  const fetchPatientDetails = async () => {
    try {
      // Récupérer les détails du patient
      const { data: patientData, error: patientError } = await supabase
        .from('patients')
        .select('*')
        .eq('id', patientId)
        .single();

      if (patientError) throw patientError;

      setPatient(patientData);

      // Récupérer les allergies du patient
      const { data: allergiesData, error: allergiesError } = await supabase
        .from('allergies')
        .select('*')
        .eq('patient_id', patientId);

      if (allergiesError) throw allergiesError;

      setAllergies(allergiesData || []);

      // Récupérer l'historique médical du patient
      const { data: medicalHistoryData, error: medicalHistoryError } = await supabase
        .from('medical_history')
        .select('*')
        .eq('patient_id', patientId);

      if (medicalHistoryError) throw medicalHistoryError;

      setMedicalHistory(medicalHistoryData || []);

      // Récupérer les vaccinations du patient
      const { data: vaccinationsData, error: vaccinationsError } = await supabase
        .from('vaccination_records')
        .select('*')
        .eq('patient_id', patientId);

      if (vaccinationsError) throw vaccinationsError;

      setVaccinations(vaccinationsData || []);

      // Récupérer les rendez-vous du patient
      const { data: appointmentsData, error: appointmentsError } = await supabase
        .from('appointments')
        .select(`
          id,
          start_time,
          end_time,
          reason,
          status,
          doctor:profiles!doctor_id(first_name, last_name),
          centre:centres!centre_id(name)
        `)
        .eq('patient_id', patientId)
        .order('start_time', { ascending: false });

      if (appointmentsError) throw appointmentsError;

      // Transformer les données pour correspondre aux interfaces TypeScript
      // En Supabase, les jointures peuvent retourner des tableaux d'objets au lieu d'objets uniques
      const transformedAppointments: Appointment[] = (appointmentsData || []).map((apt: any) => ({
        id: apt.id,
        start_time: apt.start_time,
        end_time: apt.end_time,
        reason: apt.reason,
        status: apt.status,
        doctor: Array.isArray(apt.doctor) && apt.doctor.length > 0 ? apt.doctor[0] : apt.doctor,
        centre: Array.isArray(apt.centre) && apt.centre.length > 0 ? apt.centre[0] : apt.centre,
      }));
      
      setAppointments(transformedAppointments);
      
      // Récupérer les consultations du patient
      const { data: consultationsData, error: consultationsError } = await supabase
        .from('consultations')
        .select(`
          id,
          date,
          status,
          reason_for_visit,
          diagnosis,
          doctor:profiles!doctor_id(first_name, last_name)
        `)
        .eq('patient_id', patientId)
        .order('date', { ascending: false });

      if (consultationsError) throw consultationsError;

      setConsultations(consultationsData || []);
    } catch (error: any) {
      console.error('Erreur lors de la récupération des détails du patient:', error);
      toast.error("Erreur lors de la récupération des détails du patient");
    } finally {
      setLoading(false);
    }
  };

  // Fonctions pour gérer les allergies
  const handleAddAllergy = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { error } = await supabase
        .from('allergies')
        .insert([{
          patient_id: patientId,
          substance: newAllergy.substance,
          severity: newAllergy.severity,
          notes: newAllergy.notes || null
        }]);

      if (error) throw error;

      toast.success("Allergie ajoutée avec succès");
      
      // Réinitialiser le formulaire et fermer la modale
      setNewAllergy({ substance: "", severity: "", notes: "" });
      setIsAllergyDialogOpen(false);
      
      // Recharger les données
      fetchPatientDetails();
    } catch (error: any) {
      console.error('Erreur lors de l\'ajout de l\'allergie:', error);
      toast.error("Erreur lors de l'ajout de l'allergie");
    }
  };

  // Fonctions pour gérer l'historique médical
  const handleAddMedicalHistory = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { error } = await supabase
        .from('medical_history')
        .insert([{
          patient_id: patientId,
          condition_name: newMedicalHistory.condition_name,
          diagnosis_date: newMedicalHistory.diagnosis_date,
          is_active: newMedicalHistory.is_active,
          notes: newMedicalHistory.notes || null
        }]);

      if (error) throw error;

      toast.success("Historique médical ajouté avec succès");
      
      // Réinitialiser le formulaire et fermer la modale
      setNewMedicalHistory({ condition_name: "", diagnosis_date: "", is_active: true, notes: "" });
      setIsMedicalHistoryDialogOpen(false);
      
      // Recharger les données
      fetchPatientDetails();
    } catch (error: any) {
      console.error('Erreur lors de l\'ajout de l\'historique médical:', error);
      toast.error("Erreur lors de l'ajout de l'historique médical");
    }
  };

  // Fonctions pour gérer les vaccinations
  const handleAddVaccination = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { error } = await supabase
        .from('vaccination_records')
        .insert([{
          patient_id: patientId,
          vaccine_name: newVaccination.vaccine_name,
          date_administered: newVaccination.date_administered
        }]);

      if (error) throw error;

      toast.success("Vaccination ajoutée avec succès");
      
      // Réinitialiser le formulaire et fermer la modale
      setNewVaccination({ vaccine_name: "", date_administered: "" });
      setIsVaccinationDialogOpen(false);
      
      // Recharger les données
      fetchPatientDetails();
    } catch (error: any) {
      console.error('Erreur lors de l\'ajout de la vaccination:', error);
      toast.error("Erreur lors de l'ajout de la vaccination");
    }
  };

  // Fonction pour démarrer une consultation
  const handleStartConsultation = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Créer une nouvelle consultation
      const { data: consultationData, error: consultationError } = await supabase
        .from('consultations')
        .insert([{
          patient_id: patientId,
          doctor_id: user?.id, // Le médecin connecté démarre la consultation
          centre_id: patient?.default_centre_id, // Utiliser le centre par défaut
          status: 'ONGOING'
        }])
        .select('id')
        .single();

      if (consultationError) throw consultationError;

      // Rediriger vers la page de consultation
      window.location.href = `/consultations/${consultationData.id}`;
    } catch (error: any) {
      console.error('Erreur lors du démarrage de la consultation:', error);
      toast.error("Erreur lors du démarrage de la consultation");
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Détails du Patient</h1>
          <p className="text-muted-foreground">Informations complètes sur le patient</p>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <p>Chargement des détails du patient...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Détails du Patient</h1>
          <p className="text-muted-foreground">Informations complètes sur le patient</p>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <p>Patient non trouvé</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Détails du Patient</h1>
        <p className="text-muted-foreground">Informations complètes sur le patient</p>
      </div>

      <Tabs defaultValue="info" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="info">Informations de base</TabsTrigger>
          <TabsTrigger value="medical">Antécédents médicaux</TabsTrigger>
          <TabsTrigger value="allergies">Allergies</TabsTrigger>
          <TabsTrigger value="vaccinations">Vaccinations</TabsTrigger>
          <TabsTrigger value="appointments">Rendez-vous</TabsTrigger>
          <TabsTrigger value="consultations">Consultations</TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Informations Personnelles</CardTitle>
                <CardDescription>Données de base du patient</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="bg-muted rounded-full p-3">
                    <Activity className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">N° Dossier Médical</p>
                    <p className="font-medium">{patient.medical_record_number || "N/A"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="bg-muted rounded-full p-3">
                    <Activity className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Nom complet</p>
                    <p className="font-medium">{patient.first_name} {patient.last_name}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="bg-muted rounded-full p-3">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Date de naissance</p>
                    <p className="font-medium">{new Date(patient.date_of_birth).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="bg-muted rounded-full p-3">
                    <Activity className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Sexe</p>
                    <p className="font-medium">
                      {patient.gender === 'MALE' ? 'Homme' : 
                       patient.gender === 'FEMALE' ? 'Femme' : 'Autre'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="bg-muted rounded-full p-3">
                    <Activity className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Groupe sanguin</p>
                    <p className="font-medium">{patient.blood_group || "Non renseigné"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Coordonnées</CardTitle>
                <CardDescription>Informations de contact</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="bg-muted rounded-full p-3">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{patient.email || "Non renseigné"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="bg-muted rounded-full p-3">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Téléphone</p>
                    <p className="font-medium">{patient.phone || "Non renseigné"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="bg-muted rounded-full p-3">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Adresse</p>
                    <p className="font-medium">{patient.address || "Non renseignée"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="bg-muted rounded-full p-3">
                    <Activity className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Abonné</p>
                    <p className="font-medium">
                      <Badge variant={patient.is_subscriber ? "default" : "outline"}>
                        {patient.is_subscriber ? "Oui" : "Non"}
                      </Badge>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="bg-muted rounded-full p-3">
                    <Activity className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Date d'inscription</p>
                    <p className="font-medium">{new Date(patient.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Contact d'urgence</CardTitle>
              <CardDescription>Personne à contacter en cas d'urgence</CardDescription>
            </CardHeader>
            <CardContent>
              {patient.emergency_contact_name || patient.emergency_contact_phone ? (
                <div className="flex items-center gap-3">
                  <div className="bg-muted rounded-full p-3">
                    <Activity className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">
                      {patient.emergency_contact_name || "Non renseigné"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {patient.emergency_contact_phone || "Téléphone non renseigné"}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">Aucun contact d'urgence enregistré</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="medical" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Historique Médical</CardTitle>
                <CardDescription>Conditions médicales passées et actuelles</CardDescription>
              </div>
              <Dialog open={isMedicalHistoryDialogOpen} onOpenChange={setIsMedicalHistoryDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Ajouter un antécédent
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Ajouter un antécédent médical</DialogTitle>
                    <DialogDescription>
                      Enregistrez un nouvel antécédent médical pour ce patient
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleAddMedicalHistory} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="condition_name">Nom de la condition</Label>
                      <Input
                        id="condition_name"
                        value={newMedicalHistory.condition_name}
                        onChange={(e) => setNewMedicalHistory({...newMedicalHistory, condition_name: e.target.value})}
                        required
                        placeholder="Ex: Diabète de type 2, Hypertension"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="diagnosis_date">Date de diagnostic</Label>
                      <Input
                        id="diagnosis_date"
                        type="date"
                        value={newMedicalHistory.diagnosis_date}
                        onChange={(e) => setNewMedicalHistory({...newMedicalHistory, diagnosis_date: e.target.value})}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="is_active">Statut</Label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="is_active"
                          checked={newMedicalHistory.is_active}
                          onChange={(e) => setNewMedicalHistory({...newMedicalHistory, is_active: e.target.checked})}
                          className="h-4 w-4"
                        />
                        <Label htmlFor="is_active" className="text-sm font-normal">
                          Cette condition est toujours active
                        </Label>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="notes">Notes (optionnel)</Label>
                      <Textarea
                        id="notes"
                        value={newMedicalHistory.notes}
                        onChange={(e) => setNewMedicalHistory({...newMedicalHistory, notes: e.target.value})}
                        placeholder="Détails sur la condition, traitement, évolution, etc."
                      />
                    </div>
                    
                    <div className="flex justify-end gap-2 pt-4">
                      <Button type="button" variant="outline" onClick={() => setIsMedicalHistoryDialogOpen(false)}>
                        Annuler
                      </Button>
                      <Button type="submit">Ajouter l'antécédent</Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {medicalHistory.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Condition</TableHead>
                      <TableHead>Date de diagnostic</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {medicalHistory.map((history) => (
                      <TableRow key={history.id}>
                        <TableCell className="font-medium">{history.condition_name}</TableCell>
                        <TableCell>{new Date(history.diagnosis_date).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Badge variant={history.is_active ? "default" : "outline"}>
                            {history.is_active ? "Actif" : "Résolu"}
                          </Badge>
                        </TableCell>
                        <TableCell>{history.notes || "-"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-muted-foreground">Aucun historique médical enregistré.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vaccinations" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Vaccinations</CardTitle>
                <CardDescription>Historique des vaccinations du patient</CardDescription>
              </div>
              <Dialog open={isVaccinationDialogOpen} onOpenChange={setIsVaccinationDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Ajouter une vaccination
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Ajouter une vaccination</DialogTitle>
                    <DialogDescription>
                      Enregistrez une nouvelle vaccination pour ce patient
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleAddVaccination} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="vaccine_name">Nom du vaccin</Label>
                      <Input
                        id="vaccine_name"
                        value={newVaccination.vaccine_name}
                        onChange={(e) => setNewVaccination({...newVaccination, vaccine_name: e.target.value})}
                        required
                        placeholder="Ex: DTP, ROR, COVID-19, etc."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="date_administered">Date d'administration</Label>
                      <Input
                        id="date_administered"
                        type="date"
                        value={newVaccination.date_administered}
                        onChange={(e) => setNewVaccination({...newVaccination, date_administered: e.target.value})}
                        required
                      />
                    </div>
                    
                    <div className="flex justify-end gap-2 pt-4">
                      <Button type="button" variant="outline" onClick={() => setIsVaccinationDialogOpen(false)}>
                        Annuler
                      </Button>
                      <Button type="submit">Ajouter la vaccination</Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {vaccinations.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Vaccin</TableHead>
                      <TableHead>Date d'administration</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {vaccinations.map((vaccination) => (
                      <TableRow key={vaccination.id}>
                        <TableCell className="font-medium">{vaccination.vaccine_name}</TableCell>
                        <TableCell>{new Date(vaccination.date_administered).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-muted-foreground">Aucune vaccination enregistrée.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="allergies" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Allergies</CardTitle>
                <CardDescription>Allergies connues du patient</CardDescription>
              </div>
              <Dialog open={isAllergyDialogOpen} onOpenChange={setIsAllergyDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Ajouter une allergie
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Ajouter une allergie</DialogTitle>
                    <DialogDescription>
                      Enregistrez une nouvelle allergie pour ce patient
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleAddAllergy} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="substance">Substance</Label>
                      <Input
                        id="substance"
                        value={newAllergy.substance}
                        onChange={(e) => setNewAllergy({...newAllergy, substance: e.target.value})}
                        required
                        placeholder="Ex: Pénicilline, Arachides"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="severity">Sévérité</Label>
                      <Select value={newAllergy.severity} onValueChange={(value) => setNewAllergy({...newAllergy, severity: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner la sévérité" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Mild">Bénin</SelectItem>
                          <SelectItem value="Moderate">Modéré</SelectItem>
                          <SelectItem value="Severe">Sévère</SelectItem>
                          <SelectItem value="Life-threatening">Vie menacée</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="notes">Notes (optionnel)</Label>
                      <Textarea
                        id="notes"
                        value={newAllergy.notes}
                        onChange={(e) => setNewAllergy({...newAllergy, notes: e.target.value})}
                        placeholder="Symptômes observés, traitement, etc."
                      />
                    </div>
                    
                    <div className="flex justify-end gap-2 pt-4">
                      <Button type="button" variant="outline" onClick={() => setIsAllergyDialogOpen(false)}>
                        Annuler
                      </Button>
                      <Button type="submit">Ajouter l'allergie</Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {allergies.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Substance</TableHead>
                      <TableHead>Sévérité</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allergies.map((allergy) => (
                      <TableRow key={allergy.id}>
                        <TableCell className="font-medium">{allergy.substance}</TableCell>
                        <TableCell>
                          <Badge variant="destructive">{allergy.severity}</Badge>
                        </TableCell>
                        <TableCell>{allergy.notes || "-"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-muted-foreground">Aucune allergie enregistrée.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appointments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Rendez-vous</CardTitle>
              <CardDescription>Historique des rendez-vous du patient</CardDescription>
            </CardHeader>
            <CardContent>
              {appointments.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Motif</TableHead>
                      <TableHead>Médecin</TableHead>
                      <TableHead>Centre</TableHead>
                      <TableHead>Statut</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {appointments.map((appointment) => (
                      <TableRow key={appointment.id}>
                        <TableCell>
                          {new Date(appointment.start_time).toLocaleDateString()} à {new Date(appointment.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </TableCell>
                        <TableCell>{appointment.reason || "-"}</TableCell>
                        <TableCell>{appointment.doctor?.first_name} {appointment.doctor?.last_name}</TableCell>
                        <TableCell>{appointment.centre?.name}</TableCell>
                        <TableCell>
                          <Badge variant={
                            appointment.status === 'SCHEDULED' ? 'default' :
                            appointment.status === 'COMPLETED' ? 'secondary' :
                            appointment.status === 'CANCELLED' ? 'destructive' : 'outline'
                          }>
                            {appointment.status === 'SCHEDULED' ? 'Planifié' :
                             appointment.status === 'COMPLETED' ? 'Terminé' :
                             appointment.status === 'CANCELLED' ? 'Annulé' : appointment.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-muted-foreground">Aucun rendez-vous enregistré.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="consultations" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Consultations</CardTitle>
                <CardDescription>Historique des consultations du patient</CardDescription>
              </div>
              <Button onClick={handleStartConsultation}>
                <Stethoscope className="mr-2 h-4 w-4" />
                Démarrer une consultation
              </Button>
            </CardHeader>
            <CardContent>
              {consultations.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Motif</TableHead>
                      <TableHead>Médecin</TableHead>
                      <TableHead>Diagnostic</TableHead>
                      <TableHead>Statut</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {consultations.map((consultation) => (
                      <TableRow key={consultation.id}>
                        <TableCell>{new Date(consultation.date).toLocaleDateString()}</TableCell>
                        <TableCell>{consultation.reason_for_visit || "-"}</TableCell>
                        <TableCell>{consultation.doctor?.first_name} {consultation.doctor?.last_name}</TableCell>
                        <TableCell>{consultation.diagnosis || "-"}</TableCell>
                        <TableCell>
                          <Badge variant={
                            consultation.status === 'PENDING' ? 'default' :
                            consultation.status === 'ONGOING' ? 'secondary' :
                            consultation.status === 'COMPLETED' ? 'outline' : 'destructive'
                          }>
                            {consultation.status === 'PENDING' ? 'En attente' :
                             consultation.status === 'ONGOING' ? 'En cours' :
                             consultation.status === 'COMPLETED' ? 'Terminée' : consultation.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-muted-foreground">Aucune consultation enregistrée.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-2">
        <Button variant="outline">Modifier les informations</Button>
        <Button>Planifier un rendez-vous</Button>
      </div>
    </div>
  );
}