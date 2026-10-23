import { Cow, MilkRecord, NotificationAlert, User } from '../types';
import { calculateRiskScoring } from '../utils/scoring';

export const INITIAL_USERS: User[] = [
  {
    id: 'user-1',
    name: 'John Miller',
    phone: '+1 (555) 382-9014',
    organization: 'Oakridge Dairy Farm',
    role: 'farmer',
  },
  {
    id: 'user-2',
    name: 'Dr. Sarah Jenkins',
    phone: '+1 (555) 749-2180',
    organization: 'Bovine Clinical Veterinary Practice',
    role: 'veterinarian',
  },
  {
    id: 'user-3',
    name: 'Marcus Davies',
    phone: '+1 (555) 612-4491',
    organization: 'Oakridge Dairy Farm',
    role: 'herd_manager',
  },
];

// Helper to generate 14 days of realistic historical readings
function generate14DayHistory(
  baseMilk: number,
  baseFeed: number,
  baseRum: number,
  baseAct: number,
  trendType: 'nominal' | 'dropping_lead' | 'estrus' | 'drop_moderate'
) {
  const readings = [];
  const today = new Date();

  for (let i = 13; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];

    // Day variance
    let milk = baseMilk + (Math.sin(i * 1.3) * 0.8) - (Math.cos(i * 0.7) * 0.5);
    let feed = baseFeed + (Math.sin(i * 0.9) * 12);
    let rum = baseRum + (Math.cos(i * 1.1) * 15);
    let act = baseAct + (Math.sin(i * 0.6) * 10);

    // If dropping lead indicator (Cow #0412 Stage 2)
    if (trendType === 'dropping_lead') {
      if (i <= 4) {
        // Rumination begins dropping 4 days ago
        const daysIntoDrop = 5 - i;
        rum = baseRum * (1 - daysIntoDrop * 0.075); // down to -35%
        feed = baseFeed * (1 - daysIntoDrop * 0.05); // down to -22%
        // Milk remains flat (Lagging indicator!)
        milk = baseMilk * (1 - 0.02 * (Math.random() - 0.5));
      }
    } else if (trendType === 'drop_moderate') {
      if (i <= 3) {
        const daysIntoDrop = 4 - i;
        rum = baseRum * (1 - daysIntoDrop * 0.07);
        feed = baseFeed * (1 - daysIntoDrop * 0.06);
      }
    } else if (trendType === 'estrus') {
      if (i <= 1) {
        act = baseAct * 1.65; // High restlessness / pacing
        feed = baseFeed * 0.88; // Slight feeding drop
      }
    }

    readings.push({
      dayIndex: 14 - i,
      date: dateStr,
      milkYield: Number(milk.toFixed(1)),
      feedTime: Math.round(feed),
      ruminationTime: Math.round(rum),
      activityScore: Math.round(act),
    });
  }

  return readings;
}

