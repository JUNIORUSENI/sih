import { redirect } from "next/navigation";
import { isAuthenticated, hasAnyRole } from "@/lib/auth-actions";
import { SecretaryLayout } from "@/components/secretary/secretary-layout";
import { PatientManagement } from "@/components/patient/patient-management";

export default async function PatientsPage() {
  // Vérifier si l'utilisateur a accès à cette page
  const authenticated = await isAuthenticated();
  const hasAccess = await hasAnyRole(['SECRETARY', 'DOCTOR', 'NURSE', 'GENERAL_DOCTOR', 'ADMIN_SYS']);
  
  if (!authenticated || !hasAccess) {
    redirect("/auth/login");
  }

  return (
    <SecretaryLayout>
      <PatientManagement />
    </SecretaryLayout>
  );
}