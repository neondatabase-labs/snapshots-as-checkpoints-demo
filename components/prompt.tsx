export async function Prompt({
  prompt,
  label,
}: {
  prompt: string;
  label: string;
}) {
  return (
    <div className="mt-8">
      <div className="mb-2 text-sm text-[#61646B] dark:text-[#94979E]">
        {label}:
      </div>
      <div className="rounded-lg border border-[#E4E5E7] p-4 dark:border-[#303236]">
        <pre className="whitespace-pre-wrap text-sm">{prompt}</pre>
      </div>
    </div>
  );
}
