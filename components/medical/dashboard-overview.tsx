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
  Activity,
  TrendingUp,
  ArrowRight
} from "lucide-react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";
import { ErrorDisplay } from "@/components/ui/error-display";

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

export function DashboardOverview() {
  const [stats, setStats] = useState({
    totalPatients: 0,
    activeHospitalizations: 0,
    pendingEmergencies: 0,
    pendingConsultations: 0,
    todayAppointments: 0
  });
  
  const [recentHospitalizations, setRecentHospitalizations] = useState<Hospitalization[]>([]);
  const [recentEmergencies, setRecentEmergencies] = useState<Emergency[]>([]);
  const [recentConsultations, setRecentConsultations] = useState<Consultation[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setError(null);
      
      // Récupérer les statistiques
      const [
        patientsResult,
        hospitalizationsResult,
        emergenciesResult,
        consultationsResult,
        appointmentsResult
      ] = await Promise.all([
        supabase.from('patients').select('*', { count: 'exact', head: true }),
        supabase.from('hospitalisations').select('*', { count: 'exact', head: true }).is('discharge_date', null),
        supabase.from('emergencies').select('*', { count: 'exact', head: true }).is('discharge_time', null),
        supabase.from('consultations').select('*', { count: 'exact', head: true }).in('status', ['PENDING', 'ONGOING']),
        supabase.from('appointments').select('*', { count: 'exact', head: true })
          .gte('start_time', new Date().toISOString().split('T')[0])
          .lt('start_time', new Date(Date.now() + 86400000).toISOString().split('T')[0])
      ]);

      // Récupérer les détails
      const [hospitalizationsData, emergenciesData, consultationsData] = await Promise.all([
        supabase
          .from('hospitalisations')
          .select('id, patient_id, admission_date, discharge_date, admission_reason, patients!patient_id(id, first_name, last_name, medical_record_number)')
          .order('admission_date', { ascending: false })
          .limit(5),
        
        supabase
          .from('emergencies')
          .select('id, patient_id, admission_time, triage_level, reason, patients!patient_id(id, first_name, last_name, medical_record_number)')
          .order('admission_time', { ascending: false })
          .limit(5),
        
        supabase
          .from('consultations')
          .select('id, patient_id, date, status, reason_for_visit, patients!patient_id(id, first_name, last_name, medical_record_number)')
          .order('date', { ascending: false })
          .limit(5)
      ]);

      setStats({
        totalPatients: patientsResult.count || 0,
        activeHospitalizations: hospitalizationsResult.count || 0,
        pendingEmergencies: emergenciesResult.count || 0,
        pendingConsultations: consultationsResult.count || 0,
        todayAppointments: appointmentsResult.count || 0
      });

      setRecentHospitalizations((hospitalizationsData.data || []).map((h: any) => ({
        ...h,
        patient: h.patients
      })));
      setRecentEmergencies((emergenciesData.data || []).map((e: any) => ({
        ...e,
        patient: e.patients
      })));
      setRecentConsultations((consultationsData.data || []).map((c: any) => ({
        ...c,
        patient: c.patients
      })));

    } catch (error: any) {
      console.error('Erreur lors de la récupération des données:', error);
      const errorMessage = error.message || "Erreur lors de la récupération des données du tableau de bord";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: "Patients Total",
      value: stats.totalPatients,
      description: "Patients enregistrés",
      icon: Users,
      color: "bg-blue-500",
      trend: "+12% ce mois",
    },
    {
      title: "Hospitalisations",
      value: stats.activeHospitalizations,
      description: "En cours",
      icon: Bed,
      color: "bg-purple-500",
      trend: "+3 depuis hier",
    },
    {
      title: "Urgences",
      value: stats.pendingEmergencies,
      description: "En attente de traitement",
      icon: AlertTriangle,
      color: "bg-red-500",
      trend: "Prioritaire",
    },
    {
      title: "Consultations",
      value: stats.pendingConsultations,
      description: "En cours ou en attente",
      icon: Activity,
      color: "bg-green-500",
      trend: "Aujourd'hui",
    },
    {
      title: "Rendez-vous",
      value: stats.todayAppointments,
      description: "Programmés aujourd'hui",
      icon: Calendar,
      color: "bg-gold",
      trend: "Aujourd'hui",
    },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Tableau de Bord Médical</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Vue d'ensemble de l'activité médicale</p>
        </div>
        <Card className="border-gray-200 dark:border-gray-800">
          <CardContent className="flex items-center justify-center h-64">
            <p className="text-gray-600 dark:text-gray-400">Chargement...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <ErrorDisplay
          title="Erreur de chargement"
          message={error}
          type="error"
          onRetry={() => {
            setLoading(true);
            fetchDashboardData();
          }}
          onDismiss={() => setError(null)}
        />
      )}

      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Tableau de Bord Médical</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Vue d'ensemble de l'activité médicale</p>
      </div>

      {/* Statistiques */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="border-gray-200 dark:border-gray-800 hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {stat.title}
                </CardTitle>
                <div className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                  {stat.value}
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                  {stat.description}
                </p>
                <div className="flex items-center text-xs text-green-600 dark:text-green-400">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  {stat.trend}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Sections principales */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Hospitalisations récentes */}
        <Card className="border-gray-200 dark:border-gray-800 shadow-sm">
          <CardHeader className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl text-gray-900 dark:text-white">Hospitalisations récentes</CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  {recentHospitalizations.length} hospitalisation{recentHospitalizations.length > 1 ? 's' : ''}
                </CardDescription>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => router.push('/hospitalizations')}
                className="hover:bg-gold/10 hover:text-gold hover:border-gold"
              >
                Voir tout
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {recentHospitalizations.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50 dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-900">
                      <TableHead className="font-semibold text-gray-900 dark:text-white">Patient</TableHead>
                      <TableHead className="font-semibold text-gray-900 dark:text-white">Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentHospitalizations.map((hosp) => (
                      <TableRow key={hosp.id} className="hover:bg-hover dark:hover:bg-gray-800 cursor-pointer" onClick={() => router.push(`/hospitalizations/${hosp.id}`)}>
                        <TableCell>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {hosp.patient?.first_name} {hosp.patient?.last_name}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {hosp.patient?.medical_record_number}
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-600 dark:text-gray-400">
                          {format(new Date(hosp.admission_date), 'dd MMM yyyy', { locale: fr })}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <Bed className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-sm">Aucune hospitalisation récente</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Urgences récentes */}
        <Card className="border-gray-200 dark:border-gray-800 shadow-sm">
          <CardHeader className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl text-gray-900 dark:text-white">Urgences récentes</CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  {recentEmergencies.length} urgence{recentEmergencies.length > 1 ? 's' : ''}
                </CardDescription>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => router.push('/emergencies')}
                className="hover:bg-gold/10 hover:text-gold hover:border-gold"
              >
                Voir tout
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {recentEmergencies.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50 dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-900">
                      <TableHead className="font-semibold text-gray-900 dark:text-white">Patient</TableHead>
                      <TableHead className="font-semibold text-gray-900 dark:text-white">Triage</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentEmergencies.map((emerg) => (
                      <TableRow key={emerg.id} className="hover:bg-hover dark:hover:bg-gray-800 cursor-pointer" onClick={() => router.push(`/emergencies/${emerg.id}`)}>
                        <TableCell>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {emerg.patient?.first_name} {emerg.patient?.last_name}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={
                            emerg.triage_level === 'IMMEDIATE' ? 'bg-red-500 text-white' :
                            emerg.triage_level === 'URGENT' ? 'bg-orange-500 text-white' :
                            emerg.triage_level === 'DELAYED' ? 'bg-yellow-500 text-white' :
                            'bg-green-500 text-white'
                          }>
                            {emerg.triage_level === 'IMMEDIATE' ? 'Immédiat' :
                             emerg.triage_level === 'URGENT' ? 'Urgent' :
                             emerg.triage_level === 'DELAYED' ? 'Différé' : 'Bas'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <AlertTriangle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-sm">Aucune urgence récente</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Consultations récentes */}
        <Card className="border-gray-200 dark:border-gray-800 shadow-sm">
          <CardHeader className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl text-gray-900 dark:text-white">Consultations récentes</CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  {recentConsultations.length} consultation{recentConsultations.length > 1 ? 's' : ''}
                </CardDescription>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => router.push('/consultations')}
                className="hover:bg-gold/10 hover:text-gold hover:border-gold"
              >
                Voir tout
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {recentConsultations.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50 dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-900">
                      <TableHead className="font-semibold text-gray-900 dark:text-white">Patient</TableHead>
                      <TableHead className="font-semibold text-gray-900 dark:text-white">Statut</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentConsultations.map((cons) => (
                      <TableRow key={cons.id} className="hover:bg-hover dark:hover:bg-gray-800 cursor-pointer" onClick={() => router.push(`/consultations/${cons.id}`)}>
                        <TableCell>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {cons.patient?.first_name} {cons.patient?.last_name}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={
                            cons.status === 'PENDING' ? 'bg-yellow-500 text-white' :
                            cons.status === 'ONGOING' ? 'bg-blue-500 text-white' :
                            'bg-green-500 text-white'
                          }>
                            {cons.status === 'PENDING' ? 'En attente' :
                             cons.status === 'ONGOING' ? 'En cours' : 'Terminée'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-sm">Aucune consultation récente</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions rapides */}
        <Card className="border-gray-200 dark:border-gray-800 shadow-sm">
          <CardHeader className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
            <CardTitle className="text-xl text-gray-900 dark:text-white">Actions rapides</CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              Raccourcis vers les fonctionnalités principales
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-2">
            <Button 
              variant="outline" 
              className="w-full justify-start hover:bg-navy/10 hover:text-navy hover:border-navy dark:hover:bg-gold/10 dark:hover:text-gold dark:hover:border-gold"
              onClick={() => router.push('/patients')}
            >
              <Users className="mr-2 h-4 w-4" />
              Voir tous les patients
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start hover:bg-navy/10 hover:text-navy hover:border-navy dark:hover:bg-gold/10 dark:hover:text-gold dark:hover:border-gold"
              onClick={() => router.push('/consultations')}
            >
              <Activity className="mr-2 h-4 w-4" />
              Nouvelle consultation
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start hover:bg-navy/10 hover:text-navy hover:border-navy dark:hover:bg-gold/10 dark:hover:text-gold dark:hover:border-gold"
              onClick={() => router.push('/prescriptions')}
            >
              <FileText className="mr-2 h-4 w-4" />
              Créer une ordonnance
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}