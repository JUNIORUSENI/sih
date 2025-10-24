import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth-actions";
import { StatisticsOverview } from "@/components/admin/statistics-overview";

export default async function StatisticsPage() {
  // Vérifier si l'utilisateur est un admin
  const admin = await isAdmin();
  
  if (!admin) {
    redirect("/auth/login");
  }

  return <StatisticsOverview />;
}