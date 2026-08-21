from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from fastapi import Query
from pydantic import BaseModel

from . import models, schemas, auth, matching
from .database import engine, get_db

# Create DB tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="CrewConnect API")

# Setup CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For hackathon MVP
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/auth/register", response_model=schemas.Token)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
        
    hashed_password = auth.get_password_hash(user.password)
    new_user = models.User(
        email=user.email,
        password_hash=hashed_password,
        user_type=user.user_type
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Auto-create profile stub
    if user.user_type == 'organizer':
        org = models.Organizer(user_id=new_user.id, name=user.email.split('@')[0])
        db.add(org)
    elif user.user_type == 'worker':
        worker = models.Worker(user_id=new_user.id, name=user.email.split('@')[0])
        db.add(worker)
    db.commit()

    access_token = auth.create_access_token(data={"sub": new_user.email})
    return {"access_token": access_token, "token_type": "bearer", "user_type": new_user.user_type}

@app.post("/api/auth/login", response_model=schemas.Token)
def login(user: schemas.UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if not db_user or not auth.verify_password(user.password, db_user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")
        
    access_token = auth.create_access_token(data={"sub": db_user.email})
    return {"access_token": access_token, "token_type": "bearer", "user_type": db_user.user_type}

@app.post("/api/events")
def create_event(event: schemas.EventCreate, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    if current_user.user_type != 'organizer':
        raise HTTPException(status_code=403, detail="Only organizers can create events")
        
    org = db.query(models.Organizer).filter(models.Organizer.user_id == current_user.id).first()
    
    try:
        new_event = models.Event(
            organizer_id=org.id,
            event_type=event.event_type,
            date=event.event_date,
            start_time=event.start_time,
            end_time=event.end_time,
            location=event.location,
            latitude=event.latitude,
            longitude=event.longitude,
            proximity_radius=event.proximity_radius,
            budget=event.budget,
            status="MATCHING"
        )
        db.add(new_event)
        db.flush() # Flush to get new_event.id without committing the transaction
        
        for role in event.roles:
            new_role = models.EventRole(
                event_id=new_event.id,
                role_name=role.role_name,
                quantity_needed=role.quantity_needed
            )
            db.add(new_role)
            
        # Commit both the event and the roles atomically
        db.commit()
        db.refresh(new_event)
        
        # Prepare response
        roles_response = []
        total_workers = 0
        for r in new_event.roles:
            roles_response.append({
                "id": r.id,
                "role_name": r.role_name,
                "quantity_needed": r.quantity_needed
            })
            total_workers += r.quantity_needed
            
        return {
            "event_id": new_event.id,
            "status": new_event.status,
            "event_type": new_event.event_type,
            "event_date": new_event.date,
            "location": new_event.location,
            "budget": new_event.budget,
            "roles": roles_response,
            "total_required_workers": total_workers
        }
    except Exception as e:
        print("Exception in create_event:", e)
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to create event. Transaction rolled back.")

@app.get("/api/events")
def get_organizer_events(db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    if current_user.user_type != 'organizer':
        raise HTTPException(status_code=403, detail="Only organizers can access events")
        
    org = db.query(models.Organizer).filter(models.Organizer.user_id == current_user.id).first()
    events = db.query(models.Event).filter(models.Event.organizer_id == org.id).all()
    
    results = []
    for event in events:
        roles_response = []
        total_workers = 0
        for r in event.roles:
            roles_response.append({
                "id": r.id,
                "role_name": r.role_name,
                "quantity_needed": r.quantity_needed
            })
            total_workers += r.quantity_needed
            
        results.append({
            "event_id": event.id,
            "status": event.status,
            "event_type": event.event_type,
            "event_date": event.date,
            "start_time": event.start_time,
            "end_time": event.end_time,
            "location": event.location,
            "budget": event.budget,
            "roles": roles_response,
            "total_required_workers": total_workers
        })
        
    return results

@app.get("/api/events/{event_id}")
def get_event(event_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    if current_user.user_type != 'organizer':
        raise HTTPException(status_code=403, detail="Only organizers can access events")
        
    org = db.query(models.Organizer).filter(models.Organizer.user_id == current_user.id).first()
    event = db.query(models.Event).filter(models.Event.id == event_id).first()
    
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
        
    if event.organizer_id != org.id:
        raise HTTPException(status_code=403, detail="Not authorized to access this event")
        
    roles_response = []
    total_workers = 0
    for r in event.roles:
        roles_response.append({
            "id": r.id,
            "role_name": r.role_name,
            "quantity_needed": r.quantity_needed
        })
        total_workers += r.quantity_needed
        
    return {
        "event_id": event.id,
        "status": event.status,
        "event_type": event.event_type,
        "event_date": event.date,
        "start_time": event.start_time,
        "end_time": event.end_time,
        "location": event.location,
        "budget": event.budget,
        "roles": roles_response,
        "total_required_workers": total_workers
    }

def run_optimization_pipeline(event_id: int, db: Session):
    event = db.query(models.Event).filter(models.Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
        
    roles = db.query(models.EventRole).filter(models.EventRole.event_id == event_id).all()
    all_workers = db.query(models.Worker).all()
    
    # Run optimization engine (Phase 1: Eligibility filtering)
    results = matching.get_eligible_workers(event, roles, all_workers, db)
    
    # Format for JSON response and prepare for Phase 3
    formatted_results = []
    candidates_by_role = {}
    
    for role in roles:
        role_data = results.get(role.id, {})
        role_candidates = role_data.get("eligible_candidates", [])
        excluded_summary = role_data.get("excluded_summary", {})
        
        # Phase 2: Worker Scoring
        ranked_candidates = matching.score_and_rank_candidates(event, role, role_candidates)
        candidates_by_role[role.id] = ranked_candidates
        
        formatted_results.append({
            "role": {
                "id": str(role.id),
                "roleName": role.role_name,
                "quantityNeeded": role.quantity_needed
            },
            "candidates": [
                {
                    "id": str(c["worker"].id),
                    "name": c["worker"].name,
                    "rating": c["worker"].rating,
                    "reliabilityScore": c["worker"].reliability_score,
                    "distanceKm": round(c["distanceKm"], 1),
                    "priceMin": c["worker"].price_min,
                    "priceMax": c["worker"].price_max,
                    "score": c["score"],
                    "scoreBreakdown": c.get("scoreBreakdown", {}),
                    "matchReasons": c["matchReasons"]
                } for c in ranked_candidates
            ],
            "excluded_summary": excluded_summary,
            "eligible_count": len(ranked_candidates)
        })
        
    # Phase 3: Crew Optimization
    optimization_result = matching.optimize_crew_combinations(event, roles, candidates_by_role)
    
    # Merge existing payload to maintain compatibility
    optimization_result["candidate_pools"] = formatted_results
    
    # Phase 4: Backup Selection
    if optimization_result.get("status") == "optimized":
        selected_worker_ids = {w["worker_id"] for w in optimization_result.get("crew", [])}
        
        # Save new recommended crew to DB (Phase 5 requirement)
        db.query(models.CrewAssignment).filter(
            models.CrewAssignment.event_id == event_id,
            models.CrewAssignment.status == "recommended"
        ).delete()
        
        for w in optimization_result.get("crew", []):
            new_assign = models.CrewAssignment(
                event_id=event_id,
                role_id=w["role_id"],
                worker_id=w["worker_id"],
                status="recommended",
                price_agreed=w["estimated_price"]
            )
            db.add(new_assign)
        db.commit()
        
        backup_pools = []
        for role in roles:
            role_backups = []
            rank = 1
            for c in candidates_by_role.get(role.id, []):
                worker = c["worker"]
                if worker.id not in selected_worker_ids:
                    role_backups.append({
                        "worker_id": worker.id,
                        "name": worker.name,
                        "role": role.role_name,
                        "score": round(c["score"], 2),
                        "estimated_price": round((worker.price_min + worker.price_max) / 2, 2),
                        "rank": rank
                    })
                    rank += 1
                    if len(role_backups) == 5:
                        break
            backup_pools.append({
                "role_name": role.role_name,
                "backups": role_backups
            })
        optimization_result["backup_pools"] = backup_pools
    else:
        optimization_result["backup_pools"] = []
        
    return optimization_result

@app.get("/api/crew/optimize/{event_id}")
def optimize_crew(event_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    org = db.query(models.Organizer).filter(models.Organizer.user_id == current_user.id).first()
    event = db.query(models.Event).filter(models.Event.id == event_id).first()
    if not org or not event or event.organizer_id != org.id:
        raise HTTPException(status_code=403, detail="Not authorized to access this event")
    return run_optimization_pipeline(event_id, db)

class ReplaceWorkerRequest(BaseModel):
    event_id: int
    worker_id: int

@app.post("/api/crew/replace-worker")
def replace_worker(req: ReplaceWorkerRequest, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    org = db.query(models.Organizer).filter(models.Organizer.user_id == current_user.id).first()
    event = db.query(models.Event).filter(models.Event.id == req.event_id).first()
    worker = db.query(models.Worker).filter(models.Worker.id == req.worker_id).first()
    
    if not event or not worker:
        raise HTTPException(status_code=404, detail="Event or worker not found")
        
    if not org or event.organizer_id != org.id:
        raise HTTPException(status_code=403, detail="Not authorized to access this event")
        
    assignment = db.query(models.CrewAssignment).filter(
        models.CrewAssignment.event_id == req.event_id,
        models.CrewAssignment.worker_id == req.worker_id,
        models.CrewAssignment.status.in_(["recommended", "confirmed"])
    ).first()
    
    if not assignment:
        raise HTTPException(status_code=400, detail="Worker is not part of the active crew for this event")
        
    # Get previous optimization data
    previous_crew_assignments = db.query(models.CrewAssignment).filter(
        models.CrewAssignment.event_id == req.event_id,
        models.CrewAssignment.status.in_(["recommended", "confirmed"])
    ).all()
    
    previous_crew_data = []
    total_cost_before = 0
    removed_worker_data = None
    for a in previous_crew_assignments:
        total_cost_before += a.price_agreed
        w_data = {
            "worker_id": a.worker_id,
            "name": a.worker.name,
            "role": a.role.role_name,
            "estimated_price": a.price_agreed
        }
        previous_crew_data.append(w_data)
        if a.worker_id == req.worker_id:
            removed_worker_data = w_data
            
    # Mark as no_show
    assignment.status = "no_show"
    db.commit()
    
    # Re-optimize
    new_opt = run_optimization_pipeline(req.event_id, db)
    
    if new_opt.get("status") != "optimized":
        return {
            "status": "no_feasible_crew",
            "reason": "No feasible replacement crew exists"
        }
        
    new_crew_data = new_opt.get("crew", [])
    total_cost_after = sum(w["estimated_price"] for w in new_crew_data)
    
    # Calculate changes
    old_by_role = {}
    for w in previous_crew_data:
        old_by_role.setdefault(w["role"], set()).add(w["name"])
        
    new_by_role = {}
    for w in new_crew_data:
        new_by_role.setdefault(w["role"], set()).add(w["name"])
        
    changes = []
    for role_name in set(old_by_role.keys()).union(new_by_role.keys()):
        old_set = old_by_role.get(role_name, set())
        new_set = new_by_role.get(role_name, set())
        removed = old_set - new_set
        added = new_set - old_set
        for r, a in zip(list(removed) + [None]*max(0, len(added)-len(removed)), list(added) + [None]*max(0, len(removed)-len(added))):
            if r or a:
                changes.append({
                    "role": role_name,
                    "removed": r,
                    "added": a
                })
                
    return {
        "status": "reoptimized",
        "trigger": {
            "worker_id": req.worker_id,
            "reason": "no_show"
        },
        "removed_worker": removed_worker_data,
        "previous_crew": previous_crew_data,
        "new_crew": new_crew_data,
        "changes": changes,
        "total_cost_before": total_cost_before,
        "total_cost_after": total_cost_after,
        "budget": event.budget,
        "remaining_budget": event.budget - total_cost_after,
        "reoptimization": {
            "phase1": "completed",
            "phase2": "completed",
            "phase3": "completed"
        },
        "backup_pools": new_opt.get("backup_pools", [])
    }


@app.post("/api/crew/confirm")
def confirm_crew(assignments: List[schemas.CrewAssignmentCreate], db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    org = db.query(models.Organizer).filter(models.Organizer.user_id == current_user.id).first()
    
    # Update recommended assignments to pending
    for assign in assignments:
        event = db.query(models.Event).filter(models.Event.id == assign.event_id).first()
        if not event or not org or event.organizer_id != org.id:
            raise HTTPException(status_code=403, detail="Not authorized to modify this event")
            
        existing_assign = db.query(models.CrewAssignment).filter(
            models.CrewAssignment.event_id == assign.event_id,
            models.CrewAssignment.worker_id == assign.worker_id,
            models.CrewAssignment.status == "recommended"
        ).first()
        
        if existing_assign:
            existing_assign.status = "pending"
            existing_assign.price_agreed = assign.price_agreed
            
            # Create notification for worker
            worker = db.query(models.Worker).filter(models.Worker.id == assign.worker_id).first()
            event = db.query(models.Event).filter(models.Event.id == assign.event_id).first()
            if worker and event:
                msg = f"You have been requested for {event.event_type} at {event.location} on {event.date}."
                notif = models.Notification(
                    user_id=worker.user_id,
                    event_id=event.id,
                    message=msg
                )
                db.add(notif)
            
    db.commit()
    return {"message": "Crew confirmed and notified"}

@app.get("/api/crew/{event_id}")
def get_crew_for_event(event_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    org = db.query(models.Organizer).filter(models.Organizer.user_id == current_user.id).first()
    event = db.query(models.Event).filter(models.Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
        
    if not org or event.organizer_id != org.id:
        raise HTTPException(status_code=403, detail="Not authorized to access this event")
        
    assignments = db.query(models.CrewAssignment).filter(
        models.CrewAssignment.event_id == event_id,
        models.CrewAssignment.status.in_(["pending", "confirmed"])
    ).all()
    
    crew_list = []
    total_cost = 0
    for a in assignments:
        crew_list.append({
            "assignment_id": a.id,
            "role": a.role.role_name,
            "quantity": 1,
            "selected": {
                "id": a.worker.id,
                "name": a.worker.name,
                "price": a.price_agreed,
                "rating": a.worker.rating,
                "reliability": a.worker.reliability_score
            },
            "status": a.status
        })
        total_cost += a.price_agreed
        
    return {
        "event_id": event.id,
        "crew": crew_list,
        "budget": {
            "total": event.budget,
            "used": total_cost,
            "remaining": event.budget - total_cost
        }
    }

@app.get("/api/worker/dashboard")
def get_worker_dashboard(db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    worker = db.query(models.Worker).filter(models.Worker.user_id == current_user.id).first()
    if not worker:
        return {"offers": []}
        
    assignments = db.query(models.CrewAssignment).filter(
        models.CrewAssignment.worker_id == worker.id,
        models.CrewAssignment.status.in_(["pending", "confirmed", "declined"])
    ).all()
    
    offers = []
    for a in assignments:
        offers.append({
            "id": str(a.id),
            "assignment_id": a.id,
            "eventName": a.event.title,
            "role": a.role.role_name,
            "date": f"{a.event.event_date} • {a.event.start_time}",
            "location": a.event.location,
            "price": a.price_agreed,
            "status": a.status,
            "expiresIn": "24 hours",
            "matchScore": 95
        })
        
    return {"offers": offers}

class WorkerResponse(BaseModel):
    assignment_id: int
    action: str # "accepted" or "declined"

@app.post("/api/worker/respond")
def worker_respond(req: WorkerResponse, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    worker = db.query(models.Worker).filter(models.Worker.user_id == current_user.id).first()
    if not worker:
        raise HTTPException(status_code=404, detail="Worker profile not found")
        
    assignment = db.query(models.CrewAssignment).filter(
        models.CrewAssignment.id == req.assignment_id,
        models.CrewAssignment.worker_id == worker.id
    ).first()
    
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")
        
    if req.action == "accepted":
        assignment.status = "confirmed"
        msg = f"Worker {worker.name} accepted your request for {assignment.role.role_name}."
    elif req.action == "declined":
        assignment.status = "declined"
        msg = f"Worker {worker.name} declined your request for {assignment.role.role_name}."
    else:
        raise HTTPException(status_code=400, detail="Invalid action")
        
    # Notify the organizer
    notif = models.Notification(
        user_id=assignment.event.organizer.user_id,
        event_id=assignment.event_id,
        message=msg
    )
    db.add(notif)
    db.commit()
    return {"status": "success", "new_status": assignment.status}

@app.get("/api/notifications", response_model=List[schemas.NotificationResponse])
def get_notifications(db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    notifs = db.query(models.Notification).filter(models.Notification.user_id == current_user.id).order_by(models.Notification.created_at.desc()).all()
    return notifs

import math

def haversine(lon1, lat1, lon2, lat2):
    lon1, lat1, lon2, lat2 = map(math.radians, [lon1, lat1, lon2, lat2])
    dlon = lon2 - lon1 
    dlat = lat2 - lat1 
    a = math.sin(dlat/2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon/2)**2
    c = 2 * math.asin(math.sqrt(a)) 
    r = 6371 # Radius of earth in kilometers
    return c * r

@app.get("/api/workers/filter")
def filter_workers(
    event_id: int = Query(...),
    skills: Optional[List[str]] = Query(None),
    min_rating: Optional[float] = Query(None),
    min_price: Optional[int] = Query(None),
    max_price: Optional[int] = Query(None),
    radius_km: Optional[int] = Query(None),
    min_reliability: Optional[int] = Query(None),
    availability: Optional[List[str]] = Query(None),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    event = db.query(models.Event).filter(models.Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
        
    query = db.query(models.Worker)
    
    if skills:
        query = query.filter(models.Worker.skill_category.in_(skills))
        
    if min_price is not None:
        query = query.filter(models.Worker.price_min >= min_price)
    if max_price is not None:
        query = query.filter(models.Worker.price_max <= max_price)
        
    if min_reliability is not None:
        query = query.filter(models.Worker.reliability_score >= min_reliability)
        
    if min_rating is not None:
        query = query.filter(models.Worker.rating >= min_rating)
        
    workers = query.all()
    filtered_workers = []
    
    for worker in workers:
        dist = haversine(event.longitude, event.latitude, worker.longitude, worker.latitude)
        if radius_km is not None and dist > radius_km:
            continue
            
        if availability:
            avail_record = db.query(models.WorkerAvailability).filter(
                models.WorkerAvailability.worker_id == worker.id,
                models.WorkerAvailability.date == event.date
            ).first()
            
            if not avail_record:
                continue
                
            w_start = avail_record.start_time
            w_end = avail_record.end_time
            
            slots = {
                "Morning": ("08:00", "12:00"),
                "Afternoon": ("12:00", "17:00"),
                "Evening": ("17:00", "22:00")
            }
            
            has_overlap = False
            for slot in availability:
                if slot in slots:
                    s_start, s_end = slots[slot]
                    if w_start < s_end and w_end > s_start:
                        has_overlap = True
                        break
            if not has_overlap:
                continue
                
        filtered_workers.append({
            "worker": worker,
            "distance": dist
        })
        
    filtered_workers.sort(key=lambda x: (
        -x["worker"].rating,
        -x["worker"].reliability_score,
        x["distance"],
        x["worker"].price_min
    ))
    
    response = []
    for fw in filtered_workers:
        w = fw["worker"]
        response.append({
            "worker_id": w.id,
            "full_name": w.name,
            "skill_category": w.skill_category,
            "rating": w.rating,
            "reliability_score": w.reliability_score,
            "distance_km": round(fw["distance"], 1),
            "price": f"₹{w.price_min} - ₹{w.price_max}",
            "availability_slot": "Available", 
            "phone": "+91 9876543210", 
            "email": w.user.email if w.user else f"worker{w.id}@crewconnect.com"
        })
        
    return response

@app.get("/")
def read_root():
    return {"status": "CrewConnect API is running"}
