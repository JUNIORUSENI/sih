import { redirect } from "next/navigation";
import { isAuthenticated, hasAnyRole } from "@/lib/auth-actions";
import { SecretaryLayout } from "@/components/secretary/secretary-layout";

export default async function SecretaryPage() {
  const authenticated = await isAuthenticated();
  const hasAccess = await hasAnyRole(['SECRETARY', 'DOCTOR', 'NURSE', 'GENERAL_DOCTOR', 'ADMIN_SYS']);
  
  if (!authenticated || !hasAccess) {
    redirect("/auth/login");
  }

  return (
    <SecretaryLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Secrétariat</h1>
          <p className="text-muted-foreground">
            Gestion des patients et rendez-vous
          </p>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border bg-card p-6">
            <h3 className="text-lg font-semibold">Patients</h3>
            <p className="text-sm text-muted-foreground">Gérer les dossiers patients</p>
          </div>
          
          <div className="rounded-lg border bg-card p-6">
            <h3 className="text-lg font-semibold">Rendez-vous</h3>
            <p className="text-sm text-muted-foreground">Planifier et gérer les RDV</p>
          </div>
          
          <div className="rounded-lg border bg-card p-6">
            <h3 className="text-lg font-semibold">Consultations</h3>
            <p className="text-sm text-muted-foreground">Suivi des consultations</p>
          </div>
          
          <div className="rounded-lg border bg-card p-6">
            <h3 className="text-lg font-semibold">Rapports</h3>
            <p className="text-sm text-muted-foreground">Voir les statistiques</p>
          </div>
        </div>
      </div>
    </SecretaryLayout>
  );
}