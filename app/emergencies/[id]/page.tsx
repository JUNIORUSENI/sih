import { redirect } from "next/navigation";
import { isAuthenticated, hasAnyRole } from "@/lib/auth-actions";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

export default async function EmergencyDetailPage({ params }: { params: { id: string } }) {
  const authenticated = await isAuthenticated();
  const hasAccess = await hasAnyRole(['DOCTOR', 'NURSE', 'GENERAL_DOCTOR', 'ADMIN_SYS']);
  
  if (!authenticated || !hasAccess) {
    redirect("/auth/login");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Détail de l'Urgence</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Informations complètes sur le cas d'urgence</p>
      </div>
      
      <Card className="border-gray-200 dark:border-gray-800">
        <CardContent className="flex flex-col items-center justify-center h-64 text-center">
          <AlertTriangle className="w-16 h-16 text-gray-400 mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            Détails de l'urgence #{params.id}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
            Cette page affichera les détails complets du cas d'urgence
          </p>
        </CardContent>
      </Card>
    </div>
  );
}