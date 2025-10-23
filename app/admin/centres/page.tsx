import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth-actions";
import { AdminLayout } from "@/components/admin/admin-layout";
import { CentreManagement } from "@/components/admin/centre-management";

export default async function CentresPage() {
  // Vérifier si l'utilisateur est un admin
  const admin = await isAdmin();
  
  if (!admin) {
    redirect("/auth/login");
  }

  return (
    <AdminLayout>
      <CentreManagement />
    </AdminLayout>
  );
}