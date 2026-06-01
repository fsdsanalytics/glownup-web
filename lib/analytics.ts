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
    await fetch("/api/events", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        event_name,
        transformation_id,
        page_path:
          typeof window !== "undefined"
            ? window.location.pathname
            : null,
        metadata,
      }),
    });
  } catch (error) {
    console.error("Analytics error:", error);
  }
}