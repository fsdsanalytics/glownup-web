export default function PrivacyPage() {
    return (
      <main className="mx-auto max-w-3xl px-6 py-16" style={{ color: "#111827" }}>
        <h1 className="mb-6 text-3xl font-semibold">Privacy Policy</h1>

        <p className="mb-4">
          GlownUp allows users to upload photos to generate AI-simulated body
          transformation images.
        </p>

        <p className="mb-4">
          Uploaded images are used to generate the requested transformation,
          display the result page, troubleshoot errors, prevent abuse, and
          improve the service.
        </p>

        <p className="mb-4">
          Uploaded images and generated results may be stored temporarily in
          order to provide the service. We may delete images periodically from
          storage, but we do not guarantee a specific deletion timeline.
        </p>

        <p className="mb-4">
          We do not sell user images. We do not intentionally distribute user
          images except as needed to operate the service, process images through
          third-party providers, or display/share generated result pages.
        </p>

        <p className="mb-4">
          By using GlownUp, you acknowledge that uploaded images may be processed
          by third-party AI, storage, analytics, and infrastructure providers in
          order to generate results and operate the service.
        </p>

        <p className="mb-4">
          We may collect technical information such as IP addresses, browser
          information, device information, usage analytics, upload events,
          generation events, and error events for security, abuse prevention,
          troubleshooting, analytics, and service improvement.
        </p>

        <p className="mb-4">
          Generated result links and image URLs may be accessible to anyone who
          has the link. Users should avoid uploading images they do not want
          others to potentially access through a shared or forwarded result URL.
        </p>

        <p className="mb-4">
          Users are responsible for ensuring they have the right to upload any
          image they submit and should not upload images containing nudity,
          illegal content, or content that violates another person&apos;s privacy or
          rights.
        </p>

        <p className="mt-8 text-sm text-neutral-500">
          Last updated: June 2026
        </p>
      </main>
    );
}