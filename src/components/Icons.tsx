type P = { className?: string };

const base = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "square" as const,
  strokeLinejoin: "miter" as const,
};

export const LogoMark = ({ className }: P) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
    <rect x="2" y="2" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.4" />
    <path
      d="M5.5 9 12 4.6 18.5 9"
      fill="none"
      stroke="#c9a44c"
      strokeWidth="1.5"
      strokeLinecap="square"
      strokeLinejoin="miter"
    />
    <path d="M6 11.2h12" stroke="currentColor" strokeWidth="1" opacity="0.5" />
    <path
      d="M7.4 11.2v6.3M10.5 11.2v6.3M13.5 11.2v6.3M16.6 11.2v6.3"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="square"
    />
    <path d="M5.5 17.5h13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="square" />
    <rect x="16.8" y="18.6" width="1.7" height="1.7" fill="#22c49c" stroke="none" />
  </svg>
);

export const IconCrane = ({ className }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...base} aria-hidden="true">
    <path d="M5 21h14" />
    <path d="M9 21V4" />
    <path d="M9 4h10" />
    <path d="M9 4 6 8h3" />
    <path d="M17 4v6" />
    <path d="M15.4 10a1.6 1.6 0 0 0 3.2 0" />
    <path d="M5 21v-4h3v4" />
    <path d="M13 21v-3h3v3" />
  </svg>
);

export const IconScale = ({ className }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...base} aria-hidden="true">
    <path d="M12 4v14" />
    <path d="M8 21h8" />
    <path d="M4 7h16" />
    <path d="M4 7 2.3 11.3" />
    <path d="M4 7l1.7 4.3" />
    <path d="M2.3 11.3a1.8 1.8 0 0 0 3.4 0" />
    <path d="M20 7l-1.7 4.3" />
    <path d="M20 7l1.7 4.3" />
    <path d="M18.3 11.3a1.8 1.8 0 0 0 3.4 0" />
    <path d="M9.5 18h5" />
  </svg>
);

export const IconSolar = ({ className }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...base} aria-hidden="true">
    <circle cx="12" cy="6" r="2.6" />
    <path d="M12 1.4v1.1" />
    <path d="M12 9.5v1.1" />
    <path d="M16.6 6h1.1" />
    <path d="M6.3 6h1.1" />
    <path d="M15.3 2.7l-.8.8" />
    <path d="M8.7 2.7l.8.8" />
    <rect x="4" y="13" width="16" height="7.5" />
    <path d="M4 16.7h16" />
    <path d="M9.3 13v7.5" />
    <path d="M14.7 13v7.5" />
  </svg>
);

export const IconDeal = ({ className }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...base} aria-hidden="true">
    <rect x="3.5" y="7.5" width="17" height="12" />
    <path d="M9 7.5V5.8A1.8 1.8 0 0 1 10.8 4h2.4A1.8 1.8 0 0 1 15 5.8v1.7" />
    <path d="M3.5 12.5h17" />
    <path d="M10.5 11v3h3v-3z" />
  </svg>
);

export const IconArrowUpRight = ({ className }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...base} strokeWidth={1.8} aria-hidden="true">
    <path d="M7 17 17 7" />
    <path d="M9 7h8v8" />
  </svg>
);

export const IconArrowRight = ({ className }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...base} strokeWidth={1.8} aria-hidden="true">
    <path d="M4 12h16" />
    <path d="M14 6l6 6-6 6" />
  </svg>
);

export const IconSearch = ({ className }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...base} aria-hidden="true">
    <circle cx="11" cy="11" r="6.2" />
    <path d="M15.8 15.8 21 21" />
  </svg>
);

export const IconChevron = ({ className }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...base} aria-hidden="true">
    <path d="M6 9.5l6 6 6-6" />
  </svg>
);

export const IconPlus = ({ className }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...base} strokeWidth={1.8} aria-hidden="true">
    <path d="M12 5v14" />
    <path d="M5 12h14" />
  </svg>
);

