import { redirect } from "next/navigation";
import { isAuthenticated, isAdmin } from "@/lib/auth-actions";
import { AdminLayout } from "@/components/admin/admin-layout";

export default async function AdminPage() {
  // Vérifier si l'utilisateur est authentifié et est un admin
  const authenticated = await isAuthenticated();
  const admin = await isAdmin();
  
  if (!authenticated || !admin) {
    redirect("/auth/login");
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Administration</h1>
          <p className="text-muted-foreground">
            Gestion du système hospitalier
          </p>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border bg-card p-6">
            <h3 className="text-lg font-semibold">Personnel</h3>
            <p className="text-sm text-muted-foreground">Gérer les utilisateurs du système</p>
          </div>
          
          <div className="rounded-lg border bg-card p-6">
            <h3 className="text-lg font-semibold">Centres</h3>
            <p className="text-sm text-muted-foreground">Gérer les centres hospitaliers</p>
          </div>
          
          <div className="rounded-lg border bg-card p-6">
            <h3 className="text-lg font-semibold">Paramètres</h3>
            <p className="text-sm text-muted-foreground">Configurer le système</p>
          </div>
          
          <div className="rounded-lg border bg-card p-6">
            <h3 className="text-lg font-semibold">Statistiques</h3>
            <p className="text-sm text-muted-foreground">Voir les rapports et analyses</p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}