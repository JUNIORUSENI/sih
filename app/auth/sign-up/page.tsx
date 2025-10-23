import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Accès restreint</CardTitle>
              <CardDescription>Création de compte par l'administrateur</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Les comptes utilisateurs sont créés exclusivement par les administrateurs du système. 
                Veuillez contacter votre administrateur système pour obtenir un accès.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
