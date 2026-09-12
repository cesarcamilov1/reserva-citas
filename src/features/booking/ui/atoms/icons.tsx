import type { SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement> & { size?: number }

function base(size: number, props: IconProps) {
  return {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none' as const,
    'aria-hidden': true,
    ...props,
  }
}

export function LocationIcon({ size = 18, ...props }: IconProps) {
  return (
    <svg {...base(size, props)} stroke={props.stroke ?? 'currentColor'} strokeWidth={props.strokeWidth ?? 1.6} strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  )
}

export function StethoscopeIcon({ size = 18, ...props }: IconProps) {
  return (
    <svg {...base(size, props)} stroke={props.stroke ?? 'currentColor'} strokeWidth={props.strokeWidth ?? 1.6} strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 3v6a6 6 0 0 0 12 0V3" />
      <path d="M4 3h4" />
      <path d="M16 3h4" />
      <path d="M12 15v2a4 4 0 0 0 8 0v-1" />
      <circle cx="20" cy="13" r="2" />
    </svg>
  )
}

export function CalendarIcon({ size = 18, ...props }: IconProps) {
  return (
    <svg {...base(size, props)} stroke={props.stroke ?? 'currentColor'} strokeWidth={props.strokeWidth ?? 1.6} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18" />
      <path d="M8 3v4" />
      <path d="M16 3v4" />
    </svg>
  )
}

export function ChevronDownIcon({ size = 18, ...props }: IconProps) {
  return (
    <svg {...base(size, props)} stroke={props.stroke ?? 'currentColor'} strokeWidth={props.strokeWidth ?? 1.7} strokeLinecap="round" strokeLinejoin="round">
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}

export function ChevronLeftIcon({ size = 16, ...props }: IconProps) {
  return (
    <svg {...base(size, props)} stroke={props.stroke ?? 'currentColor'} strokeWidth={props.strokeWidth ?? 1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="m15 18-6-6 6-6" />
    </svg>
  )
}

export function ChevronRightIcon({ size = 16, ...props }: IconProps) {
  return (
    <svg {...base(size, props)} stroke={props.stroke ?? 'currentColor'} strokeWidth={props.strokeWidth ?? 1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="m9 18 6-6-6-6" />
    </svg>
  )
}

export function CheckIcon({ size = 18, ...props }: IconProps) {
  return (
    <svg {...base(size, props)} stroke={props.stroke ?? 'currentColor'} strokeWidth={props.strokeWidth ?? 2} strokeLinecap="round" strokeLinejoin="round">
      <path d="m5 13 4 4L19 7" />
    </svg>
  )
}

export function WhatsappIcon({ size = 16, ...props }: IconProps) {
  return (
    <svg {...base(size, props)} stroke={props.stroke ?? 'currentColor'} strokeWidth={props.strokeWidth ?? 1.7} strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 8.9 8.9 0 0 1-4-1L3 20l1.2-4.8A8.4 8.4 0 0 1 12 3a8.4 8.4 0 0 1 9 8.5Z" />
    </svg>
  )
}

export function DoubleCheckIcon({ size = 14, ...props }: IconProps) {
  return (
    <svg {...base(size, props)} stroke={props.stroke ?? 'currentColor'} strokeWidth={props.strokeWidth ?? 2} strokeLinecap="round" strokeLinejoin="round">
      <path d="m3 13 3.5 3.5L13 10" />
      <path d="m11 16 1 1 8-8" />
    </svg>
  )
}
