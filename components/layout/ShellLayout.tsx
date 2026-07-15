"use client";

import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";

const AUTH_PATHS = ["/login", "/signup"];

export default function ShellLayout({
  isAdmin,
  children,
}: {
  isAdmin?: boolean;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAuth = AUTH_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"));

  return (
    <>
      {!isAuth && <Sidebar isAdmin={isAdmin} />}
      <main id="main-content" className={isAuth ? "min-h-screen" : "min-h-screen pb-24 md:pb-0"}>
        {children}
      </main>
    </>
  );
}
