type IconProps = { className?: string }

const base = {
  width: 22,
  height: 22,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.7,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
}

export const SetupIcon = ({ className }: IconProps) => (
  <svg {...base} className={className}>
    <path d="M4 6h16M4 12h16M4 18h16" />
    <circle cx="9" cy="6" r="2.2" fill="currentColor" stroke="none" />
    <circle cx="15" cy="12" r="2.2" fill="currentColor" stroke="none" />
    <circle cx="8" cy="18" r="2.2" fill="currentColor" stroke="none" />
  </svg>
)

export const TodayIcon = ({ className }: IconProps) => (
  <svg {...base} className={className}>
    <rect x="3" y="10" width="4" height="9" rx="1.2" />
    <rect x="10" y="6" width="4" height="13" rx="1.2" fill="currentColor" stroke="none" />
    <rect x="17" y="13" width="4" height="6" rx="1.2" />
  </svg>
)

export const IdeasIcon = ({ className }: IconProps) => (
  <svg {...base} className={className}>
    <path d="M12 3c3.6 0 6.2 2.6 6.2 6 0 2.3-1.2 3.6-2.1 4.7-.6.7-.9 1.3-.9 2.1v.4H8.8v-.4c0-.8-.3-1.4-.9-2.1C7 12.6 5.8 11.3 5.8 9 5.8 5.6 8.4 3 12 3Z" />
    <path d="M9.6 20h4.8" />
  </svg>
)

export const SearchIcon = ({ className }: IconProps) => (
  <svg {...base} className={className}>
    <circle cx="11" cy="11" r="6.2" />
    <path d="m15.6 15.6 3.6 3.6" />
  </svg>
)

export const PlusIcon = ({ className }: IconProps) => (
  <svg {...base} className={className} width={18} height={18}>
    <path d="M12 5v14M5 12h14" />
  </svg>
)

export const ArrowIcon = ({ className }: IconProps) => (
  <svg {...base} className={className} width={18} height={18}>
    <path d="M5 12h13M12.5 6l5.5 6-5.5 6" />
  </svg>
)

export const CloseIcon = ({ className }: IconProps) => (
  <svg {...base} className={className} width={16} height={16}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
)

export const CheckIcon = ({ className }: IconProps) => (
  <svg {...base} className={className} width={15} height={15} strokeWidth={2.4}>
    <path d="m5 12.5 4.5 4.5L19 7" />
  </svg>
)

export const LeafIcon = ({ className }: IconProps) => (
  <svg {...base} className={className} width={26} height={26}>
    <path d="M20 4c0 9-5 13-11.5 13H5c0-8 5.5-11.5 15-13Z" />
    <path d="M5 20c1.8-4.6 5-7.6 9.5-9.3" />
  </svg>
)
