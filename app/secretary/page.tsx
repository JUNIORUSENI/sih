import { redirect } from "next/navigation";
import { isAuthenticated, hasAnyRole } from "@/lib/auth-actions";
import Link from "next/link";
import { Users, Calendar, FolderOpen, ClipboardList, FileText, Phone, ArrowRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function SecretaryPage() {
  const authenticated = await isAuthenticated();
  const hasAccess = await hasAnyRole(['SECRETARY', 'DOCTOR', 'NURSE', 'GENERAL_DOCTOR', 'ADMIN_SYS']);
  
  if (!authenticated || !hasAccess) {
    redirect("/auth/login");
  }

  const quickActions = [
    {
      title: "Patients",
      description: "Gérer les dossiers patients",
      href: "/patients",
      icon: Users,
      color: "bg-blue-500",
    },
    {
      title: "Rendez-vous",
      description: "Planifier et gérer les RDV",
      href: "/appointments",
      icon: Calendar,
      color: "bg-green-500",
    },
    {
      title: "Dossiers",
      description: "Gérer les dossiers médicaux",
      href: "/secretary/records",
      icon: FolderOpen,
      color: "bg-purple-500",
    },
    {
      title: "Admissions",
      description: "Enregistrer les admissions",
      href: "/secretary/admissions",
      icon: ClipboardList,
      color: "bg-orange-500",
    },
    {
      title: "Documents",
      description: "Gérer les documents administratifs",
      href: "/secretary/documents",
      icon: FileText,
      color: "bg-indigo-500",
    },
    {
      title: "Contacts",
      description: "Annuaire et contacts",
      href: "/secretary/contacts",
      icon: Phone,
      color: "bg-teal-500",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Espace Secrétariat
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Gestion des patients, rendez-vous et administration
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <Link key={action.href} href={action.href}>
              <Card className="h-full transition-all duration-300 hover:shadow-lg hover:scale-105 hover:border-gold cursor-pointer group">
                <CardHeader>
                  <div className={`w-12 h-12 rounded-lg ${action.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="flex items-center justify-between">
                    {action.title}
                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-gold group-hover:translate-x-1 transition-all" />
                  </CardTitle>
                  <CardDescription>{action.description}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}