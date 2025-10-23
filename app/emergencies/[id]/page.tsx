import { redirect } from "next/navigation";
import { isAuthenticated, hasAnyRole } from "@/lib/auth-actions";
import { MedicalLayout } from "@/components/medical/medical-layout";

export default async function EmergencyDetailPage({ params }: { params: { id: string } }) {
  // Vérifier si l'utilisateur a accès à cette page
  const authenticated = await isAuthenticated();
  const hasAccess = await hasAnyRole(['DOCTOR', 'NURSE', 'GENERAL_DOCTOR', 'ADMIN_SYS']);
  
  if (!authenticated || !hasAccess) {
    redirect("/auth/login");
  }

  return (
    <MedicalLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Détail de l'Urgence</h1>
          <p className="text-muted-foreground">Informations complètes sur le cas d'urgence</p>
        </div>
        
        <p className="text-muted-foreground">Cette page affichera les détails d'un cas d'urgence spécifique.</p>
      </div>
    </MedicalLayout>
  );
}