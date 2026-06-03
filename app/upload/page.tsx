"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Cropper from "react-easy-crop";
import type { Area } from "react-easy-crop";
import { supabase } from "@/lib/supabase";

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
const CROP_ASPECT_RATIO = 3 / 4;
const CROP_OUTPUT_WIDTH = 1080;
const CROP_OUTPUT_HEIGHT = 1440;

const ALLOWED_FILE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heif",
  "image/heic"
];

const ALLOWED_FILE_EXTENSIONS = [
  "jpg",
  "jpeg",
  "png",
  "webp",
  "heif",
  "heic",
];

const isValidImageFile = (file: File) => {
  const extension = file.name.split(".").pop()?.toLowerCase() || "";

  return (
    ALLOWED_FILE_TYPES.includes(file.type) ||
    ALLOWED_FILE_EXTENSIONS.includes(extension)
  );
};

const createImage = (url: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new window.Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", reject);
    image.src = url;
  });

const getCroppedImageFile = async (
  imageSrc: string,
  croppedAreaPixels: Area,
  originalFileName: string
) => {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Could not create image canvas.");
  }

  canvas.width = CROP_OUTPUT_WIDTH;
  canvas.height = CROP_OUTPUT_HEIGHT;

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.drawImage(
    image,
    croppedAreaPixels.x,
    croppedAreaPixels.y,
    croppedAreaPixels.width,
    croppedAreaPixels.height,
    0,
    0,
    canvas.width,
    canvas.height
  );

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, "image/jpeg", 0.92);
  });

  if (!blob) {
    throw new Error("Could not crop image.");
  }

  const baseName = originalFileName.replace(/\.[^/.]+$/, "") || "glownup-upload";
  return new File([blob], `${baseName}-cropped.jpg`, { type: "image/jpeg" });
};

