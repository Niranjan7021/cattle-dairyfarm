/**
 * Types for HerdSentinel - Dairy Cattle Early-Warning Tool
 */

export interface User {
  id: string;
  name: string;
  phone: string;
  organization: string;
  role: 'farmer' | 'veterinarian' | 'herd_manager';
  avatarUrl?: string;
}

export interface DayReading {
  dayIndex: number;
  date: string;
  milkYield: number; // Liters
  feedTime: number; // Minutes
  ruminationTime: number; // Minutes
  activityScore: number; // Relative motion index
}

export interface CowBaseline {
  milkYieldMean: number; // L/day (14-day rolling mean)
  milkYieldStd: number;
  feedingTimeMean: number; // mins/day
  feedingTimeStd: number;
  ruminationTimeMean: number; // mins/day
  ruminationTimeStd: number;
  activityMean: number;
  activityStd: number;
}

export interface CowToday {
  milkYield: number; // Today's recorded milk (or partial)
  feedingTime: number; // Mins tracked today
  ruminationTime: number; // Mins tracked today
  activityScore: number; // Motion units
  jawChewRate: number; // Chews per minute
  movementState: 'moving' | 'resting' | 'feeding';
  lastVideoAnalyzedAt?: string;
  notes?: string;
}

export type AlertPriority = 'high' | 'medium' | 'low' | 'normal';

export interface CowRiskScoring {
  feedZScore: number;
  ruminationZScore: number;
  milkZScore: number;
  combinedRiskIndex: number; // Scaled 0 - 100
  priority: AlertPriority;
  primaryChanges: string[];
  suggestedAction: string;
  isEstrusSuspected: boolean; // Flagged by Estrus Filter: high activity + moderate feed drop
  feedVariancePercent: number;
  ruminationVariancePercent: number;
  milkVariancePercent: number;
}

export interface Cow {
  id: string;
  tagNumber: string; // Yellow ear tag ID e.g. "0412"
  name: string;
  breed: string; // e.g. "Holstein-Friesian", "Jersey", "Brown Swiss"
  birthDate: string;
  lactationNumber: number; // Parity
  daysInMilk: number; // DIM
  pen: string; // e.g. "Barn North - Pen 1"
  weightKg: number;
  photoUrl?: string;
  status: 'healthy' | 'flagged' | 'in_heat' | 'dry';
  baseline: CowBaseline;
  today: CowToday;
  scoring: CowRiskScoring;
  history14Days: DayReading[];
  registeredAt: string;
}

export interface MilkRecord {
  id: string;
  cowId: string;
  tagNumber: string;
  cowName: string;
  date: string; // YYYY-MM-DD
  session: 'morning' | 'afternoon' | 'evening';
  yieldLiters: number;
  fatPercentage?: number;
  proteinPercentage?: number;
  operatorNotes?: string;
  timestamp: string;
  smsSent: boolean;
  smsRecipientPhone: string;
  varianceFromBaselinePercent: number;
}

export interface NotificationAlert {
  id: string;
  type: 'milk_logged' | 'early_warning' | 'estrus_filter' | 'video_analyzed';
  recipientPhone: string;
  recipientName: string;
  cowTag: string;
  title: string;
  message: string;
  timestamp: string;
  status: 'delivered' | 'read';
  priority: AlertPriority;
  read: boolean;
}

export interface VideoAnalysisResult {
  id: string;
  cowTag: string;
  videoDurationSeconds: number;
  timestamp: string;
  dominantState: 'moving' | 'resting' | 'feeding';
  jawChewFrequencyHz: number;
  estimatedChewsPerMin: number;
  activeRuminationMinutes: number;
  feedingZoneMinutes: number;
  confidenceScore: number;
  observations: string;
}
