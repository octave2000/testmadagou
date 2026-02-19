"use client";

import Navbar from "@/components/Navbar";
import { SidebarProvider } from "@/components/ui/sidebar";
import Sidebar from "@/components/AppSidebar";
import { NAVBAR_HEIGHT } from "@/lib/constants";
import React, { useEffect, useState } from "react";
import { useGetAuthUserQuery } from "@/state/api";
import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "@/lib/i18n-client";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const { t } = useTranslations();
  const { data: authUser, isLoading: authLoading } = useGetAuthUserQuery();
  const router = useRouter();
  const pathname = usePathname();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    if (!authUser) return;
    const userRole = authUser.userRole?.toLowerCase();
    const shouldRedirect =
      (userRole === "manager" && pathname.startsWith("/tenants")) ||
      (userRole === "tenant" && pathname.startsWith("/managers"));

    if (shouldRedirect) {
      setIsRedirecting(true);
      router.replace(
        userRole === "manager"
          ? "/managers/properties"
          : userRole === "admin"
            ? "/admin/properties"
            : "/tenants/favorites",
        { scroll: false },
      );
    }
  }, [authUser, router, pathname]);

  if (authLoading || isRedirecting) return <>{t("common.loading")}</>;
  if (!authUser?.userRole) return null;

  return (
    <SidebarProvider>
      <div className="min-h-screen w-full bg-primary-100">
        <Navbar />
        <div style={{ marginTop: `${NAVBAR_HEIGHT}px` }}>
          <main className="flex">
            <Sidebar userType={authUser.userRole.toLowerCase()} />
            <div className="flex-grow transition-all duration-300">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
