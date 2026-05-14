import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <main className="bg-white text-black">
      <section className="mx-auto flex max-w-4xl flex-col items-center justify-center px-6 pt-24 pb-16 text-center">
        <div className="mb-8 flex justify-center">
          <Image
            src="/wordmark.png"
            alt="GlownUp"
            width={340}
            height={68}
            priority
            className="h-16 w-auto object-contain brightness-0"
          />
        </div>

        <h1 className="max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
          See what you’d look like at a lower body fat percentage.
        </h1>

        <p className="mt-6 max-w-2xl text-lg text-gray-600">
          Upload a photo, choose your target body fat, and generate your future summer body transformation.
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