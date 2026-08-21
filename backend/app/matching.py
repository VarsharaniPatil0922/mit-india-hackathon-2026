import math
import itertools
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from datetime import datetime
from .models import Worker, Event, EventRole, WorkerAvailability, CrewAssignment

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

def filter_skill(worker: Worker, role: EventRole) -> bool:
    return worker.skill_category == role.role_name

def filter_availability(worker: Worker, event: Event, db: Session) -> bool:
    avail = db.query(WorkerAvailability).filter(
        WorkerAvailability.worker_id == worker.id,
        WorkerAvailability.date == event.date
    ).first()
    
    if not avail:
        return False
        
    fmt = "%H:%M"
    try:
        w_start = datetime.strptime(avail.start_time, fmt).time()
        w_end = datetime.strptime(avail.end_time, fmt).time()
        e_start = datetime.strptime(event.start_time, fmt).time()
        e_end = datetime.strptime(event.end_time, fmt).time()
        
        if w_start <= e_start and w_end >= e_end:
            return True
        return False
    except ValueError:
        return False

def filter_distance(worker: Worker, event: Event) -> tuple[bool, float]:
    dist = calculate_distance(event.latitude, event.longitude, worker.latitude, worker.longitude)
    return (dist <= event.proximity_radius, dist)

def filter_booking_conflicts(worker: Worker, event: Event, db: Session) -> bool:
    assignments = db.query(CrewAssignment).filter(
        CrewAssignment.worker_id == worker.id,
        CrewAssignment.status.in_(["pending", "accepted"])
    ).all()
    
    fmt = "%H:%M"
    try:
        e1_start = datetime.strptime(event.start_time, fmt).time()
        e1_end = datetime.strptime(event.end_time, fmt).time()
    except ValueError:
        return True
        
    for assign in assignments:
        assigned_event = assign.event
        if assigned_event.date == event.date:
            try:
                e2_start = datetime.strptime(assigned_event.start_time, fmt).time()
                e2_end = datetime.strptime(assigned_event.end_time, fmt).time()
                
                # Check overlap
                if e1_start < e2_end and e1_end > e2_start:
                    return False
            except ValueError:
                pass
    return True

def get_eligible_workers(event: Event, roles: List[EventRole], all_workers: List[Worker], db: Session) -> Dict[int, Any]:
    results = {}
    
    for role in roles:
        eligible_candidates = []
        excluded_summary = {
            "wrong_skill": 0,
            "unavailable": 0,
            "outside_radius": 0,
            "booking_conflict": 0
        }
        
        for worker in all_workers:
            # Phase 5: Exclude workers who have been marked as no_show for this event
            no_show = db.query(CrewAssignment).filter(
                CrewAssignment.event_id == event.id,
                CrewAssignment.worker_id == worker.id,
                CrewAssignment.status == "no_show"
            ).first()
            if no_show:
                excluded_summary["unavailable"] += 1
                continue
                
            if not filter_skill(worker, role):
                excluded_summary["wrong_skill"] += 1
                continue
                
            if not filter_availability(worker, event, db):
                excluded_summary["unavailable"] += 1
                continue
                
            is_within_radius, dist = filter_distance(worker, event)
            if not is_within_radius:
                excluded_summary["outside_radius"] += 1
                continue
                
            if not filter_booking_conflicts(worker, event, db):
                excluded_summary["booking_conflict"] += 1
                continue
                
            eligible_candidates.append({
                "worker": worker,
                "distanceKm": dist,
                "score": 0,
                "matchReasons": ["Eligible"]
            })
            
        results[role.id] = {
            "eligible_candidates": eligible_candidates,
            "excluded_summary": excluded_summary
        }
        
    return results

