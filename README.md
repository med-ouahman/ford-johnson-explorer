# Ford-Johnson Explorer

Agent Prompt: Ford-Johnson (Merge-Insertion Sort) Visualizer

Context

You are building an interactive, educational web application that visualizes the Ford-Johnson algorithm (also known as Merge Insertion Sort), developed by L.R. Ford Jr. and Selmer M. Johnson. This algorithm is famously part of the 42 Network curriculum (the "push_swap" project relies on understanding it for optimal sorting with minimal comparisons).

The app must teach the algorithm step-by-step, not just show a final sorted result. Assume the user is a student trying to genuinely understand why each step happens, not just that it happens.

Tech Stack

HTML5, CSS3, and vanilla JavaScript as the base.

You may use additional libraries only if they add real value (e.g., a charting/animation library like D3.js or anime.js for smooth transitions). Do not add heavy frameworks (React/Vue/etc.) unless you believe it's genuinely necessary — prefer a lightweight, dependency-minimal build that runs by simply opening index.html in a browser (no build step, no server required).

Must run entirely client-side, fully offline-capable once loaded.

Input Requirements

Provide a clear input field where the user can enter a list of numbers.

Explicitly explain the expected input format near the input field (e.g., "Enter numbers separated by spaces or commas, e.g. 5 3 8 1 9 2"). Don't assume the user will guess the format.

Support reasonable flexibility in parsing (spaces, commas, or both; extra whitespace; negative numbers; decimals if you choose to support them — state clearly whether decimals/negatives are supported).

Provide a way to generate random input (e.g., a "Randomize" button with a selectable size) so users who don't want to type numbers can still explore the algorithm.

Consider a sensible upper limit on input size for visualization clarity (e.g., a warning or soft cap around 20-30 elements), since Ford-Johnson's step count grows and a huge list will make the visualization unreadable. Explain this limit to the user if reached.

Error Handling

Handle these gracefully, with clear, friendly, non-technical messaging (never a raw JS error or blank screen):

Empty input.

Non-numeric tokens (e.g., letters, symbols).

Duplicate values (decide and clearly state whether duplicates are allowed).

Only one number, or zero numbers.

Input exceeding the size limit.

Malformed separators.

Errors should be shown inline near the input, not as browser alert() popups, and should not crash or freeze the app.

Core Algorithm Requirements

Implement the actual Ford-Johnson / Merge-Insertion sort algorithm correctly, including:

Pairing elements and sorting within each pair (the larger/smaller comparison step).

Recursively sorting the "larger" elements of each pair to build the main chain.

Constructing the main chain (sorted sequence) starting from the recursively sorted larger elements, with the smallest overall element correctly seeded in.

Inserting the "pend" elements (the smaller element of each pair, plus the odd element out if the list length is odd) into the main chain using binary insertion, following the Jacobsthal number insertion order (this is the part students most often misunderstand — the order in which pend elements get inserted is NOT arbitrary, it follows the Jacobsthal sequence to minimize worst-case comparisons).

Correct handling of an odd-length list (leftover unpaired element).

The algorithm should track and be able to display the number of comparisons used, ideally alongside the theoretical minimum (Ford-Johnson's claim to fame is being comparison-optimal or near-optimal), so the user can appreciate why the algorithm is designed this way.

Step-by-Step Explanation & Navigation

This is the heart of the app — treat it as a guided walkthrough, not an animation you just watch passively:

Break the algorithm into discrete, well-defined steps (e.g., "Pairing elements", "Sorting pair 3", "Building main chain", "Computing Jacobsthal insertion order", "Inserting element X via binary search", etc.).

At each step, show:

What is happening right now, in plain language.

The current state of all relevant data structures (pairs, main chain, pending elements, insertion order) visually — not just as text/numbers, but with a visual representation (e.g., boxes/cards representing values, with highlighting/color-coding for elements currently being compared, inserted, or moved).

Why this step happens (a short explanation tying back to the algorithm's logic, e.g., why this particular pend element is inserted now based on the Jacobsthal sequence).

Provide Next and Back controls so the user can freely move forward and backward through the steps at their own pace, revisiting anything they didn't fully grasp.

Provide a step counter / progress indicator (e.g., "Step 7 of 24") and ideally a scrubber/timeline to jump to an arbitrary step.

Consider an optional "Play" / auto-advance mode with adjustable speed, in addition to manual step-through, but manual control must always be available and must be the default.

Highlight comparisons as they happen (e.g., visually flash or outline the two elements being compared) so the user can see exactly which values are involved in each decision.

At the end, show the final sorted result clearly, plus a summary (total comparisons used vs. theoretical minimum).

UX / Usability Requirements

Clean, uncluttered, modern interface — avoid visual noise. This should feel like a polished teaching tool, not a debug console.

Responsive layout that works reasonably on both desktop and smaller screens.

Use color and spacing meaningfully (e.g., consistent colors for "main chain" vs "pending" vs "currently active" elements) — include a small legend.

Avoid overwhelming the user with all the theory at once; let the step explanations build understanding progressively.

Consider a brief, optional "What is Ford-Johnson sort?" intro/collapsible panel for context before diving into the visualization, aimed at someone who's heard of it in a 42 project but wants a refresher.

Keyboard shortcuts for Next/Back (e.g., arrow keys) are a nice touch but not mandatory.

No jarring layout shifts or flickering during step transitions — use smooth, subtle animations for state changes.

Deliverable

A single self-contained set of files (or a single HTML file with embedded CSS/JS if that keeps things simplest) that:

Runs directly in a browser with no build tools or server.

Lets a user input or randomize a list of numbers.

Correctly executes Ford-Johnson sort on that list.

Walks the user through every step of the algorithm with clear visuals, plain-language explanations, and full back/forward navigation.

Handles bad input without breaking.

If Anything Is Unclear

Before writing code, ask about anything genuinely ambiguous — for example: whether decimals/negatives should be supported, whether duplicate values should be allowed, the preferred visual style (minimalist/dark mode/etc.), and the maximum input size you should design around. Don't guess silently on decisions that would meaningfully change the scope or algorithm behavior.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/348bf2e0-1589-492c-aa53-1ddf48b5232e).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
