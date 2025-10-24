import { redirect } from "next/navigation";
import { isAuthenticated, hasAnyRole } from "@/lib/auth-actions";
import { ConsultationManagement } from "@/components/medical/consultation-management";

export default async function ConsultationsPage() {
  // Vérifier si l'utilisateur a accès à cette page
  const authenticated = await isAuthenticated();
  const hasAccess = await hasAnyRole(['DOCTOR', 'NURSE', 'GENERAL_DOCTOR', 'ADMIN_SYS']);
  
  if (!authenticated || !hasAccess) {
    redirect("/auth/login");
  }

  return <ConsultationManagement />;
}