def score_and_rank_candidates(event: Event, role: EventRole, eligible_candidates: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    for candidate in eligible_candidates:
        worker = candidate["worker"]
        dist = candidate["distanceKm"]
        
        # 1. Rating Score (25%)
        rating = float(worker.rating)
        rating_score = max(0.0, min(100.0, (rating / 5.0) * 100))
        
        # 2. Reliability Score (25%)
        reliability_score = max(0.0, min(100.0, float(worker.reliability_score)))
        
        # 3. Proximity Score (20%)
        proximity_radius = float(event.proximity_radius)
        if proximity_radius > 0:
            proximity_score = max(0.0, min(100.0, 100.0 * (1.0 - (dist / proximity_radius))))
        else:
            proximity_score = 100.0 if dist == 0 else 0.0
            
        # 4. Price Fit Score (20%)
        estimated_price = (worker.price_min + worker.price_max) / 2.0
        role_budget = float(event.budget) / float(role.quantity_needed) if role.quantity_needed > 0 else 0.0
        
        if role_budget > 0:
            if estimated_price <= role_budget:
                price_score = 100.0
            else:
                price_score = max(0.0, 100.0 - ((estimated_price - role_budget) / role_budget) * 100.0)
        else:
            price_score = 0.0
            
        # 5. Skill Match Score (10%)
        skill_score = 100.0
        
        # Combine
        final_score = (rating_score * 0.25) + (reliability_score * 0.25) + (proximity_score * 0.20) + (price_score * 0.20) + (skill_score * 0.10)
        
        match_reasons = []
        if rating_score >= 90:
            match_reasons.append("Excellent rating")
        if reliability_score >= 90:
            match_reasons.append("Highly reliable")
        if proximity_score >= 80:
            match_reasons.append("Very close to venue")
        if price_score >= 80:
            match_reasons.append("Good price fit")
            
        if not match_reasons:
            match_reasons.append("Strong overall match")
            
        candidate["score"] = round(final_score, 2)
        candidate["scoreBreakdown"] = {
            "rating": round(rating_score),
            "reliability": round(reliability_score),
            "proximity": round(proximity_score),
            "priceFit": round(price_score),
            "skillMatch": round(skill_score)
        }
        candidate["matchReasons"] = match_reasons
        
    # Sort descending by score
    eligible_candidates.sort(key=lambda c: c["score"], reverse=True)
    return eligible_candidates

def optimize_crew_combinations(event: Event, roles: List[EventRole], candidates_by_role: Dict[int, List[Dict[str, Any]]]) -> Dict[str, Any]:
    roles_list = []
    for r in roles:
        # candidates_by_role is already sorted by score from Phase 2
        cands = candidates_by_role.get(r.id, [])
        roles_list.append({
            "role_id": r.id,
            "role_name": r.role_name,
            "quantity": r.quantity_needed,
            "candidates": cands
        })
        
    for r in roles_list:
        if len(r["candidates"]) < r["quantity"]:
            return {
                "status": "unfilled_roles",
                "reason": f"Only {len(r['candidates'])} eligible workers available for {r['role_name']}"
            }
            
    best_crew = None
    best_score = -1.0
    best_cost = float('inf')
    budget = float(event.budget)
    
    def backtrack(role_index: int, current_crew: List[Dict], current_cost: float, current_score: float, selected_worker_ids: set):
        nonlocal best_crew, best_score, best_cost
        
        if current_cost > budget:
            return
            
        if role_index == len(roles_list):
            if current_score > best_score or (abs(current_score - best_score) < 0.001 and current_cost < best_cost):
                best_score = current_score
                best_cost = current_cost
                best_crew = list(current_crew)
            return
            
        role_req = roles_list[role_index]
        req_quantity = role_req["quantity"]
        candidates = role_req["candidates"]
        
        valid_combos = []
        for combo in itertools.combinations(candidates, req_quantity):
            combo_worker_ids = set(c["worker"].id for c in combo)
            if len(combo_worker_ids) < req_quantity:
                continue # Edge case: same worker in combo
            
            if combo_worker_ids.isdisjoint(selected_worker_ids):
                combo_cost = sum((c["worker"].price_min + c["worker"].price_max) / 2.0 for c in combo)
                combo_score = sum(c["score"] for c in combo)
                
                if current_cost + combo_cost <= budget:
                    valid_combos.append({
                        "combo": combo,
                        "cost": combo_cost,
                        "score": combo_score,
                        "worker_ids": combo_worker_ids
                    })
                    
        valid_combos.sort(key=lambda x: x["score"], reverse=True)
        
        # Limit branching to top 100 combinations per role
        for vc in valid_combos[:100]:
            next_crew = current_crew + [{"candidate": c, "role": role_req} for c in vc["combo"]]
            next_ids = selected_worker_ids.union(vc["worker_ids"])
            backtrack(role_index + 1, next_crew, current_cost + vc["cost"], current_score + vc["score"], next_ids)

    backtrack(0, [], 0.0, 0.0, set())
    
    if best_crew is None:
        return {
            "status": "no_feasible_crew",
            "reason": "No combination of workers fits within the budget while fulfilling all constraints."
        }
        
    formatted_crew = []
    for item in best_crew:
        c = item["candidate"]
        formatted_crew.append({
            "worker_id": c["worker"].id,
            "name": c["worker"].name,
            "role": item["role"]["role_name"],
            "role_id": item["role"]["role_id"],
            "estimated_price": (c["worker"].price_min + c["worker"].price_max) / 2.0,
            "score": c["score"]
        })
        
    return {
        "status": "optimized",
        "crew": formatted_crew,
        "total_cost": best_cost,
        "budget": budget,
        "remaining_budget": budget - best_cost,
        "total_score": round(best_score, 2),
        "roles": [
             {
                 "role_name": r["role_name"],
                 "required": r["quantity"],
                 "selected": r["quantity"],
                 "status": "filled"
             } for r in roles_list
        ]
    }
