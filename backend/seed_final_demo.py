import sys
import os
import datetime

# Add the backend directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal, engine
from app import models
from app.auth import get_password_hash

# Initialize tables
models.Base.metadata.create_all(bind=engine)

def seed_final_demo():
    db = SessionLocal()
    
    # 1. CLEAN SLATE: Delete old demo workers, events, assignments, availability
    print("Cleaning old demo data...")
    demo_emails = ["demo@crewconnect.com"] + [f"demoworker{i}@crewconnect.com" for i in range(1, 50)]
    users = db.query(models.User).filter(models.User.email.in_(demo_emails)).all()
    
    worker_ids = []
    for u in users:
        w = db.query(models.Worker).filter(models.Worker.user_id == u.id).first()
        if w:
            worker_ids.append(w.id)
            db.query(models.WorkerAvailability).filter(models.WorkerAvailability.worker_id == w.id).delete()
            db.query(models.CrewAssignment).filter(models.CrewAssignment.worker_id == w.id).delete()
            db.delete(w)
    
    org_user = db.query(models.User).filter(models.User.email == "demo@crewconnect.com").first()
    if org_user:
        org = db.query(models.Organizer).filter(models.Organizer.user_id == org_user.id).first()
        if org:
            events = db.query(models.Event).filter(models.Event.organizer_id == org.id).all()
            for e in events:
                db.query(models.CrewAssignment).filter(models.CrewAssignment.event_id == e.id).delete()
                db.query(models.EventRole).filter(models.EventRole.event_id == e.id).delete()
                db.delete(e)
    
    db.commit()

    # 2. CREATE DEMO ORGANIZER
    print("Creating demo organizer...")
    if not org_user:
        org_user = models.User(
            email="demo@crewconnect.com",
            password_hash=get_password_hash("Demo@123"),
            user_type="organizer"
        )
        db.add(org_user)
        db.commit()
        db.refresh(org_user)
        
    org = db.query(models.Organizer).filter(models.Organizer.user_id == org_user.id).first()
    if not org:
        org = models.Organizer(user_id=org_user.id, company_name="CrewConnect Hackathon Team")
        db.add(org)
        db.commit()
        db.refresh(org)

    # 3. CREATE DEMO EVENT
    print("Creating demo event...")
    target_date = datetime.date.today() + datetime.timedelta(days=7)
    target_date_str = target_date.strftime("%Y-%m-%d")

    event = models.Event(
        organizer_id=org.id,
        event_type="MIT National Hackathon — AI Staffing Demo",
        date=target_date_str,
        start_time="09:00",
        end_time="17:00",
        location="Pune, Maharashtra",
        latitude=18.5204,
        longitude=73.8567,
        proximity_radius=50.0,
        budget=50000,
        status="active"
    )
    db.add(event)
    db.commit()
    db.refresh(event)

    roles = [
        ("Photographer", 2),
        ("Videographer", 2),
        ("Security", 2),
        ("Catering", 1),
        ("Event Coordinator", 1)
    ]
    for r, q in roles:
        db.add(models.EventRole(event_id=event.id, role_name=r, quantity_needed=q))
    db.commit()

    # 4. CREATE DEMO WORKERS
    # Primary workers have 96% reliability and 4.9 rating.
    # Backup workers have 85-91% reliability and 4.5-4.8 rating.
    workers_data = [
        # Photographer (2 Primary, 3 Backups)
        {"name": "Rahul Sharma", "skill": "Photographer", "rel": 96, "rate_min": 2500, "rate_max": 2500, "rating": 4.9}, # PRIMARY
        {"name": "Sneha Kulkarni", "skill": "Photographer", "rel": 96, "rate_min": 2600, "rate_max": 2600, "rating": 4.9}, # PRIMARY
        {"name": "Vikram Desai", "skill": "Photographer", "rel": 91, "rate_min": 4000, "rate_max": 4000, "rating": 4.7}, # BACKUP
        {"name": "Ananya Rao", "skill": "Photographer", "rel": 89, "rate_min": 4100, "rate_max": 4100, "rating": 4.6}, # BACKUP
        {"name": "Rohan Mehta", "skill": "Photographer", "rel": 87, "rate_min": 4500, "rate_max": 4500, "rating": 4.5}, # BACKUP

        # Videographer (2 Primary, 2 Backups)
        {"name": "Aditya Rao", "skill": "Videographer", "rel": 96, "rate_min": 3000, "rate_max": 3000, "rating": 4.9}, # PRIMARY
        {"name": "Neha Joshi", "skill": "Videographer", "rel": 96, "rate_min": 3100, "rate_max": 3100, "rating": 4.9}, # PRIMARY
        {"name": "Arjun Patel", "skill": "Videographer", "rel": 90, "rate_min": 4800, "rate_max": 4800, "rating": 4.7}, # BACKUP
        {"name": "Priya Shah", "skill": "Videographer", "rel": 88, "rate_min": 5000, "rate_max": 5000, "rating": 4.6}, # BACKUP

        # Security (2 Primary, 2 Backups)
        {"name": "Amit Singh", "skill": "Security", "rel": 96, "rate_min": 1500, "rate_max": 1500, "rating": 4.9}, # PRIMARY
        {"name": "Karan Verma", "skill": "Security", "rel": 96, "rate_min": 1600, "rate_max": 1600, "rating": 4.9}, # PRIMARY
        {"name": "Rohit Kumar", "skill": "Security", "rel": 86, "rate_min": 2500, "rate_max": 2500, "rating": 4.6}, # BACKUP
        {"name": "Suresh Patil", "skill": "Security", "rel": 85, "rate_min": 2700, "rate_max": 2700, "rating": 4.5}, # BACKUP

        # Catering (1 Primary, 2 Backups)
        {"name": "Meera Joshi", "skill": "Catering", "rel": 96, "rate_min": 3500, "rate_max": 3500, "rating": 4.9}, # PRIMARY
        {"name": "Kavita Sharma", "skill": "Catering", "rel": 91, "rate_min": 5000, "rate_max": 5000, "rating": 4.7}, # BACKUP
        {"name": "Pooja Rao", "skill": "Catering", "rel": 89, "rate_min": 5500, "rate_max": 5500, "rating": 4.6}, # BACKUP

        # Event Coordinator (1 Primary, 1 Backup)
        {"name": "Nikhil Shah", "skill": "Event Coordinator", "rel": 96, "rate_min": 4000, "rate_max": 4000, "rating": 4.9}, # PRIMARY
        {"name": "Simran Kapoor", "skill": "Event Coordinator", "rel": 88, "rate_min": 6000, "rate_max": 6000, "rating": 4.6}, # BACKUP
    ]

    print("Creating demo workers and availability...")
    for i, w_data in enumerate(workers_data):
        email = f"demoworker{i+1}@crewconnect.com"
        user = db.query(models.User).filter(models.User.email == email).first()
        
        if not user:
            user = models.User(
                email=email,
                password_hash=get_password_hash("Demo@123"),
                user_type="worker"
            )
            db.add(user)
            db.commit()
            db.refresh(user)
            
        worker = db.query(models.Worker).filter(models.Worker.user_id == user.id).first()
        if not worker:
            worker = models.Worker(
                user_id=user.id,
                name=w_data["name"],
                skill_category=w_data["skill"],
                price_min=w_data["rate_min"],
                price_max=w_data["rate_max"],
                location="Pune",
                latitude=18.5204 + (i * 0.001), # very close to event
                longitude=73.8567 + (i * 0.001),
                rating=w_data["rating"],
                reliability_score=w_data["rel"]
            )
            db.add(worker)
            db.commit()
            db.refresh(worker)

        # 5. CREATE WORKER AVAILABILITY
        avail = models.WorkerAvailability(
            worker_id=worker.id,
            date=target_date_str,
            start_time="00:00",
            end_time="23:59"
        )
        db.add(avail)
    
    db.commit()

    print("====================================")
    print("CREWCONNECT HACKATHON DEMO READY")
    print("Organizer:")
    print("demo@crewconnect.com")
    print("Password:")
    print("Demo@123")
    print("Event:")
    print("MIT National Hackathon — AI Staffing Demo")
    print("Event ID:")
    print(event.id)
    print("Workers:")
    print("18")
    print("Required Crew:")
    print("8")
    print("Primary Candidates:")
    print("8")
    print("Backup Candidates:")
    print("10")
    print("Availability:\nREADY")
    print("AI Matching:\nREADY")
    print("Confirmation:\nREADY")
    print("Recascading:\nREADY")
    print("Payment:\nREADY")
    print("====================================")

if __name__ == "__main__":
    seed_final_demo()
