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
      // Récupérer les logs d'audit
      const { data: logsData, error: logsError } = await supabase
        .from('audit_logs')
        .select(`
          id,
          user_id,
          action,
          resource_type,
          resource_id,
          old_values,
          new_values,
          ip_address,
          user_agent,
          created_at
        `)
        .order('created_at', { ascending: false })
        .limit(100); // Limiter à 100 derniers logs pour des raisons de performance

      if (logsError) throw logsError;

      // Récupérer les emails des utilisateurs séparément
      const formattedLogs = await Promise.all(
        (logsData || []).map(async (log) => {
          let user_email = 'Utilisateur inconnu';
          
          if (log.user_id) {
            const { data: userData, error: userError } = await supabase.auth.admin.getUserById(log.user_id);
            if (!userError && userData?.user) {
              user_email = userData.user.email || 'Utilisateur inconnu';
            }
          }
          
          return {
            ...log,
            user_email
          };
        })
      );

      setLogs(formattedLogs);
      setFilteredLogs(formattedLogs);
    } catch (error: any) {
      console.error('Erreur lors de la récupération des logs d\'audit:', error);
      toast.error("Erreur lors de la récupération des logs d'audit");
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
          <h1 className="text-3xl font-bold tracking-tight">Journal d'Audit</h1>
          <p className="text-muted-foreground">Historique des actions du système</p>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <p>Chargement des logs d'audit...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Journal d'Audit</h1>
        <p className="text-muted-foreground">Historique des actions du système</p>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>Logs d'Audit</CardTitle>
            <CardDescription>Détails des actions effectuées dans le système</CardDescription>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative">
              <Filter className="absolute left-2 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher dans les logs..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
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

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Utilisateur</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Resource</TableHead>
                  <TableHead>IP</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.length > 0 ? (
                  filteredLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          {log.user_email}
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
                      <TableCell className="font-mono text-xs">{log.resource_id}</TableCell>
                      <TableCell>
                        <div className="text-xs text-muted-foreground">
                          {log.ip_address || 'N/A'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          {formatDate(log.created_at)}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Aucun log d'audit trouvé avec les filtres actuels.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          
          {filteredLogs.length === 0 && logs.length > 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Aucun log ne correspond aux filtres appliqués.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}