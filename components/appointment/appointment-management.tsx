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
import { Plus, Pencil, Trash2, Calendar, Clock, User, MapPin } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface Patient {
  id: string;
  medical_record_number: string;
  first_name: string;
  last_name: string;
}

interface Profile {
  id: string;
  role: string;
  first_name: string;
  last_name: string;
}

interface Centre {
  id: string;
  name: string;
}

interface Appointment {
  id: string;
  patient_id: string;
  doctor_id?: string;
  centre_id: string;
  start_time: string;
  end_time: string;
  reason?: string;
  status: string;
  created_at: string;
  patient: Patient;
  doctor?: Profile;
  centre: Centre;
}

export function AppointmentManagement() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Profile[]>([]);
  const [centres, setCentres] = useState<Centre[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    patient_id: "",
    doctor_id: "",
    centre_id: "",
    start_time: "",
    end_time: "",
    reason: "",
    status: "SCHEDULED"
  });

  const supabase = createClient();

  useEffect(() => {
    fetchAppointmentsAndRelatedData();
  }, []);

  const fetchAppointmentsAndRelatedData = async () => {
    try {
      // Récupérer les rendez-vous avec les informations liées
      const { data: appointmentsData, error: appointmentsError } = await supabase
        .from('appointments')
        .select(`
          id,
          patient_id,
          doctor_id,
          centre_id,
          start_time,
          end_time,
          reason,
          status,
          created_at,
          patient:patients!patient_id(medical_record_number, first_name, last_name),
          doctor:profiles!doctor_id(first_name, last_name, role),
          centre:centres!centre_id(name)
        `)
        .order('start_time', { ascending: false });

      if (appointmentsError) throw appointmentsError;

      // Transformer les données pour correspondre aux interfaces TypeScript
      // En Supabase, les jointures peuvent retourner des tableaux d'objets au lieu d'objets uniques
      const transformedAppointments: Appointment[] = (appointmentsData || []).map((apt: any) => ({
        id: apt.id,
        patient_id: apt.patient_id,
        doctor_id: apt.doctor_id,
        centre_id: apt.centre_id,
        start_time: apt.start_time,
        end_time: apt.end_time,
        reason: apt.reason,
        status: apt.status,
        created_at: apt.created_at,
        patient: Array.isArray(apt.patient) && apt.patient.length > 0 ? apt.patient[0] : apt.patient,
        doctor: Array.isArray(apt.doctor) && apt.doctor.length > 0 ? apt.doctor[0] : apt.doctor,
        centre: Array.isArray(apt.centre) && apt.centre.length > 0 ? apt.centre[0] : apt.centre,
      }));
      
      setAppointments(transformedAppointments);

      // Récupérer les patients
      const { data: patientsData, error: patientsError } = await supabase
        .from('patients')
        .select('id, medical_record_number, first_name, last_name')
        .order('last_name');

      if (patientsError) throw patientsError;

      setPatients(patientsData || []);

      // Récupérer les médecins
      const { data: doctorsData, error: doctorsError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, role')
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
      toast.error("Erreur lors de la récupération des rendez-vous et données liées");
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
    
    // Vérifier que les dates sont valides
    const start = new Date(formData.start_time);
    const end = new Date(formData.end_time);
    
    if (start >= end) {
      toast.error("La date de fin doit être postérieure à la date de début");
      return;
    }
    
    try {
      if (editingAppointment) {
        // Mise à jour d'un rendez-vous existant
        const { error } = await supabase
          .from('appointments')
          .update({
            patient_id: formData.patient_id,
            doctor_id: formData.doctor_id || null,
            centre_id: formData.centre_id,
            start_time: formData.start_time,
            end_time: formData.end_time,
            reason: formData.reason || null,
            status: formData.status
          })
          .eq('id', editingAppointment.id);

        if (error) throw error;
        
        toast.success("Rendez-vous mis à jour avec succès");
      } else {
        // Création d'un nouveau rendez-vous
        const { error } = await supabase
          .from('appointments')
          .insert([{
            patient_id: formData.patient_id,
            doctor_id: formData.doctor_id || null,
            centre_id: formData.centre_id,
            start_time: formData.start_time,
            end_time: formData.end_time,
            reason: formData.reason || null,
            status: formData.status
          }]);

        if (error) throw error;
        
        toast.success("Rendez-vous créé avec succès");
      }

      // Réinitialiser le formulaire et fermer la modale
      setFormData({ 
        patient_id: "",
        doctor_id: "",
        centre_id: "",
        start_time: "",
        end_time: "",
        reason: "",
        status: "SCHEDULED"
      });
      setEditingAppointment(null);
      setIsDialogOpen(false);
      
      // Recharger la liste des rendez-vous
      fetchAppointmentsAndRelatedData();
    } catch (error: any) {
      console.error('Erreur lors de la sauvegarde du rendez-vous:', error);
      toast.error(editingAppointment ? "Erreur lors de la mise à jour du rendez-vous" : "Erreur lors de la création du rendez-vous");
    }
  };

  const handleEdit = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    setFormData({
      patient_id: appointment.patient_id,
      doctor_id: appointment.doctor_id || "",
      centre_id: appointment.centre_id,
      start_time: appointment.start_time,
      end_time: appointment.end_time,
      reason: appointment.reason || "",
      status: appointment.status
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce rendez-vous ? Cette action est irréversible.")) return;

    try {
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success("Rendez-vous supprimé avec succès");
      fetchAppointmentsAndRelatedData();
    } catch (error: any) {
      console.error('Erreur lors de la suppression du rendez-vous:', error);
      toast.error("Erreur lors de la suppression du rendez-vous");
    }
  };

  const handleNewAppointment = () => {
    setEditingAppointment(null);
    setFormData({ 
      patient_id: "",
      doctor_id: "",
      centre_id: "",
      start_time: "",
      end_time: "",
      reason: "",
      status: "SCHEDULED"
    });
    setIsDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestion des Rendez-vous</h1>
          <p className="text-muted-foreground">Planifier et gérer les rendez-vous des patients</p>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <p>Chargement des rendez-vous...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Gestion des Rendez-vous</h1>
        <p className="text-muted-foreground">Planifier et gérer les rendez-vous des patients</p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Rendez-vous</CardTitle>
            <CardDescription>Planifier et gérer les rendez-vous</CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleNewAppointment}>
                <Plus className="mr-2 h-4 w-4" />
                Nouveau Rendez-vous
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingAppointment ? "Modifier un rendez-vous" : "Créer un nouveau rendez-vous"}
                </DialogTitle>
                <DialogDescription>
                  {editingAppointment 
                    ? "Modifiez les informations du rendez-vous"
                    : "Planifiez un nouveau rendez-vous pour un patient"}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
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
                    <Label htmlFor="centre_id">Centre</Label>
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
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="doctor_id">Médecin (Optionnel)</Label>
                    <Select value={formData.doctor_id} onValueChange={(value) => handleSelectChange('doctor_id', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un médecin" />
                      </SelectTrigger>
                      <SelectContent>
                        {doctors.map((doctor) => (
                          <SelectItem key={doctor.id} value={doctor.id}>
                            {doctor.first_name} {doctor.last_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Statut</Label>
                    <Select value={formData.status} onValueChange={(value) => handleSelectChange('status', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner le statut" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SCHEDULED">Planifié</SelectItem>
                        <SelectItem value="COMPLETED">Terminé</SelectItem>
                        <SelectItem value="CANCELLED">Annulé</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start_time">Date et heure de début</Label>
                    <Input
                      id="start_time"
                      name="start_time"
                      type="datetime-local"
                      value={formData.start_time}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end_time">Date et heure de fin</Label>
                    <Input
                      id="end_time"
                      name="end_time"
                      type="datetime-local"
                      value={formData.end_time}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reason">Motif du rendez-vous</Label>
                  <Input
                    id="reason"
                    name="reason"
                    value={formData.reason}
                    onChange={handleInputChange}
                    placeholder="Consultation de suivi, Bilan de santé, etc."
                  />
                </div>
                
                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Annuler
                  </Button>
                  <Button type="submit">
                    {editingAppointment ? "Mettre à jour" : "Créer le rendez-vous"}
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
                <TableHead>Médecin</TableHead>
                <TableHead>Centre</TableHead>
                <TableHead>Motif</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {appointments.map((appointment) => (
                <TableRow key={appointment.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{appointment.patient.first_name} {appointment.patient.last_name}</p>
                        <p className="text-xs text-muted-foreground">{appointment.patient.medical_record_number}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p>{format(new Date(appointment.start_time), 'dd MMM yyyy', { locale: fr })}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(appointment.start_time), 'HH:mm', { locale: fr })} - {format(new Date(appointment.end_time), 'HH:mm', { locale: fr })}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {appointment.doctor ? (
                      <div>
                        <p>{appointment.doctor.first_name} {appointment.doctor.last_name}</p>
                        <p className="text-xs text-muted-foreground">{appointment.doctor.role === 'GENERAL_DOCTOR' ? 'Médecin Général' : 'Médecin Spécialiste'}</p>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">Non assigné</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      {appointment.centre.name}
                    </div>
                  </TableCell>
                  <TableCell>{appointment.reason || "-"}</TableCell>
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
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(appointment)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(appointment.id)}
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
          
          {appointments.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Aucun rendez-vous trouvé. Créez votre premier rendez-vous en cliquant sur le bouton "Nouveau Rendez-vous".
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}