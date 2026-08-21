import requests
import json
import uuid
import datetime

from app.database import SessionLocal
from app import models

BASE_URL = "http://127.0.0.1:8000"

def get_token(email, password, user_type="organizer"):
    r = requests.post(f"{BASE_URL}/api/auth/login", json={"email": email, "password": password})
    if r.status_code == 200:
        return r.json()["access_token"]
    
    r = requests.post(f"{BASE_URL}/api/auth/register", json={"email": email, "password": password, "user_type": user_type})
    if r.status_code == 200:
        return r.json()["access_token"]
    return None

def create_test_event(token, date, budget, roles):
    headers = {"Authorization": f"Bearer {token}"}
    payload = {
        "title": f"Test Event Phase 5 {uuid.uuid4().hex[:8]}",
        "description": "Test description",
        "event_type": "Corporate",
        "event_date": date,
        "start_time": "10:00",
        "end_time": "18:00",
        "location": "Mumbai",
        "latitude": 19.0760,
        "longitude": 72.8777,
        "proximity_radius": 20.0,
        "budget": budget,
        "roles": roles
    }
    r = requests.post(f"{BASE_URL}/api/events/", json=payload, headers=headers)
    return r.json()

def setup_workers():
    db = SessionLocal()
    today_str = datetime.date.today().strftime("%Y-%m-%d")
    
    workers = db.query(models.Worker).limit(10).all()
    
    for i, w in enumerate(workers):
        w.latitude = 19.0760
        w.longitude = 72.8777
        if i < 5:
            w.skill_category = "Photographer"
            w.price_min = 1000
            w.price_max = 2000
            w.rating = 4.0 + (i * 0.1)
        else:
            w.skill_category = "Security"
            w.price_min = 500
            w.price_max = 1000
            w.rating = 4.0 + (i * 0.1)
            
        avail = db.query(models.WorkerAvailability).filter_by(worker_id=w.id, date=today_str).first()
        if not avail:
            avail = models.WorkerAvailability(worker_id=w.id, date=today_str, start_time="08:00", end_time="22:00")
            db.add(avail)
            
        db.query(models.CrewAssignment).filter_by(worker_id=w.id).delete()
    
    db.commit()
    db.close()
    return today_str

def test_phase5_cascade_reoptimization():
    today = setup_workers()
    token = get_token("org5@test.com", "pass123")
    
    # 1. Create Event
    event = create_test_event(token, today, 10000, [
        {"role_name": "Photographer", "quantity_needed": 2},
        {"role_name": "Security", "quantity_needed": 1}
    ])
    if "event_id" not in event:
        print("Failed to create event:", event)
        return
    event_id = event["event_id"]
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # 2. Get initial optimized crew
    r1 = requests.get(f"{BASE_URL}/api/crew/optimize/{event_id}", headers=headers)
    assert r1.status_code == 200, f"Failed optimization: {r1.text}"
    opt_data1 = r1.json()
    assert opt_data1["status"] == "optimized"
    
    crew1 = opt_data1["crew"]
    assert len(crew1) == 3
    
    # Pick a worker to replace
    worker_to_replace = crew1[0]["worker_id"]
    
    # 3. Simulate No-show
    r2 = requests.post(f"{BASE_URL}/api/crew/replace-worker", json={
        "event_id": event_id,
        "worker_id": worker_to_replace
    }, headers=headers)
    
    assert r2.status_code == 200, f"Failed replacement: {r2.text}"
    replace_data = r2.json()
    
    print("\n--- PHASE 5 TESTS ---")
    print("Test 1: Replace endpoint returns 200 OK - PASS")
    
    # Test 2: Verify reoptimized status
    assert replace_data["status"] == "reoptimized"
    print("Test 2: Re-optimized status correct - PASS")
    
    # Test 3: Verify trigger info is present
    assert replace_data["trigger"]["worker_id"] == worker_to_replace
    assert replace_data["trigger"]["reason"] == "no_show"
    print("Test 3: Trigger info correct - PASS")
    
    # Test 4: Verify removed worker is tracked
    assert replace_data["removed_worker"]["worker_id"] == worker_to_replace
    print("Test 4: Removed worker tracked - PASS")
    
    # Test 5: Verify previous crew data matches
    prev_ids = [w["worker_id"] for w in replace_data["previous_crew"]]
    for w in crew1:
        assert w["worker_id"] in prev_ids
    print("Test 5: Previous crew data accurate - PASS")
    
    # Test 6: Verify new crew is full
    new_crew = replace_data["new_crew"]
    assert len(new_crew) == 3
    print("Test 6: New crew has correct quantity - PASS")
    
    # Test 7: Verify removed worker is NOT in the new crew
    new_ids = [w["worker_id"] for w in new_crew]
    assert worker_to_replace not in new_ids
    print("Test 7: Removed worker not in new crew - PASS")
    
    # Test 8: Verify total cost after is within budget
    assert replace_data["total_cost_after"] <= 10000
    print("Test 8: New crew respects budget - PASS")
    
    # Test 9: Verify remaining budget is correct
    assert replace_data["remaining_budget"] == 10000 - replace_data["total_cost_after"]
    print("Test 9: Remaining budget correct - PASS")
    
    # Test 10: Verify uniqueness of workers in new crew
    assert len(set(new_ids)) == len(new_ids)
    print("Test 10: New crew workers are unique - PASS")
    
    # Test 11: Verify 'changes' list shows removal and addition
    changes = replace_data["changes"]
    assert len(changes) > 0
    removed_names = [c["removed"] for c in changes if c["removed"]]
    added_names = [c["added"] for c in changes if c["added"]]
    
    removed_worker_name = replace_data["removed_worker"]["name"]
    assert removed_worker_name in removed_names
    assert len(added_names) > 0
    print("Test 11: Changes list tracks delta accurately - PASS")
    
    # Test 12: Verify reoptimization metrics are present
    assert replace_data["reoptimization"]["phase1"] == "completed"
    assert replace_data["reoptimization"]["phase2"] == "completed"
    assert replace_data["reoptimization"]["phase3"] == "completed"
    print("Test 12: Pipeline execution confirmed - PASS")
    
    # Test 13: Verify backups are regenerated
    assert len(replace_data["backup_pools"]) > 0
    print("Test 13: Backup pools regenerated - PASS")
    
    # Test 14: Mark another one as no-show
    worker_to_replace_2 = new_crew[-1]["worker_id"]
    r3 = requests.post(f"{BASE_URL}/api/crew/replace-worker", json={
        "event_id": event_id,
        "worker_id": worker_to_replace_2
    }, headers=headers)
    assert r3.status_code == 200
    r3_data = r3.json()
    assert r3_data["status"] == "reoptimized"
    assert worker_to_replace_2 not in [w["worker_id"] for w in r3_data["new_crew"]]
    assert worker_to_replace not in [w["worker_id"] for w in r3_data["new_crew"]] # Previous no-show shouldn't come back
    print("Test 14: Sequential cascade re-optimization works - PASS")
    
    # Test 15: Fail gracefully if worker not in crew
    r4 = requests.post(f"{BASE_URL}/api/crew/replace-worker", json={
        "event_id": event_id,
        "worker_id": 99999
    }, headers=headers)
    assert r4.status_code == 404
    print("Test 15: Validates worker existence - PASS")
    
    print("\nALL 15 PHASE 5 TESTS PASSED!")

if __name__ == "__main__":
    test_phase5_cascade_reoptimization()
