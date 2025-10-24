"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import * as Icons from "lucide-react";
import { cn } from "@/lib/utils";

const menuItems = [
  {
    title: "Personnel",
    href: "/admin/staff",
    icon: "Users",
  },
  {
    title: "Centres",
    href: "/admin/centres",
    icon: "Building2",
  },
  {
    title: "Audit",
    href: "/admin/audit",
    icon: "FileText",
  },
  {
    title: "Statistiques",
    href: "/admin/statistics",
    icon: "BarChart3",
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  
  const getIcon = (iconName: string) => {
    const Icon = (Icons as any)[iconName] || Icons.Circle;
    return Icon;
  };

  const BuildingIcon = Icons.Building2;
  const HomeIcon = Icons.Home;

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-navy border-r border-navy-light flex flex-col z-20">
      {/* Logo/Header */}
      <div className="p-6 border-b border-navy-light">
        <Link href="/admin" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-gold rounded-lg flex items-center justify-center">
            <BuildingIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-white font-bold text-lg leading-tight">
              Interface
            </h1>
            <p className="text-gold text-sm font-medium">d'Administration</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
          const Icon = getIcon(item.icon);
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                "text-white/70 hover:text-white hover:bg-navy-light",
                isActive && "bg-gold text-white font-medium shadow-lg"
              )}
            >
              <Icon className="w-5 h-5" />
              <span>{item.title}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-navy-light">
        <Link
          href="/protected"
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-white/70 hover:text-white hover:bg-navy-light transition-all duration-200"
        >
          <HomeIcon className="w-5 h-5" />
          <span>Retour à l'accueil</span>
        </Link>
      </div>
    </aside>
  );
}