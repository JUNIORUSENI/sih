"use client";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();

  const logout = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  return <Button onClick={logout}>Déconnexion</Button>;
}
