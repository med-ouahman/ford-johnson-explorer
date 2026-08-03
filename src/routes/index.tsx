import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Pause, Play, Shuffle, SkipBack, SkipForward, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Chip } from "@/components/Chip";
import { AlgorithmIntro } from "@/components/AlgorithmIntro";
import {
  MAX_ITEMS,
  fordJohnson,
  parseInput,
  randomValues,
  type SortResult,
  type Step,
} from "@/lib/ford-johnson";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Ford-Johnson Sort Visualizer — Merge-Insertion Step by Step" },
      {
        name: "description",
        content:
          "Interactive step-by-step visualizer for the Ford-Johnson (merge-insertion) sorting algorithm: pairing, main chain, Jacobsthal insertion order and comparison counts.",
      },
      { property: "og:title", content: "Ford-Johnson Sort Visualizer" },
      {
        property: "og:description",
        content:
          "Walk through merge-insertion sort one comparison at a time — pairs, main chain, pend elements and Jacobsthal order explained.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Visualizer,
});

const LEGEND = [
  { tone: "chain", label: "Main chain" },
  { tone: "pend", label: "Pending (pend)" },
  { tone: "active", label: "Current element" },
  { tone: "compare", label: "Being compared" },
] as const;

function Visualizer() {
  const [raw, setRaw] = useState("11 2 17 5 9 1 14 6");
  const [error, setError] = useState<string | null>(null);
  const [size, setSize] = useState(8);
  const [result, setResult] = useState<SortResult | null>(null);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(700);

  const run = useCallback((text: string) => {
    const parsed = parseInput(text);
    if (!parsed.ok) {
      setError(parsed.error);
      setResult(null);
      return;
    }
    setError(null);
    setResult(fordJohnson(parsed.values));
    setIndex(0);
    setPlaying(false);
  }, []);

  useEffect(() => {
    run("11 2 17 5 9 1 14 6");
  }, [run]);

  const steps = result?.steps ?? [];
  const step: Step | null = steps[index] ?? null;
  const last = steps.length - 1;

  useEffect(() => {
    if (!playing || index >= last) return;
    const t = setTimeout(() => setIndex((i) => Math.min(i + 1, last)), speed);
    return () => clearTimeout(t);
  }, [playing, index, last, speed]);

  useEffect(() => {
    if (index >= last) setPlaying(false);
  }, [index, last]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key === "ArrowRight") setIndex((i) => Math.min(i + 1, last));
      if (e.key === "ArrowLeft") setIndex((i) => Math.max(i - 1, 0));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [last]);

  const toneOf = useMemo(() => {
    return (id: number): "chain" | "pend" | "active" | "compare" | "neutral" => {
      if (!step) return "neutral";
      if (step.compare.includes(id)) return "compare";
      if (step.active.includes(id)) return "active";
      if (step.mainChain.some((c) => c.id === id)) return "chain";
      if (step.pending.some((c) => c.id === id)) return "pend";
      return "neutral";
    };
  }, [step]);

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:py-14">
      <header className="mb-8">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-primary">
          merge-insertion sort
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold sm:text-4xl">
          Ford-Johnson, one comparison at a time
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          A guided walkthrough of the comparison-optimal sort behind push_swap — pairing, the main
          chain, and why pend elements go in following the Jacobsthal sequence.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
        {/* ---------- Controls ---------- */}
        <aside className="space-y-5">
          <section className="rounded-xl border border-border bg-card p-5">
            <label htmlFor="numbers" className="font-display text-sm font-semibold">
              Your numbers
            </label>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              Separate with spaces or commas, e.g.{" "}
              <span className="font-mono text-foreground">5 3 8 1 9 2</span>. Negatives and decimals
              work. Values must be distinct, 2–{MAX_ITEMS} of them.
            </p>
            <Input
              id="numbers"
              value={raw}
              onChange={(e) => setRaw(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && run(raw)}
              className="mt-3 font-mono"
              placeholder="5 3 8 1 9 2"
              aria-invalid={!!error}
              aria-describedby={error ? "input-error" : undefined}
            />
            {error && (
              <p id="input-error" role="alert" className="mt-2 text-xs text-destructive">
                {error}
              </p>
            )}
            <Button className="mt-3 w-full" onClick={() => run(raw)}>
              <RotateCcw className="size-4" /> Visualize
            </Button>

            <div className="mt-5 border-t border-border pt-4">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Random list size</span>
                <span className="font-mono text-foreground">{size}</span>
              </div>
              <Slider
                className="mt-3"
                value={[size]}
                min={2}
                max={MAX_ITEMS}
                step={1}
                onValueChange={(v) => setSize(v[0] ?? 8)}
              />
              <Button
                variant="secondary"
                className="mt-3 w-full"
                onClick={() => {
                  const text = randomValues(size).join(" ");
                  setRaw(text);
                  run(text);
                }}
              >
                <Shuffle className="size-4" /> Randomize
              </Button>
            </div>
          </section>

          <section className="rounded-xl border border-border bg-card p-5">
            <h2 className="font-display text-sm font-semibold">Legend</h2>
            <ul className="mt-3 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
              {LEGEND.map((l) => (
                <li key={l.label} className="flex items-center gap-2">
                  <span
                    className={
                      "size-3 rounded-sm " +
                      (l.tone === "chain"
                        ? "bg-chain"
                        : l.tone === "pend"
                          ? "bg-pend"
                          : l.tone === "active"
                            ? "bg-active"
                            : "bg-compare")
                    }
                  />
                  {l.label}
                </li>
              ))}
            </ul>
          </section>

          {result && (
            <section className="rounded-xl border border-border bg-card p-5">
              <h2 className="font-display text-sm font-semibold">Comparisons</h2>
              <div className="mt-3 flex items-end gap-6">
                <div>
                  <p className="font-mono text-3xl font-bold text-primary">
                    {step?.comparisons ?? 0}
                  </p>
                  <p className="text-xs text-muted-foreground">so far</p>
                </div>
                <div>
                  <p className="font-mono text-xl font-semibold">{result.comparisons}</p>
                  <p className="text-xs text-muted-foreground">total used</p>
                </div>
                <div>
                  <p className="font-mono text-xl font-semibold">{result.theoreticalMin}</p>
                  <p className="text-xs text-muted-foreground">lower bound</p>
                </div>
              </div>
            </section>
          )}

          <AlgorithmIntro />
        </aside>

        {/* ---------- Stage ---------- */}
        <section className="space-y-5">
          {!result ? (
            <div className="rounded-xl border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
              Enter a list of numbers to start the walkthrough.
            </div>
          ) : (
            step && (
              <>
                <div className="rounded-xl border border-border bg-card p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h2 className="font-display text-lg font-semibold">{step.title}</h2>
                    <span className="rounded-full bg-secondary px-3 py-1 font-mono text-xs text-muted-foreground">
                      Step {index + 1} of {steps.length}
                      {step.depth > 0 ? ` · recursion depth ${step.depth}` : ""}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed">{step.what}</p>
                  <p className="mt-3 border-l-2 border-primary/60 pl-3 text-sm leading-relaxed text-muted-foreground">
                    <span className="font-semibold text-primary">Why: </span>
                    {step.why}
                  </p>
                </div>

                <div className="space-y-4 rounded-xl border border-border bg-card p-5">
                  {step.pairs.length > 0 && (
                    <Panel title="Pairs (larger on top)">
                      <div className="flex flex-wrap gap-3">
                        {step.pairs.map((p) => (
                          <div
                            key={p.big.id}
                            className="flex flex-col items-center gap-1 rounded-lg border border-border/60 bg-surface p-2"
                          >
                            <Chip value={p.big.value} tone={toneOf(p.big.id)} size="sm" />
                            <Chip value={p.small.value} tone={toneOf(p.small.id)} size="sm" />
                          </div>
                        ))}
                        {step.odd && (
                          <div className="flex flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-border p-2">
                            <Chip value={step.odd.value} tone={toneOf(step.odd.id)} size="sm" />
                            <span className="text-[10px] text-muted-foreground">odd</span>
                          </div>
                        )}
                      </div>
                    </Panel>
                  )}

                  {step.mainChain.length > 0 && (
                    <Panel title="Main chain">
                      <div className="flex flex-wrap gap-2">
                        {step.mainChain.map((c) => (
                          <Chip key={c.id} value={c.value} tone={toneOf(c.id)} />
                        ))}
                      </div>
                    </Panel>
                  )}

                  {step.pending.length > 0 && (
                    <Panel title="Pending elements">
                      <div className="flex flex-wrap gap-2">
                        {step.pending.map((c) => (
                          <Chip key={c.id} value={c.value} tone={toneOf(c.id)} size="sm" />
                        ))}
                      </div>
                    </Panel>
                  )}

                  {step.insertOrder.length > 0 && (
                    <Panel title="Insertion order (Jacobsthal)">
                      <div className="flex flex-wrap items-center gap-2">
                        {step.insertOrder.map((c, i) => (
                          <div key={c.id} className="flex items-center gap-2">
                            {i > 0 && <span className="text-muted-foreground">→</span>}
                            <Chip value={c.value} tone={toneOf(c.id)} size="sm" />
                          </div>
                        ))}
                      </div>
                      {step.jacobsthal.length > 0 && (
                        <p className="mt-2 font-mono text-xs text-muted-foreground">
                          J = {step.jacobsthal.join(", ")}
                        </p>
                      )}
                    </Panel>
                  )}

                  {step.phase === "done" && (
                    <Panel title="Summary">
                      <p className="text-sm text-muted-foreground">
                        Sorted {result.sorted.length} values with{" "}
                        <span className="font-mono text-foreground">{result.comparisons}</span>{" "}
                        comparisons — the theoretical lower bound is{" "}
                        <span className="font-mono text-foreground">{result.theoreticalMin}</span>.
                      </p>
                    </Panel>
                  )}
                </div>

                {/* Navigation */}
                <div className="sticky bottom-4 rounded-xl border border-border bg-card/95 p-4 backdrop-blur">
                  <Slider
                    value={[index]}
                    min={0}
                    max={last}
                    step={1}
                    onValueChange={(v) => {
                      setPlaying(false);
                      setIndex(v[0] ?? 0);
                    }}
                    aria-label="Step timeline"
                  />
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="secondary"
                        onClick={() => {
                          setPlaying(false);
                          setIndex((i) => Math.max(0, i - 1));
                        }}
                        disabled={index === 0}
                      >
                        <SkipBack className="size-4" /> Back
                      </Button>
                      <Button
                        onClick={() => {
                          setPlaying(false);
                          setIndex((i) => Math.min(last, i + 1));
                        }}
                        disabled={index === last}
                      >
                        Next <SkipForward className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => setPlaying((p) => !p)}
                        disabled={index === last}
                      >
                        {playing ? <Pause className="size-4" /> : <Play className="size-4" />}
                        {playing ? "Pause" : "Play"}
                      </Button>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>Speed</span>
                      <Slider
                        className="w-28"
                        value={[1400 - speed]}
                        min={100}
                        max={1300}
                        step={100}
                        onValueChange={(v) => setSpeed(1400 - (v[0] ?? 700))}
                        aria-label="Playback speed"
                      />
                      <span className="hidden sm:inline">← / → to step</span>
                    </div>
                  </div>
                </div>
              </>
            )
          )}
        </section>
      </div>
    </main>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-2 font-mono text-xs uppercase tracking-wider text-muted-foreground">
        {title}
      </h3>
      {children}
    </div>
  );
}
