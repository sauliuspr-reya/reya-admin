import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Activity, CircleDollarSign, KeyRound, Trophy } from "lucide-react"
import { useSession } from "next-auth/react";

export function MainNav() {
  const pathname = usePathname();
  const { data: session } = useSession();

  if (!session) return null;

  const routes = [
    {
      href: "/",
      label: "Overview",
      icon: Activity,
      active: pathname === "/",
    },
    {
      href: "/leaderboard",
      label: "Leaderboard",
      icon: Trophy,
      active: pathname === "/leaderboard",
    },
    {
      href: "/positions",
      label: "Open Positions",
      icon: CircleDollarSign,
      active: pathname === "/positions",
    },
    {
      href: "/db-requests",
      label: "DB Credentials",
      icon: KeyRound,
      active: pathname === "/db-requests",
    },
  ];

  return (
    <nav className="flex items-center space-x-6">
      {routes.map((route) => (
        <Link
          key={route.href}
          href={route.href}
          className={cn(
            "flex items-center space-x-2 text-sm font-medium transition-colors hover:text-primary",
            route.active ? "text-black dark:text-white" : "text-muted-foreground"
          )}
        >
          <route.icon className="h-4 w-4" />
          <span>{route.label}</span>
        </Link>
      ))}
    </nav>
  );
}
