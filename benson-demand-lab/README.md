# Benson Demand Lab

A local, interactive SCU ECON 101 / MGMT 173 prototype: relative menu demand → uncertain portions → staff preparation decisions → synthetic service → learning update.

## Run

Requires Node.js 22.12+ (or 24+) and pnpm. Dependencies are already installed in this checkout.

```sh
cd /Users/johnryanmyrdal/Documents/ChatGPT/Registry/benson-demand-lab
./run-local.sh
```

Open http://127.0.0.1:5173. The launcher also recognizes the installed Codex Node runtime if `node` is absent from PATH. If port 5173 is busy, Vite prints its alternative port; use that printed URL. For a fresh installation:

```sh
pnpm install
pnpm run dev
```

Build and test on a normal Node installation:

```sh
pnpm test
pnpm run build
```

On this machine, Node is bundled with Codex; put it on PATH first if running pnpm scripts directly:

```sh
export PATH="$HOME/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH"
pnpm test
pnpm run build
```

No backend, authentication, live model, external database or runtime network dependency. Completed history and learned estimates persist in this browser's localStorage. Pending sandbox edits and uncompleted approvals are session-only. Changing origin/port uses separate browser storage. Reset requires confirmation. Invalid or incompatible saved history resets safely; storage failures show a notice. Nothing is deployed or submitted.

## Guided demonstration

1. Reset demo; select Week 1, Monday.
2. Inspect all four stations. Change Fire Grill from Smash burger to Tuna melt. This opens an isolated what-if sandbox.
3. All four demand quantities and shares change together. Inspect the comparison chart and shared-ingredient changes; total primary selections still equals traffic. Try closing a station or entering zero traffic.
4. Compare static allocation, availability buffers and smaller opening batches. Inline values show expected unserved surplus, unmet demand and the probability any station is short. Adjust station quantities, then approve a plan. The quantities affect ingredients and risks, never true demand.
5. Return to original; choose/approve the replay preparation plan. Complete Service & Update Model freezes the forecast and decision, reveals synthetic demand, scores the original forecast and updates the model.
6. Open Demand & accuracy. Read the calculation-backed update; select completed days to compare original forecast and observed station portions. Ingredients & records contains the ledger and inspectable per-serving recipes.
7. Run remaining days in a week or play/pause the five-week demonstration (one service about every 2.2 seconds). Auto replay honors the selected plan for the exact next service, then uses forecast quantities as preparation for later services. Compare Week 1 and Week 5. Reset again for a live presentation.

Future services can be planned with the current available model, but observations and error scores stay hidden until chronological replay reaches them. Historical what-ifs use the original model snapshot. Sandbox edits never change the replay dataset or evaluation; return to original before completing a replay service.

## Numerical mechanism

`src/engine.ts` is the numerical boundary. `ForecastAdapter` and `demonstrationAdapter` expose initial state, forecasting, simulation and completion. UI state and presentation are in `src/main.tsx`; no engine method depends on React, network calls or browser storage. A future real model can replace the adapter, with state-schema migration and honest observation handling; no agent integration is implemented.

For each offered dish, estimated dish appeal plus a station-by-weekday effect is converted through softmax into a coherent choice share across the whole available menu. Dish appeal implicitly represents its attributes in this small demonstration; there is no learned nutrition/attribute model. Largest-remainder allocation makes integer portions sum exactly to expected traffic. Closed or unknown dishes are unavailable. When every station is closed, zero portions are allocated and expected diners remain outside the modeled service.

There is one primary selection per simulated diner. This simplification does not assert real students visit only one station. Shared ingredients aggregate grams per serving × portions, converted to kilograms by dividing by 1,000. Dry/cooked ingredients are explicitly distinguished. Recipe yield is assumed to be 100% usable; no purchasing optimizer or nutritional/allergen guidance is included.

Each completed service:

1. Copies the pre-service model and freezes its forecast (no outcome access).
2. Reveals independently seeded synthetic true demand. Synthetic true traffic is generated from the scheduled traffic, not an editable forecast input. Menu availability changes relative choice; staff capacity never changes true demand.
3. Scores original forecasts against uncapped demand, not capacity-capped sales.
4. Updates each offered dish's appeal by `0.75 × log(observed share / forecast share)` and its station-by-weekday effect by `0.12 × the same residual` (shares clamped at 0.001). With no observed choices, parameters remain unchanged.
5. Stores both model snapshots, original adaptive and static-baseline predictions, exact preparation quantities, outcomes and an explanation. Earlier records never change.

The static forecast baseline uses the initial model on the same menu and predicted traffic. MAE = sum of absolute station-portion errors ÷ four stations; weekly/overall MAE averages evaluated services only. `wape()` is available but not displayed: total absolute error ÷ observed demand; null for a zero denominator. Nothing is labeled unexplained “accuracy.”

800 reproducible Monte Carlo samples vary total traffic (7% Gaussian relative standard deviation) and log choice weights (0.14 Gaussian standard deviation); counts stay nonnegative integers and sum to each sampled total. They are illustrative distributions, not calibrated confidence. Ranges are marginal 10th–90th percentiles and need not add to the point estimate.