export function buildInitialCows(): Cow[] {
  // Cow 1: #0412 (Featured in PDF!)
  const cow0412Baseline = {
    milkYieldMean: 32.5,
    milkYieldStd: 1.8,
    feedingTimeMean: 260, // mins
    feedingTimeStd: 18,
    ruminationTimeMean: 480, // mins
    ruminationTimeStd: 25,
    activityMean: 100,
    activityStd: 12,
  };
  const cow0412Today = {
    milkYield: 31.8, // Milk has NOT dropped yet (Stage 2)
    feedingTime: 202, // 22% drop
    ruminationTime: 312, // 35% drop!
    activityScore: 88,
    jawChewRate: 42,
    movementState: 'resting' as const,
    lastVideoAnalyzedAt: 'Today at 08:45 AM',
    notes: 'Standing in stall, reduced cud chewing cycles observed via overhead Cam 4',
  };
  const cow0412Scoring = calculateRiskScoring(cow0412Baseline, cow0412Today);

  // Cow 2: #0187
  const cow0187Baseline = {
    milkYieldMean: 29.0,
    milkYieldStd: 2.1,
    feedingTimeMean: 245,
    feedingTimeStd: 16,
    ruminationTimeMean: 450,
    ruminationTimeStd: 22,
    activityMean: 95,
    activityStd: 11,
  };
  const cow0187Today = {
    milkYield: 27.8,
    feedingTime: 198, // -19%
    ruminationTime: 324, // -28%
    activityScore: 82,
    jawChewRate: 45,
    movementState: 'resting' as const,
    lastVideoAnalyzedAt: 'Today at 09:12 AM',
  };
  const cow0187Scoring = calculateRiskScoring(cow0187Baseline, cow0187Today);

  // Cow 3: #0356
  const cow0356Baseline = {
    milkYieldMean: 24.5,
    milkYieldStd: 1.6,
    feedingTimeMean: 230,
    feedingTimeStd: 15,
    ruminationTimeMean: 440,
    ruminationTimeStd: 20,
    activityMean: 92,
    activityStd: 10,
  };
  const cow0356Today = {
    milkYield: 23.9,
    feedingTime: 193, // -16%
    ruminationTime: 378, // -14%
    activityScore: 85,
    jawChewRate: 52,
    movementState: 'feeding' as const,
    lastVideoAnalyzedAt: 'Today at 07:30 AM',
  };
  const cow0356Scoring = calculateRiskScoring(cow0356Baseline, cow0356Today);

  // Cow 4: #0521 (In Heat / Estrus)
  const cow0521Baseline = {
    milkYieldMean: 31.0,
    milkYieldStd: 2.0,
    feedingTimeMean: 250,
    feedingTimeStd: 18,
    ruminationTimeMean: 470,
    ruminationTimeStd: 24,
    activityMean: 100,
    activityStd: 14,
  };
  const cow0521Today = {
    milkYield: 30.5,
    feedingTime: 220, // -12%
    ruminationTime: 455, // nominal
    activityScore: 168, // +68% restlessness
    jawChewRate: 60,
    movementState: 'moving' as const,
    lastVideoAnalyzedAt: 'Today at 10:05 AM',
  };
  const cow0521Scoring = calculateRiskScoring(cow0521Baseline, cow0521Today);

  // Cow 5: #0604 (Healthy)
  const cow0604Baseline = {
    milkYieldMean: 28.5,
    milkYieldStd: 1.5,
    feedingTimeMean: 240,
    feedingTimeStd: 16,
    ruminationTimeMean: 460,
    ruminationTimeStd: 21,
    activityMean: 96,
    activityStd: 12,
  };
  const cow0604Today = {
    milkYield: 28.9,
    feedingTime: 248,
    ruminationTime: 468,
    activityScore: 98,
    jawChewRate: 62,
    movementState: 'feeding' as const,
    lastVideoAnalyzedAt: 'Today at 06:50 AM',
  };
  const cow0604Scoring = calculateRiskScoring(cow0604Baseline, cow0604Today);

  // Cow 6: #0719 (Healthy)
  const cow0719Baseline = {
    milkYieldMean: 34.0,
    milkYieldStd: 2.2,
    feedingTimeMean: 275,
    feedingTimeStd: 19,
    ruminationTimeMean: 495,
    ruminationTimeStd: 25,
    activityMean: 104,
    activityStd: 13,
  };
  const cow0719Today = {
    milkYield: 34.2,
    feedingTime: 270,
    ruminationTime: 502,
    activityScore: 102,
    jawChewRate: 64,
    movementState: 'resting' as const,
    lastVideoAnalyzedAt: 'Today at 08:15 AM',
  };
  const cow0719Scoring = calculateRiskScoring(cow0719Baseline, cow0719Today);

  // Cow 7: #0832 (Healthy)
  const cow0832Baseline = {
    milkYieldMean: 26.0,
    milkYieldStd: 1.7,
    feedingTimeMean: 235,
    feedingTimeStd: 15,
    ruminationTimeMean: 430,
    ruminationTimeStd: 19,
    activityMean: 90,
    activityStd: 10,
  };
  const cow0832Today = {
    milkYield: 26.4,
    feedingTime: 238,
    ruminationTime: 435,
    activityScore: 91,
    jawChewRate: 58,
    movementState: 'resting' as const,
    lastVideoAnalyzedAt: 'Today at 09:40 AM',
  };
  const cow0832Scoring = calculateRiskScoring(cow0832Baseline, cow0832Today);

  // Cow 8: #0945 (Healthy)
  const cow0945Baseline = {
    milkYieldMean: 30.2,
    milkYieldStd: 1.9,
    feedingTimeMean: 255,
    feedingTimeStd: 17,
    ruminationTimeMean: 475,
    ruminationTimeStd: 23,
    activityMean: 98,
    activityStd: 11,
  };
  const cow0945Today = {
    milkYield: 30.0,
    feedingTime: 252,
    ruminationTime: 470,
    activityScore: 97,
    jawChewRate: 61,
    movementState: 'moving' as const,
    lastVideoAnalyzedAt: 'Today at 07:15 AM',
  };
  const cow0945Scoring = calculateRiskScoring(cow0945Baseline, cow0945Today);

  return [
    {
      id: 'cow-0412',
      tagNumber: '0412',
      name: 'Bella',
      breed: 'Holstein-Friesian',
      birthDate: '2023-04-12',
      lactationNumber: 2,
      daysInMilk: 114,
      pen: 'North Barn - Pen A1',
      weightKg: 645,
      photoUrl: '/src/assets/images/cow_head_portrait_tag_1792781948691.jpg',
      status: 'flagged',
      baseline: cow0412Baseline,
      today: cow0412Today,
      scoring: cow0412Scoring,
      history14Days: generate14DayHistory(32.5, 260, 480, 100, 'dropping_lead'),
      registeredAt: '2025-01-15',
    },
    {
      id: 'cow-0187',
      tagNumber: '0187',
      name: 'Daisy',
      breed: 'Holstein-Friesian',
      birthDate: '2022-11-04',
      lactationNumber: 3,
      daysInMilk: 165,
      pen: 'North Barn - Pen A2',
      weightKg: 680,
      photoUrl: '/src/assets/images/cow_resting_ruminating_1792781967102.jpg',
      status: 'flagged',
      baseline: cow0187Baseline,
      today: cow0187Today,
      scoring: cow0187Scoring,
      history14Days: generate14DayHistory(29.0, 245, 450, 95, 'drop_moderate'),
      registeredAt: '2024-10-10',
    },
    {
      id: 'cow-0356',
      tagNumber: '0356',
      name: 'Buttercup',
      breed: 'Jersey',
      birthDate: '2023-02-18',
      lactationNumber: 1,
      daysInMilk: 78,
      pen: 'South Barn - Pen B1',
      weightKg: 460,
      status: 'flagged',
      baseline: cow0356Baseline,
      today: cow0356Today,
      scoring: cow0356Scoring,
      history14Days: generate14DayHistory(24.5, 230, 440, 92, 'drop_moderate'),
      registeredAt: '2025-02-01',
    },
    {
      id: 'cow-0521',
      tagNumber: '0521',
      name: 'Rosie',
      breed: 'Holstein-Friesian',
      birthDate: '2023-06-20',
      lactationNumber: 1,
      daysInMilk: 92,
      pen: 'North Barn - Pen A3',
      weightKg: 610,
      status: 'in_heat',
      baseline: cow0521Baseline,
      today: cow0521Today,
      scoring: cow0521Scoring,
      history14Days: generate14DayHistory(31.0, 250, 470, 100, 'estrus'),
      registeredAt: '2025-01-20',
    },
    {
      id: 'cow-0604',
      tagNumber: '0604',
      name: 'Clover',
      breed: 'Brown Swiss',
      birthDate: '2022-08-14',
      lactationNumber: 3,
      daysInMilk: 140,
      pen: 'South Barn - Pen B2',
      weightKg: 690,
      status: 'healthy',
      baseline: cow0604Baseline,
      today: cow0604Today,
      scoring: cow0604Scoring,
      history14Days: generate14DayHistory(28.5, 240, 460, 96, 'nominal'),
      registeredAt: '2024-09-01',
    },
    {
      id: 'cow-0719',
      tagNumber: '0719',
      name: 'Luna',
      breed: 'Holstein-Friesian',
      birthDate: '2021-12-10',
      lactationNumber: 4,
      daysInMilk: 190,
      pen: 'North Barn - Pen A1',
      weightKg: 710,
      status: 'healthy',
      baseline: cow0719Baseline,
      today: cow0719Today,
      scoring: cow0719Scoring,
      history14Days: generate14DayHistory(34.0, 275, 495, 104, 'nominal'),
      registeredAt: '2024-06-15',
    },
    {
      id: 'cow-0832',
      tagNumber: '0832',
      name: 'Marigold',
      breed: 'Guernsey',
      birthDate: '2023-01-11',
      lactationNumber: 2,
      daysInMilk: 105,
      pen: 'South Barn - Pen B3',
      weightKg: 510,
      status: 'healthy',
      baseline: cow0832Baseline,
      today: cow0832Today,
      scoring: cow0832Scoring,
      history14Days: generate14DayHistory(26.0, 235, 430, 90, 'nominal'),
      registeredAt: '2025-01-10',
    },
    {
      id: 'cow-0945',
      tagNumber: '0945',
      name: 'Willow',
      breed: 'Ayrshire',
      birthDate: '2022-05-30',
      lactationNumber: 3,
      daysInMilk: 130,
      pen: 'South Barn - Pen B1',
      weightKg: 580,
      status: 'healthy',
      baseline: cow0945Baseline,
      today: cow0945Today,
      scoring: cow0945Scoring,
      history14Days: generate14DayHistory(30.2, 255, 475, 98, 'nominal'),
      registeredAt: '2024-11-20',
    },
  ];
}

