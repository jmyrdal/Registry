# Verification — November 10, 2026

- TypeScript compilation and Vite production build passed.
- 29 Vitest tests passed, independently rerun by the critic.
- Tests cover integer demand reconciliation; closed/all-closed/unknown stations; zero traffic; competitor substitution; shared grams/kg ingredients; pre-outcome forecasts; revealed-only updates; frozen historical forecasts; preparation-independent true demand; editable-traffic-independent true demand; deterministic replay/reset; persistence round trip; 17 malformed-inner persistence cases; baseline/MAE/WAPE arithmetic; isolated what-if simulation; 800 coherent seeded samples; preparation risk changes; and broad computed five-week improvement.
- Browser verified: actual app served on loopback; competing-dish change redistributed demand (640 total; burger→tuna changes station portions from 206/156/125/153 to 141/179/144/176); zero traffic cleared all portions, plan quantities and risks; four closures cleared allocation; return-to-original restored inputs; approval and complete-service stored 713 portions and the original forecast; reload restored saved service history; week replay, paced playback/pause and all 25 services worked; completed chart/weekly summaries rendered; recipe/ingredient ledger and source dialog checked.
- Responsive visual checks: normal 1366px laptop/projector layout and 390px mobile layout. No page horizontal overflow at 390px. Mobile chart labels changed to horizontal bars so full station names remain readable. Line-chart axis label clipping repaired; animations disabled for stable screenshot values. Keyboard focus, native select/checkbox controls, dialog Escape and focus containment implemented.
- Independent critic identified five material issues, all repaired and re-reviewed: immutable original chart data after what-if changes; accurate stored staff-plan display; approved next-service preparation retained by automatic replay; explicit before/after shares and risk metrics; robust nested saved-state validation.

Computed weekly MAE (portions per station):

| Week | Evaluated lunches | Adaptive MAE | Non-learning baseline MAE |
|---|---:|---:|---:|
| 1 | 5 | 60.20 | 78.50 |
| 2 | 5 | 23.80 | 72.80 |
| 3 | 5 | 15.85 | 71.85 |
| 4 | 5 | 14.80 | 81.20 |
| 5 | 5 | 15.70 | 73.90 |

Week 5 is slightly worse than Week 4. This is retained simulation variability; the curve is not forced to descend. Results are synthetic, not evidence of Benson forecasting performance or waste reduction. No actual staff walkthrough, real-data validation, deployment, live agent integration or assignment submission occurred.

## Forecast-first visual revision

36 tests pass: the original 29 plus seven lookahead tests covering monotone trajectories and exact sample endpoints; exact cross-station reconciliation at each time point; deterministic paths unaffected by preparation edits; zero/all-closed clearing; five-menu fixed-model forecasts with no training/reveal; historical model snapshots, selected-day-only what-if scope and end-of-demo truncation; and an exact common left anchor for every five-lunch path and its band. TypeScript and Vite production build rerun after the revision.

Independent critic accepted the new paths after clarifying requested demand versus portions served, total service capacity versus opening inventory, aggregate versus station shortages, and exact intermediate rounding. New UI introduces a four-step navigation strip and visible forecasts before any service is revealed. Browser checks cover horizon switch, station filters, path visibility, preparation overlay updates, what-if reset, all-three-plan chart, first-time navigation and mobile layout. No actual first-time staff usability study is claimed.

At John’s follow-up request, every five-lunch path starts at the same selected-day estimate, then diverges from the following lunch. The anchor is explicitly an estimate treated as a fixed scenario input; no observed result is fabricated. The day-mode readout shows the following lunch’s range and the fixed-anchor explanation rather than a misleading zero-width “80% range” for today. Critic accepted this revision and independently reran all 36 tests.


## Unified comparison revision — November 11, 2026

44 tests pass, including eight new timing/comparison cases. Pre-service profiles are stored before reveal; observed profiles are independently generated afterward. Tests verify zero starts, monotone integer checkpoints, exact endpoints and cross-station sums, independent timing, hidden unrevealed data, frozen profiles across later updates/what-ifs, per-station and mean-station errors, explicit legacy migration preserving totals, and corrupt-profile rejection. Existing simulation/learning tests retain their original results. TypeScript and Vite production build pass; chart bundle remains about 723 kB raw / 214 kB gzip.

The actor implemented the timeline/metric layer; independent critic reviewed the formulas, leakage boundaries, conservation, saved-state migration and unified UI, reran 44 tests and TypeScript, and accepted repairs. Root implemented the UI and verified the running app: no observed values before reveal; day/station/time filters; cumulative and 15-minute interval views; keyboard slider; exact checkpoint differences; daily/weekly station-specific error history; all-station metric distinctions; chronological reveal/go-next; full 25-service replay; original forecast isolation after historical what-if edits; stored history restored after reload. 1366 px laptop and 390 px mobile layouts inspected; no horizontal mobile overflow. Mobile difference-card spacing corrected after visual inspection.

Concrete browser check: Week 1 Monday Fire Grill at 12:30 p.m. shows original predicted 103 versus synthetic observed 200 primary portions (97 underpredicted); its final-service station error remains 169 portions. A historical tuna-menu what-if did not replace the original 206 portion final forecast. First-five Fire Grill endpoint error averages 106 portions versus 20.8 over the latest five in this seeded replay; these figures are synthetic, not evidence of actual Benson forecasting performance.

No live operational data or staff usability study was introduced. The previous 36-test visual revision remains historical evidence; current scope has 44 tests.

Final state-context check: The Spice Market selected in planning carried into Demand & accuracy; a 12:30 p.m. checkpoint stayed selected when moving from Week 1 to Week 2. Critic independently accepted these shared-state changes. Final browser console check returned no errors. The local demo is left with 25 completed synthetic services so comparison and accuracy charts are immediately inspectable.
