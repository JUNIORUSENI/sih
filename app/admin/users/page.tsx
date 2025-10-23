import { requireAnyRole, inviteUser } from "@/lib/auth-actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default async function UserInvitationPage() {
  // Vérifier que l'utilisateur a les rôles requis pour accéder à cette page
  await requireAnyRole(["ADMIN_SYS", "GENERAL_DOCTOR"], "/protected");

  // Pour le formulaire d'invitation, nous devons utiliser une action serveur ou un composant client
  // Pour l'instant, nous affichons la structure de base
  return (
    <div className="flex-1 w-full flex flex-col gap-6">
      <div className="w-full">
        <div className="bg-accent text-sm p-3 px-5 rounded-md text-foreground flex gap-3 items-center">
          <span className="font-semibold">Gestion des Utilisateurs</span>
        </div>
      </div>
      <div className="flex flex-col gap-8">
        <h2 className="font-bold text-2xl">Inviter un nouvel utilisateur</h2>
        
        <UserInvitationForm />
        
        <div className="mt-8">
          <h3 className="font-medium text-lg mb-4">Utilisateurs existants</h3>
          <p className="text-sm text-muted-foreground">La liste des utilisateurs sera affichée ici dans une version ultérieure.</p>
        </div>
      </div>
    </div>
  );
}

// Composant client pour le formulaire d'invitation
function UserInvitationForm() {
  return (
    <form action={async (formData: FormData) => {
      "use server";
      
      const email = formData.get('email') as string;
      const role = formData.get('role') as string;
      
      try {
        await inviteUser(email, role);
        // Rediriger ou afficher un message de succès
        console.log("Utilisateur invité avec succès:", email);
      } catch (error) {
        console.error("Erreur lors de l'invitation de l'utilisateur:", error);
        // Gérer l'erreur comme vous le souhaitez
      }
    }} className="flex flex-col gap-4">
      <div className="grid gap-2">
        <Label htmlFor="email">Email professionnel</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="nom@centre-hospitalier.fr"
          required
        />
      </div>
      
      <div className="grid gap-2">
        <Label htmlFor="role">Rôle professionnel</Label>
        <select
          name="role"
          required
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="">Sélectionnez un rôle</option>
          <option value="ADMIN_SYS">Administrateur Système</option>
          <option value="GENERAL_DOCTOR">Médecin Généraliste</option>
          <option value="DOCTOR">Médecin Spécialiste</option>
          <option value="NURSE">Infirmier(ère)</option>
          <option value="SECRETARY">Secrétaire Médicale</option>
        </select>
      </div>
      
      <Button type="submit" className="mt-4">
        Inviter l'utilisateur
      </Button>
    </form>
  );
}