export const INITIAL_MILK_RECORDS: MilkRecord[] = [
  {
    id: 'milk-rec-01',
    cowId: 'cow-0412',
    tagNumber: '0412',
    cowName: 'Bella',
    date: new Date().toISOString().split('T')[0],
    session: 'morning',
    yieldLiters: 16.2,
    fatPercentage: 3.8,
    proteinPercentage: 3.2,
    operatorNotes: 'Milked in stall 4. Milk flow steady, but cud chewing was lower before entering parlor.',
    timestamp: 'Today at 06:15 AM',
    smsSent: true,
    smsRecipientPhone: '+1 (555) 382-9014',
    varianceFromBaselinePercent: -1.8,
  },
  {
    id: 'milk-rec-02',
    cowId: 'cow-0187',
    tagNumber: '0187',
    cowName: 'Daisy',
    date: new Date().toISOString().split('T')[0],
    session: 'morning',
    yieldLiters: 13.9,
    fatPercentage: 3.9,
    proteinPercentage: 3.3,
    operatorNotes: 'Mild resistance during teat preparation.',
    timestamp: 'Today at 06:22 AM',
    smsSent: true,
    smsRecipientPhone: '+1 (555) 382-9014',
    varianceFromBaselinePercent: -4.1,
  },
  {
    id: 'milk-rec-03',
    cowId: 'cow-0719',
    tagNumber: '0719',
    cowName: 'Luna',
    date: new Date().toISOString().split('T')[0],
    session: 'morning',
    yieldLiters: 17.5,
    fatPercentage: 3.7,
    proteinPercentage: 3.1,
    operatorNotes: 'Robust yield, prime lactation.',
    timestamp: 'Today at 06:30 AM',
    smsSent: true,
    smsRecipientPhone: '+1 (555) 382-9014',
    varianceFromBaselinePercent: 2.9,
  },
  {
    id: 'milk-rec-04',
    cowId: 'cow-0412',
    tagNumber: '0412',
    cowName: 'Bella',
    date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
    session: 'afternoon',
    yieldLiters: 15.6,
    fatPercentage: 3.8,
    proteinPercentage: 3.2,
    timestamp: 'Yesterday at 04:30 PM',
    smsSent: true,
    smsRecipientPhone: '+1 (555) 382-9014',
    varianceFromBaselinePercent: -2.0,
  },
];

