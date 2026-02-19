"use client";

import Link from "next/link";
import {
  Building2,
  Compass,
  Facebook,
  Instagram,
  Mail,
  MapPin,
  Phone,
  Sparkles,
  Twitter,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { useTranslations } from "@/lib/i18n-client";
import { useGetAuthUserQuery } from "@/state/api";

export function Footer() {
  const { t } = useTranslations();
  const { data: authUser } = useGetAuthUserQuery();
  const pathname = usePathname();
  const userRole = authUser?.userRole?.toLowerCase();
  const sellServiceLabel =
    userRole === "admin" || userRole === "manager"
      ? t("footer.sellProperty")
      : t("footer.buyProperty");
  const isDashboardRoute =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/managers") ||
    pathname.startsWith("/tenants");
  const year = new Date().getFullYear();

  if (isDashboardRoute) return null;

  const serviceLinks = [
    { label: t("footer.buyProperty"), href: "/search?propertyType=Villa" },
    { label: t("footer.rentProperty"), href: "/search?propertyType=Residential" },
    { label: sellServiceLabel, href: "/managers/newproperty" },
    {
      label: t("footer.propertyManagement"),
      href: "/managers/properties",
    },
  ];

  const quickLinks = [
    { label: t("common.search"), href: "/search", icon: Compass },
    { label: t("common.signUp"), href: "/signup", icon: Sparkles },
    { label: t("common.dashboard"), href: "/tenants/favorites", icon: Building2 },
  ];

  const socialLinks = [
    { label: "Facebook", href: "#", icon: Facebook },
    { label: "Instagram", href: "#", icon: Instagram },
    { label: "Twitter", href: "#", icon: Twitter },
  ];

  return (
    <footer className="relative mt-auto overflow-hidden bg-slate-950 text-slate-100">
      <div className="relative border-b border-white/10">
        <div className="w-full px-4 py-8 sm:px-6 lg:px-10 xl:px-12">
          <div className="flex flex-col gap-5 rounded-2xl border border-white/10 bg-slate-900 p-5 md:flex-row md:items-center md:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-200/90">
                Madagou
              </p>
              <h3 className="mt-2 text-xl font-semibold text-white sm:text-2xl">
                {t("landing.ctaTitle")}
              </h3>
              <p className="mt-2 text-sm text-slate-300">{t("footer.tagline")}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {quickLinks.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white hover:text-slate-900"
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="relative w-full px-4 py-10 sm:px-6 lg:px-10 xl:px-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-4">
          <div className="xl:col-span-2">
            <Link href="/" className="inline-flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-2xl border border-white/10 bg-slate-800 text-white">
                <span className="text-2xl font-black">M</span>
              </span>
              <div>
                <p className="text-xl font-bold text-white">adagou</p>
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                  The Modern Real Estate
                </p>
              </div>
            </Link>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-slate-300">
              {t("footer.tagline")}
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/5 text-slate-300 transition hover:border-blue-300 hover:bg-blue-500/20 hover:text-white"
                >
                  <social.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-[0.16em] text-blue-200">
              {t("footer.services")}
            </h4>
            <ul className="mt-4 space-y-2">
              {serviceLinks.map((service) => (
                <li key={service.label}>
                  <Link
                    href={service.href}
                    className="group inline-flex items-center text-sm text-slate-300 transition hover:text-white"
                  >
                    <span className="mr-2 h-1.5 w-1.5 rounded-full bg-blue-300/80 transition group-hover:scale-125" />
                    {service.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-[0.16em] text-blue-200">
              {t("footer.contact")}
            </h4>
            <ul className="mt-4 space-y-3 text-sm text-slate-300">
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-blue-200" />
                info@madagou.com
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-blue-200" />
                +237 6 00 00 00 00
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-blue-200" />
                Yaounde, Cameroon
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-start gap-4 border-t border-white/10 pt-6 text-sm text-slate-400 md:flex-row md:items-center md:justify-between">
          <p>
            &copy; {year} Madagou. {t("footer.allRightsReserved")}
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <Link href="/privacy" className="transition hover:text-white">
              {t("footer.privacyPolicy")}
            </Link>
            <span className="h-1 w-1 rounded-full bg-slate-500" />
            <Link href="/terms" className="transition hover:text-white">
              {t("footer.termsOfService")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
