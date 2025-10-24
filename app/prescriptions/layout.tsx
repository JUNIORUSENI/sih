import { requireAnyRole } from "@/lib/auth-actions";
import { AppSidebar } from "@/components/shared/app-sidebar";
import { AppNavbar } from "@/components/shared/app-navbar";

export default async function PrescriptionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAnyRole(["DOCTOR", "GENERAL_DOCTOR"], "/protected");

  const menuItems = [
    { title: "Prescriptions", href: "/prescriptions", icon: "Pill" },
    { title: "Consultations", href: "/consultations", icon: "Stethoscope" },
    { title: "Patients", href: "/patients", icon: "Users" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <AppSidebar title="Espace" subtitle="Prescriptions" menuItems={menuItems} homeHref="/medical" />
      <AppNavbar title="Gestion des Prescriptions" />
      <main className="ml-64 mt-16 p-8">
        <div className="max-w-full">{children}</div>
      </main>
    </div>
  );
}