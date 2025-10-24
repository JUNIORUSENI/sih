import { redirect } from "next/navigation";
import { isAuthenticated, isAdmin } from "@/lib/auth-actions";
import Link from "next/link";
import { Users, Building2, FileText, BarChart3, ArrowRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AdminPage() {
  // Vérifier si l'utilisateur est authentifié et est un admin
  const authenticated = await isAuthenticated();
  const admin = await isAdmin();
  
  if (!authenticated || !admin) {
    redirect("/auth/login");
  }

  const quickActions = [
    {
      title: "Personnel",
      description: "Gérer les utilisateurs du système",
      href: "/admin/staff",
      icon: Users,
      color: "bg-blue-500",
    },
    {
      title: "Centres",
      description: "Gérer les centres hospitaliers",
      href: "/admin/centres",
      icon: Building2,
      color: "bg-green-500",
    },
    {
      title: "Audit",
      description: "Consulter les logs d'audit",
      href: "/admin/audit",
      icon: FileText,
      color: "bg-purple-500",
    },
    {
      title: "Statistiques",
      description: "Voir les rapports et analyses",
      href: "/admin/statistics",
      icon: BarChart3,
      color: "bg-gold",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Tableau de bord administrateur
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Gérez votre système hospitalier de manière centralisée
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
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

      {/* Section d'accueil rapide */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Bienvenue</CardTitle>
            <CardDescription>
              Vous êtes connecté en tant qu'administrateur
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Utilisez les liens ci-dessus pour accéder aux différentes sections de l'interface d'administration.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Actions rapides</CardTitle>
            <CardDescription>Raccourcis utiles</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link
              href="/admin/staff"
              className="block text-sm text-navy hover:text-gold transition-colors"
            >
              → Ajouter un membre du personnel
            </Link>
            <Link
              href="/admin/centres"
              className="block text-sm text-navy hover:text-gold transition-colors"
            >
              → Créer un nouveau centre
            </Link>
            <Link
              href="/admin/audit"
              className="block text-sm text-navy hover:text-gold transition-colors"
            >
              → Consulter les derniers logs
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Aide</CardTitle>
            <CardDescription>Support et documentation</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Pour toute question concernant l'utilisation de cette interface, consultez la documentation ou contactez le support technique.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}