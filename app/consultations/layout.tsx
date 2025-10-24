import { requireAnyRole } from "@/lib/auth-actions";
import { AppSidebar } from "@/components/shared/app-sidebar";
import { AppNavbar } from "@/components/shared/app-navbar";

export default async function ConsultationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Vérifier que l'utilisateur a accès à cette section
  await requireAnyRole(["DOCTOR", "NURSE", "GENERAL_DOCTOR", "ADMIN_SYS"], "/protected");

  const menuItems = [
    {
      title: "Consultations",
      href: "/consultations",
      icon: "Stethoscope",
    },
    {
      title: "Patients",
      href: "/patients",
      icon: "Users",
    },
    {
      title: "Prescriptions",
      href: "/prescriptions",
      icon: "Pill",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <AppSidebar 
        title="Espace"
        subtitle="Consultations"
        menuItems={menuItems}
        homeHref="/medical"
      />
      <AppNavbar title="Gestion des Consultations" />
      
      <main className="ml-64 mt-16 p-8">
        <div className="max-w-full">
          {children}
        </div>
      </main>
    </div>
  );
}