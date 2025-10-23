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
import { Plus, Eye, FileText, Calendar } from "lucide-react";
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

interface Consultation {
  id: string;
  date: string;
  reason_for_visit?: string;
  patient: Patient;
}

interface Prescription {
  id: string;
  consultation_id: string;
  medication_name: string;
  dosage: string;
  frequency: string;
  duration: string;
  notes?: string;
  created_at: string;
  consultation: Consultation;
}

export function PrescriptionManagement() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    consultation_id: "",
    medication_name: "",
    dosage: "",
    frequency: "",
    duration: "",
    notes: ""
  });
  
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    fetchPrescriptionsAndRelatedData();
  }, []);

  const fetchPrescriptionsAndRelatedData = async () => {
    try {
      // Récupérer les prescriptions avec les informations liées
      const { data: prescriptionsData, error: prescriptionsError } = await supabase
        .from('prescriptions')
        .select(`
          id,
          consultation_id,
          medication_name,
          dosage,
          frequency,
          duration,
          notes,
          created_at,
          consultation:consultations!consultation_id(
            id,
            date,
            reason_for_visit,
            patient:patients!patient_id(first_name, last_name, medical_record_number)
          )
        `)
        .order('created_at', { ascending: false });

      if (prescriptionsError) throw prescriptionsError;

      // Transformer les données pour correspondre aux interfaces TypeScript
      // En Supabase, les jointures peuvent retourner des tableaux d'objets au lieu d'objets uniques
      const transformedPrescriptions: Prescription[] = (prescriptionsData || []).map((presc: any) => ({
        id: presc.id,
        consultation_id: presc.consultation_id,
        medication_name: presc.medication_name,
        dosage: presc.dosage,
        frequency: presc.frequency,
        duration: presc.duration,
        notes: presc.notes,
        created_at: presc.created_at,
        consultation: Array.isArray(presc.consultation) && presc.consultation.length > 0 ? presc.consultation[0] : presc.consultation,
      }));
      
      setPrescriptions(transformedPrescriptions);

      // Récupérer les patients
      const { data: patientsData, error: patientsError } = await supabase
        .from('patients')
        .select('id, first_name, last_name, medical_record_number')
        .order('last_name');

      if (patientsError) throw patientsError;

      setPatients(patientsData || []);

      // Récupérer les consultations non terminées pour la création de nouvelles prescriptions
      const { data: consultationsData, error: consultationsError } = await supabase
        .from('consultations')
        .select(`
          id,
          date,
          reason_for_visit,
          patient:patients!patient_id(first_name, last_name, medical_record_number)
        `)
        .neq('status', 'COMPLETED')
        .order('date', { ascending: false });

      if (consultationsError) throw consultationsError;

      // Transformer les données pour correspondre aux interfaces TypeScript
      // En Supabase, les jointures peuvent retourner des tableaux d'objets au lieu d'objets uniques
      const transformedConsultations: Consultation[] = (consultationsData || []).map((cons: any) => ({
        id: cons.id,
        date: cons.date,
        reason_for_visit: cons.reason_for_visit,
        patient: Array.isArray(cons.patient) && cons.patient.length > 0 ? cons.patient[0] : cons.patient,
      }));
      
      setConsultations(transformedConsultations);
    } catch (error: any) {
      console.error('Erreur lors de la récupération des données:', error);
      toast.error("Erreur lors de la récupération des données de prescription");
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
      const { error } = await supabase
        .from('prescriptions')
        .insert([{
          consultation_id: formData.consultation_id,
          medication_name: formData.medication_name,
          dosage: formData.dosage,
          frequency: formData.frequency,
          duration: formData.duration,
          notes: formData.notes || null
        }]);

      if (error) throw error;

      toast.success("Ordonnance créée avec succès");
      
      // Réinitialiser le formulaire et fermer la modale
      setFormData({
        consultation_id: "",
        medication_name: "",
        dosage: "",
        frequency: "",
        duration: "",
        notes: ""
      });
      setIsDialogOpen(false);
      
      // Recharger les données
      fetchPrescriptionsAndRelatedData();
    } catch (error: any) {
      console.error('Erreur lors de la création de l\'ordonnance:', error);
      toast.error("Erreur lors de la création de l'ordonnance");
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestion des Ordonnances</h1>
          <p className="text-muted-foreground">Créer, modifier et gérer les ordonnances médicales</p>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <p>Chargement des ordonnances...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Gestion des Ordonnances</h1>
        <p className="text-muted-foreground">Créer, modifier et gérer les ordonnances médicales</p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Ordonnances</CardTitle>
            <CardDescription>Gérer les prescriptions médicales</CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <FileText className="mr-2 h-4 w-4" />
                Nouvelle Ordonnance
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Créer une nouvelle ordonnance</DialogTitle>
                <DialogDescription>
                  Prescrire un médicament à un patient durant une consultation
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="consultation_id">Consultation</Label>
                  <Select value={formData.consultation_id} onValueChange={(value) => handleSelectChange('consultation_id', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une consultation" />
                    </SelectTrigger>
                    <SelectContent>
                      {consultations.map((consultation) => (
                        <SelectItem key={consultation.id} value={consultation.id}>
                          {consultation.patient.first_name} {consultation.patient.last_name} - {new Date(consultation.date).toLocaleDateString('fr-FR')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="medication_name">Nom du médicament</Label>
                  <Input
                    id="medication_name"
                    name="medication_name"
                    value={formData.medication_name}
                    onChange={handleInputChange}
                    required
                    placeholder="Ex: Paracétamol, Ibuprofène, Amoxicilline"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dosage">Dosage</Label>
                    <Input
                      id="dosage"
                      name="dosage"
                      value={formData.dosage}
                      onChange={handleInputChange}
                      required
                      placeholder="Ex: 500mg, 1 comprimé"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="frequency">Fréquence</Label>
                    <Input
                      id="frequency"
                      name="frequency"
                      value={formData.frequency}
                      onChange={handleInputChange}
                      required
                      placeholder="Ex: 2 fois/jour, matin et soir"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration">Durée du traitement</Label>
                  <Input
                    id="duration"
                    name="duration"
                    value={formData.duration}
                    onChange={handleInputChange}
                    required
                    placeholder="Ex: 7 jours, 2 semaines, 1 mois"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (optionnel)</Label>
                  <Textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder="Instructions spéciales, allergies, durée de conservation, etc."
                    rows={3}
                  />
                </div>
                
                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Annuler
                  </Button>
                  <Button type="submit">
                    <FileText className="mr-2 h-4 w-4" />
                    Créer l'ordonnance
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
                <TableHead>Patient</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Médicament</TableHead>
                <TableHead>Dosage</TableHead>
                <TableHead>Fréquence</TableHead>
                <TableHead>Durée</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {prescriptions.map((prescription) => (
                <TableRow key={prescription.id}>
                  <TableCell>
                    <div className="font-medium">
                      {prescription.consultation.patient.first_name} {prescription.consultation.patient.last_name}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {prescription.consultation.patient.medical_record_number}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      {new Date(prescription.created_at).toLocaleDateString('fr-FR')}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{prescription.medication_name}</TableCell>
                  <TableCell>{prescription.dosage}</TableCell>
                  <TableCell>{prescription.frequency}</TableCell>
                  <TableCell>{prescription.duration}</TableCell>
                  <TableCell className="max-w-xs truncate">{prescription.notes || "-"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {prescriptions.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Aucune ordonnance trouvée. Créez votre première ordonnance en cliquant sur le bouton "Nouvelle Ordonnance".
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}