export const INITIAL_NOTIFICATIONS: NotificationAlert[] = [
  {
    id: 'notif-01',
    type: 'early_warning',
    recipientPhone: '+1 (555) 382-9014',
    recipientName: 'John Miller',
    cowTag: '0412',
    title: 'Priority Escalation: Cow #0412 (Bella)',
    message: 'Rumination dropped 35% and feed time down 22% over 72h while milk yield remains flat. Stage 2 incubation warning: Inspect feed bunk access & oral health today.',
    timestamp: 'Today at 08:48 AM',
    status: 'delivered',
    priority: 'high',
    read: false,
  },
  {
    id: 'notif-02',
    type: 'estrus_filter',
    recipientPhone: '+1 (555) 382-9014',
    recipientName: 'John Miller',
    cowTag: '0521',
    title: 'Estrus Filter: Cow #0521 (Rosie)',
    message: 'Restlessness up 68% with moderate feed drop (-12%). Filtered as standing heat (estrus) rather than sickness. Optimal AI window: Next 12 hours.',
    timestamp: 'Today at 10:07 AM',
    status: 'delivered',
    priority: 'medium',
    read: true,
  },
  {
    id: 'notif-03',
    type: 'milk_logged',
    recipientPhone: '+1 (555) 382-9014',
    recipientName: 'John Miller',
    cowTag: '0412',
    title: 'Morning Milk Recorded: Cow #0412',
    message: 'Morning session yield 16.2L logged by M. Davies. Variance: -1.8% from expected baseline.',
    timestamp: 'Today at 06:16 AM',
    status: 'delivered',
    priority: 'normal',
    read: true,
  },
];
