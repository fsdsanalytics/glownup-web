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
            Small changes in your photo can make a huge difference in your
            transformation.
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
              4. Avoid baggy clothing
            </h2>

            <p className="mt-3 text-gray-700 leading-7">
              Loose hoodies, oversized jackets, and heavy layering can make it
              harder for the AI to generate accurate body transformations.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">
              5. AI generations are not perfect
            </h2>

            <p className="mt-3 text-gray-700 leading-7">
              GlownUp uses AI-generated transformations. Some generations may
              occasionally produce visual inconsistencies or unrealistic
              details.
            </p>
          </section>
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