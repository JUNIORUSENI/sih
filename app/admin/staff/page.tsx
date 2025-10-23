import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth-actions";
import { AdminLayout } from "@/components/admin/admin-layout";
import { StaffManagement } from "@/components/admin/staff-management";

export default async function StaffPage() {
  // Vérifier si l'utilisateur est un admin
  const admin = await isAdmin();
  
  if (!admin) {
    redirect("/auth/login");
  }

  return (
    <AdminLayout>
      <StaffManagement />
    </AdminLayout>
  );
}