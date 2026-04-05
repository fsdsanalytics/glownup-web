"use client";

import Link from "next/link";
import { use, useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import TransformationCard from "@/components/TransformationCard";
import { track } from "@vercel/analytics";

type ResultPageProps = {
  params: Promise<{
    id: string;
  }>;
};

type Transformation = {
  id: string;
  original_image_url: string;
  generated_image_url: string | null;
  glow_up_level: string;
  status: string;
};

const glowUpLabels: Record<string, string> = {
  average: "Average",
  fit: "Fit",
  lean: "Lean",
  shredded: "Shredded",
};

export default function ResultPage({ params }: ResultPageProps) {
  const { id } = use(params);

  const [data, setData] = useState<Transformation | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const cardRef = useRef<HTMLDivElement | null>(null);

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(window.location.href);
    track("share_clicked", {
      method: "copy_link",
      glowUpLevel: data?.glow_up_level,
      transformationId: data?.id,
    });
  };

  const handleDownload = async () => {
    if (!cardRef.current) return;

    const { toJpeg } = await import("html-to-image");

    const dataUrl = await toJpeg(cardRef.current, {
      quality: 0.95,
      pixelRatio: 2,
      backgroundColor: "#ffffff",
    });

    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = "glownup-result.jpg";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    track("result_downloaded", {
      glowUpLevel: data?.glow_up_level,
      transformationId: data?.id,
    });
  };

  useEffect(() => {
    let isMounted = true;

    const fetchTransformation = async () => {
      const { data: transformation, error } = await supabase
        .from("transformations")
        .select("id, original_image_url, generated_image_url, glow_up_level, status")
        .eq("id", id)
        .single();

      if (!isMounted) return;

      if (error || !transformation) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setData(transformation);
      setLoading(false);
    };

    void fetchTransformation();

    const interval = setInterval(() => {
      void fetchTransformation();
    }, 3000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [id]);

  if (loading) {
    return (
      <main className="bg-white px-6 py-12 text-black">
        <div className="mx-auto max-w-2xl pt-12">
          <p className="mb-2 text-sm font-medium uppercase tracking-[0.2em] text-gray-500">
            GlownUp
          </p>
          <h1 className="text-3xl font-semibold">Loading your transformation...</h1>
        </div>
      </main>
    );
  }

  if (notFound || !data) {
    return (
      <main className="bg-white px-6 py-12 text-black">
        <div className="mx-auto max-w-2xl pt-12">
          <h1 className="text-3xl font-semibold">Result not found</h1>
          <p className="mt-3 text-gray-600">
            We couldn&apos;t find that transformation.
          </p>
          <Link
            href="/upload"
            className="mt-6 inline-flex rounded-full bg-black px-5 py-3 text-sm font-medium text-white transition hover:bg-gray-800"
          >
            Try another
          </Link>
        </div>
      </main>
    );
  }

  const glowUpLabel = glowUpLabels[data.glow_up_level] || data.glow_up_level;
  const isGenerating = data.status === "pending" || data.status === "generating";

  return (
    <main className="bg-white px-6 py-12 text-black">
      <div className="mx-auto max-w-3xl pt-12">
        <p className="mb-2 text-sm font-medium uppercase tracking-[0.2em] text-gray-500">
          GlownUp
        </p>

        <h1 className="text-4xl font-semibold tracking-tight">Your transformation</h1>

        <p className="mt-3 text-base text-gray-600">
          Status: <span className="font-medium capitalize text-black">{data.status}</span>
        </p>

        <p className="mt-1 text-base text-gray-600">
          Glow-up level: <span className="font-medium text-black">{glowUpLabel}</span>
        </p>

        <div className="mt-6 rounded-2xl border border-gray-200 p-6">
          <p className="mb-3 text-sm font-medium text-gray-700">Generated result</p>

          {data.generated_image_url ? (
            <div ref={cardRef}>
              <TransformationCard
                originalImageUrl={data.original_image_url}
                generatedImageUrl={data.generated_image_url}
              />
            </div>
          ) : (
            <div className="rounded-2xl bg-gray-50 p-8 text-gray-600">
              {isGenerating
                ? "Your transformation is being generated. This page refreshes automatically every few seconds."
                : "Your transformation is not available yet."}
            </div>
          )}
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/upload"
            className="inline-flex items-center justify-center rounded-full bg-black px-5 py-3 text-sm font-medium text-white transition hover:bg-gray-800"
          >
            Try another
          </Link>

          {data.generated_image_url && (
            <>
              <button
                onClick={handleDownload}
                className="inline-flex items-center justify-center rounded-full border border-gray-300 px-5 py-3 text-sm font-medium text-black transition hover:bg-gray-100"
              >
                Download
              </button>

              <button
                onClick={handleCopyLink}
                className="inline-flex items-center justify-center rounded-full border border-gray-300 px-5 py-3 text-sm font-medium text-black transition hover:bg-gray-100"
              >
                Copy link
              </button>
            </>
          )}
        </div>
      </div>
    </main>
  );
}