import { requireRole } from "@/lib/auth-actions";
import { AppSidebar } from "@/components/shared/app-sidebar";
import { AppNavbar } from "@/components/shared/app-navbar";

export default async function SecretaryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Vérifier que l'utilisateur a le rôle requis pour accéder à cette section
  await requireRole("SECRETARY", "/protected");

  const menuItems = [
    {
      title: "Patients",
      href: "/patients",
      icon: "Users",
    },
    {
      title: "Rendez-vous",
      href: "/appointments",
      icon: "Calendar",
    },
    {
      title: "Dossiers",
      href: "/secretary/records",
      icon: "FolderOpen",
    },
    {
      title: "Admissions",
      href: "/secretary/admissions",
      icon: "ClipboardList",
    },
    {
      title: "Documents",
      href: "/secretary/documents",
      icon: "FileText",
    },
    {
      title: "Contacts",
      href: "/secretary/contacts",
      icon: "Phone",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <AppSidebar
        title="Interface"
        subtitle="Secrétariat"
        menuItems={menuItems}
        homeHref="/secretary"
      />
      <AppNavbar title="Espace Secrétariat" />
      
      <main className="ml-64 mt-16 p-8">
        <div className="max-w-full">
          {children}
        </div>
      </main>
    </div>
  );
}