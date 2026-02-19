import Link from "next/link";

const sections = [
  {
    title: "1. Information We Collect",
    points: [
      "Account details such as your name, email address, phone number, and profile preferences.",
      "Property and listing information provided by managers and owners, including photos, descriptions, pricing, and location data.",
      "Inquiry and application data you submit through the platform.",
      "Technical and usage data such as device type, browser, IP address, pages visited, and interaction patterns.",
      "Cookie and similar technology data used to support sessions, preferences, and analytics.",
    ],
  },
  {
    title: "2. How We Use Information",
    points: [
      "To operate, maintain, and improve the platform and search experience.",
      "To verify listings, support matching between users, and process user requests.",
      "To communicate service updates, security notices, and support responses.",
      "To monitor abuse, fraud, and policy violations and protect platform integrity.",
      "To comply with legal obligations and resolve disputes.",
    ],
  },
  {
    title: "3. How We Share Information",
    points: [
      "With managers, owners, and users where needed to deliver listing, inquiry, and application features.",
      "With service providers that support hosting, infrastructure, analytics, and customer support under confidentiality obligations.",
      "When required by law, legal process, or to protect rights, safety, and security.",
      "In connection with a merger, acquisition, or business transfer where permitted by law.",
    ],
  },
  {
    title: "4. Data Retention",
    points: [
      "We keep personal information only as long as needed for business, legal, and operational purposes.",
      "Retention periods may differ depending on account activity, legal requirements, and dispute resolution needs.",
    ],
  },
  {
    title: "5. Security",
    points: [
      "We use reasonable technical and organizational safeguards to protect personal information.",
      "No internet transmission or storage method is completely secure, so we cannot guarantee absolute security.",
    ],
  },
  {
    title: "6. Your Choices and Rights",
    points: [
      "You may request to access, update, or delete your account data, subject to legal exceptions.",
      "You may manage certain communications and cookie preferences through available settings and browser tools.",
    ],
  },
  {
    title: "7. International Data Handling",
    points: [
      "Your information may be processed in countries other than your own where our providers operate.",
      "When required, we apply reasonable safeguards for cross-border data transfers.",
    ],
  },
  {
    title: "8. Children",
    points: [
      "The platform is not directed to children under 18, and we do not knowingly collect their personal information.",
    ],
  },
  {
    title: "9. Payments",
    points: [
      "Madagou does not currently process payments through the platform.",
      "Any financial arrangement between users happens outside the platform and is not processed by us.",
    ],
  },
  {
    title: "10. Changes To This Policy",
    points: [
      "We may update this policy from time to time. Material changes will be reflected by an updated date and, where appropriate, additional notice.",
    ],
  },
  {
    title: "11. Contact",
    points: ["Questions about this Privacy Policy can be sent to info@madagou.com."],
  },
];

export default function PrivacyPage() {
  return (
    <div className="w-full bg-slate-50 text-slate-900">
      <section className="w-full border-b border-slate-200 bg-white px-4 py-14 sm:px-6 lg:px-10 xl:px-12">
        <div className="mx-auto max-w-5xl">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            Legal
          </p>
          <h1 className="mt-3 text-3xl font-bold sm:text-4xl">Privacy Policy</h1>
          <p className="mt-3 text-sm text-slate-500">Last updated: February 12, 2026</p>
          <p className="mt-5 max-w-3xl text-sm leading-relaxed text-slate-600">
            This Privacy Policy describes how Madagou collects, uses, discloses, and protects
            information when you use our real estate platform and related services.
          </p>
        </div>
      </section>

      <section className="w-full px-4 py-12 sm:px-6 lg:px-10 xl:px-12">
        <div className="mx-auto space-y-5 max-w-5xl">
          {sections.map((section) => (
            <article
              key={section.title}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <h2 className="text-lg font-semibold text-slate-900">{section.title}</h2>
              <ul className="mt-3 space-y-2 text-sm leading-relaxed text-slate-600">
                {section.points.map((point) => (
                  <li key={point} className="flex gap-2">
                    <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-slate-400" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="w-full border-t border-slate-200 bg-white px-4 py-10 sm:px-6 lg:px-10 xl:px-12">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-3 text-sm">
          <Link
            href="/terms"
            className="rounded-full border border-slate-200 px-4 py-2 font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
          >
            View Terms of Service
          </Link>
          <Link
            href="/search"
            className="rounded-full border border-slate-200 px-4 py-2 font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
          >
            Back to Search
          </Link>
        </div>
      </section>
    </div>
  );
}
