import requests
import json
import datetime
import os
import sys

# Change to the backend directory if needed to import app modules for setup
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from app.database import SessionLocal
from app import models
from app.auth import get_password_hash

BASE_URL = "http://localhost:8000/api"

def get_auth_token():
    email = "test4@example.com"
    password = "password123"
    print("Obtaining auth token...")
    r = requests.post(f"{BASE_URL}/auth/login", json={"email": email, "password": password})
    if r.status_code == 200:
        return r.json()["access_token"]
    
    r = requests.post(f"{BASE_URL}/auth/register", json={"email": email, "password": password, "user_type": "organizer"})
    if r.status_code == 200:
        return r.json()["access_token"]
    
    raise Exception(f"Could not get token: {r.text}")

def create_event(token, event_data):
    headers = {"Authorization": f"Bearer {token}"}
    r = requests.post(f"{BASE_URL}/events", json=event_data, headers=headers)
    if r.status_code != 200:
        raise Exception(f"Could not create event: {r.text}")
    return r.json()["event_id"]

def run_optimization(token, event_id):
    headers = {"Authorization": f"Bearer {token}"}
    resp = requests.get(f"{BASE_URL}/crew/optimize/{event_id}", headers=headers)
    assert resp.status_code == 200, resp.text
    return resp.json()

def setup_test_data():
    db = SessionLocal()
    today_str = datetime.date.today().strftime("%Y-%m-%d")
    
    # We want a role with > 5 eligible workers to test the max 5 limit
    # We will modify workers 1 to 10 to be Photographers
    workers = db.query(models.Worker).limit(10).all()
    for i, w in enumerate(workers):
        w.skill_category = "Photographer"
        w.latitude = 19.0760 # Mumbai
        w.longitude = 72.8777
        w.rating = 4.5 + (i * 0.05) # Varying ratings
        w.price_min = 4000
        w.price_max = 6000
        w.reliability_score = 90 + i
        
        # Ensure available today
        avail = db.query(models.WorkerAvailability).filter_by(worker_id=w.id, date=today_str).first()
        if not avail:
            avail = models.WorkerAvailability(worker_id=w.id, date=today_str, start_time="08:00", end_time="22:00")
            db.add(avail)
        else:
            avail.start_time = "08:00"
            avail.end_time = "22:00"
    
    # Another role (Security) with exactly 3 workers (fewer than 5)
    workers_sec = db.query(models.Worker).offset(10).limit(3).all()
    for i, w in enumerate(workers_sec):
        w.skill_category = "Security"
        w.latitude = 19.0760
        w.longitude = 72.8777
        w.rating = 4.0 + (i * 0.1)
        w.price_min = 3000
        w.price_max = 4000
        w.reliability_score = 80 + i
        
        avail = db.query(models.WorkerAvailability).filter_by(worker_id=w.id, date=today_str).first()
        if not avail:
            avail = models.WorkerAvailability(worker_id=w.id, date=today_str, start_time="08:00", end_time="22:00")
            db.add(avail)
        else:
            avail.start_time = "08:00"
            avail.end_time = "22:00"

    db.commit()
    db.close()
    return today_str

