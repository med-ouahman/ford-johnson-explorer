export type Chip = { id: number; value: number };

export type StepPhase =
  | "intro"
  | "pair"
  | "recurse"
  | "chain"
  | "jacobsthal"
  | "insert"
  | "done";

export type Step = {
  phase: StepPhase;
  depth: number;
  title: string;
  what: string;
  why: string;
  pairs: { big: Chip; small: Chip }[];
  odd: Chip | null;
  mainChain: Chip[];
  pending: Chip[];
  insertOrder: Chip[];
  active: number[];
  compare: number[];
  inserted: number[];
  jacobsthal: number[];
  comparisons: number;
};

export type SortResult = {
  steps: Step[];
  sorted: number[];
  comparisons: number;
  theoreticalMin: number;
};

export function theoreticalMinimum(n: number): number {
  let total = 0;
  for (let k = 1; k <= n; k++) total += Math.ceil(Math.log2((3 * k) / 4));
  return total;
}

export function jacobsthalNumbers(limit: number): number[] {
  const j = [0, 1];
  while (j[j.length - 1] < limit) j.push(j[j.length - 1] + 2 * j[j.length - 2]);
  return j;
}

const fmt = (c: Chip[]) => (c.length ? c.map((x) => x.value).join(", ") : "—");

export function fordJohnson(values: number[]): SortResult {
  const steps: Step[] = [];
  let comparisons = 0;
  const chips: Chip[] = values.map((value, id) => ({ id, value }));

  const push = (s: Partial<Step> & Pick<Step, "phase" | "depth" | "title" | "what" | "why">) => {
    steps.push({
      pairs: [],
      odd: null,
      mainChain: [],
      pending: [],
      insertOrder: [],
      active: [],
      compare: [],
      inserted: [],
      jacobsthal: [],
      comparisons,
      ...s,
    });
  };

  const less = (a: Chip, b: Chip) => {
    comparisons++;
    return a.value < b.value;
  };

  function sort(list: Chip[], depth: number): Chip[] {
    if (list.length <= 1) return list.slice();

    // 1. pair up
    const pairs: { big: Chip; small: Chip }[] = [];
    const odd = list.length % 2 === 1 ? list[list.length - 1] : null;
    for (let i = 0; i + 1 < list.length; i += 2) {
      const a = list[i];
      const b = list[i + 1];
      push({
        phase: "pair",
        depth,
        title: `Compare pair (${a.value}, ${b.value})`,
        what: `One comparison decides which of ${a.value} and ${b.value} is the larger of this pair.`,
        why: "Ford-Johnson starts by splitting the list into pairs. Every pair costs exactly one comparison, and the winners will form the backbone (main chain) of the sort.",
        pairs: pairs.slice(),
        odd,
        compare: [a.id, b.id],
        active: [a.id, b.id],
      });
      const swap = less(a, b);
      pairs.push(swap ? { big: b, small: a } : { big: a, small: b });
      steps[steps.length - 1].comparisons = comparisons;
    }

    push({
      phase: "pair",
      depth,
      title: `Pairing complete (${pairs.length} pair${pairs.length === 1 ? "" : "s"})`,
      what: `Larger elements: ${fmt(pairs.map((p) => p.big))}. Smaller partners: ${fmt(
        pairs.map((p) => p.small),
      )}.${odd ? ` Leftover unpaired element: ${odd.value}.` : ""}`,
      why: "Each smaller element is already known to be below its own partner. That free knowledge is what lets us insert it later with fewer comparisons.",
      pairs: pairs.slice(),
      odd,
      active: pairs.map((p) => p.big.id),
    });

    // 2. recursively sort the larger elements
    if (pairs.length > 1) {
      push({
        phase: "recurse",
        depth,
        title: "Recurse on the larger elements",
        what: `Sort ${fmt(pairs.map((p) => p.big))} by applying merge-insertion sort to them.`,
        why: "The winners of each pair must be ordered before anything can be inserted into them. This recursion is where the algorithm's efficiency compounds.",
        pairs: pairs.slice(),
        odd,
        active: pairs.map((p) => p.big.id),
      });
    }
    const sortedBigs = sort(
      pairs.map((p) => p.big),
      depth + 1,
    );

    // 3. main chain seeded with the partner of the smallest big
    const partnerOf = new Map<number, Chip>();
    for (const p of pairs) partnerOf.set(p.big.id, p.small);

    const mainChain: Chip[] = [partnerOf.get(sortedBigs[0].id)!, ...sortedBigs];
    const pending: Chip[] = sortedBigs.slice(1).map((b) => partnerOf.get(b.id)!);
    if (odd) pending.push(odd);

    push({
      phase: "chain",
      depth,
      title: "Seed the main chain",
      what: `Main chain: ${fmt(mainChain)}. Pending: ${fmt(pending)}.`,
      why: `The partner of the smallest winner (${mainChain[0].value}) is guaranteed to be the smallest element overall, so it can be placed at the front for free — zero comparisons.`,
      pairs: pairs.slice(),
      odd,
      mainChain: mainChain.slice(),
      pending: pending.slice(),
      active: [mainChain[0].id],
    });

    if (pending.length === 0) {
      return mainChain;
    }

    // 4. Jacobsthal insertion order
    const jac = jacobsthalNumbers(pending.length + 2);
    const order: number[] = [];
    for (let k = 2; k < jac.length; k++) {
      const start = Math.min(jac[k], pending.length);
      const prev = Math.min(jac[k - 1], pending.length);
      for (let i = start; i > prev; i--) order.push(i - 1);
    }
    for (let i = 0; i < pending.length; i++) if (!order.includes(i)) order.push(i);

    push({
      phase: "jacobsthal",
      depth,
      title: "Compute the Jacobsthal insertion order",
      what: `Jacobsthal numbers: ${jac.join(", ")}. Insertion order of the pending elements: ${fmt(
        order.map((i) => pending[i]),
      )}.`,
      why: "Inserting in Jacobsthal order keeps every binary insertion inside a search window whose size is exactly a power of two minus one, so no insertion ever wastes a comparison. This is the step most people get wrong — the order is not left-to-right.",
      pairs: pairs.slice(),
      odd,
      mainChain: mainChain.slice(),
      pending: pending.slice(),
      insertOrder: order.map((i) => pending[i]),
      jacobsthal: jac,
    });

    // 5. binary insertions
    const remaining = new Set(pending.map((p) => p.id));
    for (const idx of order) {
      const el = pending[idx];
      const bound = idx + 1 < sortedBigs.length ? sortedBigs[idx + 1] : null;
      let hi = bound ? mainChain.findIndex((c) => c.id === bound.id) : mainChain.length;
      let lo = 0;

      push({
        phase: "insert",
        depth,
        title: `Insert ${el.value} by binary search`,
        what: bound
          ? `Search window is the main chain before ${bound.value} (${fmt(mainChain.slice(0, hi))}).`
          : `Search the whole main chain (${fmt(mainChain)}).`,
        why: bound
          ? `${el.value} is already known to be smaller than its pair partner ${bound.value}, so everything at or after ${bound.value} can be skipped — that's the saved comparison.`
          : "This element had no partner (odd list), so the full chain has to be searched.",
        pairs: pairs.slice(),
        odd,
        mainChain: mainChain.slice(),
        pending: pending.filter((p) => remaining.has(p.id)),
        insertOrder: order.map((i) => pending[i]).filter((p) => remaining.has(p.id)),
        active: [el.id],
        inserted: mainChain.slice(0, hi).map((c) => c.id),
      });

      while (lo < hi) {
        const mid = (lo + hi) >> 1;
        const probe = mainChain[mid];
        push({
          phase: "insert",
          depth,
          title: `Compare ${el.value} with ${probe.value}`,
          what: `Binary probe at position ${mid} of the window [${lo}, ${hi - 1}].`,
          why: "Binary search halves the candidate window with each comparison, which is what makes the insertion cost logarithmic.",
          pairs: pairs.slice(),
          odd,
          mainChain: mainChain.slice(),
          pending: pending.filter((p) => remaining.has(p.id)),
          insertOrder: order.map((i) => pending[i]).filter((p) => remaining.has(p.id)),
          active: [el.id],
          compare: [el.id, probe.id],
        });
        if (less(el, probe)) hi = mid;
        else lo = mid + 1;
        steps[steps.length - 1].comparisons = comparisons;
      }

      mainChain.splice(lo, 0, el);
      remaining.delete(el.id);
      push({
        phase: "insert",
        depth,
        title: `Placed ${el.value}`,
        what: `Main chain is now ${fmt(mainChain)}.`,
        why: "The window collapsed to a single position, so the element's exact slot is known without any further comparison.",
        pairs: pairs.slice(),
        odd,
        mainChain: mainChain.slice(),
        pending: pending.filter((p) => remaining.has(p.id)),
        insertOrder: order.map((i) => pending[i]).filter((p) => remaining.has(p.id)),
        active: [el.id],
        inserted: [el.id],
      });
    }

    return mainChain;
  }

  push({
    phase: "intro",
    depth: 0,
    title: "Starting list",
    what: `We will sort ${fmt(chips)} using merge-insertion (Ford-Johnson) sort.`,
    why: "Ford-Johnson trades a more complicated procedure for a comparison count that is optimal or near-optimal for small inputs.",
    mainChain: [],
    pending: chips.slice(),
    active: chips.map((c) => c.id),
  });

  const result = sort(chips, 0);

  push({
    phase: "done",
    depth: 0,
    title: "Sorted",
    what: `Final result: ${fmt(result)}.`,
    why: `Used ${comparisons} comparison${comparisons === 1 ? "" : "s"}; the information-theoretic style lower bound for ${
      values.length
    } elements is ${theoreticalMinimum(values.length)}.`,
    mainChain: result.slice(),
    inserted: result.map((c) => c.id),
  });

  return {
    steps,
    sorted: result.map((c) => c.value),
    comparisons,
    theoreticalMin: theoreticalMinimum(values.length),
  };
}

