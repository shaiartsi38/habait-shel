"use client";

import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";

const NO_SIDEBAR_PATHS = ["/login", "/signup", "/onboarding"];

export default function ShellLayout({
  isAdmin,
  children,
}: {
  isAdmin?: boolean;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const hideSidebar = NO_SIDEBAR_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"));

  return (
    <>
      {!hideSidebar && <Sidebar isAdmin={isAdmin} />}
      <main id="main-content" className={hideSidebar ? "min-h-screen" : "min-h-screen pb-24 md:pb-0"}>
        {children}
      </main>
    </>
  );
}