export default function UploadPage() {
  const router = useRouter();

  const getTodayKey = () => new Date().toISOString().slice(0, 10);

  const getSessionId = () => {
    const todayKey = getTodayKey();
    const storedDate = localStorage.getItem("glownup_session_date");
    const existing = localStorage.getItem("glownup_session_id");

    if (existing && storedDate === todayKey) return existing;

    const newSessionId = crypto.randomUUID();
    localStorage.setItem("glownup_session_id", newSessionId);
    localStorage.setItem("glownup_session_date", todayKey);
    return newSessionId;
  };

  const trackEvent = async ({
    eventName,
    transformationId = null,
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

  const [file, setFile] = useState<File | null>(null);
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [sourceImageUrl, setSourceImageUrl] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [cropEditorOpen, setCropEditorOpen] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    void trackEvent({ eventName: "page_visit" });
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setMessage("");
    void trackEvent({ eventName: "upload_file_selected" });

    if (!selectedFile) {
      setFile(null);
      setSourceFile(null);
      setSourceImageUrl(null);
      setPreviewUrl(null);
      setCropEditorOpen(false);
      return;
    }

    if (!isValidImageFile(selectedFile)) {
      setFile(null);
      setSourceFile(null);
      setSourceImageUrl(null);
      setPreviewUrl(null);
      setCropEditorOpen(false);
      setMessage("Please upload a JPG, PNG, WebP, or HEIF image. If your iPhone photo is HEIC, upload a screenshot instead.");
      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE_BYTES) {
      setFile(null);
      setSourceFile(null);
      setSourceImageUrl(null);
      setPreviewUrl(null);
      setCropEditorOpen(false);
      setMessage("Please upload an image smaller than 10MB.");
      return;
    }

    const objectUrl = URL.createObjectURL(selectedFile);
    setSourceFile(selectedFile);
    setSourceImageUrl(objectUrl);
    setFile(null);
    setPreviewUrl(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
    setCropEditorOpen(true);
  };

  const handleConfirmCrop = async () => {
    if (!sourceImageUrl || !sourceFile || !croppedAreaPixels) return;

    try {
      const croppedFile = await getCroppedImageFile(
        sourceImageUrl,
        croppedAreaPixels,
        sourceFile.name
      );

      const croppedPreviewUrl = URL.createObjectURL(croppedFile);
      setFile(croppedFile);
      setPreviewUrl(croppedPreviewUrl);
      setCropEditorOpen(false);
      setMessage("");
    } catch (error) {
      console.error(error);
      setMessage("Could not crop this image. Try a JPG, PNG, or screenshot instead.");
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage("Please select and crop an image first.");
      return;
    }

    if (!isValidImageFile(file)) {
      setMessage("Please upload a JPG, PNG, WebP, or HEIF image. If your iPhone photo is HEIC, upload a screenshot instead.");
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setMessage("Please upload an image smaller than 10MB.");
      return;
    }

    void trackEvent({ eventName: "upload_started" });

    setUploading(true);
    setMessage("");

    try {
      const sessionId = getSessionId();
      const transformationId = crypto.randomUUID();

      const limitResponse = await fetch("/api/generation-limit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sessionId }),
      });

      if (!limitResponse.ok) {
        const limitData = await limitResponse.json().catch(() => null);

        void trackEvent({
          eventName: "generation_limit_reached",
          metadata: { limit: 3 },
        });

        setMessage(
          limitData?.message ||
            limitData?.error ||
            "Free generation limit reached for today. Come back tomorrow to generate more."
        );
        setUploading(false);
        return;
      }

      const fileExt = file.name.split(".").pop() || "jpg";
      const fileName = `${sessionId}/${crypto.randomUUID()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("original-uploads")
        .upload(fileName, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data: publicUrlData } = supabase.storage
        .from("original-uploads")
        .getPublicUrl(fileName);

      const originalImageUrl = publicUrlData.publicUrl;

      const transformationResponse = await fetch("/api/transformations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: transformationId,
          session_id: sessionId,
          original_image_url: originalImageUrl,
          glow_up_level: "lean",
          status: "pending",
          is_free_generation: true,
        }),
      });

      if (!transformationResponse.ok) {
        const transformationData = await transformationResponse.json().catch(() => null);
        throw new Error(
          transformationData?.error || "Failed to create transformation."
        );
      }

      void trackEvent({
        eventName: "upload_completed",
        transformationId: transformationId,
      });

      void trackEvent({
        eventName: "generation_started",
        transformationId: transformationId,
      });

      void fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          transformationId: transformationId,
        }),
      }).catch((generationError) => {
        console.error("Generation request failed:", generationError);
      });

      router.push(`/result/${transformationId}`);
    } catch (error) {
      console.error(error);
      void trackEvent({
        eventName: "upload_failed",
        metadata: {
          message: error instanceof Error ? error.message : "Unknown error",
        },
      });
      setMessage("Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <main className="bg-white px-6 py-12 text-black">
      <div className="mx-auto max-w-xl pt-12">
        <div className="mb-8">
          <h1 className="text-4xl font-semibold tracking-tight">Upload your photo</h1>
          <p className="mt-3 text-base text-gray-600">
            Visit the{" "}
            <a
              href="/instructions"
              className="font-medium text-black underline underline-offset-4 hover:text-gray-700"
            >
              Tips page
            </a>{" "}
            for best results.
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <label className="mb-3 block text-sm font-medium text-gray-700">
            Upload an image
          </label>

          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
            onChange={handleFileChange}
            className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm file:mr-4 file:rounded-full file:border-0 file:bg-black file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-gray-800"
          />

          {cropEditorOpen && sourceImageUrl && (
            <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-4">
              <p className="mb-3 text-sm font-medium text-gray-700">
                Crop your photo
              </p>
              <div className="relative h-[420px] w-full overflow-hidden rounded-2xl bg-black">
                <Cropper
                  image={sourceImageUrl}
                  crop={crop}
                  zoom={zoom}
                  aspect={CROP_ASPECT_RATIO}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={(_, croppedPixels) => setCroppedAreaPixels(croppedPixels)}
                />
              </div>

              <p className="mt-3 rounded-xl bg-white px-3 py-2 text-xs text-gray-600">
                If your photo appears black here, your file format may not be fully supported. Take a screenshot of the photo and upload the screenshot instead. Some HEIC photos may not display correctly.
              </p>

              <label className="mt-4 block text-sm font-medium text-gray-700">
                Zoom
              </label>
              <input
                type="range"
                min={1}
                max={3}
                step={0.1}
                value={zoom}
                onChange={(event) => setZoom(Number(event.target.value))}
                className="mt-2 w-full"
              />

              <button
                onClick={handleConfirmCrop}
                className="mt-4 w-full rounded-full bg-black px-5 py-3 text-sm font-medium text-white transition hover:bg-gray-800"
              >
                Use this crop
              </button>
            </div>
          )}

          {previewUrl && !cropEditorOpen && (
            <div className="mt-6">
              <p className="mb-2 text-sm font-medium text-gray-700">Preview</p>
              <img
                src={previewUrl}
                alt="Preview"
                className="max-h-[420px] w-full rounded-2xl border border-gray-200 object-contain"
              />
            </div>
          )}

          <button
            onClick={handleUpload}
            disabled={uploading || cropEditorOpen}
            className="mt-6 w-full rounded-full bg-black px-5 py-3 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {uploading ? "Uploading..." : "Generate my glow-up"}
          </button>
          <p className="mt-4 text-center text-xs text-gray-500">
            Images are processed using AI to generate simulated physique transformations.
          </p>
          <p className="mt-2 text-center text-xs text-gray-500">
            By uploading a photo, you confirm you are 18+ and have the right to use the image.
          </p>
          <p className="mt-2 text-center text-xs text-gray-500">
            Free preview is limited to 3 generations per day.
          </p>

          {message && <p className="mt-4 text-center text-sm text-red-600">{message}</p>}
          <p className="mt-6 text-center text-xs text-gray-500">
            Contact: hello@glownup.app
          </p>
        </div>
      </div>
    </main>
  );
}