import Link from "next/link";

export default function Home() {
  return (
    <main className="bg-white text-black">
      <section className="mx-auto flex max-w-4xl flex-col items-center justify-center px-6 pt-24 pb-16 text-center">
        <p className="mb-4 text-sm font-medium uppercase tracking-[0.2em] text-gray-500">
          GlownUp
        </p>

        <h1 className="max-w-3xl text-5xl font-semibold tracking-tight sm:text-6xl">
          See what you’d look like at a lower body fat percentage.
        </h1>

        <p className="mt-6 max-w-2xl text-lg text-gray-600">
          Upload a photo, choose your target body fat, and generate your future summer-body transformation.
        </p>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <Link
            href="/upload"
            className="rounded-full bg-black px-6 py-3 text-white transition hover:bg-gray-800"
          >
            Try GlownUp
          </Link>
          <Link
            href="/upload"
            className="rounded-full border border-gray-300 px-6 py-3 text-black transition hover:bg-gray-100"
          >
            See Example
          </Link>
        </div>
      </section>
    </main>
  );
}