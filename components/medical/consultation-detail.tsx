"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Calendar, Clock, User, Stethoscope, Syringe, Activity, HeartPulse } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

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

interface Consultation {
  id: string;
  patient_id: string;
  doctor_id?: string;
  centre_id: string;
  appointment_id?: string;
  date: string;
  status: string;
  reason_for_visit?: string;
  clinical_exam_notes?: string;
  diagnosis?: string;
  follow_up_date?: string;
  created_at: string;
  patient: Patient;
  doctor?: Profile;
  centre: Centre;
  appointment?: {
    start_time: string;
    reason: string;
  };
}

interface VitalSignLog {
  id: string;
  timestamp: string;
  heart_rate?: number;
  bp_systolic?: number;
  bp_diastolic?: number;
  temperature_celsius?: number;
  oxygen_saturation?: number;
  respiratory_rate?: number;
  recorded_by_id: string;
  recorded_by: Profile;
}

interface Prescription {
  id: string;
  medication_name: string;
  dosage: string;
  frequency: string;
  duration: string;
  notes?: string;
  created_at: string;
}

export function ConsultationDetail({ consultationId }: { consultationId: string }) {
  const [consultation, setConsultation] = useState<Consultation | null>(null);
  const [vitalSignLogs, setVitalSignLogs] = useState<VitalSignLog[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  
  // États pour les nouveaux éléments
  const [newVitalSigns, setNewVitalSigns] = useState({
    heart_rate: "",
    bp_systolic: "",
    bp_diastolic: "",
    temperature_celsius: "",
    oxygen_saturation: "",
    respiratory_rate: ""
  });
  const [newPrescription, setNewPrescription] = useState({
    medication_name: "",
    dosage: "",
    frequency: "",
    duration: "",
    notes: ""
  });

  const supabase = createClient();

  useEffect(() => {
    fetchConsultationDetails();
  }, []);

  const fetchConsultationDetails = async () => {
    try {
      // Récupérer la consultation avec les informations liées
      const { data: consultationData, error: consultationError } = await supabase
        .from('consultations')
        .select(`
          id,
          patient_id,
          doctor_id,
          centre_id,
          appointment_id,
          date,
          status,
          reason_for_visit,
          clinical_exam_notes,
          diagnosis,
          follow_up_date,
          created_at,
          patient:patients!patient_id(id, first_name, last_name, medical_record_number),
          doctor:profiles!doctor_id(id, first_name, last_name),
          centre:centres!centre_id(id, name),
          appointment:appointments!appointment_id(start_time, reason)
        `)
        .eq('id', consultationId)
        .single();

      if (consultationError) throw consultationError;

      // Transformer les données pour correspondre aux interfaces TypeScript
      // En Supabase, les jointures peuvent retourner des tableaux d'objets au lieu d'objets uniques
      const transformedConsultation: Consultation = {
        id: consultationData.id,
        patient_id: consultationData.patient_id,
        doctor_id: consultationData.doctor_id,
        centre_id: consultationData.centre_id,
        appointment_id: consultationData.appointment_id,
        date: consultationData.date,
        status: consultationData.status,
        reason_for_visit: consultationData.reason_for_visit,
        clinical_exam_notes: consultationData.clinical_exam_notes,
        diagnosis: consultationData.diagnosis,
        follow_up_date: consultationData.follow_up_date,
        created_at: consultationData.created_at,
        patient: (Array.isArray(consultationData.patient) && consultationData.patient.length > 0
          ? consultationData.patient[0]
          : consultationData.patient) as Patient,
        doctor: (Array.isArray(consultationData.doctor) && consultationData.doctor.length > 0
          ? consultationData.doctor[0]
          : consultationData.doctor) as Profile | undefined,
        centre: (Array.isArray(consultationData.centre) && consultationData.centre.length > 0
          ? consultationData.centre[0]
          : consultationData.centre) as Centre,
        appointment: (Array.isArray(consultationData.appointment) && consultationData.appointment.length > 0
          ? consultationData.appointment[0]
          : consultationData.appointment) as { start_time: string; reason: string } | undefined,
      };

      setConsultation(transformedConsultation);

      // Récupérer les signes vitaux pour cette consultation
      const { data: vitalSignsData, error: vitalSignsError } = await supabase
        .from('vital_sign_logs')
        .select(`
          id,
          timestamp,
          heart_rate,
          bp_systolic,
          bp_diastolic,
          temperature_celsius,
          oxygen_saturation,
          respiratory_rate,
          recorded_by_id,
          recorded_by:profiles!recorded_by_id(id, first_name, last_name)
        `)
        .eq('consultation_id', consultationId)
        .order('timestamp', { ascending: false });

      if (vitalSignsError) throw vitalSignsError;

      // Transformer les données des signes vitaux
      const transformedVitalSigns: VitalSignLog[] = (vitalSignsData || []).map((log: any) => ({
        id: log.id,
        timestamp: log.timestamp,
        heart_rate: log.heart_rate,
        bp_systolic: log.bp_systolic,
        bp_diastolic: log.bp_diastolic,
        temperature_celsius: log.temperature_celsius,
        oxygen_saturation: log.oxygen_saturation,
        respiratory_rate: log.respiratory_rate,
        recorded_by_id: log.recorded_by_id,
        recorded_by: (Array.isArray(log.recorded_by) && log.recorded_by.length > 0
          ? log.recorded_by[0]
          : log.recorded_by) as Profile,
      }));

      setVitalSignLogs(transformedVitalSigns);

      // Récupérer les ordonnances pour cette consultation
      const { data: prescriptionsData, error: prescriptionsError } = await supabase
        .from('prescriptions')
        .select('*')
        .eq('consultation_id', consultationId);

      if (prescriptionsError) throw prescriptionsError;

      setPrescriptions(prescriptionsData || []);
    } catch (error: any) {
      console.error('Erreur lors de la récupération des détails de la consultation:', error);
      toast.error("Erreur lors de la récupération des détails de la consultation");
    } finally {
      setLoading(false);
    }
  };

  const handleVitalSignsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const vitalSignData: any = {
        patient_id: consultation?.patient_id,
        consultation_id: consultationId,
        recorded_by_id: user?.id,
      };
      
      // Ajouter les valeurs seulement si elles sont fournies
      if (newVitalSigns.heart_rate) vitalSignData.heart_rate = parseInt(newVitalSigns.heart_rate);
      if (newVitalSigns.bp_systolic) vitalSignData.bp_systolic = parseInt(newVitalSigns.bp_systolic);
      if (newVitalSigns.bp_diastolic) vitalSignData.bp_diastolic = parseInt(newVitalSigns.bp_diastolic);
      if (newVitalSigns.temperature_celsius) vitalSignData.temperature_celsius = parseFloat(newVitalSigns.temperature_celsius);
      if (newVitalSigns.oxygen_saturation) vitalSignData.oxygen_saturation = parseInt(newVitalSigns.oxygen_saturation);
      if (newVitalSigns.respiratory_rate) vitalSignData.respiratory_rate = parseInt(newVitalSigns.respiratory_rate);

      const { error } = await supabase
        .from('vital_sign_logs')
        .insert([vitalSignData]);

      if (error) throw error;

      toast.success("Signes vitaux enregistrés avec succès");
      
      // Réinitialiser le formulaire
      setNewVitalSigns({
        heart_rate: "",
        bp_systolic: "",
        bp_diastolic: "",
        temperature_celsius: "",
        oxygen_saturation: "",
        respiratory_rate: ""
      });
      
      // Recharger les signes vitaux
      fetchConsultationDetails();
    } catch (error: any) {
      console.error('Erreur lors de l\'enregistrement des signes vitaux:', error);
      toast.error("Erreur lors de l'enregistrement des signes vitaux");
    }
  };

  const handlePrescriptionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { error } = await supabase
        .from('prescriptions')
        .insert([{
          consultation_id: consultationId,
          medication_name: newPrescription.medication_name,
          dosage: newPrescription.dosage,
          frequency: newPrescription.frequency,
          duration: newPrescription.duration,
          notes: newPrescription.notes || null
        }]);

      if (error) throw error;

      toast.success("Ordonnance enregistrée avec succès");
      
      // Réinitialiser le formulaire
      setNewPrescription({
        medication_name: "",
        dosage: "",
        frequency: "",
        duration: "",
        notes: ""
      });
      
      // Recharger les ordonnances
      fetchConsultationDetails();
    } catch (error: any) {
      console.error('Erreur lors de l\'enregistrement de l\'ordonnance:', error);
      toast.error("Erreur lors de l'enregistrement de l'ordonnance");
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Détail de la Consultation</h1>
          <p className="text-muted-foreground">Informations complètes sur la consultation</p>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <p>Chargement de la consultation...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!consultation) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Détail de la Consultation</h1>
          <p className="text-muted-foreground">Informations complètes sur la consultation</p>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <p>Consultation non trouvée</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Détail de la Consultation</h1>
        <p className="text-muted-foreground">Informations complètes sur la consultation</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informations de Base</CardTitle>
          <CardDescription>Détails de la consultation et du patient</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Patient</p>
              <p className="font-medium">{consultation.patient.first_name} {consultation.patient.last_name} ({consultation.patient.medical_record_number})</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Médecin</p>
              <p className="font-medium">{consultation.doctor ? `${consultation.doctor.first_name} ${consultation.doctor.last_name}` : "Non assigné"}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Date</p>
              <p className="font-medium">{new Date(consultation.date).toLocaleString('fr-FR')}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Centre</p>
              <p className="font-medium">{consultation.centre.name}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Statut</p>
              <Badge variant={
                consultation.status === 'PENDING' ? 'default' :
                consultation.status === 'ONGOING' ? 'secondary' :
                consultation.status === 'COMPLETED' ? 'outline' : 'destructive'
              }>
                {consultation.status === 'PENDING' ? 'En Attente' :
                 consultation.status === 'ONGOING' ? 'En Cours' :
                 consultation.status === 'COMPLETED' ? 'Terminée' : consultation.status}
              </Badge>
            </div>
            {consultation.appointment && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Rendez-vous associé</p>
                <p className="font-medium">{new Date(consultation.appointment.start_time).toLocaleString('fr-FR')}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="consultation" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="consultation">Consultation</TabsTrigger>
          <TabsTrigger value="vitals">Signes Vitals</TabsTrigger>
          <TabsTrigger value="prescriptions">Ordonnances</TabsTrigger>
        </TabsList>

        <TabsContent value="consultation">
          <Card>
            <CardHeader>
              <CardTitle>Détails de la Consultation</CardTitle>
              <CardDescription>Notes et diagnostics de la consultation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {consultation.reason_for_visit && (
                <div>
                  <Label>Motif de la visite</Label>
                  <p className="mt-1">{consultation.reason_for_visit}</p>
                </div>
              )}
              
              {consultation.clinical_exam_notes && (
                <div>
                  <Label>Notes de l'examen clinique</Label>
                  <p className="mt-1 whitespace-pre-line">{consultation.clinical_exam_notes}</p>
                </div>
              )}
              
              {consultation.diagnosis && (
                <div>
                  <Label>Diagnostic</Label>
                  <p className="mt-1">{consultation.diagnosis}</p>
                </div>
              )}
              
              {consultation.follow_up_date && (
                <div>
                  <Label>Date de suivi</Label>
                  <p className="mt-1">{new Date(consultation.follow_up_date).toLocaleDateString('fr-FR')}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vitals">
          <Card>
            <CardHeader>
              <CardTitle>Signes Vitals</CardTitle>
              <CardDescription>Enregistrer et consulter les signes vitaux</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Enregistrer des signes vitaux</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleVitalSignsSubmit} className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="heart_rate">Fréquence cardiaque (bpm)</Label>
                        <Input
                          id="heart_rate"
                          type="number"
                          value={newVitalSigns.heart_rate}
                          onChange={(e) => setNewVitalSigns({...newVitalSigns, heart_rate: e.target.value})}
                          placeholder="72"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="bp_systolic">Tension artérielle (sys/dia)</Label>
                        <div className="flex gap-2">
                          <Input
                            id="bp_systolic"
                            type="number"
                            value={newVitalSigns.bp_systolic}
                            onChange={(e) => setNewVitalSigns({...newVitalSigns, bp_systolic: e.target.value})}
                            placeholder="120"
                            className="flex-1"
                          />
                          <Input
                            id="bp_diastolic"
                            type="number"
                            value={newVitalSigns.bp_diastolic}
                            onChange={(e) => setNewVitalSigns({...newVitalSigns, bp_diastolic: e.target.value})}
                            placeholder="80"
                            className="flex-1"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="temperature_celsius">Température (°C)</Label>
                        <Input
                          id="temperature_celsius"
                          type="number"
                          step="0.1"
                          value={newVitalSigns.temperature_celsius}
                          onChange={(e) => setNewVitalSigns({...newVitalSigns, temperature_celsius: e.target.value})}
                          placeholder="37.0"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="oxygen_saturation">Saturation en O₂ (%)</Label>
                        <Input
                          id="oxygen_saturation"
                          type="number"
                          value={newVitalSigns.oxygen_saturation}
                          onChange={(e) => setNewVitalSigns({...newVitalSigns, oxygen_saturation: e.target.value})}
                          placeholder="98"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="respiratory_rate">Fréquence respiratoire (mvt/min)</Label>
                        <Input
                          id="respiratory_rate"
                          type="number"
                          value={newVitalSigns.respiratory_rate}
                          onChange={(e) => setNewVitalSigns({...newVitalSigns, respiratory_rate: e.target.value})}
                          placeholder="16"
                        />
                      </div>
                      
                      <div className="col-span-2 flex justify-end pt-4">
                        <Button type="submit">Enregistrer les signes vitaux</Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>

                {vitalSignLogs.length > 0 ? (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Historique des signes vitaux</h3>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date/Heure</TableHead>
                          <TableHead>Fréq. Card.</TableHead>
                          <TableHead>Tension art.</TableHead>
                          <TableHead>Temp.</TableHead>
                          <TableHead>Sat. O₂</TableHead>
                          <TableHead>Fréq. Resp.</TableHead>
                          <TableHead>Enregistré par</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {vitalSignLogs.map((log) => (
                          <TableRow key={log.id}>
                            <TableCell>{new Date(log.timestamp).toLocaleString('fr-FR')}</TableCell>
                            <TableCell>{log.heart_rate} bpm</TableCell>
                            <TableCell>{log.bp_systolic}/{log.bp_diastolic} mmHg</TableCell>
                            <TableCell>{log.temperature_celsius}°C</TableCell>
                            <TableCell>{log.oxygen_saturation}%</TableCell>
                            <TableCell>{log.respiratory_rate} mvt/min</TableCell>
                            <TableCell>{log.recorded_by?.first_name} {log.recorded_by?.last_name}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <p className="text-muted-foreground">Aucun signe vital enregistré pour cette consultation.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="prescriptions">
          <Card>
            <CardHeader>
              <CardTitle>Ordonnances</CardTitle>
              <CardDescription>Prescrire des médicaments à ce patient</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Nouvelle ordonnance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handlePrescriptionSubmit} className="grid grid-cols-2 gap-4">
                      <div className="space-y-2 col-span-2">
                        <Label htmlFor="medication_name">Nom du médicament</Label>
                        <Input
                          id="medication_name"
                          value={newPrescription.medication_name}
                          onChange={(e) => setNewPrescription({...newPrescription, medication_name: e.target.value})}
                          required
                          placeholder="Paracétamol, Ibuprofène, etc."
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="dosage">Dosage</Label>
                        <Input
                          id="dosage"
                          value={newPrescription.dosage}
                          onChange={(e) => setNewPrescription({...newPrescription, dosage: e.target.value})}
                          required
                          placeholder="500mg, 1 comprimé, etc."
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="frequency">Fréquence</Label>
                        <Input
                          id="frequency"
                          value={newPrescription.frequency}
                          onChange={(e) => setNewPrescription({...newPrescription, frequency: e.target.value})}
                          required
                          placeholder="2 fois/jour, matin et soir, etc."
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="duration">Durée</Label>
                        <Input
                          id="duration"
                          value={newPrescription.duration}
                          onChange={(e) => setNewPrescription({...newPrescription, duration: e.target.value})}
                          required
                          placeholder="7 jours, 2 semaines, etc."
                        />
                      </div>
                      <div className="space-y-2 col-span-2">
                        <Label htmlFor="notes">Notes (optionnel)</Label>
                        <Textarea
                          id="notes"
                          value={newPrescription.notes}
                          onChange={(e) => setNewPrescription({...newPrescription, notes: e.target.value})}
                          placeholder="Instructions spéciales, allergies, etc."
                        />
                      </div>
                      
                      <div className="col-span-2 flex justify-end pt-4">
                        <Button type="submit">Enregistrer l'ordonnance</Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>

                {prescriptions.length > 0 ? (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Ordonnances prescrites</h3>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Médicament</TableHead>
                          <TableHead>Dosage</TableHead>
                          <TableHead>Fréquence</TableHead>
                          <TableHead>Durée</TableHead>
                          <TableHead>Notes</TableHead>
                          <TableHead>Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {prescriptions.map((prescription) => (
                          <TableRow key={prescription.id}>
                            <TableCell className="font-medium">{prescription.medication_name}</TableCell>
                            <TableCell>{prescription.dosage}</TableCell>
                            <TableCell>{prescription.frequency}</TableCell>
                            <TableCell>{prescription.duration}</TableCell>
                            <TableCell>{prescription.notes || "-"}</TableCell>
                            <TableCell>{new Date(prescription.created_at).toLocaleDateString('fr-FR')}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <p className="text-muted-foreground">Aucune ordonnance prescrite pour cette consultation.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}