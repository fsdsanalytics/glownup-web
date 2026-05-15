"use client";

import Link from "next/link";
import Image from "next/image";
import { use, useEffect, useRef, useState } from "react";
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
  feedback_text?: string | null;
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
  const [feedback, setFeedback] = useState("");
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [downloadClicked, setDownloadClicked] = useState(false);
  const [copyClicked, setCopyClicked] = useState(false);
  const cardRef = useRef<HTMLDivElement | null>(null);

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setCopyClicked(true);
    setTimeout(() => setCopyClicked(false), 1200);
    track("share_clicked", {
      method: "copy_link",
      glowUpLevel: data?.glow_up_level,
      transformationId: data?.id,
    });
  };

  const convertImageToDataUrl = async (imageUrl: string) => {
    const response = await fetch(imageUrl, { cache: "no-store" });
    const blob = await response.blob();

    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(String(reader.result));
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const handleDownload = async () => {
    if (!cardRef.current || !data?.generated_image_url) return;

    setDownloadClicked(true);
    setTimeout(() => setDownloadClicked(false), 1200);

    const images = Array.from(cardRef.current.querySelectorAll("img"));
    const originalSources = images.map((image) => image.src);

    try {
      const dataUrls = await Promise.all(
        originalSources.map((source) => convertImageToDataUrl(source))
      );

      images.forEach((image, index) => {
        image.src = dataUrls[index];
      });

      await Promise.all(
        images.map((image) => {
          if (image.complete) return Promise.resolve();

          return new Promise<void>((resolve) => {
            image.onload = () => resolve();
            image.onerror = () => resolve();
          });
        })
      );

      const { toJpeg } = await import("html-to-image");

      const dataUrl = await toJpeg(cardRef.current, {
        quality: 0.95,
        pixelRatio: 2,
        backgroundColor: "#ffffff",
        cacheBust: true,
      });

      const response = await fetch(dataUrl);
      const blob = await response.blob();
      const file = new File([blob], "glownup-result.jpg", {
        type: "image/jpeg",
      });

      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

      if (isMobile && navigator.canShare?.({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
            title: "GlownUp transformation",
          });
        } catch (error) {
          if ((error as Error).name !== "AbortError") {
            throw error;
          }
        }
      } else {
        const link = document.createElement("a");
        link.href = dataUrl;
        link.download = "glownup-result.jpg";

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

      track("result_downloaded", {
        glowUpLevel: data?.glow_up_level,
        transformationId: data?.id,
      });
    } finally {
      images.forEach((image, index) => {
        image.src = originalSources[index];
      });
    }
  };

  const handleSubmitFeedback = async () => {
    if (!data?.id || !feedback.trim()) return;

    setSubmittingFeedback(true);
    setFeedbackMessage("");

    const { error } = await supabase
      .from("transformations")
      .update({ feedback_text: feedback.trim() })
      .eq("id", data.id);

    if (error) {
      setFeedbackMessage("Could not save feedback. Please try again.");
      setSubmittingFeedback(false);
      return;
    }

    setData({ ...data, feedback_text: feedback.trim() });
    setFeedbackMessage("Thanks — your feedback was saved.");
    setSubmittingFeedback(false);

    track("feedback_submitted", {
      transformationId: data.id,
    });
  };

  useEffect(() => {
    let isMounted = true;
    let intervalId: ReturnType<typeof setInterval> | null = null;

    const fetchTransformation = async () => {
      const { data: transformation, error } = await supabase
        .from("transformations")
        .select("id, original_image_url, generated_image_url, glow_up_level, status, feedback_text")
        .eq("id", id)
        .single();

      if (!isMounted) return;

      if (error || !transformation) {
        setNotFound(true);
        setLoading(false);
        if (intervalId) clearInterval(intervalId);
        return;
      }

      setData(transformation);
      setFeedback((currentFeedback) =>
        currentFeedback ? currentFeedback : transformation.feedback_text ?? ""
      );
      setLoading(false);

      if (transformation.status !== "pending" && transformation.status !== "generating") {
        if (intervalId) clearInterval(intervalId);
      }
    };

    void fetchTransformation();

    intervalId = setInterval(() => {
      void fetchTransformation();
    }, 3000);

    return () => {
      isMounted = false;
      if (intervalId) clearInterval(intervalId);
    };
  }, [id]);

  if (loading) {
    return (
      <main className="bg-white px-6 py-12 text-black">
        <div className="mx-auto max-w-2xl pt-12">
          <div className="mb-6 flex justify-start">
            <Image
              src="/wordmark.png"
              alt="GlownUp"
              width={220}
              height={44}
              priority
              className="h-10 w-auto object-contain brightness-0"
            />
          </div>
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
          <p className="mt-3 text-gray-600">We couldn&apos;t find that transformation.</p>
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
        <div className="mb-6 flex justify-start">
          <Image
            src="/wordmark.png"
            alt="GlownUp"
            width={220}
            height={44}
            priority
            className="h-10 w-auto object-contain brightness-0"
          />
        </div>

        <p className="mt-3 text-base text-gray-600">
          Status: <span className="font-medium capitalize text-black">{data.status}</span>
        </p>

        <div className="mt-6 rounded-2xl sm:border sm:border-gray-200 sm:p-4">
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
                ? "Your transformation is being generated. Please wait up to 15 seconds."
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

        {data.generated_image_url && (
          <div className="mt-8 rounded-2xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-black">How did this look?</h2>
            <p className="mt-2 text-sm text-gray-600">
              Leave a quick note so we can improve future results.
            </p>

            <textarea
              value={feedback}
              onChange={(event) => setFeedback(event.target.value)}
              placeholder="What looked right or wrong about this result?"
              className="mt-4 min-h-[120px] w-full rounded-2xl border border-gray-300 px-4 py-3 text-sm text-black outline-none transition focus:border-black"
            />

            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                onClick={handleSubmitFeedback}
                disabled={submittingFeedback || !feedback.trim()}
                className="inline-flex items-center justify-center rounded-full bg-black px-5 py-3 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submittingFeedback ? "Submitting..." : "Submit feedback"}
              </button>

              {feedbackMessage && <p className="text-sm text-gray-600">{feedbackMessage}</p>}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}