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
import { Plus, Eye, Calendar, FileText } from "lucide-react";
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
  patient: Patient;
  referring_doctor?: Profile;
  centre: Centre;
}

export function HospitalizationManagement() {
  const [hospitalizations, setHospitalizations] = useState<Hospitalization[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Profile[]>([]);
  const [centres, setCentres] = useState<Centre[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    patient_id: "",
    referring_doctor_id: "",
    centre_id: "",
    service: "",
    room: "",
    bed: "",
    admission_reason: ""
  });
  
  // États pour la pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    fetchHospitalizationsAndRelatedData();
  }, []);

  const fetchHospitalizationsAndRelatedData = async () => {
    try {
      // Calculer l'offset pour la pagination
      const offset = (currentPage - 1) * itemsPerPage;

      // Récupérer le nombre total d'hospitalisations pour la pagination
      const { count, error: countError } = await supabase
        .from('hospitalisations')
        .select('*', { count: 'exact', head: true });

      if (countError) throw countError;
      setTotalItems(count || 0);

      // Récupérer les hospitalisations avec les informations liées
      const { data: hospitalizationsData, error: hospitalizationsError } = await supabase
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
          patient:patients!patient_id(first_name, last_name, medical_record_number),
          referring_doctor:profiles!referring_doctor_id(first_name, last_name),
          centre:centres!centre_id(name)
        `)
        .order('admission_date', { ascending: false })
        .range(offset, offset + itemsPerPage - 1);

      if (hospitalizationsError) throw hospitalizationsError;

      // Transformer les données pour correspondre aux interfaces TypeScript
      // En Supabase, les jointures peuvent retourner des tableaux d'objets au lieu d'objets uniques
      const transformedHospitalizations: Hospitalization[] = (hospitalizationsData || []).map((hosp: any) => ({
        id: hosp.id,
        patient_id: hosp.patient_id,
        referring_doctor_id: hosp.referring_doctor_id,
        centre_id: hosp.centre_id,
        service: hosp.service,
        room: hosp.room,
        bed: hosp.bed,
        admission_date: hosp.admission_date,
        discharge_date: hosp.discharge_date,
        admission_reason: hosp.admission_reason,
        discharge_summary: hosp.discharge_summary,
        patient: Array.isArray(hosp.patient) && hosp.patient.length > 0 ? hosp.patient[0] : hosp.patient,
        referring_doctor: Array.isArray(hosp.referring_doctor) && hosp.referring_doctor.length > 0 ? hosp.referring_doctor[0] : hosp.referring_doctor,
        centre: Array.isArray(hosp.centre) && hosp.centre.length > 0 ? hosp.centre[0] : hosp.centre,
      }));
      
      setHospitalizations(transformedHospitalizations);

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
      toast.error("Erreur lors de la récupération des données d'hospitalisation");
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
      
      // Création d'une nouvelle hospitalisation
      const { error } = await supabase
        .from('hospitalisations')
        .insert([{
          patient_id: formData.patient_id,
          referring_doctor_id: formData.referring_doctor_id || null,
          centre_id: formData.centre_id,
          service: formData.service || null,
          room: formData.room || null,
          bed: formData.bed || null,
          admission_reason: formData.admission_reason,
          admission_date: new Date().toISOString()
        }]);

      if (error) throw error;

      toast.success("Hospitalisation créée avec succès");
      
      // Réinitialiser le formulaire et fermer la modale
      setFormData({
        patient_id: "",
        referring_doctor_id: "",
        centre_id: "",
        service: "",
        room: "",
        bed: "",
        admission_reason: ""
      });
      setIsDialogOpen(false);
      
      // Recharger les données
      fetchHospitalizationsAndRelatedData();
    } catch (error: any) {
      console.error('Erreur lors de la création de l\'hospitalisation:', error);
      toast.error("Erreur lors de la création de l'hospitalisation");
    }
  };

  const handleViewDetails = (id: string) => {
    router.push(`/hospitalizations/${id}`);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestion des Hospitalisations</h1>
          <p className="text-muted-foreground">Créer, modifier et gérer les hospitalisations</p>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <p>Chargement des hospitalisations...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Gestion des Hospitalisations</h1>
        <p className="text-muted-foreground">Créer, modifier et gérer les hospitalisations</p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Hospitalisations</CardTitle>
            <CardDescription>Gérer les hospitalisations des patients</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Input
                placeholder="Rechercher des hospitalisations..."
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
                <SelectItem value="active">En cours</SelectItem>
                <SelectItem value="completed">Terminées</SelectItem>
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
                  <Plus className="mr-2 h-4 w-4" />
                  Nouvelle Hospitalisation
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Créer une nouvelle hospitalisation</DialogTitle>
                  <DialogDescription>
                    Remplissez les détails pour hospitaliser un patient
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
                    <Label htmlFor="referring_doctor_id">Médecin référent</Label>
                    <Select value={formData.referring_doctor_id} onValueChange={(value) => handleSelectChange('referring_doctor_id', value)}>
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
                  <div className="grid grid-cols-2 gap-4">
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
                      <Label htmlFor="service">Service</Label>
                      <Input
                        id="service"
                        name="service"
                        value={formData.service}
                        onChange={handleInputChange}
                        placeholder="Ex: Cardiologie, Pneumologie"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="room">Chambre</Label>
                      <Input
                        id="room"
                        name="room"
                        value={formData.room}
                        onChange={handleInputChange}
                        placeholder="Ex: 201"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bed">Lit</Label>
                      <Input
                        id="bed"
                        name="bed"
                        value={formData.bed}
                        onChange={handleInputChange}
                        placeholder="Ex: A"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="admission_reason">Raison d'admission</Label>
                    <Textarea
                      id="admission_reason"
                      name="admission_reason"
                      value={formData.admission_reason}
                      onChange={handleInputChange}
                      required
                      placeholder="Décrivez la raison de l'admission"
                      rows={3}
                    />
                  </div>
                  
                  <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Annuler
                    </Button>
                    <Button type="submit">Créer l'hospitalisation</Button>
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
                <TableHead>Date d'admission</TableHead>
                <TableHead>Médecin</TableHead>
                <TableHead>Centre</TableHead>
                <TableHead>Service/Chambre/Lit</TableHead>
                <TableHead>Raison</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {hospitalizations.map((hospitalization) => (
                <TableRow key={hospitalization.id}>
                  <TableCell>
                    <div className="font-medium">
                      {hospitalization.patient.first_name} {hospitalization.patient.last_name}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {hospitalization.patient.medical_record_number}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      {new Date(hospitalization.admission_date).toLocaleDateString('fr-FR')}
                    </div>
                  </TableCell>
                  <TableCell>
                    {hospitalization.referring_doctor 
                      ? `${hospitalization.referring_doctor.first_name} ${hospitalization.referring_doctor.last_name}`
                      : "Non assigné"}
                  </TableCell>
                  <TableCell>{hospitalization.centre.name}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {hospitalization.service || "N/A"} / 
                      {hospitalization.room || "N/A"} / 
                      {hospitalization.bed || "N/A"}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">{hospitalization.admission_reason}</TableCell>
                  <TableCell>
                    {hospitalization.discharge_date ? (
                      <Badge variant="outline">Terminée</Badge>
                    ) : (
                      <Badge variant="default">En cours</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewDetails(hospitalization.id)}
                    >
                      <Eye className="h-4 w-4" />
                      Détails
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {hospitalizations.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              {totalItems === 0 
                ? "Aucune hospitalisation trouvée. Créez votre première hospitalisation en cliquant sur le bouton 'Nouvelle Hospitalisation'."
                : "Aucune hospitalisation ne correspond à vos critères de filtrage."}
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