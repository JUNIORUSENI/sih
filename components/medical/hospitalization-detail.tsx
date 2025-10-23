"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Calendar, Clock, User, Bed, Activity, Plus } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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

interface Hospitalization {
  id: string;
  patient_id: string;
  referring_doctor_id?: string;
  centre_id: string;
  service?: string;
  room?: string;
  bed?: string;
  admission_date: string;
  discharge_date?: string;
  admission_reason: string;
  discharge_summary?: string;
  created_at: string;
  patient: Patient;
  referring_doctor?: Profile;
  centre: Centre;
}

interface HospitalizationLog {
  id: string;
  timestamp: string;
  log_type: string;
  notes: string;
  author_id: string;
  author: Profile;
}

export function HospitalizationDetail({ hospitalizationId }: { hospitalizationId: string }) {
  const [hospitalization, setHospitalization] = useState<Hospitalization | null>(null);
  const [logs, setLogs] = useState<HospitalizationLog[]>([]);
  const [loading, setLoading] = useState(true);
  
  // États pour le nouveau log
  const [newLog, setNewLog] = useState({
    log_type: "",
    notes: ""
  });

  const supabase = createClient();

  useEffect(() => {
    fetchHospitalizationDetails();
  }, []);

  const fetchHospitalizationDetails = async () => {
    try {
      // Récupérer l'hospitalisation avec les informations liées
      const { data: hospitalizationData, error: hospitalizationError } = await supabase
        .from('hospitalisations')
        .select(`
          id,
          patient_id,
          referring_doctor_id,
          centre_id,
          service,
          room,
          bed,
          admission_date,
          discharge_date,
          admission_reason,
          discharge_summary,
          created_at,
          patient:patients!patient_id(id, first_name, last_name, medical_record_number),
          referring_doctor:profiles!referring_doctor_id(id, first_name, last_name),
          centre:centres!centre_id(id, name)
        `)
        .eq('id', hospitalizationId)
        .single();

      if (hospitalizationError) throw hospitalizationError;

      // Transformer les données pour correspondre aux interfaces TypeScript
      // En Supabase, les jointures peuvent retourner des tableaux d'objets au lieu d'objets uniques
      const transformedHospitalization: Hospitalization = {
        id: hospitalizationData.id,
        patient_id: hospitalizationData.patient_id,
        referring_doctor_id: hospitalizationData.referring_doctor_id,
        centre_id: hospitalizationData.centre_id,
        service: hospitalizationData.service,
        room: hospitalizationData.room,
        bed: hospitalizationData.bed,
        admission_date: hospitalizationData.admission_date,
        discharge_date: hospitalizationData.discharge_date,
        admission_reason: hospitalizationData.admission_reason,
        discharge_summary: hospitalizationData.discharge_summary,
        created_at: hospitalizationData.created_at,
        patient: (Array.isArray(hospitalizationData.patient) && hospitalizationData.patient.length > 0
          ? hospitalizationData.patient[0]
          : hospitalizationData.patient) as Patient,
        referring_doctor: (Array.isArray(hospitalizationData.referring_doctor) && hospitalizationData.referring_doctor.length > 0
          ? hospitalizationData.referring_doctor[0]
          : hospitalizationData.referring_doctor) as Profile | undefined,
        centre: (Array.isArray(hospitalizationData.centre) && hospitalizationData.centre.length > 0
          ? hospitalizationData.centre[0]
          : hospitalizationData.centre) as Centre,
      };

      setHospitalization(transformedHospitalization);

      // Récupérer les logs pour cette hospitalisation
      const { data: logsData, error: logsError } = await supabase
        .from('hospitalisation_logs')
        .select(`
          id,
          timestamp,
          log_type,
          notes,
          author_id,
          author:profiles!author_id(id, first_name, last_name)
        `)
        .eq('hospitalisation_id', hospitalizationId)
        .order('timestamp', { ascending: false });

      if (logsError) throw logsError;

      // Transformer les données des logs pour correspondre à l'interface
      const transformedLogs: HospitalizationLog[] = (logsData || []).map((log: any) => ({
        id: log.id,
        timestamp: log.timestamp,
        log_type: log.log_type,
        notes: log.notes,
        author_id: log.author_id,
        author: (Array.isArray(log.author) && log.author.length > 0 ? log.author[0] : log.author) as Profile,
      }));

      setLogs(transformedLogs);
    } catch (error: any) {
      console.error('Erreur lors de la récupération des détails de l\'hospitalisation:', error);
      toast.error("Erreur lors de la récupération des détails de l'hospitalisation");
    } finally {
      setLoading(false);
    }
  };

  const handleAddLog = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('hospitalisation_logs')
        .insert([{
          hospitalisation_id: hospitalizationId,
          author_id: user?.id,
          log_type: newLog.log_type,
          notes: newLog.notes
        }]);

      if (error) throw error;

      toast.success("Journal d'hospitalisation ajouté avec succès");
      
      // Réinitialiser le formulaire
      setNewLog({ log_type: "", notes: "" });
      
      // Recharger les logs
      fetchHospitalizationDetails();
    } catch (error: any) {
      console.error('Erreur lors de l\'ajout du journal:', error);
      toast.error("Erreur lors de l'ajout du journal");
    }
  };

  const handleDischargePatient = async () => {
    if (!confirm("Êtes-vous sûr de vouloir désigner ce patient ? Cela mettra fin à son hospitalisation.")) return;

    try {
      const { error } = await supabase
        .from('hospitalisations')
        .update({
          discharge_date: new Date().toISOString(),
          discharge_summary: "Patient désigné conformément aux protocoles médicaux"
        })
        .eq('id', hospitalizationId);

      if (error) throw error;

      toast.success("Patient désigné avec succès");
      
      // Recharger les données
      fetchHospitalizationDetails();
    } catch (error: any) {
      console.error('Erreur lors de la désignation du patient:', error);
      toast.error("Erreur lors de la désignation du patient");
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Détail de l'Hospitalisation</h1>
          <p className="text-muted-foreground">Informations complètes sur l'hospitalisation du patient</p>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <p>Chargement de l'hospitalisation...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!hospitalization) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Détail de l'Hospitalisation</h1>
          <p className="text-muted-foreground">Informations complètes sur l'hospitalisation du patient</p>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <p>Hospitalisation non trouvée</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Détail de l'Hospitalisation</h1>
        <p className="text-muted-foreground">Informations complètes sur l'hospitalisation du patient</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informations d'Hospitalisation</CardTitle>
          <CardDescription>Détails de l'hospitalisation et du patient</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Patient</p>
              <p className="font-medium">{hospitalization.patient.first_name} {hospitalization.patient.last_name} ({hospitalization.patient.medical_record_number})</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Médecin référent</p>
              <p className="font-medium">{hospitalization.referring_doctor ? `${hospitalization.referring_doctor.first_name} ${hospitalization.referring_doctor.last_name}` : "Non assigné"}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Date d'admission</p>
              <p className="font-medium">{new Date(hospitalization.admission_date).toLocaleString('fr-FR')}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Date de sortie</p>
              <p className="font-medium">
                {hospitalization.discharge_date 
                  ? new Date(hospitalization.discharge_date).toLocaleString('fr-FR') 
                  : "Non assignée"}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Centre</p>
              <p className="font-medium">{hospitalization.centre.name}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Service/Chambre/Lit</p>
              <p className="font-medium">
                {hospitalization.service || "N/A"} / 
                {hospitalization.room || "N/A"} / 
                {hospitalization.bed || "N/A"}
              </p>
            </div>
            <div className="space-y-2 col-span-2">
              <p className="text-sm text-muted-foreground">Raison d'admission</p>
              <p className="font-medium">{hospitalization.admission_reason}</p>
            </div>
            <div className="space-y-2 col-span-2">
              <p className="text-sm text-muted-foreground">Résumé de sortie</p>
              <p className="font-medium">{hospitalization.discharge_summary || "Non disponible"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="logs">Journal d'Hospitalisation</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>États de l'Hospitalisation</CardTitle>
              <CardDescription>Statut actuel et actions possibles</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-semibold">Statut de l'hospitalisation</h3>
                    <p className="text-sm text-muted-foreground">
                      {hospitalization.discharge_date 
                        ? "Terminée le " + new Date(hospitalization.discharge_date).toLocaleDateString('fr-FR')
                        : "En cours d'hospitalisation"}
                    </p>
                  </div>
                  {!hospitalization.discharge_date && (
                    <Button variant="destructive" onClick={handleDischargePatient}>
                      <Bed className="mr-2 h-4 w-4" />
                      Désigner le patient
                    </Button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="border rounded-lg p-4">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Jours d'hospitalisation
                    </h3>
                    <p className="text-2xl font-bold mt-2">
                      {hospitalization.discharge_date 
                        ? Math.ceil((new Date(hospitalization.discharge_date).getTime() - new Date(hospitalization.admission_date).getTime()) / (1000 * 3600 * 24))
                        : Math.ceil((new Date().getTime() - new Date(hospitalization.admission_date).getTime()) / (1000 * 3600 * 24))
                      }
                    </p>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Activity className="h-4 w-4" />
                      Entrées de journal
                    </h3>
                    <p className="text-2xl font-bold mt-2">{logs.length}</p>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <h3 className="font-semibold flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Personnel impliqué
                    </h3>
                    <p className="text-2xl font-bold mt-2">
                      {[...new Set(logs.map(log => log.author_id))].length}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle>Journal d'Hospitalisation</CardTitle>
              <CardDescription>Enregistrez et consultez les événements de l'hospitalisation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Nouvelle entrée de journal</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleAddLog} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="log_type">Type d'événement</Label>
                        <Select value={newLog.log_type} onValueChange={(value) => setNewLog({...newLog, log_type: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner le type d'événement" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="MEDICATION">Administration de médicament</SelectItem>
                            <SelectItem value="PROCEDURE">Procédure médicale</SelectItem>
                            <SelectItem value="OBSERVATION">Observation clinique</SelectItem>
                            <SelectItem value="CARE">Soins infirmiers</SelectItem>
                            <SelectItem value="NOTE">Note clinique</SelectItem>
                            <SelectItem value="OTHER">Autre</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="notes">Notes</Label>
                        <Textarea
                          id="notes"
                          value={newLog.notes}
                          onChange={(e) => setNewLog({...newLog, notes: e.target.value})}
                          required
                          placeholder="Décrivez l'événement, les observations, les soins prodigués, etc."
                          rows={4}
                        />
                      </div>
                      
                      <div className="flex justify-end pt-4">
                        <Button type="submit">Ajouter au journal</Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>

                {logs.length > 0 ? (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Historique du journal</h3>
                    <div className="space-y-4">
                      {logs.map((log) => (
                        <Card key={log.id} className="border-l-4 border-l-blue-500">
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <Badge variant="secondary">
                                    {log.log_type === 'MEDICATION' ? 'Médicament' :
                                     log.log_type === 'PROCEDURE' ? 'Procédure' :
                                     log.log_type === 'OBSERVATION' ? 'Observation' :
                                     log.log_type === 'CARE' ? 'Soins' :
                                     log.log_type === 'NOTE' ? 'Note' : log.log_type}
                                  </Badge>
                                  <span className="text-sm text-muted-foreground">
                                    {new Date(log.timestamp).toLocaleString('fr-FR')}
                                  </span>
                                </div>
                                <p className="mt-2">{log.notes}</p>
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {log.author.first_name} {log.author.last_name}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">Aucun journal d'hospitalisation enregistré pour le moment.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}