import { requireAnyRole } from "@/lib/auth-actions";
import { AppSidebar } from "@/components/shared/app-sidebar";
import { AppNavbar } from "@/components/shared/app-navbar";

export default async function AppointmentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAnyRole(["SECRETARY", "DOCTOR", "NURSE", "GENERAL_DOCTOR"], "/protected");

  const menuItems = [
    { title: "Rendez-vous", href: "/appointments", icon: "Calendar" },
    { title: "Patients", href: "/patients", icon: "Users" },
    { title: "Consultations", href: "/consultations", icon: "Stethoscope" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <AppSidebar title="Gestion" subtitle="Rendez-vous" menuItems={menuItems} homeHref="/secretary" />
      <AppNavbar title="Gestion des Rendez-vous" />
      <main className="ml-64 mt-16 p-8">
        <div className="max-w-full">{children}</div>
      </main>
    </div>
  );
}