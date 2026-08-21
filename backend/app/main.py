from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional
from fastapi import Query

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

@app.get("/api/crew/optimize/{event_id}")
def optimize_crew(event_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
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
    return optimization_result

@app.post("/api/crew/confirm")
def confirm_crew(assignments: List[schemas.CrewAssignmentCreate], db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    # Create crew assignments and dispatch notifications
    for assign in assignments:
        new_assign = models.CrewAssignment(
            event_id=assign.event_id,
            role_id=assign.role_id,
            worker_id=assign.worker_id,
            price_agreed=assign.price_agreed
        )
        db.add(new_assign)
        
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

@app.get("/api/worker/notifications", response_model=List[schemas.NotificationResponse])
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
