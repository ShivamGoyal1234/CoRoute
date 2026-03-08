import type { ReactNode } from 'react';

export interface FeatureItem {
  title: string;
  description: string;
  icon: ReactNode;
}

export const features: FeatureItem[] = [
  {
    title: 'Real-time Collaboration',
    description: 'Invite travelers, assign Owner, Editor, or Viewer roles, and plan together in one place.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
      </svg>
    ),
  },
  {
    title: 'Smart Budgeting',
    description: 'Set trip budget, track costs per activity, and see your expense summary at a glance.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    title: 'Shared Checklists',
    description: 'Packing, booking, and documentation lists—assign items and tick them off together.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
  },
  {
    title: 'Day-wise Itinerary',
    description: 'Build your trip day by day. Add activities as cards, reorder with a drag, and attach files.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    title: 'Comments & Attachments',
    description: 'Discuss per activity, upload tickets and PDFs, and keep everything in one thread.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
      </svg>
    ),
  },
  {
    title: 'Roles & Permissions',
    description: 'Owner, Editor, and Viewer roles so everyone has the right level of access.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
];

export const featuresHighlights: FeatureItem[] = [
  {
    title: 'Instant Sync',
    description: 'Updates across all web and mobile apps instantly.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    ),
  },
  {
    title: 'Multi-currency',
    description: 'Real-time exchange rates for global adventures.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    ),
  },
  {
    title: 'Offline Mode',
    description: 'Access your travel documents without WiFi.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
      </svg>
    ),
  },
  {
    title: 'Secure Sharing',
    description: 'Fine-grained permissions for your group.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
];

export const trustedByBrands = [
  'Booking.com',
  'Airbnb',
  'Skyscanner',
  'TripAdvisor',
  'Google Travel',
  'Expedia',
  'Kayak',
  'Hopper',
  'GetYourGuide',
  'Viator',
];

export interface MembershipTier {
  name: string;
  price: string;
  period?: string;
  description: string;
  features: string[];
  popular?: boolean;
  ctaText: string;
}

export const memberships: MembershipTier[] = [
  {
    name: 'EXPLORER',
    price: '$0',
    period: '/mo',
    description: 'For solo trips and weekend getaways',
    features: [
      '2 active trips',
      '4 collaborators per trip',
      'Day-by-day itinerary builder',
      'Shared packing & booking lists',
      'Multi-currency expense tracking',
    ],
    ctaText: 'Start Exploring',
  },
  {
    name: 'SQUAD',
    price: '$12',
    period: '/mo',
    description: 'Built for groups who plan together',
    features: [
      'Unlimited trips & travelers',
      'Comments, tickets & PDF uploads',
      'Activity-based expense splits',
      'Offline access to itineraries',
      'Priority email support',
    ],
    popular: true,
    ctaText: 'Start Free Trial',
  },
  {
    name: 'AGENCY',
    price: '$49',
    period: '/mo',
    description: 'For tour operators and travel professionals',
    features: [
      'All Squad features included',
      'Team workspace & dashboard',
      '50GB shared file storage',
      'White-label client reports',
      'Role-based access control',
    ],
    ctaText: 'Talk to Sales',
  },
];

export const testimonials = [
  { quote: 'CoRoute completely changed how my friends and I travel. No more endless scrolls in WhatsApp!', name: 'Sarah Jenkins', title: 'Solo Traveler & Adventurer' },
  { quote: 'The budgeting tool is a lifesaver. It handles all the currency conversions automatically. Brilliant.', name: 'Mark Thompson', title: 'Digital Nomad' },
  { quote: 'Inviting my squad was so easy. We planned a 10-day trip to Japan in just one afternoon!', name: 'Elena Rodriguez', title: 'Group Coordinator' },
];

export const howItWorksSteps = [
  { step: 1, title: 'Initialize the Workspace', description: 'Define your destination, timeline, and baseline budget. CoRoute generates a structured environment tailored to your specific dates.' },
  { step: 2, title: 'Sync the Squad', description: 'Deploy role-based invites to your travelers. Whether they are full Editors or read-only Viewers, everyone stays aligned on the master plan.' },
  { step: 3, title: 'Architect the Journey', description: 'Populate your days with activity cards. Attach tickets, drop in Google Maps links, and use drag-and-drop logic to optimize your daily flow.' },
  { step: 4, title: 'Log & Liquidate', description: 'Track expenses in real-time. Our integrated ledger handles the math and currency conversions, ensuring a stress-free settle-up once you’re home.' },

];

export const footerLinks = {
  Product: [
    { label: 'Features', href: '#features' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'Integrations', href: '#' },
    { label: 'Changelog', href: '#' },
  ],
  Company: [
    { label: 'About Us', href: '#' },
    { label: 'Careers', href: '#' },
    { label: 'Blog', href: '#' },
    { label: 'Press', href: '#' },
  ],
  Legal: [
    { label: 'Privacy Policy', href: '#' },
    { label: 'Terms of Service', href: '#' },
    { label: 'Cookie Policy', href: '#' },
  ],
} as const;