Preparation comparison uses the same samples: expected surplus is mean positive preparation-minus-demand; expected unmet is mean positive demand-minus-preparation; shortage probability is the fraction with any station unmet. Static allocation splits traffic equally; buffer uses the 80th percentile; smaller batches open at 75% of point demand with feasible replenishment to 100%. The comparison assumes the full final capacity is available by the time it is needed, so it does not simulate arrival queues or replenishment delays. Staff overrides directly change final capacity. Unserved surplus is not measured disposal or plate waste.

## Provenance and limits

Four station names are preserved in the workspace: **Fire Grill** (John's November 10 correction), The Chef’s Table, The Garden and The Spice Market. The public SCU page labels the fire examples under “The Fire”; the app uses John's requested name consistently, including charts. No other station is renamed or abbreviated.

SCU menu source: https://scudining.cafebonappetit.com/ (checked November 10, 2026; local metadata and example pool cached in `engine.ts`). Sourced examples include Signature Smash Burger, Fried Chicken Sandwich, Tuna Melt, Build Your Own Caribbean Harvest Bowl, the full root-vegetable/kale pasta salad and Crispy Tofu Sisig. Long dish names have friendly display names and full details. Additional dishes are explicitly fictional. Some source dishes were listed in dinner/all-day periods; **all 25 weekday lunch schedules are invented**.

All traffic, weights, yields, appeal, preparation capacities and outcomes are synthetic assumptions. These are sample recipes informed by dish names/descriptions, not complete official recipes or verified ingredient lists. There are no real student records, staff tests, waste reduction measurements or validated operational forecasts. Staff timing feasibility, real-data calibration and empirical waste benefits remain future work. Future Claude-agent burst learning is an extension idea only; there are no live agents, keys or fabricated training activity.

## Verification

See `VERIFICATION.md` for the completed test and browser-review scope. Tests and charts calculate weekly errors from frozen predictions rather than hard-coding improvement. The independent reviewer accepted repairs to historical chart isolation, stored-plan labeling, auto replay decisions, sandbox comparisons and nested persistence validation.

## Forecast visuals and first-time guidance — November 10 revision

Daily planning now starts with a four-step route: **Choose the menu → Explore the forecast → Choose preparation → Reveal & learn**. Each step takes you directly to its workspace. Graphs are visible immediately, before any completed service. Menu/traffic edits show a prominent what-if banner with a return action; a button beside the menu returns directly to the updated paths.

The forecast panel provides:

- **During this lunch:** 32 spaghetti trajectories from 800 seeded scenarios, an empirical 80% range, expected cumulative primary demand and a dashed total-service preparation-capacity line. The invented 15-minute arrival pattern is independent of outcomes; paths are monotone, and their endpoints equal the existing Monte Carlo demand samples. All-station trajectories and expected lines exactly sum the four station counts at every time point.
- **Next 5 lunches:** all paths start at the same selected-day forecast (the fixed “Today” anchor), then diverge across up to four following fictional menus using one frozen model. Today’s selected estimate is treated as a known scenario input, not a claim of observed demand. No future observations or updates enter the forecast. Only the selected day reflects current what-if edits; later days use their scheduled menus. There is no capacity line for unplanned future days. Near the end, the horizon truncates explicitly.
- Station filters retain full names; an All stations filter checks shortage probability at individual stations rather than masking deficits with aggregate capacity.
- A plain-language reading panel, clear units, descriptive tooltips, a path-visibility control, and a surplus-versus-unmet-demand chart for all three preparation plans.

These cumulative paths describe **requested primary portions**, not capacity-capped sales. The dashed line is total final service capacity, not stock available at opening. Arrival timing, queues and replenishment delays are not validated or modeled. The new lookahead module is pure and cannot reveal observations or update learning.


## Unified demand and accuracy — November 11 revision

Open **Demand & accuracy**. Choose a week/day using Selected service, choose a full-name station (or All stations), and inspect a time with the dropdown or keyboard-accessible slider. The original prediction, synthetic observed count and signed direction of difference share that checkpoint. **By this time** shows cumulative primary requested portions; **15-minute intervals** shows requests during the interval ending at the selected time. The two series share a chart and colors throughout. Upcoming observations are absent rather than zero, with a direct reveal/go-next action. Completing a service from planning opens the comparison view.

The same station selection controls the final-service error history, baseline comparison and weekly summary below. Per-station error is absolute predicted-minus-observed portions at 2:30 p.m. All stations uses the mean absolute error across four stations; the intraday All stations timeline instead sums primary demand. Both definitions are explicit because aggregate demand error can conceal station misallocation. Moving the time control does not change endpoint accuracy scores.

Forecasts now store a 15-checkpoint × four-station arrival profile before observations are revealed. Synthetic observed timing is independently seeded after reveal, monotone, and sums exactly to each original observed station total. All-station profiles sum station records at every checkpoint. The model updates dish appeal and weekday choice estimates; overall traffic remains an input, and the fixed arrival pattern is not learned. Intraday shape improvement is not established by endpoint learning.

Older complete local histories are migrated without changing final predictions, observed totals, decisions or endpoint scores. Their added timing is labeled reconstructed; partial/corrupt profiles are rejected. New histories store both profiles directly. All timing is synthetic and generated from service totals, not measured transactions. Current user-facing explanations preserve this distinction.

Station selection is shared between planning and results, so opening a station's forecast comparison retains that station. Changing the selected day within Demand & accuracy retains the chosen time checkpoint. Tabs return to their workspace heading, and the Menu & preparation shortcut goes directly to editable inputs.
