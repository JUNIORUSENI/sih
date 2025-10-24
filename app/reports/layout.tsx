import { requireAnyRole } from "@/lib/auth-actions";
import { AppSidebar } from "@/components/shared/app-sidebar";
import { AppNavbar } from "@/components/shared/app-navbar";

export default async function ReportsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAnyRole(["DOCTOR", "GENERAL_DOCTOR", "ADMIN_SYS"], "/protected");

  const menuItems = [
    { title: "Rapports", href: "/reports", icon: "FileText" },
    { title: "Consultations", href: "/consultations", icon: "Stethoscope" },
    { title: "Statistiques", href: "/admin/statistics", icon: "BarChart3" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <AppSidebar title="Espace" subtitle="Rapports" menuItems={menuItems} homeHref="/medical" />
      <AppNavbar title="Système de Rapports" />
      <main className="ml-64 mt-16 p-8">
        <div className="max-w-full">{children}</div>
      </main>
    </div>
  );
}