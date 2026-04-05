type TransformationCardProps = {
  originalImageUrl: string;
  generatedImageUrl: string;
  title?: string;
};

export default function TransformationCard({
  originalImageUrl,
  generatedImageUrl,
  title = "MY TRANSFORMATION",
}: TransformationCardProps) {
  return (
    <div className="mx-auto aspect-square w-full max-w-[720px] bg-white p-8 shadow-lg border border-neutral-200">
      <div className="flex h-full flex-col border border-neutral-200 bg-[#faf7f2]">
        <div className="border-b border-neutral-200 px-6 py-6 text-center">
          <h2 className="text-4xl font-bold tracking-tight uppercase text-black sm:text-5xl">
            {title}
          </h2>
        </div>

        <div className="flex-1 px-6 py-6">
          <div className="mb-4 grid grid-cols-2 gap-6">
            <p className="text-center text-sm font-semibold tracking-[0.25em] text-neutral-500">
              BEFORE
            </p>
            <p className="text-center text-sm font-semibold tracking-[0.25em] text-neutral-500">
              AFTER
            </p>
          </div>

          <div className="grid h-[calc(100%-2rem)] grid-cols-2 gap-6">
            <div className="flex items-center justify-center bg-white p-4">
              <img
                src={originalImageUrl}
                alt="Before"
                className="h-full w-full object-contain"
              />
            </div>

            <div className="flex items-center justify-center bg-white p-4">
              <img
                src={generatedImageUrl}
                alt="After"
                className="h-full w-full object-contain"
              />
            </div>
          </div>
        </div>

        <div className="border-t border-neutral-200 px-6 py-5 text-center text-base font-semibold text-neutral-600">
          Made with GlownUp.app
        </div>
      </div>
    </div>
  );
}