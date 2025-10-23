import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth-actions";
import { AdminLayout } from "@/components/admin/admin-layout";
import { UserProfile } from "@/components/admin/user-profile";

export default async function ProfilePage({ params }: { params: { id: string } }) {
  // Vérifier si l'utilisateur est un admin
  const admin = await isAdmin();
  
  if (!admin) {
    redirect("/auth/login");
  }

  return (
    <AdminLayout>
      <UserProfile userId={params.id} />
    </AdminLayout>
  );
}