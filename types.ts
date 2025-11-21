export enum ViewState {
  HOME = 'HOME',
  RULES = 'RULES',
  HISTORY = 'HISTORY',
  REWARDS = 'REWARDS'
}

export interface Winner {
  id: string;
  name: string;
  date: string;
  prize: number;
  avatar: string;
  testimonial?: string;
}

export interface DrawStats {
  currentPrize: number;
  participants: number;
  timeRemaining: string;
  ticketPrice: number;
  nextTier: number;
}

export interface BreakdownItem {
  label: string;
  value: number;
  color: string;
  description: string;
}

export interface UserProfile {
  referralCode: string;
  referralCount: number;
  loyaltyProgress: number; // Current progress (e.g., 3/10)
  loyaltyTarget: number;   // Target to get free entry (e.g., 10)
  freeTickets: number;
  notificationsEnabled: boolean;
  luckBoost?: string; // New field for the roulette bonus
}

export interface Report {
  id: string;
  month: string;
  year: number;
  totalCollected: number;
  totalPaid: number;
}