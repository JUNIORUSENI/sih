"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Users, 
  Bed, 
  AlertTriangle, 
  FileText, 
  Calendar, 
  Activity
} from "lucide-react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface Patient {
  id: string;
  first_name: string;
  last_name: string;
  medical_record_number: string;
}

interface Hospitalization {
  id: string;
  patient_id: string;
  admission_date: string;
  discharge_date?: string;
  admission_reason: string;
  patient: Patient;
}

interface Emergency {
  id: string;
  patient_id: string;
  admission_time: string;
  triage_level: string;
  reason: string;
  patient: Patient;
}

interface Consultation {
  id: string;
  patient_id: string;
  date: string;
  status: string;
  reason_for_visit?: string;
  patient: Patient;
}

interface Prescription {
  id: string;
  created_at: string;
  medication_name: string;
  patient: Patient;
}

export function DashboardOverview() {
  const [stats, setStats] = useState({
    totalPatients: 0,
    activeHospitalizations: 0,
    pendingEmergencies: 0,
    pendingConsultations: 0,
    newPrescriptions: 0
  });
  
  const [recentHospitalizations, setRecentHospitalizations] = useState<Hospitalization[]>([]);
  const [recentEmergencies, setRecentEmergencies] = useState<Emergency[]>([]);
  const [recentConsultations, setRecentConsultations] = useState<Consultation[]>([]);
  const [recentPrescriptions, setRecentPrescriptions] = useState<Prescription[]>([]);
  
  const [loading, setLoading] = useState(true);
  
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Récupérer les statistiques
      const [
        patientsResult,
        hospitalizationsResult,
        emergenciesResult,
        consultationsResult,
        prescriptionsResult
      ] = await Promise.all([
        // Total des patients
        supabase.from('patients').select('*', { count: 'exact', head: true }),
        
        // Hospitalisations actives
        supabase
          .from('hospitalisations')
          .select('*', { count: 'exact', head: true })
          .is('discharge_date', null),
        
        // Urgences en attente
        supabase
          .from('emergencies')
          .select('*', { count: 'exact', head: true })
          .is('discharge_time', null),
        
        // Consultations en attente
        supabase
          .from('consultations')
          .select('*', { count: 'exact', head: true })
          .in('status', ['PENDING', 'ONGOING']),
        
        // Nouvelles prescriptions (dernières 24h)
        supabase
          .from('prescriptions')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      ]);

      // Récupérer les détails pour les listes récentes
      const [
        recentHospitalizationsResult,
        recentEmergenciesResult,
        recentConsultationsResult,
        recentPrescriptionsResult
      ] = await Promise.all([
        // Hospitalisations récentes
        supabase
          .from('hospitalisations')
          .select(`
            id,
            patient_id,
            admission_date,
            discharge_date,
            admission_reason,
            patient:patients!patient_id(first_name, last_name, medical_record_number)
          `)
          .order('admission_date', { ascending: false })
          .limit(5),
        
        // Urgences récentes
        supabase
          .from('emergencies')
          .select(`
            id,
            patient_id,
            admission_time,
            triage_level,
            reason,
            patient:patients!patient_id(first_name, last_name, medical_record_number)
          `)
          .order('admission_time', { ascending: false })
          .limit(5),
        
        // Consultations récentes
        supabase
          .from('consultations')
          .select(`
            id,
            patient_id,
            date,
            status,
            reason_for_visit,
            patient:patients!patient_id(first_name, last_name, medical_record_number)
          `)
          .order('date', { ascending: false })
          .limit(5),
        
        // Prescriptions récentes
        supabase
          .from('prescriptions')
          .select(`
            id,
            created_at,
            medication_name,
            consultation:consultations!consultation_id(patient:patients!patient_id(first_name, last_name, medical_record_number))
          `)
          .order('created_at', { ascending: false })
          .limit(5)
      ]);

      if (patientsResult.error) throw patientsResult.error;
      if (hospitalizationsResult.error) throw hospitalizationsResult.error;
      if (emergenciesResult.error) throw emergenciesResult.error;
      if (consultationsResult.error) throw consultationsResult.error;
      if (prescriptionsResult.error) throw prescriptionsResult.error;
      if (recentHospitalizationsResult.error) throw recentHospitalizationsResult.error;
      if (recentEmergenciesResult.error) throw recentEmergenciesResult.error;
      if (recentConsultationsResult.error) throw recentConsultationsResult.error;
      if (recentPrescriptionsResult.error) throw recentPrescriptionsResult.error;

      setStats({
        totalPatients: patientsResult.count || 0,
        activeHospitalizations: hospitalizationsResult.count || 0,
        pendingEmergencies: emergenciesResult.count || 0,
        pendingConsultations: consultationsResult.count || 0,
        newPrescriptions: prescriptionsResult.count || 0
      });

      // Transformer les données pour correspondre aux interfaces TypeScript
      // En Supabase, les jointures peuvent retourner des tableaux d'objets au lieu d'objets uniques
      
      // Transformer les hospitalisations récentes
      const transformedHospitalizations: Hospitalization[] = (recentHospitalizationsResult.data || []).map((hosp: any) => ({
        id: hosp.id,
        patient_id: hosp.patient_id,
        admission_date: hosp.admission_date,
        discharge_date: hosp.discharge_date,
        admission_reason: hosp.admission_reason,
        patient: Array.isArray(hosp.patient) && hosp.patient.length > 0 ? hosp.patient[0] : hosp.patient,
      }));
      
      // Transformer les urgences récentes
      const transformedEmergencies: Emergency[] = (recentEmergenciesResult.data || []).map((emerg: any) => ({
        id: emerg.id,
        patient_id: emerg.patient_id,
        admission_time: emerg.admission_time,
        triage_level: emerg.triage_level,
        reason: emerg.reason,
        patient: Array.isArray(emerg.patient) && emerg.patient.length > 0 ? emerg.patient[0] : emerg.patient,
      }));
      
      // Transformer les consultations récentes
      const transformedConsultations: Consultation[] = (recentConsultationsResult.data || []).map((cons: any) => ({
        id: cons.id,
        patient_id: cons.patient_id,
        date: cons.date,
        status: cons.status,
        reason_for_visit: cons.reason_for_visit,
        patient: Array.isArray(cons.patient) && cons.patient.length > 0 ? cons.patient[0] : cons.patient,
      }));
      
      // Transformer les prescriptions récentes
      const transformedPrescriptions: Prescription[] = (recentPrescriptionsResult.data || []).map((presc: any) => ({
        id: presc.id,
        created_at: presc.created_at,
        medication_name: presc.medication_name,
        patient: Array.isArray(presc.consultation) && presc.consultation.length > 0 && presc.consultation[0].patient 
          ? presc.consultation[0].patient 
          : { id: '', first_name: '', last_name: '', medical_record_number: '' },
      }));

      setRecentHospitalizations(transformedHospitalizations);
      setRecentEmergencies(transformedEmergencies);
      setRecentConsultations(transformedConsultations);
      setRecentPrescriptions(transformedPrescriptions);
    } catch (error: any) {
      console.error('Erreur lors de la récupération des données du tableau de bord:', error);
    } finally {
      setLoading(false);
    }
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'ONGOING': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'COMPLETED': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tableau de Bord Médical</h1>
          <p className="text-muted-foreground">Vue d'ensemble de l'activité médicale</p>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <p>Chargement du tableau de bord...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Tableau de Bord Médical</h1>
        <p className="text-muted-foreground">Vue d'ensemble de l'activité médicale</p>
      </div>

      {/* Statistiques */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription>Total des patients</CardDescription>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPatients}</div>
            <p className="text-xs text-muted-foreground">+12% par rapport au mois dernier</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription>Hospitalisations actives</CardDescription>
            <Bed className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeHospitalizations}</div>
            <p className="text-xs text-muted-foreground">+3 depuis hier</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription>Urgences en attente</CardDescription>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingEmergencies}</div>
            <p className="text-xs text-muted-foreground">Niveau de triage prioritaire</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription>Consultations en cours</CardDescription>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingConsultations}</div>
            <p className="text-xs text-muted-foreground">patients en attente</p>
          </CardContent>
        </Card>
      </div>

      {/* Sections principales */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Hospitalisations récentes */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Hospitalisations récentes</CardTitle>
            <Button variant="outline" size="sm" onClick={() => router.push('/hospitalizations')}>
              Voir tout
            </Button>
          </CardHeader>
          <CardContent>
            {recentHospitalizations.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentHospitalizations.map((hosp) => (
                    <TableRow key={hosp.id}>
                      <TableCell>
                        <div className="font-medium">
                          {hosp.patient.first_name} {hosp.patient.last_name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {hosp.patient.medical_record_number}
                        </div>
                      </TableCell>
                      <TableCell>
                        {format(new Date(hosp.admission_date), 'dd MMM', { locale: fr })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-muted-foreground text-center py-4">Aucune hospitalisation récente</p>
            )}
          </CardContent>
        </Card>

        {/* Urgences récentes */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Urgences récentes</CardTitle>
            <Button variant="outline" size="sm" onClick={() => router.push('/emergencies')}>
              Voir tout
            </Button>
          </CardHeader>
          <CardContent>
            {recentEmergencies.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient</TableHead>
                    <TableHead>Triage</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentEmergencies.map((emerg) => (
                    <TableRow key={emerg.id}>
                      <TableCell>
                        <div className="font-medium">
                          {emerg.patient.first_name} {emerg.patient.last_name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getTriageColor(emerg.triage_level)}>
                          {getTriageLabel(emerg.triage_level)}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-muted-foreground text-center py-4">Aucune urgence récente</p>
            )}
          </CardContent>
        </Card>

        {/* Consultations récentes */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Consultations récentes</CardTitle>
            <Button variant="outline" size="sm" onClick={() => router.push('/consultations')}>
              Voir tout
            </Button>
          </CardHeader>
          <CardContent>
            {recentConsultations.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient</TableHead>
                    <TableHead>Statut</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentConsultations.map((cons) => (
                    <TableRow key={cons.id}>
                      <TableCell>
                        <div className="font-medium">
                          {cons.patient.first_name} {cons.patient.last_name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(cons.status)}>
                          {cons.status === 'PENDING' ? 'En attente' :
                           cons.status === 'ONGOING' ? 'En cours' :
                           'Terminée'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-muted-foreground text-center py-4">Aucune consultation récente</p>
            )}
          </CardContent>
        </Card>

        {/* Prescriptions récentes */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Nouvelles ordonnances</CardTitle>
            <Button variant="outline" size="sm" onClick={() => router.push('/prescriptions')}>
              Voir tout
            </Button>
          </CardHeader>
          <CardContent>
            {recentPrescriptions.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Médicament</TableHead>
                    <TableHead>Patient</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentPrescriptions.map((presc) => (
                    <TableRow key={presc.id}>
                      <TableCell className="font-medium">
                        {presc.medication_name}
                      </TableCell>
                      <TableCell>
                        {presc.patient && presc.patient.first_name && presc.patient.last_name
                          ? `${presc.patient.first_name} ${presc.patient.last_name}`
                          : "Patient inconnu"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-muted-foreground text-center py-4">Aucune nouvelle ordonnance</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}