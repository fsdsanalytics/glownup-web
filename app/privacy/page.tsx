export default function PrivacyPage() {
    return (
      <main className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="mb-6 text-3xl font-semibold">Privacy Policy</h1>
  
        <p className="mb-4">
          GlownUp allows users to upload photos to generate AI-simulated physique
          transformations.
        </p>
  
        <p className="mb-4">
          Uploaded images are used only to generate the requested transformation
          and are stored temporarily in order to display the result page.
        </p>
  
        <p className="mb-4">
          We do not sell or distribute user images. Images may be deleted
          periodically from storage.
        </p>
  
        <p className="mb-4">
          By using this service, you agree that uploaded images may be processed
          by third-party AI providers to generate results.
        </p>
        
        <p className="mb-4">
          We may collect technical information such as IP addresses, browser
          information, device information, and usage analytics for security,
          abuse prevention, troubleshooting, and service improvement.
        </p>
  
        <p className="mt-8 text-sm text-neutral-500">
          Last updated: 2026
        </p>
      </main>
    );
  }