import sys
import os

# Ensure we can import app modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal
from app.models import Worker, WorkerAvailability, Event

def seed_event_41_availability():
    db = SessionLocal()
    
    event = db.query(Event).filter(Event.id == 41).first()
    if not event:
        print("Event 41 not found.")
        return
        
    target_date = event.date
    print(f"Target Date for Event 41: {target_date}")
    
    # Get Photographers and Security
    photographers = db.query(Worker).filter(Worker.skill_category == "Photographer").all()
    security = db.query(Worker).filter(Worker.skill_category == "Security").all()
    
    target_workers = photographers + security
    
    added_count = 0
    for worker in target_workers:
        # Check if they already have availability on this date
        existing = db.query(WorkerAvailability).filter(
            WorkerAvailability.worker_id == worker.id,
            WorkerAvailability.date == target_date
        ).first()
        
        if not existing:
            # Add availability for the full day to ensure they match event hours
            avail = WorkerAvailability(
                worker_id=worker.id,
                date=target_date,
                start_time="00:00",
                end_time="23:59"
            )
            db.add(avail)
            
            # Optionally tweak their coordinates so they are definitely within the radius (15km)
            # Event 41 is at 18.5204, 73.8567
            worker.latitude = event.latitude + (worker.id % 5) * 0.01 # Small variance
            worker.longitude = event.longitude + (worker.id % 5) * 0.01
            
            added_count += 1

    db.commit()
    print(f"Added availability for {added_count} workers on {target_date} for Event 41 demo.")

if __name__ == "__main__":
    seed_event_41_availability()
