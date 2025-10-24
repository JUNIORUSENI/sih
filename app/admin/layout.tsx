import { requireAnyRole } from "@/lib/auth-actions";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminNavbar } from "@/components/admin/admin-navbar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Vérifier que l'utilisateur a les rôles requis pour accéder à cette section
  await requireAnyRole(["ADMIN_SYS", "GENERAL_DOCTOR"], "/protected");

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <AdminSidebar />
      <AdminNavbar />
      
      <main className="ml-64 mt-16 p-8">
        <div className="max-w-full">
          {children}
        </div>
      </main>
    </div>
  );
}