import { requireRole } from "@/lib/auth-actions";

export default async function NurseDashboard() {
  // Vérifier que l'utilisateur a le rôle requis pour accéder à cette page
  await requireRole("NURSE", "/protected");

  return (
    <div className="flex-1 w-full flex flex-col gap-12">
      <div className="w-full">
        <div className="bg-accent text-sm p-3 px-5 rounded-md text-foreground flex gap-3 items-center">
          <span className="font-semibold">Tableau de bord Infirmier(ère)</span>
        </div>
      </div>
      <div className="flex flex-col gap-8">
        <h2 className="font-bold text-2xl">Espace Infirmier(ère)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border rounded-lg p-4 hover:bg-accent transition-colors">
            <h3 className="font-medium text-lg">Patients Assignés</h3>
            <p className="text-sm text-muted-foreground">Gérer les patients sous votre responsabilité</p>
          </div>
          <div className="border rounded-lg p-4 hover:bg-accent transition-colors">
            <h3 className="font-medium text-lg">Signes Vitaux</h3>
            <p className="text-sm text-muted-foreground">Enregistrer et surveiller les signes vitaux</p>
          </div>
          <div className="border rounded-lg p-4 hover:bg-accent transition-colors">
            <h3 className="font-medium text-lg">Tâches Médicales</h3>
            <p className="text-sm text-muted-foreground">Suivre les tâches médicamenteuses</p>
          </div>
          <div className="border rounded-lg p-4 hover:bg-accent transition-colors">
            <h3 className="font-medium text-lg">Rapports</h3>
            <p className="text-sm text-muted-foreground">Rédiger des rapports de soins</p>
          </div>
        </div>
      </div>
    </div>
  );
}