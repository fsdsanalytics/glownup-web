import { supabase } from "@/lib/supabase";

export async function trackEvent({
  event_name,
  transformation_id = null,
  metadata = {},
}: {
  event_name: string;
  transformation_id?: string | null;
  metadata?: Record<string, any>;
}) {
  try {
    await supabase.from("events").insert({
      event_name,
      transformation_id,
      page_path:
        typeof window !== "undefined"
          ? window.location.pathname
          : null,
      metadata,
    });
  } catch (error) {
    console.error("Analytics error:", error);
  }
}