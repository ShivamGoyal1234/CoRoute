export type SectionId = 'itinerary' | 'budgeting' | 'organization' | 'shared-map';

export const SIDEBAR_NAV: {
  id: SectionId;
  label: string;
  icon: 'calendar' | 'piggy' | 'folder' | 'checklist' | 'map';
}[] = [
  { id: 'itinerary', label: 'Itinerary', icon: 'calendar' },
  { id: 'budgeting', label: 'Budgeting', icon: 'piggy' },
  { id: 'organization', label: 'Organization', icon: 'folder' },
  { id: 'shared-map', label: 'Shared Map', icon: 'map' },
];
