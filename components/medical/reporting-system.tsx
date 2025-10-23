"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Calendar, 
  Users, 
  Bed, 
  AlertTriangle, 
  FileBarChart,
  Download,
  Eye
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface Report {
  id: string;
  title: string;
  description: string;
  type: string;
  createdAt: string;
  status: string;
}

export function ReportingSystem() {
  const [activeTab, setActiveTab] = useState('overview');
  const [reports, setReports] = useState<Report[]>([
    {
      id: "1",
      title: "Rapport quotidien des hospitalisations",
      description: "Résumé des hospitalisations du 21 octobre 2025",
      type: "hospitalization",
      createdAt: "2025-10-21T08:00:00Z",
      status: "completed"
    },
    {
      id: "2",
      title: "Statistiques des urgences - Semaine 42",
      description: "Analyse des cas d'urgence de la semaine 42",
      type: "emergency",
      createdAt: "2025-10-18T15:30:00Z",
      status: "completed"
    },
    {
      id: "3",
      title: "Rapport mensuel des consultations",
      description: "Résumé des consultations du mois d'octobre 2025",
      type: "consultation",
      createdAt: "2025-10-01T09:00:00Z",
      status: "completed"
    },
    {
      id: "4",
      title: "Triage Analysis Report",
      description: "Analyse des niveaux de triage pour le mois dernier",
      type: "analysis",
      createdAt: "2025-09-30T14:45:00Z",
      status: "completed"
    }
  ]);

  const reportTypes = [
    { id: 'daily', label: 'Rapport quotidien', icon: Calendar },
    { id: 'weekly', label: 'Rapport hebdomadaire', icon: Calendar },
    { id: 'monthly', label: 'Rapport mensuel', icon: Calendar },
    { id: 'hospitalization', label: 'Rapport hospitalisation', icon: Bed },
    { id: 'emergency', label: 'Rapport urgence', icon: AlertTriangle },
    { id: 'consultation', label: 'Rapport consultation', icon: Users },
    { id: 'analysis', label: 'Analyse statistique', icon: FileBarChart }
  ];

  const generateReport = (type: string) => {
    // Simulation de la génération d'un rapport
    const newReport: Report = {
      id: (reports.length + 1).toString(),
      title: `Rapport ${type} - ${format(new Date(), 'dd/MM/yyyy')}`,
      description: `Rapport ${type} généré le ${format(new Date(), 'dd MMMM yyyy', { locale: fr })}`,
      type: type,
      createdAt: new Date().toISOString(),
      status: "completed"
    };

    setReports([newReport, ...reports]);
  };

  const getReportIcon = (type: string) => {
    switch (type) {
      case 'hospitalization': return Bed;
      case 'emergency': return AlertTriangle;
      case 'consultation': return Users;
      case 'analysis': return FileBarChart;
      default: return FileText;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Système de Reporting</h1>
        <p className="text-muted-foreground">Générer et gérer les rapports médicaux</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Types de rapports</CardTitle>
              <CardDescription>Choisissez un type de rapport à générer</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {reportTypes.map((reportType) => {
                const Icon = reportType.icon;
                return (
                  <Button
                    key={reportType.id}
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => generateReport(reportType.id)}
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    {reportType.label}
                  </Button>
                );
              })}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Rapports disponibles</CardTitle>
                <CardDescription>Liste des rapports générés</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reports.map((report) => {
                  const Icon = getReportIcon(report.type);
                  return (
                    <div 
                      key={report.id} 
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="bg-muted p-2 rounded-lg">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-medium">{report.title}</h3>
                          <p className="text-sm text-muted-foreground">{report.description}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary">{report.type.replace('_', ' ')}</Badge>
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(report.createdAt), 'dd MMM yyyy', { locale: fr })}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="mr-2 h-4 w-4" />
                          Voir
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="mr-2 h-4 w-4" />
                          Télécharger
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {reports.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                  <p className="mt-2">Aucun rapport généré</p>
                  <p className="text-sm">Générez votre premier rapport en utilisant les options à gauche</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Prévisualisation</CardTitle>
          <CardDescription>Aperçu des données incluses dans les rapports</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Users className="h-4 w-4" />
                Patients
              </h3>
              <p className="text-2xl font-bold mt-2">1,234</p>
              <p className="text-sm text-muted-foreground mt-1">+12% vs mois dernier</p>
            </div>
            
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Bed className="h-4 w-4" />
                Hospitalisations
              </h3>
              <p className="text-2xl font-bold mt-2">42</p>
              <p className="text-sm text-muted-foreground mt-1">7 en cours</p>
            </div>
            
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Urgences
              </h3>
              <p className="text-2xl font-bold mt-2">28</p>
              <p className="text-sm text-muted-foreground mt-1">aujourd'hui</p>
            </div>
            
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Consultations
              </h3>
              <p className="text-2xl font-bold mt-2">87</p>
              <p className="text-sm text-muted-foreground mt-1">ce mois</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}