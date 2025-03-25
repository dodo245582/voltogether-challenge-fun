
export interface User {
  id: string;
  email: string;
  name?: string;
  created_at?: string;
  city?: string;
  discovery_source?: string;
  selected_actions?: string[];
  completed_challenges?: number;
  total_points?: number;
  streak?: number;
  // Add any user metadata fields
  user_metadata?: {
    name?: string;
  };
}

export interface SustainableAction {
  id: string;
  label: string;
  description: string;
  pointValue: number;
}

export interface Challenge {
  id: number;
  date: string;
  startTime: string;
  endTime: string;
  completed: boolean;
  participating?: boolean;
  userActions?: string[];
}

export type DiscoverySource = 
  | 'social-media'
  | 'friend'
  | 'search'
  | 'advertisement'
  | 'news'
  | 'event'
  | 'other';

// Compute the current week dates starting from today
const generateCurrentWeekDates = () => {
  const dates: string[] = [];
  const today = new Date();
  
  // Reset hours to get a clean date
  today.setHours(0, 0, 0, 0);
  
  // Start with today
  const startDate = new Date(today);
  
  // Add 7 days from today
  for (let i = 0; i < 7; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + i);
    dates.push(currentDate.toISOString().split('T')[0]);
  }
  
  return dates;
};

export const CHALLENGE_DATES = generateCurrentWeekDates();

export const SUSTAINABLE_ACTIONS: SustainableAction[] = [
  {
    id: 'laundry',
    label: 'Spostare utilizzo della lavatrice',
    description: 'Utilizzare la lavatrice fuori dagli orari di punta di consumo energetico',
    pointValue: 10
  },
  {
    id: 'dishwasher',
    label: 'Abbassare i gradi della lavastoviglie',
    description: 'Ridurre la temperatura della lavastoviglie per risparmiare energia',
    pointValue: 10
  },
  {
    id: 'pc',
    label: 'Spegnere il PC fisso',
    description: 'Spegnere completamente il PC invece di lasciarlo in standby',
    pointValue: 10
  },
  {
    id: 'lights',
    label: 'Spegnere le luci non necessarie',
    description: 'Ridurre l\'illuminazione nelle stanze non utilizzate',
    pointValue: 10
  },
  {
    id: 'heating',
    label: 'Abbassare il riscaldamento',
    description: 'Ridurre la temperatura del riscaldamento di qualche grado',
    pointValue: 10
  },
  {
    id: 'cooking',
    label: 'Evitare l\'uso del forno',
    description: 'Utilizzare metodi di cottura più efficienti come microonde o fornelli',
    pointValue: 10
  },
  {
    id: 'tv',
    label: 'Spegnere TV e dispositivi',
    description: 'Spegnere completamente TV e altri dispositivi elettronici',
    pointValue: 10
  },
  {
    id: 'shower',
    label: 'Fare docce più brevi',
    description: 'Ridurre il tempo sotto la doccia per risparmiare acqua calda',
    pointValue: 10
  }
];
