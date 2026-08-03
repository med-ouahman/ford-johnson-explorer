import { cn } from "@/lib/utils";

type Tone = "chain" | "pend" | "active" | "compare" | "neutral";

export function Chip({
  value,
  tone = "neutral",
  size = "md",
  label,
}: {
  value: number;
  tone?: Tone;
  size?: "sm" | "md";
  label?: string;
}) {
  return (
    <div
      className={cn(
        "chip-pop flex select-none flex-col items-center justify-center rounded-lg border font-mono font-semibold tabular-nums shadow-sm transition-all duration-300",
        size === "md" ? "min-w-12 px-3 py-2 text-base" : "min-w-9 px-2 py-1 text-sm",
        tone === "chain" && "border-chain/60 bg-chain text-chain-foreground",
        tone === "pend" && "border-border bg-pend text-pend-foreground",
        tone === "active" && "border-active bg-active text-active-foreground scale-110 shadow-lg",
        tone === "compare" &&
          "border-compare bg-compare text-compare-foreground scale-110 shadow-lg ring-2 ring-compare/40",
        tone === "neutral" && "border-border bg-secondary text-secondary-foreground",
      )}
    >
      <span>{value}</span>
      {label ? <span className="text-[10px] font-normal opacity-70">{label}</span> : null}
    </div>
  );
}
