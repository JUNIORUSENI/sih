import { requireAnyRole } from "@/lib/auth-actions";
import { AppSidebar } from "@/components/shared/app-sidebar";
import { AppNavbar } from "@/components/shared/app-navbar";

export default async function EmergenciesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAnyRole(["DOCTOR", "NURSE", "GENERAL_DOCTOR"], "/protected");

  const menuItems = [
    { title: "Urgences", href: "/emergencies", icon: "AlertCircle" },
    { title: "Consultations", href: "/consultations", icon: "Stethoscope" },
    { title: "Hospitalisations", href: "/hospitalizations", icon: "BedDouble" },
    { title: "Patients", href: "/patients", icon: "Users" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <AppSidebar title="Espace" subtitle="Urgences" menuItems={menuItems} homeHref="/medical" />
      <AppNavbar title="Gestion des Urgences" />
      <main className="ml-64 mt-16 p-8">
        <div className="max-w-full">{children}</div>
      </main>
    </div>
  );
}