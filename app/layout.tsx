import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Image from "next/image";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GlownUp",
  description: "See what you'd look like at a lower body fat percentage.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-screen flex flex-col bg-white text-black">
        <header className="border-b border-gray-100 bg-white">
          <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            <a href="/" className="flex items-center">
              <Image
                src="/wordmark.png"
                alt="GlownUp"
                width={260}
                height={52}
                priority
                className="h-11 w-auto object-contain brightness-0"
              />
            </a>

            <div className="hidden items-center gap-5 text-sm text-gray-600 sm:flex">
              <a href="/privacy" className="hover:text-black">
                Privacy
              </a>
              <a href="/terms" className="hover:text-black">
                Terms
              </a>
              <a
                href="/upload"
                className="rounded-full bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
              >
                Try GlownUp
              </a>
            </div>

            <details className="relative sm:hidden">
              <summary className="flex h-10 w-10 cursor-pointer list-none items-center justify-center rounded-full border border-gray-200 text-gray-900 marker:hidden">
                <span className="sr-only">Open navigation menu</span>
                <span className="flex flex-col gap-1.5">
                  <span className="block h-0.5 w-5 bg-black" />
                  <span className="block h-0.5 w-5 bg-black" />
                  <span className="block h-0.5 w-5 bg-black" />
                </span>
              </summary>

              <div className="absolute right-0 top-12 z-50 w-44 rounded-2xl border border-gray-200 bg-white p-2 text-sm text-gray-700 shadow-lg">
                <a href="/privacy" className="block rounded-xl px-4 py-3 hover:bg-gray-50 hover:text-black">
                  Privacy
                </a>
                <a href="/terms" className="block rounded-xl px-4 py-3 hover:bg-gray-50 hover:text-black">
                  Terms
                </a>
                <a href="/upload" className="mt-1 block rounded-xl bg-black px-4 py-3 text-center font-medium text-white hover:bg-gray-800">
                  Try GlownUp
                </a>
              </div>
            </details>
          </nav>
        </header>

        <main className="flex-1 bg-white">{children}</main>

        <footer className="mt-auto border-t border-gray-200 bg-white py-8 text-center text-sm text-gray-500">
          <div className="mb-4 flex justify-center">
            <Image
              src="/wordmark.png"
              alt="GlownUp"
              width={260}
              height={52}
              className="h-11 w-auto object-contain brightness-0"
            />
          </div>

          <p>© 2026 GlownUp</p>

          <div className="mt-2 flex justify-center gap-4">
            <a href="/" className="hover:text-black">
              Home
            </a>

            <a href="/privacy" className="hover:text-black">
              Privacy
            </a>

            <a href="/terms" className="hover:text-black">
              Terms
            </a>

            <a href="mailto:fsdsanalytics@gmail.com" className="hover:text-black">
              Contact
            </a>
          </div>
        </footer>
        <Analytics />
      </body>
    </html>
  );
}
