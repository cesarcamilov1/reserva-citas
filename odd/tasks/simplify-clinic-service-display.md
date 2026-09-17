# Simplify clinic and service display

## Objective

Show the configured clinic without a location selector or address, and omit service descriptions from the booking flow.

## Problem and why

The clinic step currently asks patients to select a location and repeats its address. Service cards also show descriptions. The requested booking experience should present only the clinic name and the essential service details.

## Scope

- Automatically use the default active clinic, falling back to the first returned clinic.
- Remove the clinic selector and every patient-facing clinic address in the booking flow.
- Remove service descriptions from service cards.
- Preserve loading, error, retry, navigation, pricing, and duration behavior.

## Constraints

- Do not change API/domain contracts; this is a presentation and flow-defaulting change.
- Never replace an already selected clinic during rerenders or retries.
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

- [x] **CLINIC-1 — Make clinic selection implicit and show only its name**
  - Prefer the default clinic, fall back to the first clinic, and preserve an existing selection.
  - Remove the clinic selector and clinic addresses from the booking UI.
  - Update component and integration tests.
  - Checks: focused clinic/booking tests, lint, build.
  - Checks: `pnpm test:run` — 29 files/155 tests passed; `pnpm lint` — passed with 4 pre-existing warnings; `pnpm build` — passed.
  - Commit: `a7777c4` (`feat(booking): simplify clinic selection`).
  - RDD assessment: medium; deferred to the feature-ending PR slice.
- [ ] **SERVICE-1 — Hide service descriptions**
  - Remove description rendering and the now-unused presentation contract/style.
  - Add an assertion that descriptions are absent while core service details remain.
  - Checks: focused service tests, lint, build.
  - Commit: pending.
  - RDD assessment: pending.

## Acceptance criteria

- The clinic step has no select/combobox and displays only the chosen clinic name.
- No clinic address is visible in the booking flow.
- The default clinic is selected automatically; the first clinic is the fallback.
- Service cards do not display descriptions.
- Loading, retry, and full booking flow tests remain green.

## Progress and evidence

- Exploration completed with CodeGraph; removing the selector requires implicit clinic selection because step validity and downstream queries depend on `clinicId`.
- CLINIC-1 completed: the default clinic is selected automatically with a first-location fallback, and the UI no longer exposes clinic selectors or addresses.

## Next step

Implement and verify SERVICE-1.
