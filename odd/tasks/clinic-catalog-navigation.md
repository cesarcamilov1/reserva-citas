# Clinic defaults and service navigation

## Objective and scope

Remove the clinic placeholder, default to Cuernavaca, and make a 39-service catalog easier to navigate without losing selection context. Keep the clinic selector, name-only option labels, address details, prices/durations, and hidden service descriptions.

## Decisions and constraints

- Select Cuernavaca by name (case-insensitive), then address if needed; no hardcoded remote ID. If absent, use the API default or first available clinic. Never override a user's subsequent choice. Resetting a booking reapplies the default.
- Service search ignores case/accents. Show a short page of results with counts and navigation. Preserve selection on search/page changes, without an extra selected-service panel below pagination (explicit user correction).
- No invented categories, no API or dependency changes, no remote access. Existing Spanish UI copy stays Spanish.
- Scope authorized by the current user request. Earlier manual-only default policy is superseded by the explicit Cuernavaca request; other clinic details remain unchanged.

## Workflow and delivery

- TDD: unconfigured; retain ordinary functional verification as in prior task. Runner: `pnpm test:run` (Vitest/jsdom).
- Branch: `feat/simplify-clinic-service-display`; baseline for this feature: `75279f5`. Last reviewed boundary: none; branch point `1b2792d`.
- RDD: enabled globally; consent still pending. Assess work-unit commits, without starting review unless granted.
- Delivery: `ask-on-risk`. Initial forecast was low; the verified implementation plus regression coverage exceeds the accumulated branch review budget. Chain strategy must be chosen before work-unit commits.
- Checks: focused component/integration tests, full tests, lint, build, diff whitespace. Browser verification if locally available; do not substitute jsdom for visual evidence.

## Tasks and acceptance

- [ ] **CLINIC-1 — Default to Cuernavaca**
  - Remove placeholder; select Cuernavaca after load, retaining manual changes and resetting defaults for a new booking.
  - Keep displayed selection, service queries, and booking payload consistent. No clinics means Continue stays disabled.
  - Verify preferred location despite API order/default, manual change, absent Cuernavaca fallback, reset/empty/loading/error behavior.
  - Implementation verified; commit pending chain-strategy selection. Native review remains pending consent.
- [ ] **SERVICE-1 — Make the catalog navigable**
  - Labeled search, short result pages with count, clear/no-results/empty states and keyboard-operable controls. Remove the extra selected-service panel; keep selected-card state and the existing booking summary unchanged.
  - Maintain price/duration, selection callbacks, loading/error/retry and hidden descriptions.
  - Verify with 39 services, accent-insensitive search, later-page selection, clear/no-match behavior, preserved selection and correct Continue flow.
  - Implementation verified; commit pending chain-strategy selection. Native review remains pending consent.

## Progress and evidence

- User refinement implemented: removed only the extra "Servicio seleccionado" panel below pagination and its unused styles/lookup. Regression verifies no extra panel and retained selected-card state after page/filter changes. Full suite: 29 files/166 tests passed; build and whitespace check passed; lint retains four existing warnings. Browser checks below predate this panel removal; not rerun for this small correction. Commit/chain choice remains pending; no repeat prompt.
- CodeGraph inspection confirmed an unbounded list and no category field in the service contract. Cuernavaca IDs are not present in local source; do not invent one or query unauthorized remote endpoints.
- Browser proof: local Brave/CDP with intercepted fixture APIs (39 services), no external API access or new dependencies. Passed at 1280px desktop and 390px/320px mobile: default selection, all pages, long names/no overflow, accent search, no matches/clear, retained selection, Continue to schedule. Harness: `/tmp/citas-catalog-check.mjs`; screenshots: `/tmp/citas-services-*.png`.
- Functional checks: `pnpm test:run` — 29 files/166 tests passed; `pnpm build` passed; `pnpm lint` passed with the same four existing hook warnings; `git diff --check` passed.
- Initial integration run caught a timing assumption: select presence preceded the default effect. Updated the test to wait for the selected Cuernavaca value; full suite passed afterward.
- Focused checks: clinic 14 tests; service 9 tests. Test-only accessible-name assertion was corrected during service implementation.
- Changed `src/App.test.tsx` to expect the truthful no-clinics message instead of an empty selector.
- Rollback boundaries: clinic default/placeholder changes independently of service navigation and its styles/tests.

## Next step

User choice required before commits: chain strategy under ask-on-risk. Proposed independent slices: clinic default with its tests/documentation, then service navigation with its tests/styles. No commits, PRs, push, or native review executed for this new feature. Preserve both implemented tasks while waiting.
