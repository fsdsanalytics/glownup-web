"use client";

import Link from "next/link";
import Image from "next/image";
import { use, useEffect, useState } from "react";

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
  error_message?: string | null;
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
  const [exportedCardUrl, setExportedCardUrl] = useState<string | null>(null);
  const [exportingCard, setExportingCard] = useState(false);
  const [completedEventTracked, setCompletedEventTracked] = useState(false);
  const [failedEventTracked, setFailedEventTracked] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const getSessionId = () => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("glownup_session_id");
  };

  const trackEvent = async ({
    eventName,
    transformationId = data?.id ?? null,
    metadata = {},
  }: {
    eventName: string;
    transformationId?: string | null;
    metadata?: Record<string, unknown>;
  }) => {
    try {
      await fetch("/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          event_name: eventName,
          session_id: getSessionId(),
          transformation_id: transformationId,
          page_path: window.location.pathname,
          metadata,
        }),
      });
    } catch (error) {
      console.error("Analytics event failed:", error);
    }
  };

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setCopyClicked(true);
    setTimeout(() => setCopyClicked(false), 1200);
    void trackEvent({
      eventName: "copy_link",
      metadata: {
        method: "copy_link",
        glowUpLevel: data?.glow_up_level,
      },
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

  const loadImage = async (src: string) => {
    return await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new window.Image();
      image.onload = () => resolve(image);
      image.onerror = reject;
      image.src = src;
    });
  };

  const drawRoundedRect = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number
  ) => {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  };

  const drawImageCover = (
    ctx: CanvasRenderingContext2D,
    image: HTMLImageElement,
    x: number,
    y: number,
    width: number,
    height: number
  ) => {
    const imageRatio = image.width / image.height;
    const targetRatio = width / height;

    let sourceX = 0;
    let sourceY = 0;
    let sourceWidth = image.width;
    let sourceHeight = image.height;

    if (imageRatio > targetRatio) {
      sourceWidth = image.height * targetRatio;
      sourceX = (image.width - sourceWidth) / 2;
    } else {
      sourceHeight = image.width / targetRatio;
      sourceY = (image.height - sourceHeight) / 2;
    }

    ctx.drawImage(
      image,
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,
      x,
      y,
      width,
      height
    );
  };

  const generateExportedCard = async () => {
    if (!data?.generated_image_url || exportingCard || exportedCardUrl) return;

    setExportingCard(true);

    try {
      const [originalDataUrl, generatedDataUrl, wordmarkDataUrl, logoDataUrl] =
        await Promise.all([
          convertImageToDataUrl(data.original_image_url),
          convertImageToDataUrl(data.generated_image_url),
          convertImageToDataUrl("/wordmark.png"),
          convertImageToDataUrl("/logo_border.png"),
        ]);

      const [originalImage, generatedImage, wordmarkImage, logoImage] = await Promise.all([
        loadImage(originalDataUrl),
        loadImage(generatedDataUrl),
        loadImage(wordmarkDataUrl),
        loadImage(logoDataUrl),
      ]);

      const canvas = document.createElement("canvas");
      canvas.width = 1080;
      canvas.height = 1080;

      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Could not create export canvas.");

      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const wordmarkWidth = 400;
      const wordmarkHeight = wordmarkWidth * (wordmarkImage.height / wordmarkImage.width);

      const wordmarkCanvas = document.createElement("canvas");
      wordmarkCanvas.width = wordmarkWidth;
      wordmarkCanvas.height = wordmarkHeight;

      const wordmarkCtx = wordmarkCanvas.getContext("2d");
      if (!wordmarkCtx) throw new Error("Could not create wordmark canvas.");

      wordmarkCtx.drawImage(wordmarkImage, 0, 0, wordmarkWidth, wordmarkHeight);
      wordmarkCtx.globalCompositeOperation = "source-in";
      wordmarkCtx.fillStyle = "#000000";
      wordmarkCtx.fillRect(0, 0, wordmarkWidth, wordmarkHeight);

      ctx.drawImage(
        wordmarkCanvas,
        (canvas.width - wordmarkWidth) / 2,
        50,
        wordmarkWidth,
        wordmarkHeight
      );

      ctx.fillStyle = "#1f2937";
      ctx.font = "700 28px Arial, sans-serif";
      ctx.letterSpacing = "0px";
      ctx.textAlign = "center";
      ctx.fillText("B E F O R E", 285, 220);
      ctx.fillText("A F T E R", 795, 220);

      ctx.strokeStyle = "#d1d5db";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(540, 245);
      ctx.lineTo(540, 910);
      ctx.stroke();

      const imageY = 255;
      const imageWidth = 455;
      const imageHeight = 650;
      drawImageCover(ctx, originalImage, 55, imageY, imageWidth, imageHeight);
      drawImageCover(ctx, generatedImage, 570, imageY, imageWidth, imageHeight);

      const footerY = 955;
      const footerHeight = 125;
      ctx.fillStyle = "#030712";
      ctx.fillRect(0, footerY, canvas.width, footerHeight);

      const logoSize = 52;
      const logoX = 360;
      const logoY = footerY + (footerHeight - logoSize) / 2;
      ctx.drawImage(logoImage, logoX, logoY, logoSize, logoSize);

      ctx.fillStyle = "#ffffff";
      ctx.font = "700 32px Arial, sans-serif";
      ctx.letterSpacing = "0px";
      ctx.textAlign = "left";
      ctx.fillText("www.GlownUp.app", logoX + 72, footerY + 74);

      const dataUrl = canvas.toDataURL("image/jpeg", 0.95);
      setExportedCardUrl(dataUrl);
    } catch (error) {
      console.error("Could not prepare exported card:", error);
    } finally {
      setExportingCard(false);
    }
  };

  const handleDownload = async () => {
    if (!exportedCardUrl) return;

    setDownloadClicked(true);
    setTimeout(() => setDownloadClicked(false), 1200);

    const response = await fetch(exportedCardUrl);
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
      link.href = exportedCardUrl;
      link.download = "glownup-result.jpg";

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    void trackEvent({
      eventName: "save_transformation",
      metadata: {
        glowUpLevel: data?.glow_up_level,
        exportType: "before_after_card",
      },
    });
  };

  const handleDownloadPhotoOnly = async () => {
    if (!data?.generated_image_url) return;

    const response = await fetch(data.generated_image_url);
    const blob = await response.blob();
    const file = new File([blob], "glownup-photo.jpg", { type: "image/jpeg" });
    const objectUrl = URL.createObjectURL(blob);

    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    if (isMobile && navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: "GlownUp transformation",
        });
      } catch (error) {
        if ((error as Error).name !== "AbortError") throw error;
      }
    } else {
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = "glownup-photo.jpg";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    URL.revokeObjectURL(objectUrl);

    void trackEvent({
      eventName: "save_photo",
      metadata: {
        glowUpLevel: data?.glow_up_level,
        exportType: "photo_only",
      },
    });
  };

  const handleSubmitFeedback = async () => {
    if (!data?.id || !feedback.trim()) return;

    setSubmittingFeedback(true);
    setFeedbackMessage("");

  try {
    const response = await fetch("/api/feedback", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        transformationId: data.id,
        feedback: feedback.trim(),
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result?.error || "Could not save feedback");
    }

    const savedFeedback = result.feedback_text || feedback.trim();

    setData({ ...data, feedback_text: savedFeedback });
    setFeedback(savedFeedback);
    setFeedbackMessage("Thanks — your feedback was saved.");
  } catch (error) {
    console.error("Feedback submit failed:", error);
    setFeedbackMessage("Could not save feedback. Please try again.");
    setSubmittingFeedback(false);
    return;
  }

  setSubmittingFeedback(false);

    void trackEvent({
      eventName: "feedback_submitted",
      transformationId: data.id,
    });
  };

  useEffect(() => {
    let isMounted = true;
    let intervalId: ReturnType<typeof setInterval> | null = null;

    const fetchTransformation = async () => {
      try {
        const response = await fetch(`/api/transformations/${id}`, {
          cache: "no-store",
        });

        const result = await response.json();

        if (!isMounted) return;

        if (!response.ok || !result.transformation) {
          setNotFound(true);
          setLoading(false);
          if (intervalId) clearInterval(intervalId);
          return;
        }

        const transformation = result.transformation as Transformation;

        setData(transformation);
        setFeedback((currentFeedback) =>
          currentFeedback ? currentFeedback : transformation.feedback_text ?? ""
        );
        setLoading(false);

        if (
          transformation.status !== "pending" &&
          transformation.status !== "generating" &&
          transformation.status !== "retrying"
        ) {
          if (intervalId) clearInterval(intervalId);
        }
      } catch (error) {
        console.error("Could not fetch transformation:", error);

        if (!isMounted) return;

        setNotFound(true);
        setLoading(false);
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

  useEffect(() => {
  if (
    !data ||
    (data.status !== "pending" &&
      data.status !== "generating" &&
      data.status !== "retrying")
  ) {
    return;
  }

  setElapsedSeconds(0);

  const timerId = setInterval(() => {
    setElapsedSeconds((seconds) => seconds + 1);
  }, 1000);

  return () => clearInterval(timerId);
}, [data?.id, data?.status]);

  useEffect(() => {
    void trackEvent({
      eventName: "page_visit",
      transformationId: id,
      metadata: { page: "result" },
    });
  }, [id]);

  useEffect(() => {
    if (!data?.generated_image_url) return;

    void generateExportedCard();
  }, [data?.generated_image_url]);

  useEffect(() => {
    if (!data || completedEventTracked) return;

    if (data.status === "completed" && data.generated_image_url) {
      void trackEvent({
        eventName: "generation_completed",
        transformationId: data.id,
        metadata: { glowUpLevel: data.glow_up_level },
      });
      setCompletedEventTracked(true);
    }
  }, [data, completedEventTracked]);

  useEffect(() => {
    if (!data || failedEventTracked) return;

    if (data.status === "failed") {
      void trackEvent({
        eventName: "generation_failed",
        transformationId: data.id,
        metadata: { glowUpLevel: data.glow_up_level },
      });
      setFailedEventTracked(true);
    }
  }, [data, failedEventTracked]);

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
  const isGenerating =
    data.status === "pending" || data.status === "generating" || data.status === "retrying";

  return (
    <main className="bg-white px-6 py-12 text-black">
      <div className="mx-auto max-w-xl pt-0">

        <div className="mt-4">
          {data.generated_image_url ? (
            <>
              {exportedCardUrl ? (
                <img
                  src={exportedCardUrl}
                  alt="GlownUp transformation result"
                  className="w-full rounded-2xl border border-gray-200 shadow-lg"
                />
              ) : (
                <div className="rounded-2xl bg-gray-50 p-8 text-center text-sm text-gray-600">
                  Preparing your shareable result...
                </div>
              )}
            </>
          ) : (
            <div className="rounded-2xl bg-gray-50 p-8 text-gray-600">
              {isGenerating ? (
                <div className="flex flex-col items-center justify-center text-center">
                  <p className="text-base font-medium text-black">
                    Generating your glow-up
                  </p>

                  <div className="mt-4 flex gap-2">
                    <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-black [animation-delay:-0.3s]" />
                    <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-black [animation-delay:-0.15s]" />
                    <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-black" />
                  </div>

                  {data.status === "retrying" ? (
                    <p className="mt-4 text-sm text-gray-600">
                      Still working — we’re retrying with a backup model. This usually takes about a minute, but times can vary.
                    </p>
                  ) : (
                    <p className="mt-4 text-sm text-gray-600">
                      This usually takes about a minute, but times can vary.
                    </p>
                  )}

                  <p className="mt-2 text-xs text-gray-500">
                    Elapsed time: {elapsedSeconds}s
                  </p>
                </div>
              ) : (
                data.status === "failed" ? (
                  <div className="text-center">
                    <p className="text-base font-medium text-black">
                      We couldn&apos;t generate this transformation.
                    </p>
                    <p className="mt-3 text-sm text-gray-600">
                      {data.error_message ||
                        "This image couldn’t be processed. Please try another photo."}
                    </p>
                    <Link
                      href="/upload"
                      className="mt-6 inline-flex rounded-full bg-black px-5 py-3 text-sm font-medium text-white transition hover:bg-gray-800"
                    >
                      Try another photo
                    </Link>
                  </div>
                ) : (
                  "Your transformation is not available yet."
                )
              )}
            </div>
          )}
        </div>

        {data.generated_image_url && exportedCardUrl && (
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                onClick={handleDownload}
                className="inline-flex items-center justify-center rounded-full bg-black px-5 py-3 text-sm font-medium text-white transition hover:bg-gray-800"
              >
                Save Transformation
              </button>

              <button
                onClick={handleDownloadPhotoOnly}
                className="inline-flex items-center justify-center rounded-full border border-gray-300 px-5 py-3 text-sm font-medium text-black transition hover:bg-gray-100"
              >
                Save Photo
              </button>

              <button
                onClick={handleCopyLink}
                className="inline-flex items-center justify-center rounded-full border border-gray-300 px-5 py-3 text-sm font-medium text-black transition hover:bg-gray-100"
              >
                Copy Link
              </button>
            </div>

            <Link
              href="/upload"
              className="inline-flex items-center justify-center rounded-full border border-gray-300 px-5 py-3 text-sm font-medium text-black transition hover:bg-gray-100"
            >
              Try Again
            </Link>
          </div>
        )}

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