export const SITE_CONFIG = {
  siteName: 'Gautiyan Tola (Saman)',
  shortName: 'Gautiyan Tola',
  location: 'Saman',
  tagline: 'Our roots. Our people. Our home.',
  description:
    'Discover Gautiyan Tola (Saman) through village photographs, shared memories, community voices and stories of home.',
  whatsappNumber: '919755752534',
  maxMessages: 5,
  maxImageBytes: 1500000,
  socialLinks: { facebook: '', instagram: '', youtube: '' },
  navigation: [
    { label: 'Home', path: '/', fragment: '' },
    { label: 'Our village', path: '/', fragment: 'about' },
    { label: 'Gallery', path: '/gallery', fragment: '' },
    { label: 'Stories', path: '/blog', fragment: '' },
    { label: 'Community', path: '/', fragment: 'community' },
  ],
} as const;
export const STORAGE_KEYS = {
  messages: 'gautiyan-tola-messages',
  blogs: 'gautiyan-tola-blogs',
  submissions: 'gautiyan-tola-submissions',
  theme: 'gautiyan-tola-theme',
} as const;
export const FORM_LIMITS = { name: 80, message: 600, title: 140, blog: 6000, minBlog: 80 } as const;
