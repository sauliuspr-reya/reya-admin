import { MainNav } from "./main-nav"
import { SideNav } from "./side-nav"
import { useSession } from "next-auth/react";

interface RootLayoutProps {
  children: React.ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  const { data: session } = useSession();
  const isAuthenticated = !!session;
  return (
    <div className="flex min-h-screen flex-col">
      {isAuthenticated && (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-14 items-center">
            <MainNav />
          </div>
        </header>
      )}
      <div className={`container grid flex-1 gap-12 md:grid-cols-[200px_1fr]${isAuthenticated ? '' : ' md:grid-cols-1'}`}>
        {isAuthenticated && (
          <aside className="hidden w-[200px] flex-col md:flex">
            <SideNav />
          </aside>
        )}
        <main className="flex w-full flex-1 flex-col overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  )
}
