import os
import sys
import datetime
import random

# Ensure we can import app modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal, engine
from app import models
from app.auth import get_password_hash

# Initialize tables
models.Base.metadata.create_all(bind=engine)

DEMO_ORGANIZER_EMAIL = "demo@crewconnect.com"
DEMO_EVENT_TITLE = "MIT National Hackathon Demo Event"

def get_demo_date():
    target_date = datetime.date(2026, 9, 15)
    if target_date <= datetime.date.today():
        # Dynamic fallback to 14 days in future if original date passed
        target_date = datetime.date.today() + datetime.timedelta(days=14)
    return target_date

def seed_demo():
    db = SessionLocal()
    
    # 1. Create or Find Demo Organizer
    org_user = db.query(models.User).filter(models.User.email == DEMO_ORGANIZER_EMAIL).first()
    
    if org_user:
        print(f"Demo organizer {DEMO_ORGANIZER_EMAIL} already exists. Attempting to ensure demo event/workers are present.")
    else:
        print("Creating demo organizer...")
        org_user = models.User(
            email=DEMO_ORGANIZER_EMAIL,
            password_hash=get_password_hash("Demo@123"),
            user_type="organizer"
        )
        db.add(org_user)
        db.commit()
        db.refresh(org_user)
        
        org = models.Organizer(user_id=org_user.id, name="Hackathon Demo Judge", organization_name="MIT National Hackathon")
        db.add(org)
        db.commit()
        db.refresh(org)

    org = db.query(models.Organizer).filter(models.Organizer.user_id == org_user.id).first()

    # 2. Create or Find Demo Event
    event = db.query(models.Event).filter(
        models.Event.organizer_id == org.id,
        models.Event.event_type == DEMO_EVENT_TITLE
    ).first()
    
    target_date = get_demo_date()
    
    if not event:
        print("Creating demo event...")
        event = models.Event(
            organizer_id=org.id,
            event_type=DEMO_EVENT_TITLE,
            date=target_date.strftime("%Y-%m-%d"),
            start_time="10:00",
            end_time="18:00",
            location="MIT Academy of Engineering, Alandi, Pune",
            latitude=18.6756, # MIT Academy coords
            longitude=73.8906,
            proximity_radius=50.0,
            budget=50000,
            status="matching"
        )
        db.add(event)
        db.commit()
        db.refresh(event)

        # 5. Create Event Roles
        roles = [
            ("Photographer", 2),
            ("Security", 3),
            ("Event Coordinator", 1),
            ("Videographer", 2)
        ]
        
        for role_name, qty in roles:
            db.add(models.EventRole(event_id=event.id, role_name=role_name, quantity_needed=qty))
        db.commit()
    else:
        print("Demo event already exists.")
        target_date = datetime.datetime.strptime(event.date, "%Y-%m-%d").date()

    # 3. Create Demo Workers
    demo_workers_data = [
        # Photographers (Needs 2, providing 5)
        {"name": "Aarav Sharma", "skill": "Photographer", "rel": 98, "rate_min": 2000, "rate_max": 2500, "lat_offset": 0.01},
        {"name": "Priya Patel", "skill": "Photographer", "rel": 95, "rate_min": 1800, "rate_max": 2200, "lat_offset": 0.02},
        {"name": "Rahul Mehta", "skill": "Photographer", "rel": 91, "rate_min": 2500, "rate_max": 3000, "lat_offset": -0.01},
        {"name": "Ananya Deshmukh", "skill": "Photographer", "rel": 85, "rate_min": 1500, "rate_max": 1800, "lat_offset": 0.08},
        {"name": "Rohan Kulkarni", "skill": "Photographer", "rel": 99, "rate_min": 3000, "rate_max": 3500, "lat_offset": -0.05},
        
        # Security (Needs 3, providing 6)
        {"name": "Sneha Joshi", "skill": "Security", "rel": 100, "rate_min": 800, "rate_max": 1000, "lat_offset": 0.01},
        {"name": "Aditya Shah", "skill": "Security", "rel": 95, "rate_min": 900, "rate_max": 1200, "lat_offset": 0.03},
        {"name": "Neha Patil", "skill": "Security", "rel": 92, "rate_min": 750, "rate_max": 900, "lat_offset": -0.02},
        {"name": "Karan Singh", "skill": "Security", "rel": 88, "rate_min": 1000, "rate_max": 1500, "lat_offset": 0.06},
        {"name": "Isha Verma", "skill": "Security", "rel": 90, "rate_min": 800, "rate_max": 1100, "lat_offset": -0.04},
        {"name": "Vikram Rao", "skill": "Security", "rel": 85, "rate_min": 700, "rate_max": 850, "lat_offset": 0.09},
        
        # Event Coordinators (Needs 1, providing 3)
        {"name": "Meera Nair", "skill": "Event Coordinator", "rel": 97, "rate_min": 3500, "rate_max": 4000, "lat_offset": 0.01},
        {"name": "Kavya Menon", "skill": "Event Coordinator", "rel": 92, "rate_min": 3000, "rate_max": 3500, "lat_offset": -0.02},
        {"name": "Arjun Das", "skill": "Event Coordinator", "rel": 88, "rate_min": 2500, "rate_max": 3000, "lat_offset": 0.05},
        
        # Videographers (Needs 2, providing 4)
        {"name": "Sai Kumar", "skill": "Videographer", "rel": 96, "rate_min": 2500, "rate_max": 3500, "lat_offset": 0.02},
        {"name": "Sanya Malhotra", "skill": "Videographer", "rel": 94, "rate_min": 2800, "rate_max": 3200, "lat_offset": -0.01},
        {"name": "Riya Singh", "skill": "Videographer", "rel": 89, "rate_min": 2000, "rate_max": 2500, "lat_offset": 0.07},
        {"name": "Vihaan Reddy", "skill": "Videographer", "rel": 82, "rate_min": 1800, "rate_max": 2200, "lat_offset": -0.08},
    ]

    print("Checking demo workers...")
    for i, w_data in enumerate(demo_workers_data):
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
            
            worker = models.Worker(
                user_id=user.id,
                name=w_data["name"],
                skill_category=w_data["skill"],
                price_min=w_data["rate_min"],
                price_max=w_data["rate_max"],
                location="Pune",
                latitude=18.6756 + w_data["lat_offset"], # Relative to MIT Academy
                longitude=73.8906 + w_data["lat_offset"],
                rating=round(4.0 + (w_data["rel"] / 100), 1), # Correlate rating with rel
                reliability_score=w_data["rel"]
            )
            db.add(worker)
            db.commit()
            db.refresh(worker)
        else:
            worker = db.query(models.Worker).filter(models.Worker.user_id == user.id).first()

        # 6. Ensure Availability for the specific demo event date
        avail = db.query(models.WorkerAvailability).filter(
            models.WorkerAvailability.worker_id == worker.id,
            models.WorkerAvailability.date == target_date.strftime("%Y-%m-%d")
        ).first()
        
        if not avail:
            new_avail = models.WorkerAvailability(
                worker_id=worker.id,
                date=target_date.strftime("%Y-%m-%d"),
                start_time="00:00",
                end_time="23:59"
            )
            db.add(new_avail)

    db.commit()
    print("Demo seed completed successfully!")
    print(f"Organizer: {DEMO_ORGANIZER_EMAIL} / Demo@123")
    print(f"Demo Event '{DEMO_EVENT_TITLE}' created for {target_date.strftime('%Y-%m-%d')}")
    print("Demo Workers: demoworker1@crewconnect.com through demoworker18@crewconnect.com")

if __name__ == "__main__":
    seed_demo()
