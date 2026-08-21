import { WorkerProfile, AppEvent, EventRole } from '../types';
import { MOCK_WORKERS } from './workers';

// Haversine formula to calculate distance between two coordinates in km
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  const d = R * c; 
  return d;
}

export interface ScoredWorker extends WorkerProfile {
  score: number;
  distanceKm: number;
  matchReasons: string[];
}

export function matchWorkersForRole(event: AppEvent, role: EventRole): ScoredWorker[] {
  const scoredWorkers: ScoredWorker[] = [];

  MOCK_WORKERS.forEach(worker => {
    // 1. Eligibility Filters
    if (!worker.skillCategories.includes(role.roleName)) return; // Must have role
    if (!worker.availableDates.includes(event.date)) return; // Must be available
    
    const distanceKm = calculateDistance(event.latitude, event.longitude, worker.latitude, worker.longitude);
    if (distanceKm > event.proximityRadius) return; // Must be within radius

    // 2. Scoring
    let score = 0;
    const matchReasons: string[] = [];

    // Proximity score (Max 30 points) - Closer is better
    const proximityScore = Math.max(0, 30 - (distanceKm / event.proximityRadius) * 30);
    score += proximityScore;
    if (distanceKm < 5) matchReasons.push('Very close to venue');

    // Reliability score (Max 30 points)
    const reliabilityScore = (worker.reliabilityScore / 100) * 30;
    score += reliabilityScore;
    if (worker.reliabilityScore > 90) matchReasons.push('Highly reliable history');

    // Rating score (Max 20 points)
    const ratingScore = (worker.rating / 5) * 20;
    score += ratingScore;
    if (worker.rating >= 4.5) matchReasons.push('Top-rated professional');

    // Price fit (Max 20 points) - Lower price is better, but within reason
    // Simple heuristic: If their max price is low compared to the total budget, they are affordable.
    // In a real system, we'd optimize the *entire* crew against the budget, but here we score individually.
    const averagePrice = (worker.priceMin + worker.priceMax) / 2;
    const affordableRatio = Math.max(0, 1 - (averagePrice / (event.budget / Math.max(1, event.roles.reduce((acc, r) => acc + r.quantityNeeded, 0)))));
    const priceScore = affordableRatio * 20;
    score += priceScore;
    if (affordableRatio > 0.6) matchReasons.push('Excellent budget fit');

    scoredWorkers.push({
      ...worker,
      score: Number(score.toFixed(1)),
      distanceKm: Number(distanceKm.toFixed(1)),
      matchReasons
    });
  });

  // Sort descending by score
  return scoredWorkers.sort((a, b) => b.score - a.score);
}
