type TransformationCardProps = {
  originalImageUrl: string;
  generatedImageUrl: string;
};

export default function TransformationCard({
  originalImageUrl,
  generatedImageUrl,
}: TransformationCardProps) {
  return (
    <div
      className="w-full select-none bg-white p-4 sm:p-6"
      onContextMenu={(event) => event.preventDefault()}
    >
      <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-lg">
        <div className="grid grid-cols-2 gap-0 bg-white px-6 pb-6 pt-8 sm:px-10 sm:pb-10 sm:pt-10">
          <div className="pr-4 sm:pr-8">
            <p className="mb-5 text-center text-sm font-bold uppercase tracking-[0.3em] text-gray-800 sm:text-base">
              Before
            </p>
            <div className="relative aspect-[3/4] w-full overflow-hidden bg-white">
              <img
                src={originalImageUrl}
                alt="Before transformation"
                draggable={false}
                className="pointer-events-none h-full w-full object-contain"
              />
            </div>
          </div>

          <div className="border-l border-gray-300 pl-4 sm:pl-8">
            <p className="mb-5 text-center text-sm font-bold uppercase tracking-[0.3em] text-gray-800 sm:text-base">
              After
            </p>
            <div className="relative aspect-[3/4] w-full overflow-hidden bg-white">
              <img
                src={generatedImageUrl}
                alt="After transformation"
                draggable={false}
                className="pointer-events-none h-full w-full object-contain"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 bg-gray-950 px-6 py-3 text-white sm:py-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-full border border-lime-300 text-base font-bold text-lime-300">
            G
          </div>
          <p className="text-base font-semibold tracking-tight sm:text-lg">
            GlownUp.app
          </p>
        </div>
      </div>
    </div>
  );
}