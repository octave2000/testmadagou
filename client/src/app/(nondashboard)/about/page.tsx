import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  CheckCircle2,
  Compass,
  Handshake,
  Home,
  Landmark,
  MapPin,
  ShieldCheck,
  Users,
} from "lucide-react";

const marketStats = [
  {
    label: "Cities with active coverage",
    value: "6+",
    icon: MapPin,
  },
  {
    label: "Property managers on platform",
    value: "100+",
    icon: Users,
  },
  {
    label: "Verified listing workflow",
    value: "100%",
    icon: BadgeCheck,
  },
  {
    label: "Support in EN / FR",
    value: "2 languages",
    icon: Handshake,
  },
];

const citySpotlights = [
  {
    city: "Douala",
    note:
      "High-demand urban rentals, commercial corridors, and strong neighborhood-by-neighborhood price variation.",
  },
  {
    city: "Yaounde",
    note:
      "Strong family housing demand, diplomatic and professional tenant profiles, and stable long-term leasing patterns.",
  },
  {
    city: "Bafoussam",
    note:
      "Growing residential communities with increasing demand for modern apartments and quality-managed properties.",
  },
  {
    city: "Limbe & Kribi",
    note:
      "Coastal markets blending local demand, tourism influence, and premium rental opportunities.",
  },
];

const commitments = [
  {
    title: "Verified listings only",
    description:
      "Every listing goes through manager validation and moderation checks before broad visibility.",
    icon: ShieldCheck,
  },
  {
    title: "Cameroon-first data",
    description:
      "Pricing, property types, and search behavior are shaped by local realities, not copied from foreign markets.",
    icon: Landmark,
  },
  {
    title: "Transparent communication",
    description:
      "Tenants, managers, and owners get clear status updates from inquiry to application and approval.",
    icon: CheckCircle2,
  },
];

const processSteps = [
  {
    title: "List and verify",
    detail:
      "Managers submit complete property details, photos, and location data. Our workflow flags quality and consistency.",
  },
  {
    title: "Match by context",
    detail:
      "Search results prioritize neighborhood intent, budget range in XAF/USD, and practical filters such as beds, baths, and amenities.",
  },
  {
    title: "Apply with confidence",
    detail:
      "Tenants can apply directly, track status, and receive a clear decision flow with better trust and less friction.",
  },
];

export default function AboutPage() {
  return (
    <div className="w-full bg-slate-50 text-slate-900">
      <section className="relative min-h-[72vh] overflow-hidden">
        <Image
          src="/landing-discover-bg.jpg"
          alt="Madagou real estate operations in Cameroon"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-slate-900/70" />
        <div className="relative flex min-h-[72vh] w-full items-end px-4 pb-14 pt-20 sm:px-6 lg:px-10 xl:px-12">
          <div className="max-w-4xl">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-slate-100">
              <Building2 className="h-3.5 w-3.5" />
              About Madagou
            </p>
            <h1 className="mt-4 text-3xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
              Real estate in Cameroon, designed for trust and real local needs.
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-relaxed text-slate-200 sm:text-lg">
              Madagou is a Cameroon-focused real estate platform connecting
              tenants, property managers, and owners through verified listings,
              transparent workflows, and practical market intelligence.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/search"
                className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
              >
                Explore Listings
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 rounded-full border border-white/35 bg-white/10 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/20"
              >
                Join the Platform
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="w-full px-4 py-14 sm:px-6 lg:px-10 xl:px-12">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {marketStats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500">{stat.label}</p>
                <span className="grid h-9 w-9 place-items-center rounded-full bg-slate-100 text-slate-700">
                  <stat.icon className="h-4 w-4" />
                </span>
              </div>
              <p className="mt-3 text-2xl font-bold text-slate-900">
                {stat.value}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="w-full px-4 pb-16 sm:px-6 lg:px-10 xl:px-12">
        <div className="grid gap-10 xl:grid-cols-[1.2fr_1fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              Our mission
            </p>
            <h2 className="mt-3 text-2xl font-bold text-slate-900 sm:text-3xl">
              Make property search and management in Cameroon reliable,
              transparent, and efficient.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-slate-600">
              We built Madagou around problems local users actually face:
              inconsistent listing quality, unclear approval processes, and weak
              communication between tenants and managers. Our platform closes
              those gaps through verification, structured workflows, and clear
              data.
            </p>

            <div className="mt-7 space-y-5">
              {processSteps.map((step, index) => (
                <div
                  key={step.title}
                  className="flex gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4"
                >
                  <span className="mt-0.5 grid h-8 w-8 flex-shrink-0 place-items-center rounded-full bg-slate-900 text-sm font-semibold text-white">
                    {index + 1}
                  </span>
                  <div>
                    <h3 className="text-base font-semibold text-slate-900">
                      {step.title}
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-slate-600">
                      {step.detail}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              Market expertise
            </p>
            <h2 className="mt-3 text-2xl font-bold text-slate-900">
              Grounded in major Cameroon markets
            </h2>
            <div className="mt-5 space-y-3">
              {citySpotlights.map((spotlight) => (
                <div
                  key={spotlight.city}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                >
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                    <MapPin className="h-4 w-4 text-slate-500" />
                    {spotlight.city}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    {spotlight.note}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="w-full bg-white px-4 py-16 sm:px-6 lg:px-10 xl:px-12">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            What we stand for
          </p>
          <h2 className="mt-3 text-2xl font-bold text-slate-900 sm:text-3xl">
            Commitments that shape every listing and interaction
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {commitments.map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
            >
              <span className="grid h-10 w-10 place-items-center rounded-full bg-slate-900 text-white">
                <item.icon className="h-4 w-4" />
              </span>
              <h3 className="mt-4 text-lg font-semibold text-slate-900">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="w-full bg-slate-900 px-4 py-14 text-slate-100 sm:px-6 lg:px-10 xl:px-12">
        <div className="flex flex-col gap-6 rounded-2xl border border-white/15 bg-white/5 p-6 backdrop-blur sm:p-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-300">
              Build with us
            </p>
            <h2 className="mt-2 text-2xl font-bold text-white sm:text-3xl">
              Looking for a home, or managing one?
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-300 sm:text-base">
              Madagou helps you move from search to decision with clarity.
              Explore listings across Cameroon or start publishing your managed
              inventory with structured workflows.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/search"
              className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
            >
              <Home className="h-4 w-4" />
              Find Properties
            </Link>
            <Link
              href="/managers/newproperty"
              className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/20"
            >
              <Compass className="h-4 w-4" />
              List a Property
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

