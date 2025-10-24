"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar, Filter, User, Clock, Activity } from "lucide-react";
import { toast } from "sonner";
import { ErrorDisplay } from "@/components/ui/error-display";

interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  resource_type: string;
  resource_id: string;
  old_values: any;
  new_values: any;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
  user_email?: string; // Champ ajouté pour l'email de l'utilisateur
}

export function AuditLogViewer() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterAction, setFilterAction] = useState("all");
  const [filterResource, setFilterResource] = useState("all");

  const supabase = createClient();

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  // Filtrer les logs en fonction des critères de recherche et de filtre
  useEffect(() => {
    let result = logs;

    // Filtre par terme de recherche
    if (searchTerm) {
      result = result.filter(log => 
        log.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.resource_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.resource_id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtre par action
    if (filterAction !== "all") {
      result = result.filter(log => log.action === filterAction);
    }

    // Filtre par type de ressource
    if (filterResource !== "all") {
      result = result.filter(log => log.resource_type === filterResource);
    }

    setFilteredLogs(result);
  }, [logs, searchTerm, filterAction, filterResource]);

  const fetchAuditLogs = async () => {
    try {
      setError(null);
      
      // Récupérer les logs d'audit via l'API
      const response = await fetch('/api/admin/audit-logs');
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Erreur de connexion au serveur' }));
        throw new Error(errorData.error || 'Erreur lors de la récupération des logs d\'audit');
      }

      const { logs: logsData } = await response.json();
      
      setLogs(logsData || []);
      setFilteredLogs(logsData || []);
    } catch (error: any) {
      console.error('Erreur lors de la récupération des logs d\'audit:', error);
      const errorMessage = error.message || "Erreur lors de la récupération des logs d'audit";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'CREATE': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100';
      case 'UPDATE': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100';
      case 'DELETE': return 'bg-destructive text-destructive-foreground';
      case 'LOGIN': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100';
      case 'LOGOUT': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100';
      default: return 'bg-muted text-foreground';
    }
  };

  const getResourceColor = (resourceType: string) => {
    switch (resourceType) {
      case 'centre': return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100';
      case 'profile': return 'bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-100';
      case 'patient': return 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-100';
      case 'appointment': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-100';
      default: return 'bg-muted text-foreground';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getActionLabel = (action: string) => {
    switch (action) {
      case 'CREATE': return 'Création';
      case 'UPDATE': return 'Mise à jour';
      case 'DELETE': return 'Suppression';
      case 'LOGIN': return 'Connexion';
      case 'LOGOUT': return 'Déconnexion';
      default: return action;
    }
  };

  const getResourceLabel = (resourceType: string) => {
    switch (resourceType) {
      case 'centre': return 'Centre';
      case 'profile': return 'Profil';
      case 'patient': return 'Patient';
      case 'appointment': return 'Rendez-vous';
      default: return resourceType;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Journal d'Audit</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Historique des actions du système</p>
        </div>
        <Card className="border-gray-200 dark:border-gray-800">
          <CardContent className="flex items-center justify-center h-64">
            <p className="text-gray-600 dark:text-gray-400">Chargement des logs d'audit...</p>
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
            fetchAuditLogs();
          }}
          onDismiss={() => setError(null)}
        />
      )}
      
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Journal d'Audit</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Historique des actions du système</p>
      </div>

      <Card className="border-gray-200 dark:border-gray-800 shadow-sm">
        <CardHeader className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
          <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
            <div>
              <CardTitle className="text-xl text-gray-900 dark:text-white">Logs d'Audit</CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                {filteredLogs.length} log{filteredLogs.length > 1 ? 's' : ''} trouvé{filteredLogs.length > 1 ? 's' : ''}
              </CardDescription>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative">
                <Filter className="absolute left-2 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Rechercher..."
                  className="pl-8 border-gray-200 dark:border-gray-700"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex flex-wrap gap-4 mb-4">
            <div className="flex-1 min-w-[200px]">
              <Select value={filterAction} onValueChange={setFilterAction}>
                <SelectTrigger>
                  <SelectValue placeholder="Toutes les actions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les actions</SelectItem>
                  <SelectItem value="CREATE">Création</SelectItem>
                  <SelectItem value="UPDATE">Mise à jour</SelectItem>
                  <SelectItem value="DELETE">Suppression</SelectItem>
                  <SelectItem value="LOGIN">Connexion</SelectItem>
                  <SelectItem value="LOGOUT">Déconnexion</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex-1 min-w-[200px]">
              <Select value={filterResource} onValueChange={setFilterResource}>
                <SelectTrigger>
                  <SelectValue placeholder="Tous les types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les types</SelectItem>
                  <SelectItem value="centre">Centre</SelectItem>
                  <SelectItem value="profile">Profil</SelectItem>
                  <SelectItem value="patient">Patient</SelectItem>
                  <SelectItem value="appointment">Rendez-vous</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-md border border-gray-200 dark:border-gray-800 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-900">
                  <TableHead className="font-semibold text-gray-900 dark:text-white">Utilisateur</TableHead>
                  <TableHead className="font-semibold text-gray-900 dark:text-white">Action</TableHead>
                  <TableHead className="font-semibold text-gray-900 dark:text-white">Type</TableHead>
                  <TableHead className="font-semibold text-gray-900 dark:text-white">Resource</TableHead>
                  <TableHead className="font-semibold text-gray-900 dark:text-white">IP</TableHead>
                  <TableHead className="font-semibold text-gray-900 dark:text-white">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.length > 0 ? (
                  filteredLogs.map((log) => (
                    <TableRow key={log.id} className="hover:bg-hover dark:hover:bg-gray-800 transition-colors">
                      <TableCell className="font-medium text-gray-900 dark:text-white">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">{log.user_email}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getActionColor(log.action)}>
                          {getActionLabel(log.action)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getResourceColor(log.resource_type)}>
                          {getResourceLabel(log.resource_type)}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-gray-600 dark:text-gray-400">{log.resource_id.slice(0, 8)}...</TableCell>
                      <TableCell>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          {log.ip_address || 'N/A'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                          <Clock className="h-4 w-4" />
                          {formatDate(log.created_at)}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12 text-gray-500 dark:text-gray-400">
                      <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium mb-2">Aucun log trouvé</p>
                      <p className="text-sm">Aucun log d'audit ne correspond aux filtres actuels.</p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}