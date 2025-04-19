import { Users } from 'lucide-react';

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
  profile_completed?: boolean;
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
  startTime: string;
  endTime: string;
  completed: boolean;
  participating?: boolean;
  actions?: {
    id: string;
    label: string;
    description: string | null;
    point_value: number;
    title: string | null;
    created_at: string;
  }[];
  Users_Challenges?: any;
}

export type DiscoverySource = 
    | 'social-media'
    | 'friend'
    | 'advertisement'
    | 'previous-experiment'
    | 'atmospheralab'
    | 'cs1bc'
    // | 'news-article'
    // | 'event'
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

export const SUSTAINABLE_ACTIONS: SustainableAction[] = 
[
  {
    id: 'washing_machine',
    label: 'Sposta l\'utilizzo della lavatrice',
    description: 'Usare la lavatrice in orari non di punta per ridurre il consumo energetico',
    pointValue: 20
  },
  {
    id: 'dishwasher',
    label: 'Sposta l\'utilizzo della lavastoviglie',
    description: 'Usare la lavastoviglie fuori dagli orari di picco energetico per risparmiare energia',
    pointValue: 20
  },
  {
    id: 'heating',
    label: 'Abbassare il riscaldamento di due gradi',
    description: 'Abbassare la temperatura di casa di due gradi per risparmiare energia',
    pointValue: 10
  },
  {
    id: 'lights_off',
    label: 'Spegnere luci non necessarie',
    description: 'Spegnere l\'illuminazione nelle stanze inutilizzate per risparmiare energia',
    pointValue: 5
  },
  {
    id: 'stand_by',
    label: 'Spegni dispositivi come TV e PC anziché lasciarli in standby',
    description: 'Spegnere completamente dispositivi quando non in uso per ridurre il consumo in standby',
    pointValue: 5
  },
  {
    id: 'dryer',
    label: 'Stendi i panni invece di usare l\'asciugatrice',
    description: 'Non usare l\'asciugatrice, per risparmiare energia',
    pointValue: 10
  },
  {
    id: 'chargers',
    label: 'Scollegare i caricabatterie e le prese non utilizzati',
    description: 'Scollegare dalla corrente caricabatterie e dispositivi non utilizzati per evitare consumi inutili',
    pointValue: 5
  },
  {
    id: 'oven',
    label: 'Evitare l\'uso del forno',
    description: 'Utilizzare metodi di cottura più efficienti come microonde o fornelli',
    pointValue: 20
  },
  {
    id: 'eco_mode',
    label: 'Usare la modalità ECO/temperatura più bassa sugli elettrodomestici',
    description: 'Selezionare modalità ECO o temperature più basse negli elettrodomestici per risparmiare energia',
    pointValue: 10
  },
  {
    id: 'iron',
    label: 'Abbassa la temperatura del ferro da stiro',
    description: 'Abbassare leggermente la temperatura del ferro per risparmiare energia durante la stiratura',
    pointValue: 10
  },
  {
    id: 'fridge',
    label: 'Alza la temperatura del frigo',
    description: 'Impostare una temperatura leggermente più alta nel frigorifero per ridurre il consumo energetico',
    pointValue: 10
  }
];


//[
//   {
//     id: 'laundry',
//     label: 'Spostare utilizzo della lavatrice',
//     description: 'Utilizzare la lavatrice fuori dagli orari di punta di consumo energetico',
//     pointValue: 10
//   },
//   {
//     id: 'dishwasher',
//     label: 'Abbassare i gradi della lavastoviglie',
//     description: 'Ridurre la temperatura della lavastoviglie per risparmiare energia',
//     pointValue: 10
//   },
//   {
//     id: 'pc',
//     label: 'Spegnere il PC fisso',
//     description: 'Spegnere completamente il PC invece di lasciarlo in standby',
//     pointValue: 10
//   },
//   {
//     id: 'lights',
//     label: 'Spegnere le luci non necessarie',
//     description: 'Ridurre l\'illuminazione nelle stanze non utilizzate',
//     pointValue: 10
//   },
//   {
//     id: 'heating',
//     label: 'Abbassare il riscaldamento',
//     description: 'Ridurre la temperatura del riscaldamento di qualche grado',
//     pointValue: 10
//   },
//   {
//     id: 'cooking',
//     label: 'Evitare l\'uso del forno',
//     description: 'Utilizzare metodi di cottura più efficienti come microonde o fornelli',
//     pointValue: 10
//   },
//   {
//     id: 'tv',
//     label: 'Spegnere TV e dispositivi',
//     description: 'Spegnere completamente TV e altri dispositivi elettronici',
//     pointValue: 10
//   },
//   {
//     id: 'shower',
//     label: 'Fare docce più brevi',
//     description: 'Ridurre il tempo sotto la doccia per risparmiare acqua calda',
//     pointValue: 10
//   }
// ];


