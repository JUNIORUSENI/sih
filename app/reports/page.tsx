import { redirect } from "next/navigation";
import { isAuthenticated, hasAnyRole } from "@/lib/auth-actions";
import { ReportingSystem } from "@/components/medical/reporting-system";

export default async function ReportingPage() {
  // Vérifier si l'utilisateur a accès à cette page
  const authenticated = await isAuthenticated();
  const hasAccess = await hasAnyRole(['DOCTOR', 'NURSE', 'GENERAL_DOCTOR', 'ADMIN_SYS']);
  
  if (!authenticated || !hasAccess) {
    redirect("/auth/login");
  }

  return <ReportingSystem />;
}