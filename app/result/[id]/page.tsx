import { supabase } from "@/lib/supabase";

type ResultPageProps = {
  params: Promise<{
    id: string;
  }>;
};

const glowUpLabels: Record<string, string> = {
  average: "Average",
  fit: "Fit",
  lean: "Lean",
  shredded: "Shredded",
};

export default async function ResultPage({ params }: ResultPageProps) {
  const { id } = await params;

  const { data, error } = await supabase
    .from("transformations")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    return (
      <main className="min-h-screen bg-white px-6 py-12 text-black">
        <div className="mx-auto max-w-2xl">
          <h1 className="text-3xl font-semibold">Result not found</h1>
          <p className="mt-3 text-gray-600">
            We couldn’t find that transformation.
          </p>
        </div>
      </main>
    );
  }

  const glowUpLabel = glowUpLabels[data.glow_up_level] || data.glow_up_level;

  return (
    <main className="min-h-screen bg-white px-6 py-12 text-black">
      <div className="mx-auto max-w-3xl">
        <p className="mb-2 text-sm font-medium uppercase tracking-[0.2em] text-gray-500">
          GlownUp
        </p>

        <h1 className="text-4xl font-semibold tracking-tight">Your transformation</h1>

        <p className="mt-3 text-base text-gray-600">
          Status: <span className="font-medium text-black">{data.status}</span>
        </p>

        <p className="mt-1 text-base text-gray-600">
          Glow-up level: <span className="font-medium text-black">{glowUpLabel}</span>
        </p>

        <div className="mt-8 rounded-2xl border border-gray-200 p-6">
          <p className="mb-3 text-sm font-medium text-gray-700">Original image</p>
          <img
            src={data.original_image_url}
            alt="Original upload"
            className="w-full rounded-2xl border border-gray-200 object-cover"
          />
        </div>

        <div className="mt-6 rounded-2xl border border-gray-200 p-6">
          <p className="mb-3 text-sm font-medium text-gray-700">Generated result</p>

          {data.generated_image_url ? (
            <img
              src={data.generated_image_url}
              alt="Generated result"
              className="w-full rounded-2xl border border-gray-200 object-cover"
            />
          ) : (
            <div className="rounded-2xl bg-gray-50 p-8 text-gray-600">
              Your glow-up is not generated yet. This page is ready for the AI step next.
            </div>
          )}
        </div>
      </div>
    </main>
  );
}