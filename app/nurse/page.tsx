import { requireRole } from "@/lib/auth-actions";
import Link from "next/link";
import { Users, Thermometer, Heart, Activity, BedDouble, ClipboardList, ArrowRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function NurseDashboard() {
  // Vérifier que l'utilisateur a le rôle requis pour accéder à cette page
  await requireRole("NURSE", "/protected");

  const quickActions = [
    {
      title: "Patients",
      description: "Gérer les patients assignés",
      href: "/patients",
      icon: Users,
      color: "bg-blue-500",
    },
    {
      title: "Signes Vitaux",
      description: "Enregistrer les signes vitaux",
      href: "/nurse/vital-signs",
      icon: Thermometer,
      color: "bg-red-500",
    },
    {
      title: "Soins",
      description: "Administrer les soins",
      href: "/nurse/care",
      icon: Heart,
      color: "bg-pink-500",
    },
    {
      title: "Urgences",
      description: "Gérer les urgences",
      href: "/emergencies",
      icon: Activity,
      color: "bg-orange-500",
    },
    {
      title: "Hospitalisations",
      description: "Suivi des hospitalisations",
      href: "/hospitalizations",
      icon: BedDouble,
      color: "bg-purple-500",
    },
    {
      title: "Tâches",
      description: "Liste des tâches à effectuer",
      href: "/nurse/tasks",
      icon: ClipboardList,
      color: "bg-green-500",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Espace Infirmier
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Gérez vos patients et tâches quotidiennes
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