export const IconDoc = ({ className }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...base} aria-hidden="true">
    <path d="M6 3h8l4 4v14H6z" />
    <path d="M14 3v4h4" />
    <path d="M9 12h6" />
    <path d="M9 15.5h6" />
  </svg>
);

export const IconShield = ({ className }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...base} aria-hidden="true">
    <path d="M12 3l7 2.7v5.5c0 4.5-2.9 7.9-7 9.8-4.1-1.9-7-5.3-7-9.8V5.7z" />
    <path d="M9 11.6l2.1 2.1 4-4.2" />
  </svg>
);

export const IconPhone = ({ className }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...base} aria-hidden="true">
    <path d="M5 4h4l1.6 4.2-2.3 1.7a12.5 12.5 0 0 0 5.8 5.8l1.7-2.3L20 15v4a1.7 1.7 0 0 1-1.9 1.7C10.5 20 4 13.5 3.3 5.9A1.7 1.7 0 0 1 5 4z" />
  </svg>
);

export const IconMail = ({ className }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...base} aria-hidden="true">
    <rect x="3.5" y="5.5" width="17" height="13" />
    <path d="M4 7l8 6 8-6" />
  </svg>
);

export const IconPin = ({ className }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...base} aria-hidden="true">
    <path d="M12 21s-6.5-5.1-6.5-10a6.5 6.5 0 0 1 13 0c0 4.9-6.5 10-6.5 10z" />
    <circle cx="12" cy="11" r="2.2" />
  </svg>
);

export const IconCheck = ({ className }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...base} strokeWidth={2} aria-hidden="true">
    <path d="M4.5 12.5l5 5L19.5 7" />
  </svg>
);

export const IconClock = ({ className }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...base} aria-hidden="true">
    <circle cx="12" cy="12" r="8.2" />
    <path d="M12 7.5V12l3.4 2" />
  </svg>
);

export const IconClose = ({ className }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...base} strokeWidth={1.8} aria-hidden="true">
    <path d="M6 6l12 12" />
    <path d="M18 6 6 18" />
  </svg>
);

export const IconMenu = ({ className }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...base} strokeWidth={1.8} aria-hidden="true">
    <path d="M4 7h16" />
    <path d="M4 12h16" />
    <path d="M4 17h10" />
  </svg>
);

export const IconDiscord = ({ className }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...base} aria-hidden="true">
    <path d="M7.1 7.7A14.2 14.2 0 0 1 12 6.8c1.7 0 3.3.3 4.9.9l1.7 8.1c-1.8 1.3-3.9 2.1-6.1 2.3l-.9-1.4" />
    <path d="M7.1 7.7 5.4 16c1.5 1.1 3 1.7 4.6 2.1" />
    <path d="M8.3 15.4c2.3 1 5.1 1 7.4 0" />
    <circle cx="9.2" cy="12.1" r=".8" fill="currentColor" stroke="none" />
    <circle cx="14.8" cy="12.1" r=".8" fill="currentColor" stroke="none" />
  </svg>
);

export const IconInstagram = ({ className }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...base} aria-hidden="true">
    <rect x="4" y="4" width="16" height="16" rx="4" />
    <circle cx="12" cy="12" r="3.5" />
    <circle cx="17.2" cy="6.9" r=".9" fill="currentColor" stroke="none" />
  </svg>
);

export const IconLinkedin = ({ className }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...base} aria-hidden="true">
    <rect x="4" y="4" width="16" height="16" rx="1.5" />
    <path d="M8 10v6M8 7.7v.1M11.5 16v-3.3a2.1 2.1 0 0 1 4.2 0V16M11.5 10v6" />
  </svg>
);

export const IconFacebook = ({ className }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...base} aria-hidden="true">
    <path d="M13.5 20v-7h2.4l.4-2.8h-2.8V8.4c0-.8.3-1.4 1.5-1.4h1.6V4.5c-.3 0-1.2-.1-2.2-.1-2.2 0-3.7 1.3-3.7 3.8v2H8.3V13h2.4v7" />
  </svg>
);
