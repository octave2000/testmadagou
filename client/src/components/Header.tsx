"use client";

import { useGetAuthUserQuery } from "@/state/api";
import {
  Building2,
  ChevronDown,
  Home,
  LayoutDashboard,
  LogOut,
  Menu,
  Search,
  Settings,
  Trees,
  X,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import React, { useMemo, useState, useSyncExternalStore } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { signOut } from "aws-amplify/auth";
import { useTranslations } from "@/lib/i18n-client";
import LanguageSwitcher from "./LanguageSwitcher";
import CurrencySwitcher from "./CurrencySwitcher";
import { cn } from "@/lib/utils";
import Image from "next/image";

type NavMenuItem = {
  label: string;
  listingLabel: "monthly" | "night" | "sell";
  propertyType: "Commercial" | "Residential" | "Land";
  icon: LucideIcon;
};

const buildSearchHref = (
  listingLabel?: "monthly" | "night" | "sell",
  propertyType?: "Commercial" | "Residential" | "Land",
) => {
  const params = new URLSearchParams();
  if (listingLabel) params.set("listingLabel", listingLabel);
  if (propertyType) params.set("propertyType", propertyType);
  const query = params.toString();
  return query ? `/search?${query}` : "/search";
};

const subscribeToScroll = (callback: () => void) => {
  window.addEventListener("scroll", callback, { passive: true });
  return () => window.removeEventListener("scroll", callback);
};

const getScrollY = () => window.scrollY;
const getServerScrollY = () => 0;

const Header = () => {
  const [openMenuRoute, setOpenMenuRoute] = useState<string | null>(null);
  const scrollY = useSyncExternalStore(
    subscribeToScroll,
    getScrollY,
    getServerScrollY,
  );
  const scrolled = scrollY > 18;
  const { data: authUser } = useGetAuthUserQuery();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { t } = useTranslations();

  const userRole = authUser?.userRole?.toLowerCase();
  const sellNavLabel =
    userRole === "admin" || userRole === "manager"
      ? t("header.sell")
      : t("header.buy");
  const dashboardPath =
    userRole === "manager"
      ? "/managers/properties"
      : userRole === "admin"
        ? "/admin/properties"
        : "/tenants/favorites";
  const settingsPath =
    userRole === "admin"
      ? "/admin/settings"
      : userRole
        ? `/${userRole}s/settings`
        : "/";

  const searchParamsString = searchParams.toString();
  const routeKey = searchParamsString
    ? `${pathname}?${searchParamsString}`
    : pathname;
  const mobileMenuOpen = openMenuRoute === routeKey;
  const handleMobileMenuToggle = () => {
    setOpenMenuRoute((currentRoute) =>
      currentRoute === routeKey ? null : routeKey,
    );
  };

  const handleSignOut = async () => {
    await signOut();
    window.location.href = "/";
  };

  const rentMenuItems = useMemo<NavMenuItem[]>(
    () => [
      {
        label: t("header.commercial"),
        listingLabel: "monthly",
        propertyType: "Commercial",
        icon: Building2,
      },
      {
        label: t("header.residential"),
        listingLabel: "monthly",
        propertyType: "Residential",
        icon: Home,
      },
    ],
    [t],
  );

  const sellMenuItems = useMemo<NavMenuItem[]>(
    () => [
      {
        label: t("header.commercial"),
        listingLabel: "sell",
        propertyType: "Commercial",
        icon: Building2,
      },
      {
        label: t("header.residential"),
        listingLabel: "sell",
        propertyType: "Residential",
        icon: Home,
      },
    ],
    [t],
  );

  const landMenuItems = useMemo<NavMenuItem[]>(
    () => [
      {
        label: t("header.rent"),
        listingLabel: "monthly",
        propertyType: "Land",
        icon: Trees,
      },
      {
        label: sellNavLabel,
        listingLabel: "sell",
        propertyType: "Land",
        icon: Trees,
      },
    ],
    [sellNavLabel, t],
  );

  const activeListingLabel = (
    searchParams.get("listingLabel") || ""
  ).toLowerCase();
  const normalizedListingLabel = activeListingLabel || "monthly";
  const activePropertyType = (
    searchParams.get("propertyType") || ""
  ).toLowerCase();
  const isSearchPage = pathname === "/search";
  const isRentActive =
    isSearchPage &&
    normalizedListingLabel === "monthly" &&
    activePropertyType !== "land";
  const isSellActive =
    isSearchPage &&
    activeListingLabel === "sell" &&
    activePropertyType !== "land";
  const isLandActive =
    isSearchPage &&
    activePropertyType === "land" &&
    (normalizedListingLabel === "monthly" || activeListingLabel === "sell");
  const isShortTermRentalActive =
    isSearchPage && activeListingLabel === "night";
  const isAboutActive = pathname === "/about";

  const isNavItemActive = (item: NavMenuItem) => {
    if (!isSearchPage) return false;

    const listingMatches =
      item.listingLabel === "monthly"
        ? normalizedListingLabel === "monthly"
        : activeListingLabel === item.listingLabel;
    const propertyMatches = item.propertyType
      ? activePropertyType === item.propertyType.toLowerCase()
      : true;

    return listingMatches && propertyMatches;
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className=" w-full ">
        <div
          className={cn(
            "relative w-full border-b backdrop-blur-xl transition-all duration-500",
            scrolled
              ? "border-slate-200/90 bg-white/95 shadow-[0_16px_48px_rgba(15,23,42,0.16)]"
              : "border-slate-200/70 bg-white/86",
          )}
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_8%_-40%,rgba(13,148,136,0.2),transparent_48%),radial-gradient(circle_at_92%_-40%,rgba(14,165,233,0.18),transparent_45%),linear-gradient(to_bottom,rgba(255,255,255,0.92),rgba(255,255,255,0.82))]" />
          <div className="relative flex h-16 items-center justify-between px-3 sm:h-[76px] sm:px-6 lg:px-8 xl:px-10">
            <Link
              href="/"
              className="group flex min-w-0 flex-col rounded-2xl border border-white/80 bg-white/90 px-2 py-1.5 shadow-sm transition hover:shadow-md sm:px-3"
            >
              <div className="flex min-w-0 items-end">
                {/* Logo M */}
                <span className="relative flex h-12 shrink-0 items-center overflow-hidden rounded-xl sm:h-14">
                  <Image
                    src="/logoc.png"
                    alt="Madagou Logo"
                    width={354}
                    height={221}
                    className="h-full w-auto object-contain object-left"
                    priority
                  />

                  {/* Ring */}
                  <span className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-white/40" />

                  {/* Glow Effect */}
                  <span className="pointer-events-none absolute inset-0 bg-[conic-gradient(from_210deg,transparent_0deg,rgba(255,255,255,0.5)_110deg,transparent_190deg)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                </span>

                {/* adagou text */}
                <p className="-ml-1 pb-0.5 text-[1.02rem] font-extrabold leading-[0.9] text-slate-900 sm:text-[1.25rem]">
                  Madagou
                </p>
              </div>
            </Link>

            <nav className="hidden xl:flex items-center gap-4 rounded-full border border-white/80 bg-white/80 px-4 py-3 shadow-inner shadow-slate-100 backdrop-blur">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className={cn(
                      "inline-flex items-center gap-2 rounded-full px-6 py-3 text-base font-semibold transition-all",
                      isRentActive
                        ? "bg-slate-900 text-white shadow-lg shadow-slate-400/25"
                        : "text-slate-700 hover:bg-white hover:text-slate-900",
                    )}
                  >
                    {t("header.rent")}
                    <ChevronDown className="h-5 w-5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  className="mt-3 w-72 rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-xl backdrop-blur"
                >
                  {rentMenuItems.map((item) => (
                    <Link
                      key={`${item.listingLabel}-${item.propertyType}`}
                      href={buildSearchHref(
                        item.listingLabel,
                        item.propertyType,
                      )}
                      className={cn(
                        "group flex items-center gap-4 rounded-xl border px-4 py-3 text-base font-semibold transition-all",
                        isNavItemActive(item)
                          ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                          : "border-transparent text-slate-700 hover:border-emerald-100 hover:bg-emerald-50/70",
                      )}
                    >
                      <span
                        className={cn(
                          "grid h-10 w-10 place-items-center rounded-lg transition",
                          isNavItemActive(item)
                            ? "bg-emerald-100"
                            : "bg-slate-100 group-hover:bg-emerald-100",
                        )}
                      >
                        <item.icon className="h-5 w-5" />
                      </span>
                      {item.label}
                    </Link>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className={cn(
                      "inline-flex items-center gap-2 rounded-full px-6 py-3 text-base font-semibold transition-all",
                      isSellActive
                        ? "bg-slate-900 text-white shadow-lg shadow-slate-400/25"
                        : "text-slate-700 hover:bg-white hover:text-slate-900",
                    )}
                  >
                    {sellNavLabel}
                    <ChevronDown className="h-5 w-5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  className="mt-3 w-72 rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-xl backdrop-blur"
                >
                  {sellMenuItems.map((item) => (
                    <Link
                      key={`${item.listingLabel}-${item.propertyType}`}
                      href={buildSearchHref(
                        item.listingLabel,
                        item.propertyType,
                      )}
                      className={cn(
                        "group flex items-center gap-4 rounded-xl border px-4 py-3 text-base font-semibold transition-all",
                        isNavItemActive(item)
                          ? "border-sky-200 bg-sky-50 text-sky-800"
                          : "border-transparent text-slate-700 hover:border-sky-100 hover:bg-sky-50/70",
                      )}
                    >
                      <span
                        className={cn(
                          "grid h-10 w-10 place-items-center rounded-lg transition",
                          isNavItemActive(item)
                            ? "bg-sky-100"
                            : "bg-slate-100 group-hover:bg-sky-100",
                        )}
                      >
                        <item.icon className="h-5 w-5" />
                      </span>
                      {item.label}
                    </Link>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className={cn(
                      "inline-flex items-center gap-2 rounded-full px-6 py-3 text-base font-semibold transition-all",
                      isLandActive
                        ? "bg-slate-900 text-white shadow-lg shadow-slate-400/25"
                        : "text-slate-700 hover:bg-white hover:text-slate-900",
                    )}
                  >
                    {t("header.land")}
                    <ChevronDown className="h-5 w-5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  className="mt-3 w-72 rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-xl backdrop-blur"
                >
                  {landMenuItems.map((item) => (
                    <Link
                      key={`${item.listingLabel}-${item.propertyType}`}
                      href={buildSearchHref(
                        item.listingLabel,
                        item.propertyType,
                      )}
                      className={cn(
                        "group flex items-center gap-4 rounded-xl border px-4 py-3 text-base font-semibold transition-all",
                        isNavItemActive(item)
                          ? "border-amber-200 bg-amber-50 text-amber-800"
                          : "border-transparent text-slate-700 hover:border-amber-100 hover:bg-amber-50/70",
                      )}
                    >
                      <span
                        className={cn(
                          "grid h-10 w-10 place-items-center rounded-lg transition",
                          isNavItemActive(item)
                            ? "bg-amber-100"
                            : "bg-slate-100 group-hover:bg-amber-100",
                        )}
                      >
                        <item.icon className="h-5 w-5" />
                      </span>
                      {item.label}
                    </Link>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <Link
                href={buildSearchHref("night")}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full px-6 py-3 text-base font-semibold transition-all",
                  isShortTermRentalActive
                    ? "bg-slate-900 text-white shadow-lg shadow-slate-400/25"
                    : "text-slate-700 hover:bg-white hover:text-slate-900",
                )}
              >
                {t("header.shortTermRental")}
              </Link>

              <Link
                href="/about"
                className={cn(
                  "inline-flex items-center gap-2 rounded-full px-6 py-3 text-base font-semibold transition-all",
                  isAboutActive
                    ? "bg-slate-900 text-white shadow-lg shadow-slate-400/25"
                    : "text-slate-700 hover:bg-white hover:text-slate-900",
                )}
              >
                {t("header.aboutUs")}
              </Link>
            </nav>

            <div className="flex items-center gap-2 sm:gap-3">
              <div className="hidden md:flex items-center gap-2 rounded-full p-1">
                <LanguageSwitcher />
                <CurrencySwitcher />
              </div>

              <Link
                href="/search"
                className="hidden xl:inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-emerald-200 hover:text-emerald-700"
              >
                <Search className="h-4 w-4" />
                {t("common.search")}
              </Link>

              {authUser ? (
                <DropdownMenu>
                  <DropdownMenuTrigger className="group flex items-center gap-2 rounded-full border border-slate-200 bg-white px-2 py-1.5 shadow-sm transition hover:border-emerald-200 focus:outline-none">
                    <Avatar className="h-8 w-8 ring-2 ring-emerald-100 sm:h-9 sm:w-9">
                      <AvatarImage src={authUser.userInfo?.image} />
                      <AvatarFallback className="bg-gradient-to-br from-emerald-600 to-sky-700 font-semibold text-white">
                        {authUser.userInfo?.name?.[0]?.toUpperCase() ||
                          authUser.userRole?.[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden max-w-32 truncate text-sm font-semibold text-slate-800 md:block">
                      {authUser.userInfo?.name}
                    </span>
                    <ChevronDown className="hidden h-4 w-4 text-slate-500 transition-transform group-data-[state=open]:rotate-180 md:block" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="mt-2 w-60 border-slate-200 bg-white/95 p-1 shadow-xl backdrop-blur">
                    <div className="rounded-lg bg-slate-50 px-3 py-2">
                      <p className="truncate text-sm font-semibold text-slate-900">
                        {authUser.userInfo?.name}
                      </p>
                      <p className="text-xs uppercase tracking-wide text-slate-500">
                        {authUser.userRole?.toLowerCase()}
                      </p>
                    </div>
                    <DropdownMenuItem
                      className="mt-1 cursor-pointer rounded-md px-2 py-2.5 font-medium focus:bg-emerald-50"
                      onClick={() =>
                        router.push(dashboardPath, { scroll: false })
                      }
                    >
                      <LayoutDashboard className="mr-2 h-4 w-4 text-emerald-600" />
                      {t("common.dashboard")}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="cursor-pointer rounded-md px-2 py-2.5 font-medium focus:bg-slate-100"
                      onClick={() =>
                        router.push(settingsPath, { scroll: false })
                      }
                    >
                      <Settings className="mr-2 h-4 w-4 text-slate-600" />
                      {t("common.settings")}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-slate-200" />
                    <DropdownMenuItem
                      className="cursor-pointer rounded-md px-2 py-2.5 font-medium text-red-600 focus:bg-red-50"
                      onClick={handleSignOut}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      {t("common.signOut")}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="hidden sm:flex items-center gap-2">
                  <Link
                    href="/signin"
                    className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-emerald-200 hover:text-emerald-700"
                  >
                    {t("common.logIn")}
                  </Link>
                  <Link
                    href="/signup"
                    className="rounded-full bg-gradient-to-r from-emerald-600 to-sky-700 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-300/35 transition hover:from-emerald-700 hover:to-sky-800"
                  >
                    {t("common.signUp")}
                  </Link>
                </div>
              )}

              <button
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:border-emerald-200 hover:text-emerald-700 xl:hidden"
                onClick={handleMobileMenuToggle}
                aria-label={t("header.toggleMenu")}
              >
                {mobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
        </div>

        <div
          className={cn(
            "overflow-hidden transition-all duration-300 xl:hidden",
            mobileMenuOpen ? "max-h-[700px] opacity-100" : "max-h-0 opacity-0",
          )}
        >
          <div className="border-b border-slate-200/90 bg-white/95 px-4 pb-4 pt-3 shadow-lg backdrop-blur-xl sm:px-6">
            <nav className="space-y-3">
              <details className="group overflow-hidden rounded-2xl border border-slate-200 bg-white">
                <summary
                  className={cn(
                    "flex cursor-pointer list-none items-center justify-between px-3 py-3 text-sm font-semibold",
                    isRentActive
                      ? "bg-slate-900 text-white"
                      : "text-slate-700 hover:bg-slate-50",
                  )}
                >
                  {t("header.rent")}
                  <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
                </summary>
                <div className="space-y-1 border-t border-slate-100 p-2">
                  {rentMenuItems.map((item) => (
                    <Link
                      key={`mobile-${item.listingLabel}-${item.propertyType}`}
                      href={buildSearchHref(
                        item.listingLabel,
                        item.propertyType,
                      )}
                      className={cn(
                        "flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm font-medium transition",
                        isNavItemActive(item)
                          ? "bg-emerald-50 text-emerald-800"
                          : "text-slate-700 hover:bg-emerald-50/60",
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  ))}
                </div>
              </details>

              <details className="group overflow-hidden rounded-2xl border border-slate-200 bg-white">
                <summary
                  className={cn(
                    "flex cursor-pointer list-none items-center justify-between px-3 py-3 text-sm font-semibold",
                    isSellActive
                      ? "bg-slate-900 text-white"
                      : "text-slate-700 hover:bg-slate-50",
                  )}
                >
                  {sellNavLabel}
                  <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
                </summary>
                <div className="space-y-1 border-t border-slate-100 p-2">
                  {sellMenuItems.map((item) => (
                    <Link
                      key={`mobile-${item.listingLabel}-${item.propertyType}`}
                      href={buildSearchHref(
                        item.listingLabel,
                        item.propertyType,
                      )}
                      className={cn(
                        "flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm font-medium transition",
                        isNavItemActive(item)
                          ? "bg-sky-50 text-sky-800"
                          : "text-slate-700 hover:bg-sky-50/60",
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  ))}
                </div>
              </details>

              <details className="group overflow-hidden rounded-2xl border border-slate-200 bg-white">
                <summary
                  className={cn(
                    "flex cursor-pointer list-none items-center justify-between px-3 py-3 text-sm font-semibold",
                    isLandActive
                      ? "bg-slate-900 text-white"
                      : "text-slate-700 hover:bg-slate-50",
                  )}
                >
                  {t("header.land")}
                  <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
                </summary>
                <div className="space-y-1 border-t border-slate-100 p-2">
                  {landMenuItems.map((item) => (
                    <Link
                      key={`mobile-${item.listingLabel}-${item.propertyType}`}
                      href={buildSearchHref(
                        item.listingLabel,
                        item.propertyType,
                      )}
                      className={cn(
                        "flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm font-medium transition",
                        isNavItemActive(item)
                          ? "bg-amber-50 text-amber-800"
                          : "text-slate-700 hover:bg-amber-50/60",
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  ))}
                </div>
              </details>

              <Link
                href={buildSearchHref("night")}
                className={cn(
                  "flex items-center justify-between rounded-2xl border px-3 py-3 text-sm font-semibold transition",
                  isShortTermRentalActive
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-200 text-slate-700 hover:border-sky-200 hover:bg-sky-50/60",
                )}
              >
                {t("header.shortTermRental")}
              </Link>

              <Link
                href="/about"
                className={cn(
                  "flex items-center justify-between rounded-2xl border px-3 py-3 text-sm font-semibold transition",
                  isAboutActive
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-200 text-slate-700 hover:border-emerald-200 hover:bg-emerald-50/60",
                )}
              >
                {t("header.aboutUs")}
              </Link>
            </nav>

            <div className="mt-4 flex items-center gap-2">
              <LanguageSwitcher />
              <CurrencySwitcher />
            </div>

            {authUser ? (
              <div className="mt-4 grid grid-cols-2 gap-2">
                <button
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-emerald-200 hover:text-emerald-700"
                  onClick={() => router.push(dashboardPath, { scroll: false })}
                >
                  <LayoutDashboard className="h-4 w-4" />
                  {t("common.dashboard")}
                </button>
                <button
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-100"
                  onClick={handleSignOut}
                >
                  <LogOut className="h-4 w-4" />
                  {t("common.signOut")}
                </button>
              </div>
            ) : (
              <div className="mt-4 grid grid-cols-2 gap-2">
                <Link
                  href="/signin"
                  className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-emerald-200 hover:text-emerald-700"
                >
                  {t("common.logIn")}
                </Link>
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-emerald-600 to-sky-700 px-3 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-300/35 transition hover:from-emerald-700 hover:to-sky-800"
                >
                  {t("common.signUp")}
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
