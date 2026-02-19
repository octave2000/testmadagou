The Core Problem

When you build at image build time:

RUN npm run build


Next.js:

Reads env vars during build

Performs static optimization

Pre-renders pages

Inlines NEXT_PUBLIC_*

Possibly caches fetches

So at runtime, changing envs doesn’t change behavior.

🧠 Why Runtime Build “Works”

When you build inside:

CMD ["sh", "-c", "npm run build && npm run start"]


The container already has the runtime env vars.

So build sees correct envs.

But…

👉 The app is DOWN during build.
👉 Not production-safe.

🎯 What You Actually Need

You need:

✅ Build once

✅ No downtime

✅ Runtime env vars work

❌ No rebuild at container start

That means:

You must stop relying on build-time env behavior.

🧨 What’s Probably Happening

You're likely using one of these:

1️⃣ NEXT_PUBLIC_* in client components

These are frozen at build time.

2️⃣ Static rendering or default fetch caching

Example:

fetch("https://api.com")


Next caches at build unless you force dynamic.

🛠 THE REAL FIX (Not Docker)
✅ Solution 1 — Force runtime rendering

If using App Router:

export const dynamic = "force-dynamic";


or:

fetch(url, { cache: "no-store" });


This prevents build-time caching.

✅ Solution 2 — Stop using NEXT_PUBLIC for dynamic env

Instead of:

process.env.NEXT_PUBLIC_API_URL


Use:

process.env.API_URL


And fetch from server-side code only.

Client should call your API routes, not external env-based URLs directly.

✅ Solution 3 — Don’t statically optimize pages

If using:

export const revalidate = 60;


or nothing at all…

Next may pre-render.

Force runtime:lets go

export const dynamic = "force-dynamic";
