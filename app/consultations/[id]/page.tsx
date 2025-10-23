import { redirect } from "next/navigation";
import { isAuthenticated, hasAnyRole } from "@/lib/auth-actions";
import { SecretaryLayout } from "@/components/secretary/secretary-layout";
import { ConsultationDetail } from "@/components/medical/consultation-detail";

export default async function ConsultationPage({ params }: { params: { id: string } }) {
  // Vérifier si l'utilisateur a accès à cette page
  const authenticated = await isAuthenticated();
  const hasAccess = await hasAnyRole(['DOCTOR', 'NURSE', 'GENERAL_DOCTOR', 'ADMIN_SYS']);
  
  if (!authenticated || !hasAccess) {
    redirect("/auth/login");
  }

  return (
    <SecretaryLayout>
      <ConsultationDetail consultationId={params.id} />
    </SecretaryLayout>
  );
}