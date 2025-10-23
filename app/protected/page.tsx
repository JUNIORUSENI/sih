import { isAuthenticated, getUserRole } from "@/lib/auth-actions";
import { InfoIcon } from "lucide-react";
import { getUserProfileServer, getRoleDescription } from "@/lib/auth-utils";
import { redirect } from "next/navigation";

export default async function ProtectedPage() {
  // Vérifier que l'utilisateur est authentifié
  const authenticated = await isAuthenticated();
  if (!authenticated) {
    redirect("/auth/login");
  }

  const userProfile = await getUserProfileServer();
  
  // Rediriger en fonction du rôle de l'utilisateur
  if (userProfile) {
    const userRole = userProfile.role;
    switch(userRole) {
      case 'ADMIN_SYS':
      case 'GENERAL_DOCTOR':
        redirect("/admin");
        break;
      case 'DOCTOR':
        redirect("/medical");
        break;
      case 'NURSE':
        redirect("/nurse");
        break;
      case 'SECRETARY':
        redirect("/secretary");
        break;
    }
  }
  
  const roleDescription = userProfile ? getRoleDescription(userProfile.role) : 'Rôle inconnu';

  return (
    <div className="flex-1 w-full flex flex-col gap-12">
      <div className="w-full">
        <div className="bg-accent text-sm p-3 px-5 rounded-md text-foreground flex gap-3 items-center">
          <InfoIcon size="16" strokeWidth={2} />
          Page protégée - Accès restreint aux utilisateurs authentifiés
        </div>
      </div>
      <div className="flex flex-col gap-2 items-start">
        <h2 className="font-bold text-2xl mb-4">Détails de votre compte</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
          <div>
            <p className="text-sm font-medium">Email:</p>
            <p className="text-sm">{userProfile?.email || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Rôle:</p>
            <p className="text-sm">{roleDescription}</p>
          </div>
          {userProfile?.specialty && (
            <div>
              <p className="text-sm font-medium">Spécialité:</p>
              <p className="text-sm">{userProfile.specialty}</p>
            </div>
          )}
          {userProfile?.phone_work && (
            <div>
              <p className="text-sm font-medium">Téléphone professionnel:</p>
              <p className="text-sm">{userProfile.phone_work}</p>
            </div>
          )}
        </div>
      </div>
      <div>
        <h2 className="font-bold text-2xl mb-4">Système de Gestion Hospitalière</h2>
        <p>Vous êtes connecté avec succès à votre système de gestion hospitalière sécurisé.</p>
        <p className="mt-2">Sélectionnez une option dans le menu pour accéder à vos fonctionnalités.</p>
      </div>
    </div>
  );
}
