"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const glowUpOptions = [
  { value: "average", label: "Average" },
  { value: "fit", label: "Fit" },
  { value: "lean", label: "Lean" },
  { value: "shredded", label: "Shredded" },
];

export default function UploadPage() {
  const router = useRouter();

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [glowUpLevel, setGlowUpLevel] = useState("lean");
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
    setFile(selectedFile);

    if (selectedFile) {
      setPreviewUrl(URL.createObjectURL(selectedFile));
    } else {
      setPreviewUrl(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage("Please select an image first.");
      return;
    }

    setUploading(true);
    setMessage("");

    try {
      const sessionId = getSessionId();
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
          glow_up_level: glowUpLevel,
          status: "pending",
          is_free_generation: true,
        })
        .select("id")
        .single();

      if (insertError) {
        throw insertError;
      }

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
          <p className="mb-2 text-sm font-medium uppercase tracking-[0.2em] text-gray-500">
            GlownUp
          </p>
          <h1 className="text-4xl font-semibold tracking-tight">Upload your photo</h1>
          <p className="mt-3 text-base text-gray-600">
            Choose your glow-up level, upload a photo, and we&apos;ll start generating your transformation right away.
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <label className="mb-3 block text-sm font-medium text-gray-700">
            Choose your glow-up level
          </label>

          <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {glowUpOptions.map((option) => {
              const isSelected = glowUpLevel === option.value;

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setGlowUpLevel(option.value)}
                  className={`rounded-2xl border px-4 py-3 text-sm font-medium transition ${
                    isSelected
                      ? "border-black bg-black text-white"
                      : "border-gray-300 bg-white text-black hover:bg-gray-50"
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>

          <label className="mb-3 block text-sm font-medium text-gray-700">
            Upload an image
          </label>

          <input
            type="file"
            accept="image/*"
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