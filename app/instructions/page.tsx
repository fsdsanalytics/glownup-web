import Link from "next/link";

export default function InstructionsPage() {
  return (
    <main className="min-h-screen bg-white px-6 py-16 text-black">
      <div className="mx-auto max-w-3xl">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-semibold tracking-tight">
            Tips for the Best Result
          </h1>

          <p className="mt-4 text-lg text-gray-600">
            The best results come from clear, well-lit photos. Review the examples below before uploading.
          </p>
        </div>

        <div className="mb-12 rounded-2xl border border-gray-200 p-6">
          <h2 className="mb-4 text-2xl font-semibold">Example Photos</h2>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="mb-3 font-medium text-green-700">✓ Works Best</h3>
              <img
                src="/example_1.png"
                alt="Examples of photos that work well"
                className="w-full rounded-xl border border-gray-200"
              />
              <ul className="mt-3 space-y-1 text-sm text-gray-700">
                <li>• Front-facing upper body</li>
                <li>• Good lighting</li>
                <li>• Fitted shirt, athletic wear, or sports bra</li>
                <li>• Shoulders and torso clearly visible</li>
                <li>• Simple background with minimal distractions</li>
              </ul>
            </div>

            <div>
              <h3 className="mb-3 font-medium text-red-700">✕ May Not Work Well</h3>
              <img
                src="/example_2.png"
                alt="Examples of photos that may not work well"
                className="w-full rounded-xl border border-gray-200"
              />
              <ul className="mt-3 space-y-1 text-sm text-gray-700">
                <li>• Very dark photos</li>
                <li>• Heavy layering or baggy clothing</li>
                <li>• Side profiles</li>
                <li>• Extreme crops or distant full-body shots</li>
                <li>• Underwear, bikini bottoms, or highly revealing images</li>
              </ul>
            </div>
          </div>
          <p className="mt-4 text-center text-sm text-gray-500">
            See the detailed guidance below for additional tips and image guidelines.
          </p>
        </div>

        <div className="space-y-10">
          <section>
            <h2 className="text-2xl font-semibold">
              1. Use a front-facing photo
            </h2>

            <p className="mt-3 text-gray-700 leading-7">
              Front-facing upper body photos produce the most realistic and
              consistent results. Slight angles are okay, but avoid side
              profiles or heavily rotated poses.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">
              2. Good lighting matters
            </h2>

            <p className="mt-3 text-gray-700 leading-7">
              Natural lighting or evenly lit indoor photos work best. Dark,
              blurry, or heavily shadowed photos may create distorted
              generations.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">
              3. Keep your upper body visible
            </h2>

            <p className="mt-3 text-gray-700 leading-7">
              Try to keep your shoulders, chest, and torso clearly visible in
              the crop. Extremely zoomed-in selfies or full-body long-distance
              photos may reduce quality.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">
              4. Fitted clothing works best
            </h2>

            <p className="mt-3 text-gray-700 leading-7">
              Fitted shirts, athletic wear, and sports bras generally produce the most accurate transformations. Baggy clothing, hoodies, oversized jackets, and heavy layering can reduce quality.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">
              5. Image Guidelines
            </h2>

            <p className="mt-3 text-gray-700 leading-7">
              You must be 18 or older to use GlownUp. Nudity is not permitted. Shirtless photos and sports bras are allowed, but underwear, bikini bottoms, and other highly revealing images may be moderated and rejected by AI safety systems.
              Some images may not be supported due to image quality or AI safety systems.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">
              6. AI generations are not perfect
            </h2>

            <p className="mt-3 text-gray-700 leading-7">
              GlownUp creates AI-simulated body transformations for entertainment and visualization purposes. Results may contain visual inconsistencies and should not be considered a prediction or guarantee of future appearance.
            </p>
          </section>

          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
            GlownUp is actively being improved. We continue to refine image generation quality, moderation systems, and supported photo types to improve results over time.
          </div>
        </div>

        <div className="mt-14 flex justify-center">
          <Link
            href="/upload"
            className="inline-flex items-center justify-center rounded-full bg-black px-6 py-3 text-sm font-medium text-white transition hover:bg-gray-800"
          >
            Start Your Transformation
          </Link>
        </div>
      </div>
    </main>
  );
}