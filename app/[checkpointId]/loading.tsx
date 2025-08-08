export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-5 md:max-w-lg md:px-0 lg:max-w-xl">
        <main className="flex flex-1 flex-col justify-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Applying snapshot…
          </h1>
          <p className="mt-2 max-w-lg text-base leading-snug tracking-tight text-[#61646B] md:text-lg md:leading-snug lg:text-xl lg:leading-snug dark:text-[#94979E]">
            Please wait while we prepare the database state for this checkpoint.
          </p>
          <div className="mt-6 h-1 w-full max-w-xs overflow-hidden rounded bg-[#E4E5E7] dark:bg-[#303236]">
            <div className="h-full w-1/3 animate-[loading_1.2s_infinite] bg-[#00E599]" />
          </div>
          <style>{`@keyframes loading {0%{transform:translateX(-100%)}50%{transform:translateX(50%)}100%{transform:translateX(200%)}}`}</style>
        </main>
      </div>
    </div>
  );
}
