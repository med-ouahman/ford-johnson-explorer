import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export function AlgorithmIntro() {
  const [open, setOpen] = useState(false);
  return (
    <section className="rounded-xl border border-border bg-card">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
      >
        <span className="font-display text-sm font-semibold">
          What is Ford-Johnson (merge-insertion) sort?
        </span>
        <ChevronDown
          className={cn("size-4 text-muted-foreground transition-transform", open && "rotate-180")}
        />
      </button>
      {open && (
        <div className="space-y-3 border-t border-border px-5 py-4 text-sm leading-relaxed text-muted-foreground">
          <p>
            Published by L. R. Ford Jr. and Selmer M. Johnson in 1959, merge-insertion sort is built
            to use as few <em>comparisons</em> as possible — not to be fast in wall-clock terms. For
            small inputs it matches the known lower bound, which is why the 42 Network's{" "}
            <span className="font-mono text-foreground">push_swap</span> project keeps pointing at
            it.
          </p>
          <p className="text-foreground/90">The shape of the algorithm:</p>
          <ol className="list-decimal space-y-1 pl-5">
            <li>Split the list into pairs and compare inside each pair (1 comparison per pair).</li>
            <li>Recursively merge-insertion sort the winners — this becomes the main chain.</li>
            <li>
              The loser paired with the smallest winner is the global minimum, so it joins the front
              of the chain for free.
            </li>
            <li>
              Insert the remaining losers (and any odd element) with binary search, in{" "}
              <strong className="text-foreground">Jacobsthal order</strong> (1, 3, 5, 11, 21, …), so
              every search window is exactly a power of two minus one and no comparison is wasted.
            </li>
          </ol>
        </div>
      )}
    </section>
  );
}
