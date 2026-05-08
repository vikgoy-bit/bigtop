import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  { key: "unit", label: "Unit" },
  { key: "details", label: "Details" },
  { key: "payment", label: "Payment" },
  { key: "verify", label: "Verify ID" },
] as const;

export type StepKey = (typeof STEPS)[number]["key"];

export function Stepper({ current }: { current: StepKey }) {
  const currentIdx = STEPS.findIndex((s) => s.key === current);
  return (
    <ol className="mx-auto flex w-full max-w-3xl items-center gap-2 px-4 py-4 sm:gap-3">
      {STEPS.map((step, i) => {
        const done = i < currentIdx;
        const active = i === currentIdx;
        return (
          <li key={step.key} className="flex flex-1 items-center gap-2">
            <div
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ring-2 transition",
                done && "bg-accent text-accent-foreground ring-accent",
                active && "bg-primary text-primary-foreground ring-primary",
                !done && !active && "bg-muted text-muted-foreground ring-border"
              )}
            >
              {done ? <Check className="h-4 w-4" /> : i + 1}
            </div>
            <div
              className={cn(
                "hidden text-sm font-medium sm:block",
                active ? "text-foreground" : "text-muted-foreground"
              )}
            >
              {step.label}
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={cn(
                  "ml-1 h-px flex-1 transition",
                  done ? "bg-accent" : "bg-border"
                )}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
