import { landingColors } from '../../landing/theme';

export const MOCK_PRESENCE = [
  { name: 'Sarah', action: 'editing Day 1', color: landingColors.primary },
  { name: 'Mike', action: 'in Budgeting', color: '#38BDF8' },
];

export const MOCK_FEED = [
  { name: 'Elena', text: 'suggested a new activity', detail: 'Sushi Breakfast at Tsukiji Outer Market?', time: '2 mins ago' },
  { name: 'Sarah', text: 'updated the budget', time: '15 mins ago' },
  { name: 'Mike', text: 'is typing a comment...', typing: true },
];
