import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

type AdminPageProps = {
  searchParams: Promise<{
    days?: string;
  }>;
};

type EventRow = {
  id: string;
  created_at: string;
  event_name: string;
  session_id: string | null;
  transformation_id: string | null;
  page_path: string | null;
  metadata: Record<string, unknown> | null;
};

async function unlockAnalytics(formData: FormData) {
  "use server";

  const submittedToken = String(formData.get("token") || "");

  if (!process.env.ANALYTICS_TOKEN || submittedToken !== process.env.ANALYTICS_TOKEN) {
    redirect("/admin?error=invalid");
  }

  const cookieStore = await cookies();
  cookieStore.set("glownup_analytics_token", submittedToken, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 12,
    path: "/admin",
  });

  redirect("/admin");
}

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const params = await searchParams;
  const days = Number(params.days || 1);
  const cookieStore = await cookies();
  const savedToken = cookieStore.get("glownup_analytics_token")?.value;

  if (!process.env.ANALYTICS_TOKEN || savedToken !== process.env.ANALYTICS_TOKEN) {
    return (
      <main className="min-h-screen bg-white px-6 py-16 text-black">
        <div className="mx-auto max-w-xl">
          <h1 className="text-3xl font-semibold">Analytics</h1>
          <p className="mt-3 text-gray-600">
            Enter your analytics passcode to view this page.
          </p>

          <form action={unlockAnalytics} className="mt-8 space-y-4">
            <input
              name="token"
              type="password"
              placeholder="Passcode"
              className="w-full rounded-2xl border border-gray-300 px-4 py-3 text-base outline-none transition focus:border-black"
            />

            <button
              type="submit"
              className="inline-flex w-full items-center justify-center rounded-full bg-black px-5 py-3 text-sm font-medium text-white transition hover:bg-gray-800"
            >
              View analytics
            </button>
          </form>
        </div>
      </main>
    );
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        persistSession: false,
      },
    }
  );

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data: events = [], error } = await supabaseAdmin
    .from("events")
    .select("id, created_at, event_name, session_id, transformation_id, page_path, metadata")
    .gte("created_at", startDate.toISOString())
    .order("created_at", { ascending: false })
    .limit(500);

  const rows = (events || []) as EventRow[];

  const uniqueSessions = new Set(rows.map((event) => event.session_id).filter(Boolean)).size;

  const count = (name: string) =>
    rows.filter((event) => event.event_name === name).length;

  const metrics = [
    ["Sessions", uniqueSessions],
    ["Page visits", count("page_visit")],
    ["Uploads started", count("upload_started")],
    ["Uploads completed", count("upload_completed")],
    ["Generations started", count("generation_started")],
    ["Generations completed", count("generation_completed")],
    ["Generations failed", count("generation_failed")],
    ["Saved transformations", count("save_transformation")],
    ["Saved photos", count("save_photo")],
    ["Copied links", count("copy_link")],
  ];

  const groupedSessions = Array.from(
    rows.reduce((map, event) => {
      if (!event.session_id) return map;
      const existing = map.get(event.session_id) || [];
      existing.push(event);
      map.set(event.session_id, existing);
      return map;
    }, new Map<string, EventRow[]>())
  ).slice(0, 20);

  return (
    <main className="min-h-screen bg-white px-6 py-12 text-black">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-4xl font-semibold tracking-tight">
              GlownUp Analytics
            </h1>
            <p className="mt-2 text-gray-600">
              Showing the last {days} day{days === 1 ? "" : "s"}.
            </p>
          </div>

          <div className="flex gap-2">
            {[1, 7, 30].map((value) => (
              <a
                key={value}
                href={`/admin?days=${value}`}
                className={`rounded-full border px-4 py-2 text-sm ${
                  days === value
                    ? "border-black bg-black text-white"
                    : "border-gray-300 text-black hover:bg-gray-100"
                }`}
              >
                {value}d
              </a>
            ))}
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            Could not load events: {error.message}
          </div>
        )}

        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {metrics.map(([label, value]) => (
            <div key={label} className="rounded-2xl border border-gray-200 p-4">
              <p className="text-sm text-gray-500">{label}</p>
              <p className="mt-2 text-3xl font-semibold">{value}</p>
            </div>
          ))}
        </section>

        <section className="mt-10">
          <h2 className="text-2xl font-semibold">Recent events</h2>

          <div className="mt-4 overflow-x-auto rounded-2xl border border-gray-200">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-4 py-3">Time</th>
                  <th className="px-4 py-3">Event</th>
                  <th className="px-4 py-3">Session</th>
                  <th className="px-4 py-3">Transformation</th>
                  <th className="px-4 py-3">Path</th>
                </tr>
              </thead>
              <tbody>
                {rows.slice(0, 100).map((event) => (
                  <tr key={event.id} className="border-t border-gray-100">
                    <td className="whitespace-nowrap px-4 py-3">
                      {new Date(event.created_at).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 font-medium">{event.event_name}</td>
                    <td className="max-w-[180px] truncate px-4 py-3 text-gray-600">
                      {event.session_id || "—"}
                    </td>
                    <td className="max-w-[180px] truncate px-4 py-3 text-gray-600">
                      {event.transformation_id || "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {event.page_path || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-2xl font-semibold">Recent sessions</h2>

          <div className="mt-4 space-y-4">
            {groupedSessions.map(([sessionId, sessionEvents]) => (
              <div
                key={sessionId}
                className="rounded-2xl border border-gray-200 p-4"
              >
                <p className="mb-3 text-sm font-medium text-gray-500">
                  {sessionId}
                </p>

                <div className="flex flex-wrap gap-2">
                  {sessionEvents
                    .slice()
                    .reverse()
                    .map((event) => (
                      <span
                        key={event.id}
                        className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700"
                      >
                        {event.event_name}
                      </span>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}