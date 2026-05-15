import Image from "next/image";

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
      className="w-full select-none bg-white p-0 sm:p-6"
      onContextMenu={(event) => event.preventDefault()}
    >
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg sm:rounded-3xl">
        <div className="flex justify-center px-6 py-5">
          <Image
            src="/wordmark.png"
            alt="GlownUp"
            width={240}
            height={48}
            className="h-10 w-auto object-contain brightness-0"
          />
        </div>

        <div className="grid grid-cols-2 gap-0 bg-white px-3 pb-4 pt-1 sm:px-10 sm:pb-10 sm:pt-3">
          <div className="pr-2 sm:pr-8">
            <p className="mb-3 text-center text-xs font-bold uppercase tracking-[0.25em] text-gray-800 sm:mb-5 sm:text-base sm:tracking-[0.3em]">
              Before
            </p>
            <div className="relative aspect-[4/5] w-full overflow-hidden bg-white sm:aspect-[3/4]">
              <img
                src={originalImageUrl}
                alt="Before transformation"
                draggable={false}
                style={{ imageOrientation: "from-image" }}
                className="pointer-events-none h-full w-full object-cover object-top"
              />
            </div>
          </div>

          <div className="border-l border-gray-300 pl-2 sm:pl-8">
            <p className="mb-3 text-center text-xs font-bold uppercase tracking-[0.25em] text-gray-800 sm:mb-5 sm:text-base sm:tracking-[0.3em]">
              After
            </p>
            <div className="relative aspect-[4/5] w-full overflow-hidden bg-white sm:aspect-[3/4]">
              <img
                src={generatedImageUrl}
                alt="After transformation"
                draggable={false}
                style={{ imageOrientation: "from-image" }}
                className="pointer-events-none h-full w-full object-cover object-top"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center gap-3 bg-gray-950 px-4 py-3 text-white sm:px-6 sm:py-4">
          <Image
            src="/logo_border.png"
            alt="GlownUp logo"
            width={42}
            height={42}
            className="h-10 w-10 object-contain"
          />
          <p className="text-base font-semibold tracking-tight sm:text-lg">
            www.GlownUp.app
          </p>
        </div>
      </div>
    </div>
  );
}