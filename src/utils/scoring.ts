import { CowBaseline, CowRiskScoring, CowToday, AlertPriority } from '../types';

/**
 * Calculates behavioral deviation scores and Combined Risk Index
 * Based on ONSPOT HerdSentinel methodology:
 * - 14-day rolling baseline per individual cow (never herd average)
 * - 80% weight on feed duration and rumination chewing cycles (lead indicators)
 * - Milk yield is a lagging indicator (drops only after prolonged illness)
 * - Estrus Filter: separates sick cows (activity down, feed down) from cows in heat (activity up, feed down)
 * - Early Escalation: >30% rumination drop with flat milk triggers instant high escalation
 */
export function calculateRiskScoring(
  baseline: CowBaseline,
  today: CowToday
): CowRiskScoring {
  // Feed variance & Z-Score
  const feedDiff = baseline.feedingTimeMean - today.feedingTime;
  const feedStd = baseline.feedingTimeStd || 15;
  const feedZScore = Math.max(-3, Math.min(5, feedDiff / feedStd));
  const feedVariancePercent = baseline.feedingTimeMean > 0
    ? Math.round(((today.feedingTime - baseline.feedingTimeMean) / baseline.feedingTimeMean) * 100)
    : 0;

  // Rumination variance & Z-Score
  const ruminationDiff = baseline.ruminationTimeMean - today.ruminationTime;
  const ruminationStd = baseline.ruminationTimeStd || 20;
  const ruminationZScore = Math.max(-3, Math.min(5, ruminationDiff / ruminationStd));
  const ruminationVariancePercent = baseline.ruminationTimeMean > 0
    ? Math.round(((today.ruminationTime - baseline.ruminationTimeMean) / baseline.ruminationTimeMean) * 100)
    : 0;

  // Milk variance & Z-Score (lagging indicator)
  const milkDiff = baseline.milkYieldMean - today.milkYield;
  const milkStd = baseline.milkYieldStd || 2.5;
  const milkZScore = Math.max(-3, Math.min(5, milkDiff / milkStd));
  const milkVariancePercent = baseline.milkYieldMean > 0
    ? Math.round(((today.milkYield - baseline.milkYieldMean) / baseline.milkYieldMean) * 100)
    : 0;

  // Activity difference
  const activityDiff = today.activityScore - baseline.activityMean;
  const isHighActivity = activityDiff > baseline.activityStd * 1.5;

  // Estrus Filter: High activity + feed down => Likely Estrus (in heat), NOT sick
  const isEstrusSuspected = isHighActivity && feedVariancePercent < -8;

  // Primary Changes Flagged
  const primaryChanges: string[] = [];
  if (ruminationVariancePercent < -15) {
    primaryChanges.push(`Rumination down ${Math.abs(ruminationVariancePercent)}%`);
  } else if (ruminationVariancePercent > 15) {
    primaryChanges.push(`Rumination up ${ruminationVariancePercent}%`);
  }

  if (feedVariancePercent < -15) {
    primaryChanges.push(`Feed time down ${Math.abs(feedVariancePercent)}%`);
  } else if (feedVariancePercent > 15) {
    primaryChanges.push(`Feed time up ${feedVariancePercent}%`);
  }

  if (Math.abs(milkVariancePercent) > 15) {
    primaryChanges.push(`Milk yield ${milkVariancePercent > 0 ? 'up' : 'down'} ${Math.abs(milkVariancePercent)}%`);
  } else if (today.milkYield > 0 && Math.abs(milkVariancePercent) <= 6 && ruminationVariancePercent < -25) {
    // Stage 2 signature: Rumination dropping while milk remains flat
    primaryChanges.push(`Early Stage 2: Milk steady despite rumination drop`);
  }

  // Combined Risk Index (0 - 100 scale)
  // Weighting: 45% Rumination Z + 35% Feed Z + 20% Milk Z
  let rawRisk = 0;
  if (!isEstrusSuspected) {
    const positiveRuminationZ = Math.max(0, ruminationZScore);
    const positiveFeedZ = Math.max(0, feedZScore);
    const positiveMilkZ = Math.max(0, milkZScore);

    rawRisk = (positiveRuminationZ * 18) + (positiveFeedZ * 14) + (positiveMilkZ * 8);

    // Instant escalation trigger: Rumination down >= 30% while milk hasn't collapsed yet
    if (ruminationVariancePercent <= -30 && Math.abs(milkVariancePercent) < 15) {
      rawRisk = Math.max(rawRisk, 78);
    }
  } else {
    // Suppress sickness risk index if cow is filtered into estrus
    rawRisk = 25;
  }

  const combinedRiskIndex = Math.min(100, Math.max(0, Math.round(rawRisk)));

  // Priority classification
  let priority: AlertPriority = 'normal';
  if (isEstrusSuspected) {
    priority = 'medium';
  } else if (combinedRiskIndex >= 70) {
    priority = 'high';
  } else if (combinedRiskIndex >= 45) {
    priority = 'medium';
  } else if (combinedRiskIndex >= 25) {
    priority = 'low';
  } else {
    priority = 'normal';
  }

  // Actionable Suggested Action
  let suggestedAction = 'Nominal status - No action required';
  if (isEstrusSuspected) {
    suggestedAction = 'Estrus check: Verify artificial insemination window or heat mount marks';
  } else if (priority === 'high') {
    if (ruminationVariancePercent <= -30) {
      suggestedAction = 'Inspect today: Check feed bunk intake, oral cavity/jaw movement, and body temp';
    } else {
      suggestedAction = 'Urgent physical veterinary review: check rumen fill and udder firmness';
    }
  } else if (priority === 'medium') {
    suggestedAction = 'Monitor next milking session & inspect feed bunk accessibility';
  } else if (priority === 'low') {
    suggestedAction = 'Scheduled check during next routine herd walkthrough';
  }

  return {
    feedZScore: Number(feedZScore.toFixed(2)),
    ruminationZScore: Number(ruminationZScore.toFixed(2)),
    milkZScore: Number(milkZScore.toFixed(2)),
    combinedRiskIndex,
    priority,
    primaryChanges: primaryChanges.length ? primaryChanges : ['Within normal variance (<10%)'],
    suggestedAction,
    isEstrusSuspected,
    feedVariancePercent,
    ruminationVariancePercent,
    milkVariancePercent,
  };
}
