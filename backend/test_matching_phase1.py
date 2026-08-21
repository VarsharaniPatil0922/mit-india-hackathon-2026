import requests
import datetime
from app.database import SessionLocal
from app import models
from app.auth import get_password_hash

BASE_URL = "http://localhost:8000/api"

def setup_test_data():
    db = SessionLocal()
    
    # Get organizer
    org = db.query(models.User).filter(models.User.user_type == "organizer").first()
    
    # We will pick a specific worker to be our "Test Worker" for different scenarios.
    # Worker 1: Eligible (Photographer, available, close, no conflict)
    # Worker 2: Wrong role (Videographer, but we need Photographer)
    # Worker 3: Unavailable (Photographer, not available on date)
    # Worker 4: Outside radius (Photographer, very far away)
    # Worker 5: Booking conflict (Photographer, has pending assignment on date)
    
    # Reset some workers for predictable testing
    workers = db.query(models.Worker).limit(5).all()
    today_str = datetime.date.today().strftime("%Y-%m-%d")
    
    # Worker 0: The Eligible Photographer
    w0 = workers[0]
    w0.skill_category = "Photographer"
    w0.latitude = 18.5204
    w0.longitude = 73.8567
    
    # Ensure available
    avail0 = db.query(models.WorkerAvailability).filter_by(worker_id=w0.id, date=today_str).first()
    if not avail0:
        avail0 = models.WorkerAvailability(worker_id=w0.id, date=today_str, start_time="08:00", end_time="22:00")
        db.add(avail0)
    else:
        avail0.start_time = "08:00"
        avail0.end_time = "22:00"
        
    # Clear any assignments
    db.query(models.CrewAssignment).filter_by(worker_id=w0.id).delete()
    
    # Worker 1: Wrong Role
    w1 = workers[1]
    w1.skill_category = "Videographer" # NOT Photographer
    w1.latitude = 18.5204
    w1.longitude = 73.8567
    avail1 = db.query(models.WorkerAvailability).filter_by(worker_id=w1.id, date=today_str).first()
    if not avail1:
        avail1 = models.WorkerAvailability(worker_id=w1.id, date=today_str, start_time="08:00", end_time="22:00")
        db.add(avail1)
        
    # Worker 2: Unavailable
    w2 = workers[2]
    w2.skill_category = "Photographer"
    w2.latitude = 18.5204
    w2.longitude = 73.8567
    db.query(models.WorkerAvailability).filter_by(worker_id=w2.id, date=today_str).delete()
    
    # Worker 3: Outside radius
    w3 = workers[3]
    w3.skill_category = "Photographer"
    w3.latitude = 28.5204 # Very far (Delhi)
    w3.longitude = 77.8567
    avail3 = db.query(models.WorkerAvailability).filter_by(worker_id=w3.id, date=today_str).first()
    if not avail3:
        avail3 = models.WorkerAvailability(worker_id=w3.id, date=today_str, start_time="08:00", end_time="22:00")
        db.add(avail3)
        
    # Worker 4: Booking conflict
    w4 = workers[4]
    w4.skill_category = "Photographer"
    w4.latitude = 18.5204
    w4.longitude = 73.8567
    avail4 = db.query(models.WorkerAvailability).filter_by(worker_id=w4.id, date=today_str).first()
    if not avail4:
        avail4 = models.WorkerAvailability(worker_id=w4.id, date=today_str, start_time="08:00", end_time="22:00")
        db.add(avail4)
        
    # Create a conflicting event & assignment for w4
    conflict_event = models.Event(
        organizer_id=1,
        event_type="wedding",
        date=today_str,
        start_time="10:00",
        end_time="14:00",
        location="Pune",
        latitude=18.5204,
        longitude=73.8567,
        proximity_radius=20,
        budget=10000,
        status="MATCHING"
    )
    db.add(conflict_event)
    db.flush()
    conflict_role = models.EventRole(event_id=conflict_event.id, role_name="Photographer", quantity_needed=1)
    db.add(conflict_role)
    db.flush()
    conflict_assign = models.CrewAssignment(
        event_id=conflict_event.id,
        role_id=conflict_role.id,
        worker_id=w4.id,
        status="accepted",
        price_agreed=5000
    )
    db.add(conflict_assign)

    db.commit()
    
    return {
        "w0": w0.id,
        "w1": w1.id,
        "w2": w2.id,
        "w3": w3.id,
        "w4": w4.id,
        "today_str": today_str
    }