export type ParseResult = { ok: true; values: number[] } | { ok: false; error: string };

export const MAX_ITEMS = 30;

export function parseInput(raw: string): ParseResult {
  const text = raw.trim();
  if (!text) return { ok: false, error: "Please enter some numbers first — try 5 3 8 1 9 2." };
  const tokens = text.split(/[\s,;]+/).filter(Boolean);
  const bad = tokens.filter((t) => !/^-?\d+(\.\d+)?$/.test(t));
  if (bad.length) {
    return {
      ok: false,
      error: `“${bad.slice(0, 3).join("”, “")}” ${bad.length > 1 ? "aren't numbers" : "isn't a number"}. Use digits only, separated by spaces or commas (negatives and decimals are fine).`,
    };
  }
  const values = tokens.map(Number);
  if (values.length < 2)
    return { ok: false, error: "One number is already sorted — enter at least two values." };
  if (values.length > MAX_ITEMS)
    return {
      ok: false,
      error: `That's ${values.length} values. The walkthrough stays readable up to ${MAX_ITEMS}, so please trim the list.`,
    };
  const seen = new Set<number>();
  for (const v of values) {
    if (seen.has(v))
      return {
        ok: false,
        error: `Duplicate value ${v}. This visualizer uses distinct values so every comparison has a clear winner.`,
      };
    seen.add(v);
  }
  return { ok: true, values };
}

export function randomValues(size: number): number[] {
  const pool = new Set<number>();
  while (pool.size < size) pool.add(Math.floor(Math.random() * 99) + 1);
  return [...pool];
}
