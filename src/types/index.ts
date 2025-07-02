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
  user_metadata?: {
    name?: string;
  };
  instagram_account?: string;
  arera_portal_access?: boolean;
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
  title?: string;
  description?: string;
  action_ids?: string[];
  actions?: {
    id: string;
    label: string;
    description: string | null;
    point_value: number;
    title: string | null;
    created_at: string;
  }[];
  Users_Challenges?: {
    completed_at: string | null;
    points: number | null;
    actions_done: string[] | null;
  }[];
  userActions?: string[];
  date?: string;
}

export type DiscoverySource = 
  | 'instagram'
  | 'sustainable-friends'
  | 'heroots'
  | 'greenpea'
  | 'friend'
  // | 'advertisement'
  | 'previous-experiment'
  | 'atmospheralab'
  | 'milan-green-forum'
  | 'impatto'
  | 'cs1bc';

const generateCurrentWeekDates = () => {
  const dates: string[] = [];
  const today = new Date();
  
  today.setHours(0, 0, 0, 0);
  
  const startDate = new Date(today);
  
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
    pointValue: 70
  },
  {
    id: 'dishwasher',
    label: 'Sposta l\'utilizzo della lavastoviglie',
    description: 'Usare la lavastoviglie fuori dagli orari di picco energetico per risparmiare energia',
    pointValue: 100
  },
  {
    id: 'heating',
    label: 'Abbassare il riscaldamento di due gradi',
    description: 'Abbassare la temperatura di casa di due gradi per risparmiare energia',
    pointValue: 25
  },
  {
    id: 'lights_off',
    label: 'Spegnere luci non necessarie',
    description: 'Spegnere l\'illuminazione nelle stanze inutilizzate per risparmiare energia',
    pointValue: 10
  },
  {
    id: 'stand_by',
    label: 'Spegni dispositivi come TV e PC',
    description: 'Spegnere completamente dispositivi quando non in uso per ridurre il consumo',
    pointValue: 15
  },
  {
    id: 'dryer',
    label: 'Stendi i panni invece di usare l\'asciugatrice',
    description: 'Non usare l\'asciugatrice, per risparmiare energia',
    pointValue: 190
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
    pointValue: 100
  },
  {
    id: 'eco_mode',
    label: 'Usare la modalità ECO/temperatura più bassa sugli elettrodomestici',
    description: 'Selezionare modalità ECO o temperature più basse negli elettrodomestici per risparmiare energia',
    pointValue: 10
  },
  {
    id: 'iron',
    label: 'Abbassa la temperatura del ferro da stiro di almeno 10 gradi',
    description: 'Abbassare leggermente la temperatura del ferro per risparmiare energia durante la stiratura',
    pointValue: 15
  },
  {
    id: 'fridge',
    label: 'Spegni il frigorifero per 1 ora, o alza la sua temperatura',
    description: 'Spegnere o impostare una temperatura leggermente più alta nel frigorifero per ridurre il consumo energetico',
    pointValue: 15
  }
];