def run_tests():
    data = setup_test_data()
    today_str = data["today_str"]
    
    print("Test data setup complete. Running API tests...")
    
    # Login
    login_resp = requests.post(f"{BASE_URL}/auth/login", json={
        "email": "organizer@crew.com",
        "password": "password"
    })
    token = login_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    # Create test event
    payload = {
        "event_type": "wedding",
        "event_date": today_str,
        "start_time": "11:00",
        "end_time": "13:00", # Overlaps with worker 4's assignment (10:00-14:00)
        "location": "Pune Central",
        "latitude": 18.5204,
        "longitude": 73.8567,
        "proximity_radius": 20,
        "budget": 25000,
        "roles": [
            {"role_name": "Photographer", "quantity_needed": 2},
            {"role_name": "Stage Manager", "quantity_needed": 1},
            {"role_name": "Alien Overlord", "quantity_needed": 1} # Nobody has this
        ]
    }
    
    resp = requests.post(f"{BASE_URL}/events", json=payload, headers=headers)
    event_id = resp.json()["event_id"]
    
    # Call Optimize/Matching
    resp = requests.get(f"{BASE_URL}/crew/optimize/{event_id}", headers=headers)
    assert resp.status_code == 200, resp.text
    results = resp.json()
    if "candidate_pools" in results:
        results = results["candidate_pools"]
    
    print("\nAPI Response received:")
    import json
    print(json.dumps(results, indent=2))
    
    # Verify outputs
    photo_role = next(r for r in results if r["role"]["roleName"] == "Photographer")
    stage_role = next(r for r in results if r["role"]["roleName"] == "Stage Manager")
    alien_role = next(r for r in results if r["role"]["roleName"] == "Alien Overlord")
    
    photo_candidate_ids = [int(c["id"]) for c in photo_role["candidates"]]
    photo_exclusions = photo_role.get("excluded_summary", {})
    
    print("--- Verifying Constraints ---")
    
    # TEST 1: Correct role + available + within radius -> eligible
    assert data["w0"] in photo_candidate_ids, f"TEST 1 FAILED: Worker {data['w0']} should be eligible"
    print("TEST 1 Passed: Eligible worker is in candidates list.")
    
    # TEST 2: Wrong role -> excluded
    assert data["w1"] not in photo_candidate_ids, f"TEST 2 FAILED: Worker {data['w1']} has wrong role"
    print("TEST 2 Passed: Wrong role worker excluded.")
    
    # TEST 3: Correct role + unavailable -> excluded
    assert data["w2"] not in photo_candidate_ids, f"TEST 3 FAILED: Worker {data['w2']} is unavailable"
    print("TEST 3 Passed: Unavailable worker excluded.")
    
    # TEST 4: Correct role + outside radius -> excluded
    assert data["w3"] not in photo_candidate_ids, f"TEST 4 FAILED: Worker {data['w3']} is outside radius"
    print("TEST 4 Passed: Out-of-bounds worker excluded.")
    
    # TEST 5: Existing booking conflict -> excluded
    assert data["w4"] not in photo_candidate_ids, f"TEST 5 FAILED: Worker {data['w4']} has booking conflict"
    print("TEST 5 Passed: Worker with conflict excluded.")
    
    # TEST 6: Multiple roles -> each gets its own pool
    assert len(results) == 3, "TEST 6 FAILED: Did not return pools for all 3 roles"
    print("TEST 6 Passed: Multiple roles returned independent pools.")
    
    # TEST 7: Custom role "Stage Manager"
    print("TEST 7 Passed: Custom role processed without crashing.")
    
    # TEST 8: No eligible workers -> clean empty list
    assert len(alien_role["candidates"]) == 0, "TEST 8 FAILED: Should be no Alien Overlords"
    assert alien_role["eligible_count"] == 0
    print("TEST 8 Passed: Impossible role cleanly returned 0 candidates.")
    
    print(f"Exclusions for Photographer: {photo_exclusions}")
    print("ALL PHASE 1 ELIGIBILITY TESTS PASSED")

if __name__ == "__main__":
    run_tests()
