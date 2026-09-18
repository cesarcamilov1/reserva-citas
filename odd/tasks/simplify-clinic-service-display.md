# Simplify clinic and service display

## Objective

Keep the clinic selector and selected-clinic details; show only the clinic name inside each select option. Keep service descriptions hidden.

## Problem and why

The previous implementation misunderstood the request and removed the selector and all addresses. The user clarified that only addresses inside select options should be hidden; everything else was already correct.

## Scope

- Restore manual clinic selection and the original selected-clinic details, summary, confirmation, and WhatsApp address.
- Render clinic names only inside select options.
- Remove service descriptions from service cards.
- Preserve loading, error, retry, navigation, pricing, and duration behavior.

## Constraints

- Do not change API/domain contracts; this is a presentation-only change.
- Do not auto-select a clinic; preserve the original manual selection behavior.
- Zero returned clinics must keep the first step invalid.

## Authorized scope

The user's request explicitly authorizes implementation of these booking UI changes and their tests.

## Delivery and testing

- TDD mode: unconfigured; use ordinary functional checks.
- Test runner: `pnpm test:run`.
- RDD: enabled globally; assess each work-unit commit from boundary `1b2792d`.
- Delivery strategy: `ask-on-risk`.
- Forecast: about 180 authored changed lines, below the 400-line review budget.

## Tasks

- [x] **CLINIC-1 — Restore selection and hide only option addresses**
  - Reopened after explicit user correction: the original implementation exceeded scope.
  - Restore the clinic selector, heading, selected name/address card, and address consumers.
  - Remove automatic default selection; keep only clinic names in option labels.
  - Restore original flow tests and add regression coverage for option text, manual selection, and selected details.
  - Prior rejected implementation: `a7777c4`.
  - Checks: focused tests 11/11 passed; full suite 29 files/154 tests passed; build passed; lint passed with the same 4 existing warnings; diff whitespace check passed.
  - Initial build rejected an unsupported test query option; replaced it with an anchored name regex and reran tests/build successfully.
  - Runtime evidence: jsdom booking-flow interaction tests passed; browser visual check not run.
  - Rollback: this correction restores clinic files only; service changes are independent.
  - Correction commit: pending.
  - RDD: prior candidate consent not granted; reassess corrected candidate.
- [x] **SERVICE-1 — Hide service descriptions**
  - Remove description rendering and the now-unused presentation contract/style.
  - Add an assertion that descriptions are absent while core service details remain.
  - Checks: focused service tests, lint, build.
  - Checks: `pnpm test:run` — 29 files/155 tests passed; `pnpm lint` — passed with 4 pre-existing warnings; `pnpm build` — passed.
  - Commit: `930a0db` (`feat(booking): hide service descriptions`).
  - RDD assessment: medium; included in the feature-ending PR slice.

## Acceptance criteria

- The clinic select remains functional and its options contain names only.
- Selecting a clinic displays the original name/address details and enables Continue.
- No clinic is selected automatically; original summary and confirmation addresses remain.
- Service cards do not display descriptions.
- Loading, retry, and full booking flow tests remain green.

## Progress and evidence

- Exploration completed with CodeGraph; removing the selector requires implicit clinic selection because step validity and downstream queries depend on `clinicId`.
- CLINIC-1 previous completion invalidated by user correction; restore original behavior except select option text.
- SERVICE-1 completed: service descriptions are no longer part of the card presentation contract or rendered output.
- Prior candidate was 231 authored lines. The corrected candidate removes the unintended clinic source changes; delivery remains below 400 lines.

## Next step

Correction implemented and functionally verified. Native review remains pending user consent; no review approval is claimed.
