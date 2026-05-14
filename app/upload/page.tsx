"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { track } from "@vercel/analytics";

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

const ALLOWED_FILE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
];

const ALLOWED_FILE_EXTENSIONS = [
  "jpg",
  "jpeg",
  "png",
  "webp",
  "heic",
  "heif",
];

const isValidImageFile = (file: File) => {
  const extension = file.name.split(".").pop()?.toLowerCase() || "";

  return (
    ALLOWED_FILE_TYPES.includes(file.type) ||
    ALLOWED_FILE_EXTENSIONS.includes(extension)
  );
};

export default function UploadPage() {
  const router = useRouter();

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  const getSessionId = () => {
    const existing = localStorage.getItem("glownup_session_id");
    if (existing) return existing;

    const newSessionId = crypto.randomUUID();
    localStorage.setItem("glownup_session_id", newSessionId);
    return newSessionId;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setMessage("");

    if (!selectedFile) {
      setFile(null);
      setPreviewUrl(null);
      return;
    }

    if (!isValidImageFile(selectedFile)) {
      setFile(null);
      setPreviewUrl(null);
      setMessage("Please upload a JPG, PNG, WebP, or HEIC image.");
      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE_BYTES) {
      setFile(null);
      setPreviewUrl(null);
      setMessage("Please upload an image smaller than 10MB.");
      return;
    }

    setFile(selectedFile);
    setPreviewUrl(URL.createObjectURL(selectedFile));
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage("Please select an image first.");
      return;
    }

    if (!isValidImageFile(file)) {
      setMessage("Please upload a JPG, PNG, WebP, or HEIC image.");
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setMessage("Please upload an image smaller than 10MB.");
      return;
    }

    track("upload_started");

    setUploading(true);
    setMessage("");

    try {
      const sessionId = getSessionId();

      const { count, error: countError } = await supabase
        .from("transformations")
        .select("*", { count: "exact", head: true })
        .eq("session_id", sessionId);

      if (countError) {
        throw countError;
      }

      if ((count || 0) >= 3) {
        setMessage("Free generation limit reached for this session.");
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

      const { data: insertData, error: insertError } = await supabase
        .from("transformations")
        .insert({
          session_id: sessionId,
          original_image_url: originalImageUrl,
          glow_up_level: "lean",
          status: "pending",
          is_free_generation: true,
        })
        .select("id")
        .single();

      if (insertError) {
        throw insertError;
      }

      track("upload_completed");

      void fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          transformationId: insertData.id,
        }),
      }).catch((generationError) => {
        console.error("Generation request failed:", generationError);
      });

      router.push(`/result/${insertData.id}`);
    } catch (error) {
      console.error(error);
      setMessage("Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <main className="bg-white px-6 py-12 text-black">
      <div className="mx-auto max-w-xl pt-12">
        <div className="mb-8">
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
          <h1 className="text-4xl font-semibold tracking-tight">Upload your photo</h1>
          <p className="mt-3 text-base text-gray-600">
            Upload a photo and we&apos;ll generate your glow-up transformation right away.
          </p>
          <p className="mt-3 text-base text-gray-600">
            Best results: use a clear, front-facing photo with your upper body visible and good lighting.
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

          {previewUrl && (
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
            disabled={uploading}
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

          {message && <p className="mt-4 text-sm text-red-600">{message}</p>}
          <p className="mt-6 text-center text-xs text-gray-500">
            Contact: fsdsanalytics@gmail.com
          </p>
        </div>
      </div>
    </main>
  );
}