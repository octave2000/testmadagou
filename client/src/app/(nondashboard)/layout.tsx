import React, { Suspense } from "react";
import Header from "@/components/Header";

const HeaderFallback = () => (
  <div className="fixed inset-x-0 top-0 z-40 h-16 border-b border-slate-200 bg-white/90 sm:h-[76px]" />
);

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div>
      <Suspense fallback={<HeaderFallback />}>
        <Header />
      </Suspense>
      <main className="flex h-full w-full flex-col pt-16 sm:pt-[76px]">
        {children}
      </main>
    </div>
  );
};

export default Layout;
