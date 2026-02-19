import Link from "next/link";

const sections = [
  {
    title: "1. Scope",
    points: [
      "These Terms of Service govern your use of the Madagou website, applications, and related real estate marketplace services.",
      "By using the platform, you agree to these terms and applicable laws.",
    ],
  },
  {
    title: "2. Eligibility And Accounts",
    points: [
      "You must provide accurate account information and keep your credentials secure.",
      "You are responsible for activity under your account and for promptly reporting unauthorized access.",
    ],
  },
  {
    title: "3. Listings And Property Information",
    points: [
      "Managers and listing parties are responsible for the accuracy, legality, and completeness of listing content.",
      "Listings must not contain false, misleading, discriminatory, or unlawful information.",
      "We may moderate, remove, or limit listings that violate these terms or platform policies.",
    ],
  },
  {
    title: "4. User Conduct",
    points: [
      "You agree to use the platform lawfully and respectfully when contacting managers, owners, and other users.",
      "You must not scrape data, distribute malware, interfere with platform operations, or attempt unauthorized access.",
      "You must not use the platform to harass, impersonate, or defraud others.",
    ],
  },
  {
    title: "5. Platform Role",
    points: [
      "Madagou provides a listing and communication platform and is not a broker, landlord, legal advisor, or financial advisor.",
      "We do not guarantee that any listing, tenant, owner, or transaction outcome will meet your expectations.",
      "Users are responsible for their own due diligence before entering any rental or sale agreement.",
    ],
  },
  {
    title: "6. Communications",
    points: [
      "By using the platform, you consent to receive service and account-related communications.",
      "You are responsible for ensuring your contact information remains current.",
    ],
  },
  {
    title: "7. Intellectual Property",
    points: [
      "The platform, branding, and original content are owned by or licensed to Madagou and are protected by law.",
      "You may not copy, reproduce, or distribute protected materials without permission, except as allowed by law.",
    ],
  },
  {
    title: "8. Payments",
    points: [
      "Madagou does not currently process payments through the platform.",
      "Any rent, deposit, purchase, or other payment arrangement occurs outside the platform between users.",
      "Because payments are not processed by us, we do not provide payment processing protection, escrow, or chargeback handling at this time.",
    ],
  },
  {
    title: "9. Disclaimer Of Warranties",
    points: [
      "The platform is provided on an as-is and as-available basis to the fullest extent permitted by law.",
      "We disclaim warranties of merchantability, fitness for a particular purpose, and non-infringement where legally allowed.",
    ],
  },
  {
    title: "10. Limitation Of Liability",
    points: [
      "To the extent permitted by law, Madagou is not liable for indirect, incidental, special, consequential, or punitive damages.",
      "Our total liability for claims related to platform use is limited to the minimum amount required by applicable law.",
    ],
  },
  {
    title: "11. Indemnification",
    points: [
      "You agree to defend, indemnify, and hold harmless Madagou and its affiliates from claims arising out of your misuse of the platform or violation of these terms.",
    ],
  },
  {
    title: "12. Suspension And Termination",
    points: [
      "We may suspend or terminate access for violations, security concerns, or legal reasons, with or without prior notice where appropriate.",
    ],
  },
  {
    title: "13. Governing Law",
    points: [
      "These terms are governed by applicable laws of Cameroon, unless mandatory law in your jurisdiction requires otherwise.",
    ],
  },
  {
    title: "14. Updates To These Terms",
    points: [
      "We may revise these terms from time to time. Continued use after updates means you accept the revised terms.",
    ],
  },
  {
    title: "15. Contact",
    points: ["Questions about these Terms can be sent to info@madagou.com."],
  },
];

export default function TermsPage() {
  return (
    <div className="w-full bg-slate-50 text-slate-900">
      <section className="w-full border-b border-slate-200 bg-white px-4 py-14 sm:px-6 lg:px-10 xl:px-12">
        <div className="mx-auto max-w-5xl">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            Legal
          </p>
          <h1 className="mt-3 text-3xl font-bold sm:text-4xl">Terms of Service</h1>
          <p className="mt-3 text-sm text-slate-500">Last updated: February 12, 2026</p>
          <p className="mt-5 max-w-3xl text-sm leading-relaxed text-slate-600">
            These Terms provide standard marketplace rules for a real estate listing and
            application platform. They do not replace legal advice for your specific transactions.
          </p>
        </div>
      </section>

      <section className="w-full px-4 py-12 sm:px-6 lg:px-10 xl:px-12">
        <div className="mx-auto max-w-5xl space-y-5">
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
            href="/privacy"
            className="rounded-full border border-slate-200 px-4 py-2 font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
          >
            View Privacy Policy
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
