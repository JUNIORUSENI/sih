"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import * as Icons from "lucide-react";

interface MenuItem {
  title: string;
  href: string;
  icon: string;
}

interface AppSidebarProps {
  title: string;
  subtitle: string;
  menuItems: MenuItem[];
  homeHref?: string;
}

export function AppSidebar({ title, subtitle, menuItems, homeHref = "/protected" }: AppSidebarProps) {
  const pathname = usePathname();

  // Fonction pour obtenir l'icône depuis lucide-react
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
        <Link href={homeHref} className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-gold rounded-lg flex items-center justify-center">
            <BuildingIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-white font-bold text-lg leading-tight">
              {title}
            </h1>
            <p className="text-gold text-sm font-medium">{subtitle}</p>
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
          <span>Tableau de bord</span>
        </Link>
      </div>
    </aside>
  );
}