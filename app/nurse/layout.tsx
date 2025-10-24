import { requireRole } from "@/lib/auth-actions";
import { AppSidebar } from "@/components/shared/app-sidebar";
import { AppNavbar } from "@/components/shared/app-navbar";

export default async function NurseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Vérifier que l'utilisateur a le rôle requis pour accéder à cette section
  await requireRole("NURSE", "/protected");

  const menuItems = [
    {
      title: "Patients",
      href: "/patients",
      icon: "Users",
    },
    {
      title: "Signes Vitaux",
      href: "/nurse/vital-signs",
      icon: "Thermometer",
    },
    {
      title: "Soins",
      href: "/nurse/care",
      icon: "Heart",
    },
    {
      title: "Urgences",
      href: "/emergencies",
      icon: "Activity",
    },
    {
      title: "Hospitalisations",
      href: "/hospitalizations",
      icon: "BedDouble",
    },
    {
      title: "Tâches",
      href: "/nurse/tasks",
      icon: "ClipboardList",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <AppSidebar
        title="Interface"
        subtitle="Infirmière"
        menuItems={menuItems}
        homeHref="/nurse"
      />
      <AppNavbar title="Espace Infirmier" />
      
      <main className="ml-64 mt-16 p-8">
        <div className="max-w-full">
          {children}
        </div>
      </main>
    </div>
  );
}