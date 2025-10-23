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
import { Plus, Eye, Stethoscope, Calendar, User, FileText } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

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

interface Appointment {
  id: string;
  start_time: string;
  reason?: string;
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
  appointment?: Appointment;
}

export function ConsultationManagement() {
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Profile[]>([]);
  const [centres, setCentres] = useState<Centre[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    patient_id: "",
    doctor_id: "",
    centre_id: "",
    appointment_id: "",
    reason_for_visit: "",
    status: "PENDING"
  });
  
  // États pour la pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    fetchConsultationsAndRelatedData();
  }, []);

  const fetchConsultationsAndRelatedData = async () => {
    try {
      // Calculer l'offset pour la pagination
      const offset = (currentPage - 1) * itemsPerPage;

      // Récupérer le nombre total de consultations pour la pagination
      const { count, error: countError } = await supabase
        .from('consultations')
        .select('*', { count: 'exact', head: true });

      if (countError) throw countError;
      setTotalItems(count || 0);

      // Récupérer les consultations avec les informations liées
      const { data: consultationsData, error: consultationsError } = await supabase
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
          patient:patients!patient_id(first_name, last_name, medical_record_number),
          doctor:profiles!doctor_id(first_name, last_name),
          centre:centres!centre_id(name),
          appointment:appointments!appointment_id(start_time, reason)
        `)
        .order('date', { ascending: false })
        .range(offset, offset + itemsPerPage - 1);

      if (consultationsError) throw consultationsError;

      // Transformer les données pour correspondre aux interfaces TypeScript
      // En Supabase, les jointures peuvent retourner des tableaux d'objets au lieu d'objets uniques
      const transformedConsultations: Consultation[] = (consultationsData || []).map((cons: any) => ({
        id: cons.id,
        patient_id: cons.patient_id,
        doctor_id: cons.doctor_id,
        centre_id: cons.centre_id,
        appointment_id: cons.appointment_id,
        date: cons.date,
        status: cons.status,
        reason_for_visit: cons.reason_for_visit,
        clinical_exam_notes: cons.clinical_exam_notes,
        diagnosis: cons.diagnosis,
        follow_up_date: cons.follow_up_date,
        created_at: cons.created_at,
        patient: Array.isArray(cons.patient) && cons.patient.length > 0 ? cons.patient[0] : cons.patient,
        doctor: Array.isArray(cons.doctor) && cons.doctor.length > 0 ? cons.doctor[0] : cons.doctor,
        centre: Array.isArray(cons.centre) && cons.centre.length > 0 ? cons.centre[0] : cons.centre,
        appointment: Array.isArray(cons.appointment) && cons.appointment.length > 0 ? cons.appointment[0] : cons.appointment,
      }));
      
      setConsultations(transformedConsultations);

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
      toast.error("Erreur lors de la récupération des données de consultation");
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
      
      const { error } = await supabase
        .from('consultations')
        .insert([{
          patient_id: formData.patient_id,
          doctor_id: formData.doctor_id || null,
          centre_id: formData.centre_id,
          appointment_id: formData.appointment_id || null,
          reason_for_visit: formData.reason_for_visit || null,
          status: formData.status,
          date: new Date().toISOString()
        }]);

      if (error) throw error;

      toast.success("Consultation créée avec succès");
      
      // Réinitialiser le formulaire et fermer la modale
      setFormData({
        patient_id: "",
        doctor_id: "",
        centre_id: "",
        appointment_id: "",
        reason_for_visit: "",
        status: "PENDING"
      });
      setIsDialogOpen(false);
      
      // Recharger les données
      fetchConsultationsAndRelatedData();
    } catch (error: any) {
      console.error('Erreur lors de la création de la consultation:', error);
      toast.error("Erreur lors de la création de la consultation");
    }
  };

  const handleViewDetails = (id: string) => {
    router.push(`/consultations/${id}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'ONGOING': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'COMPLETED': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PENDING': return 'En attente';
      case 'ONGOING': return 'En cours';
      case 'COMPLETED': return 'Terminée';
      default: return status;
    }
  };

  // Filtrer les consultations en fonction du statut et du terme de recherche
  const filteredConsultations = consultations.filter(consultation => {
    const matchesStatus = filterStatus === "all" || consultation.status === filterStatus;
    const matchesSearch = 
      consultation.patient.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      consultation.patient.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      consultation.patient.medical_record_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      consultation.reason_for_visit?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      consultation.diagnosis?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestion des Consultations</h1>
          <p className="text-muted-foreground">Créer, modifier et gérer les consultations médicales</p>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <p>Chargement des consultations...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Gestion des Consultations</h1>
        <p className="text-muted-foreground">Créer, modifier et gérer les consultations médicales</p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Consultations</CardTitle>
            <CardDescription>Gérer les consultations médicales</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Input
                placeholder="Rechercher des consultations..."
                className="pl-8 w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <FileText className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Tous les statuts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="PENDING">En attente</SelectItem>
                <SelectItem value="ONGOING">En cours</SelectItem>
                <SelectItem value="COMPLETED">Terminées</SelectItem>
              </SelectContent>
            </Select>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Nouvelle Consultation
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Créer une nouvelle consultation</DialogTitle>
                  <DialogDescription>
                    Planifier une consultation médicale pour un patient
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
                    <Label htmlFor="doctor_id">Médecin</Label>
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
                  <div className="space-y-2">
                    <Label htmlFor="status">Statut</Label>
                    <Select value={formData.status} onValueChange={(value) => handleSelectChange('status', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner le statut" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PENDING">En attente</SelectItem>
                        <SelectItem value="ONGOING">En cours</SelectItem>
                        <SelectItem value="COMPLETED">Terminée</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reason_for_visit">Motif de la consultation</Label>
                    <Textarea
                      id="reason_for_visit"
                      name="reason_for_visit"
                      value={formData.reason_for_visit}
                      onChange={handleInputChange}
                      placeholder="Décrivez le motif de la consultation"
                      rows={3}
                    />
                  </div>
                  
                  <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Annuler
                    </Button>
                    <Button type="submit">
                      <Stethoscope className="mr-2 h-4 w-4" />
                      Créer la consultation
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
                <TableHead>Motif</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredConsultations.map((consultation) => (
                <TableRow key={consultation.id}>
                  <TableCell>
                    <div className="font-medium">
                      {consultation.patient.first_name} {consultation.patient.last_name}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {consultation.patient.medical_record_number}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      {format(new Date(consultation.date), 'dd MMM yyyy', { locale: fr })}
                    </div>
                  </TableCell>
                  <TableCell>
                    {consultation.doctor 
                      ? `${consultation.doctor.first_name} ${consultation.doctor.last_name}`
                      : "Non assigné"}
                  </TableCell>
                  <TableCell>{consultation.centre.name}</TableCell>
                  <TableCell className="max-w-xs truncate">{consultation.reason_for_visit || "-"}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(consultation.status)}>
                      {getStatusLabel(consultation.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewDetails(consultation.id)}
                    >
                      <Eye className="h-4 w-4" />
                      Détails
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {filteredConsultations.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              {consultations.length === 0 
                ? "Aucune consultation trouvée. Créez votre première consultation en cliquant sur le bouton 'Nouvelle Consultation'."
                : "Aucune consultation ne correspond à vos critères de filtrage."}
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