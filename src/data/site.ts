// Site-wide details. Empty strings and empty lists hide the related UI until filled in.

export const site = {
  coachName: 'Nolan Sloan',
  role: 'Goalie Coach',
  // Shown on the Contact page and footer. Leave '' to hide the email link.
  contactEmail: '',
  // Region or rink names where sessions happen, e.g. 'Minneapolis, MN'. '' hides it.
  location: '',
  socials: [] as { label: 'Instagram' | 'X' | 'Facebook' | 'YouTube' | 'TikTok'; url: string }[],
}

export const nav = [
  { path: '/', label: 'Home' },
  { path: '/training', label: 'Training' },
  { path: '/schedule', label: 'Schedule' },
  { path: '/stats', label: 'Stats' },
  { path: '/play', label: 'Play' },
  { path: '/about', label: 'About' },
  { path: '/contact', label: 'Contact' },
] as const
