import math
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
