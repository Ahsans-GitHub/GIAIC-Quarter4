// // frontend/app/sports/[sport]/page.tsx
// import { notFound } from 'next/navigation';
// import SportsDashboard from '@/app/components/SportsDashboard';
// import { sportsAPI } from '@/app/lib/api';

// interface SportPageProps {
//   params: {
//     sport: string;
//   };
// }

// // If you prefer to reuse your frontend/lib/api.ts functions on the server-side,
// // you can still call the backend directly here with fetch.
// const BACKEND_BASE = process.env.BACKEND_URL || 'http://127.0.0.1:8000';

// export default async function SportPage({ params }: SportPageProps) {
//   // Next.js message required unwrapping params — await it to be safe in App Router.
//   // This matches the Next.js error message you were seeing.
//   const { sport } = await params;

//   // Validate sport exists by calling your backend endpoint that lists available sports.
//   // This keeps behavior the same as your previous code that used sportsAPI.getSports()
//   // but avoids client-only helper issues.
//   const res = await fetch(`${BACKEND_BASE}/api/sports`, { cache: 'no-store' });
//   if (!res.ok) {
//     // If the backend fails, show notFound or throw an error
//     console.error('Failed to fetch available sports:', await res.text());
//     notFound();
//   }

//   const json = await res.json();
//   const availableSports: string[] = json.sports || [];

//   if (!availableSports.includes(sport)) {
//     return notFound();
//   }

//   // Render the client component (SportsDashboard) and pass the sport string
//   return (
//     <div className="min-h-screen bg-gray-50">
//       <SportsDashboard sport={sport} />
//     </div>
//   );
// }

// export async function generateStaticParams() {
//   const sports = await sportsAPI.getSports();
//   return sports.map((sport) => ({
//     sport,
//   }));
// }

// export const dynamicParams = true;




// frontend/app/sports/[sport]/page.tsx
import { notFound } from 'next/navigation';
// SportsDashboard is a client component (it uses 'use client'), so import from where it actually lives.
// Based on your earlier code it should be at '@/components/SportsDashboard' (not '@/app/components/...').
import SportsDashboard from '@/app/components/SportsDashboard';

// If you prefer to reuse your frontend/lib/api.ts functions on the server-side,
// you can still call the backend directly here with fetch.
const BACKEND_BASE = process.env.BACKEND_URL || 'http://127.0.0.1:8000';

interface SportPageProps {
  params: {
    sport: string;
  };
}

export default async function SportPage({ params }: SportPageProps) {
  // Next.js message required unwrapping params — await it to be safe in App Router.
  // This matches the Next.js error message you were seeing.
  const { sport } = await params;

  // Validate sport exists by calling your backend endpoint that lists available sports.
  // This keeps behavior the same as your previous code that used sportsAPI.getSports()
  // but avoids client-only helper issues.
  const res = await fetch(`${BACKEND_BASE}/api/sports`, { cache: 'no-store' });
  if (!res.ok) {
    // If the backend fails, show notFound or throw an error
    console.error('Failed to fetch available sports:', await res.text());
    notFound();
  }

  const json = await res.json();
  const availableSports: string[] = json.sports || [];

  if (!availableSports.includes(sport)) {
    return notFound();
  }

  // Render the client component (SportsDashboard) and pass the sport string
  return (
    <div className="min-h-screen bg-gray-50">
      <SportsDashboard sport={sport} />
    </div>
  );
}

// Keep dynamic params enabled if you want runtime dynamic routes
export const dynamicParams = true;

// Optional: pre-generate routes at build time (used by `next build`). Uses the same backend.
export async function generateStaticParams() {
  const res = await fetch(`${BACKEND_BASE}/api/sports`, { cache: 'no-store' });
  if (!res.ok) return []; // safe fallback
  const json = await res.json();
  const sports: string[] = json.sports || [];
  return sports.map((s) => ({ sport: s }));
}



