# Citas — Appointment Booking Flow

A responsive, five-step medical appointment booking flow (clinic, service,
schedule, patient data, confirmation), ported from a static desktop design
into a fully working React + TypeScript app.

## Stack

- Vite + React 19 + TypeScript (strict mode)
- CSS Modules only, all design tokens as CSS custom properties
  (`src/styles/tokens.css`) — no Tailwind, no CSS-in-JS, no UI library
- Vitest + React Testing Library for tests

## Commands

```bash
pnpm install       # install dependencies
pnpm dev           # start the dev server
pnpm build         # type-check (tsc -b) and build for production
pnpm preview       # preview the production build
pnpm test          # run tests in watch mode
pnpm test:run      # run tests once (CI mode)
pnpm lint          # oxlint
```

## Architecture

Feature-first, with the domain layer isolated from React so it can be
tested with no DOM:

```
src/
  styles/
    tokens.css       design tokens (colors, spacing, radii, shadows, type)
    global.css       Inter font import, base element styles
    colorMix.ts       pure mixWithWhite/mixWithBlack helpers used to derive
                      the accent's soft/line/dark variants (values baked
                      into tokens.css)
  features/booking/
    domain/           pure TypeScript, zero React imports
      types.ts         shared domain types
      clinics.ts        clinic catalog
      services.ts       service catalog
      availability.ts   open days, calendar grid, time slots, date formatting
      appointment.ts     end-time math, booking folio
      validation.ts      per-step validation rules
      whatsapp.ts         confirmation message builder
    application/
      useBookingFlow.ts  all booking state + transitions (the only
                         stateful piece of the feature)
    ui/
      atoms/            Button, TextField/PhoneField, SelectField, icons
      molecules/        ServiceCard, DayCell, TimeSlotButton, SummaryItem,
                        ConfirmRow, WhatsappBubble, StepperStep
      organisms/        one component per step (StepClinic, StepService,
                        StepSchedule, StepPatient, StepConfirm, StepDone),
                        plus DoctorHeader, SummaryRail, Stepper, Footer
      BookingFlow.tsx    container that wires useBookingFlow to the
                        organisms; the only place that reads domain +
                        application state to build view props
  App.tsx, main.tsx
```

Presentational components (`ui/atoms`, `ui/molecules`, `ui/organisms`)
receive data and callbacks through props only and hold no business logic.

## Responsive breakpoints

Mobile-first CSS with `min-width` media queries at `640px` and `1024px`:

- **Desktop (≥1024px)** — two-column layout, 288px rail beside the main
  column, card capped at 988px and centered.
- **Tablet (640–1023px)** — single column; the rail's summary becomes a
  horizontal strip of three items above the step content.
- **Mobile (<640px)** — full-bleed card, the five-dot stepper collapses
  into a "Paso N de 5" progress bar, the rail summary becomes a
  collapsible panel (closed by default), and the Atrás/Continuar footer is
  sticky at the bottom of the viewport with a safe-area inset.

## Notes / decisions not spelled out in the original design

- The design's `jumpTo` demo helper (which pre-fills earlier steps with
  placeholder data when jumping ahead) was a prototype-only affordance and
  was not ported — the stepper only allows navigating to steps already
  reached.
- The WhatsApp message builder degrades field-by-field (e.g. "Fecha por
  confirmar", "Sede por confirmar") instead of falling back to the
  prototype's hardcoded demo name, since the app now has real form state.
- The accent's soft/line/dark color variants are computed once (see
  `src/styles/colorMix.ts` and its test) and the resulting hex values are
  hardcoded into `tokens.css`, since the app doesn't need runtime theming.
