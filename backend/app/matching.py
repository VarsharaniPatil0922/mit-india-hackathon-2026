import math
from typing import List
from .models import Worker, Event, EventRole

def calculate_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    # Haversine formula
    R = 6371.0 # Earth radius in kilometers

    lat1_rad = math.radians(lat1)
    lon1_rad = math.radians(lon1)
    lat2_rad = math.radians(lat2)
    lon2_rad = math.radians(lon2)

    dlon = lon2_rad - lon1_rad
    dlat = lat2_rad - lat1_rad

    a = math.sin(dlat / 2)**2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

    distance = R * c
    return distance

def optimize_crew_for_event(event: Event, roles: List[EventRole], available_workers: List[Worker]):
    """
    Python port of the Crew Optimization Engine.
    Filters available_workers based on requirements and ranks them.
    Returns a dict mapping role.id -> list of ranked workers (with score dict).
    """
    
    results = {}

    for role in roles:
        candidates = []
        
        # 1. Filter
        for worker in available_workers:
            # Skill check
            if worker.skill_category != role.role_name:
                continue
                
            # Proximity check
            dist = calculate_distance(event.latitude, event.longitude, worker.latitude, worker.longitude)
            if dist > event.proximity_radius:
                continue
                
            # (Note: In a full app, we also check worker_availability against event date/time here)
            
            candidates.append((worker, dist))
            
        # 2. Score
        scored_candidates = []
        for worker, dist in candidates:
            score = 0
            reasons = []

            # Rating score (0-40 points)
            rating_score = (worker.rating / 5.0) * 40
            score += rating_score
            if worker.rating >= 4.5:
                reasons.append("Top Rated")

            # Reliability score (0-30 points)
            rel_score = (worker.reliability_score / 100.0) * 30
            score += rel_score
            if worker.reliability_score >= 90:
                reasons.append("Highly Reliable")

            # Proximity score (0-20 points)
            if dist < 5:
                score += 20
                reasons.append("Very Close")
            elif dist < event.proximity_radius:
                proximity_ratio = 1 - (dist / event.proximity_radius)
                score += (proximity_ratio * 20)
            
            # Budget check (0-10 points) - simplified heuristic
            avg_price = (worker.price_min + worker.price_max) / 2
            # Assuming budget is evenly distributed among all required people
            total_people = sum(r.quantity_needed for r in roles)
            per_person_budget = event.budget / total_people if total_people > 0 else 0
            
            if avg_price <= per_person_budget:
                score += 10
                reasons.append("Fits Budget")
                
            scored_candidates.append({
                "worker": worker,
                "score": round(score),
                "distanceKm": round(dist, 1),
                "matchReasons": reasons
            })
            
        # Sort by score descending
        scored_candidates.sort(key=lambda x: x["score"], reverse=True)
        results[role.id] = scored_candidates
        
    return results