def run_tests():
    token = get_auth_token()
    date_str = setup_test_data()
    
    # ---------------------------------------------------------
    # TEST 1 & 4 & 5 & 6 & 7: Basic backup functionality
    # ---------------------------------------------------------
    print("--- TEST 1, 4, 5, 6, 7: Basic backup logic ---")
    event1 = {
        "event_type": "Wedding",
        "event_date": date_str,
        "start_time": "10:00",
        "end_time": "22:00",
        "location": "Mumbai",
        "latitude": 19.0760,
        "longitude": 72.8777,
        "proximity_radius": 50,
        "budget": 50000,
        "roles": [
            {"role_name": "Photographer", "quantity_needed": 2},
            {"role_name": "Security", "quantity_needed": 1}
        ]
    }
    eid1 = create_event(token, event1)
    res1 = run_optimization(token, eid1)
    
    assert res1["status"] == "optimized", res1["status"]
    
    primary_ids = {w["worker_id"] for w in res1["crew"]}
    backup_pools = {bp["role_name"]: bp["backups"] for bp in res1["backup_pools"]}
    
    # TEST 1: Primary workers are not included in their role's backups.
    photo_backups = backup_pools["Photographer"]
    photo_backup_ids = {b["worker_id"] for b in photo_backups}
    assert len(primary_ids.intersection(photo_backup_ids)) == 0, "Primary worker found in backups!"
    print("TEST 1 PASSED")
    
    # TEST 2: Primary workers are not included in another role's backups.
    sec_backups = backup_pools["Security"]
    sec_backup_ids = {b["worker_id"] for b in sec_backups}
    assert len(primary_ids.intersection(sec_backup_ids)) == 0, "Primary worker found in another role's backups!"
    print("TEST 2 PASSED")

    # TEST 3: Backups are sorted by score descending.
    photo_scores = [b["score"] for b in photo_backups]
    assert photo_scores == sorted(photo_scores, reverse=True), "Backups are not sorted by score!"
    print("TEST 3 PASSED")
    
    # TEST 4: Maximum 5 backups per role.
    assert len(photo_backups) <= 5, f"Expected <= 5 backups, got {len(photo_backups)}"
    print("TEST 4 PASSED")

    # TEST 5: If fewer than 5 candidates exist, return available candidates.
    # We seeded 3 Security. 1 is selected. So 2 should be in backups.
    assert len(sec_backups) == 2, f"Expected 2 security backups, got {len(sec_backups)}"
    print("TEST 5 PASSED")

    # TEST 6: Backups are all Phase 1 eligible workers.
    # Test implicitly passes if they come from candidate_pools
    photo_pool = next(p for p in res1["candidate_pools"] if p["role"]["roleName"] == "Photographer")
    eligible_ids = {int(c["id"]) for c in photo_pool["candidates"]}
    assert photo_backup_ids.issubset(eligible_ids), "Backups contain non-eligible workers"
    print("TEST 6 PASSED")

    # TEST 7: Backups contain Phase 2 score information.
    assert "score" in photo_backups[0], "Backups missing score!"
    assert "estimated_price" in photo_backups[0], "Backups missing estimated_price!"
    assert "name" in photo_backups[0], "Backups missing name!"
    print("TEST 7 PASSED")

    # TEST 8: Multiple roles receive independent backup pools.
    assert "Photographer" in backup_pools and "Security" in backup_pools
    print("TEST 8 PASSED")

    # TEST 9 & 10: Custom roles / No eligible candidates
    print("--- TEST 9 & 10: No eligible candidates ---")
    event2 = {
        "event_type": "Wedding",
        "event_date": date_str,
        "start_time": "10:00",
        "end_time": "22:00",
        "location": "Mumbai",
        "latitude": 19.0760,
        "longitude": 72.8777,
        "proximity_radius": 50,
        "budget": 20000,
        "roles": [{"role_name": "Alien Overlord", "quantity_needed": 1}]
    }
    eid2 = create_event(token, event2)
    res2 = run_optimization(token, eid2)
    assert res2["status"] == "unfilled_roles"
    assert res2["backup_pools"] == [], "Expected empty backup pools on failure"
    print("TEST 9 & 10 PASSED")

    # TEST 11: Same input produces the same backup ordering.
    print("--- TEST 11: Determinism ---")
    res1_again = run_optimization(token, eid1)
    backup_pools_again = {bp["role_name"]: bp["backups"] for bp in res1_again["backup_pools"]}
    assert [b["worker_id"] for b in backup_pools["Photographer"]] == [b["worker_id"] for b in backup_pools_again["Photographer"]]
    print("TEST 11 PASSED")

    print("\nALL PHASE 4 TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    run_tests()
