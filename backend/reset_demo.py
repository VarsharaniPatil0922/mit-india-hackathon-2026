import os
import sys

# Ensure we can import app modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal
from app import models

def reset_demo():
    db = SessionLocal()
    
    print("Resetting demo data...")
    
    # Target all demo users by email domain @crewconnect.com
    demo_users = db.query(models.User).filter(models.User.email.like("%@crewconnect.com")).all()
    user_ids = [u.id for u in demo_users]
    
    if not user_ids:
        print("No demo data found.")
        return

    # Delete Notifications
    db.query(models.Notification).filter(models.Notification.user_id.in_(user_ids)).delete(synchronize_session=False)

    # Organizers
    organizers = db.query(models.Organizer).filter(models.Organizer.user_id.in_(user_ids)).all()
    org_ids = [o.id for o in organizers]
    
    # Events
    events = db.query(models.Event).filter(models.Event.organizer_id.in_(org_ids)).all()
    event_ids = [e.id for e in events]
    
    # Workers
    workers = db.query(models.Worker).filter(models.Worker.user_id.in_(user_ids)).all()
    worker_ids = [w.id for w in workers]

    if event_ids or worker_ids:
        # Delete Payments
        db.query(models.Payment).filter(
            (models.Payment.event_id.in_(event_ids) if event_ids else False) | 
            (models.Payment.worker_id.in_(worker_ids) if worker_ids else False)
        ).delete(synchronize_session=False)

        # Delete CrewAssignments
        db.query(models.CrewAssignment).filter(
            (models.CrewAssignment.event_id.in_(event_ids) if event_ids else False) | 
            (models.CrewAssignment.worker_id.in_(worker_ids) if worker_ids else False)
        ).delete(synchronize_session=False)
        
    if event_ids:
        # Delete EventRoles
        db.query(models.EventRole).filter(models.EventRole.event_id.in_(event_ids)).delete(synchronize_session=False)
        # Delete Events
        db.query(models.Event).filter(models.Event.id.in_(event_ids)).delete(synchronize_session=False)
        
    if worker_ids:
        # Delete WorkerAvailability
        db.query(models.WorkerAvailability).filter(models.WorkerAvailability.worker_id.in_(worker_ids)).delete(synchronize_session=False)
        # Delete Workers
        db.query(models.Worker).filter(models.Worker.id.in_(worker_ids)).delete(synchronize_session=False)

    # Delete Organizers
    if org_ids:
        db.query(models.Organizer).filter(models.Organizer.id.in_(org_ids)).delete(synchronize_session=False)

    # Delete Users
    db.query(models.User).filter(models.User.id.in_(user_ids)).delete(synchronize_session=False)
    
    db.commit()
    print(f"Successfully deleted {len(user_ids)} demo users and all associated records.")

if __name__ == "__main__":
    reset_demo()
