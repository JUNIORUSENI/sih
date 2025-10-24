import { requireAnyRole } from "@/lib/auth-actions";
import { AppSidebar } from "@/components/shared/app-sidebar";
import { AppNavbar } from "@/components/shared/app-navbar";

export default async function PatientsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Vérifier que l'utilisateur a accès à cette section
  await requireAnyRole(["SECRETARY", "DOCTOR", "NURSE", "GENERAL_DOCTOR", "ADMIN_SYS"], "/protected");

  const menuItems = [
    {
      title: "Liste des Patients",
      href: "/patients",
      icon: "Users",
    },
    {
      title: "Nouveau Patient",
      href: "/patients/new",
      icon: "UserPlus",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <AppSidebar 
        title="Gestion"
        subtitle="Patients"
        menuItems={menuItems}
        homeHref="/protected"
      />
      <AppNavbar title="Gestion des Patients" />
      
      <main className="ml-64 mt-16 p-8">
        <div className="max-w-full">
          {children}
        </div>
      </main>
    </div>
  );
}