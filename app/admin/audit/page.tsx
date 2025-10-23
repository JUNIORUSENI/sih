import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth-actions";
import { AdminLayout } from "@/components/admin/admin-layout";
import { AuditLogViewer } from "@/components/admin/audit-log-viewer";

export default async function AuditPage() {
  // Vérifier si l'utilisateur est un admin
  const admin = await isAdmin();
  
  if (!admin) {
    redirect("/auth/login");
  }

  return (
    <AdminLayout>
      <AuditLogViewer />
    </AdminLayout>
  );
}