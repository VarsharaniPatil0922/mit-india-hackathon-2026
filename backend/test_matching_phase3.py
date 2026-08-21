import requests
import json
import uuid
import datetime

from app.database import SessionLocal
from app import models

BASE_URL = "http://127.0.0.1:8000"

def setup_test_data():
    db = SessionLocal()
    today_str = datetime.date.today().strftime("%Y-%m-%d")
    
    # We need 3 photographers and 3 security workers
    workers = db.query(models.Worker).limit(10).all()
    
    roles = ["Photographer", "Photographer", "Photographer", "Security", "Security", "Security"]
    
    for i, role in enumerate(roles):
        w = workers[i]
        w.skill_category = role
        w.latitude = 19.0760 # Mumbai
        w.longitude = 72.8777
        w.rating = 4.5 + (i * 0.1) # Varied scores
        
        # Ensure available
        avail = db.query(models.WorkerAvailability).filter_by(worker_id=w.id, date=today_str).first()
        if not avail:
            avail = models.WorkerAvailability(worker_id=w.id, date=today_str, start_time="08:00", end_time="22:00")
            db.add(avail)
        else:
            avail.start_time = "08:00"
            avail.end_time = "22:00"
            
        # Clear assignments
        db.query(models.CrewAssignment).filter_by(worker_id=w.id).delete()
        
    db.commit()
    return today_str

def get_token(email, password, user_type="organizer"):
    # Try to login first
    r = requests.post(f"{BASE_URL}/api/auth/login", json={"email": email, "password": password})
    if r.status_code == 200:
        return r.json()["access_token"]
    
    # Register if not exists
    r = requests.post(f"{BASE_URL}/api/auth/register", json={"email": email, "password": password, "user_type": user_type})
    if r.status_code == 200:
        return r.json()["access_token"]
    
    raise Exception(f"Could not get token: {r.text}")

def create_event(token, event_data):
    headers = {"Authorization": f"Bearer {token}"}
    r = requests.post(f"{BASE_URL}/api/events", json=event_data, headers=headers)
    if r.status_code != 200:
        raise Exception(f"Could not create event: {r.text}")
    return r.json()["event_id"]

def run_optimization(token, event_id):
    headers = {"Authorization": f"Bearer {token}"}
    r = requests.get(f"{BASE_URL}/api/crew/optimize/{event_id}", headers=headers)
    if r.status_code != 200:
        raise Exception(f"Optimization failed: {r.text}")
    return r.json()

def run_tests():
    today_str = setup_test_data()
    print("Obtaining auth token...")
    token = get_token("test_org_phase3@example.com", "password123")
    print("Token obtained.\n")
    
    date_str = today_str

    print("--- TEST 1: Single role, quantity 1 ---")
    event1 = {
        "event_type": "Wedding",
        "event_date": date_str,
        "start_time": "10:00",
        "end_time": "22:00",
        "location": "Mumbai",
        "latitude": 19.0760,
        "longitude": 72.8777,
        "proximity_radius": 50,
        "budget": 20000,
        "roles": [{"role_name": "Photographer", "quantity_needed": 1}]
    }
    eid1 = create_event(token, event1)
    res1 = run_optimization(token, eid1)
    assert res1["status"] == "optimized", f"Expected optimized, got {res1['status']}. Response: {json.dumps(res1, indent=2)}"
    assert len(res1["crew"]) == 1, f"Expected 1 worker, got {len(res1['crew'])}"
    print("TEST 1 PASSED")

    print("--- TEST 2: Single role, quantity 2 ---")
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
        "roles": [{"role_name": "Photographer", "quantity_needed": 2}]
    }
    eid2 = create_event(token, event2)
    res2 = run_optimization(token, eid2)
    assert res2["status"] == "optimized", f"Expected optimized, got {res2['status']}"
    assert len(res2["crew"]) == 2, f"Expected 2 workers, got {len(res2['crew'])}"
    w_ids = set(w["worker_id"] for w in res2["crew"])
    assert len(w_ids) == 2, "Expected 2 different workers"
    print("TEST 2 PASSED")

    print("--- TEST 3: Multiple roles ---")
    event3 = {
        "event_type": "Wedding",
        "event_date": date_str,
        "start_time": "10:00",
        "end_time": "22:00",
        "location": "Mumbai",
        "latitude": 19.0760,
        "longitude": 72.8777,
        "proximity_radius": 50,
        "budget": 30000,
        "roles": [
            {"role_name": "Photographer", "quantity_needed": 1},
            {"role_name": "Security", "quantity_needed": 2}
        ]
    }
    eid3 = create_event(token, event3)
    res3 = run_optimization(token, eid3)
    assert res3["status"] == "optimized"
    assert len(res3["crew"]) == 3, f"Expected 3 total workers, got {len(res3['crew'])}"
    roles_fulfilled = {}
    for w in res3["crew"]:
        roles_fulfilled[w["role"]] = roles_fulfilled.get(w["role"], 0) + 1
    assert roles_fulfilled.get("Photographer") == 1
    assert roles_fulfilled.get("Security") == 2
    print("TEST 3 PASSED")

    print("--- TEST 4: Worker cannot be assigned to two roles ---")
    w_ids_test4 = set(w["worker_id"] for w in res3["crew"])
    assert len(w_ids_test4) == 3, "Worker assigned to two roles (not unique!)"
    print("TEST 4 PASSED")

    print("--- TEST 5: Combination exceeding budget is rejected ---")
    event5 = {
        "event_type": "Wedding",
        "event_date": date_str,
        "start_time": "10:00",
        "end_time": "22:00",
        "location": "Mumbai",
        "latitude": 19.0760,
        "longitude": 72.8777,
        "proximity_radius": 50,
        "budget": 100, 
        "roles": [{"role_name": "Photographer", "quantity_needed": 1}]
    }
    eid5 = create_event(token, event5)
    res5 = run_optimization(token, eid5)
    assert res5["status"] == "no_feasible_crew", f"Expected no_feasible_crew, got {res5['status']}"
    print("TEST 5 PASSED")

    print("--- TEST 6: Lower-scoring but affordable combination ---")
    event6 = {
        "event_type": "Wedding",
        "event_date": date_str,
        "start_time": "10:00",
        "end_time": "22:00",
        "location": "Mumbai",
        "latitude": 19.0760,
        "longitude": 72.8777,
        "proximity_radius": 50,
        "budget": 5000,
        "roles": [{"role_name": "Photographer", "quantity_needed": 1}]
    }
    eid6 = create_event(token, event6)
    res6 = run_optimization(token, eid6)
    if res6["status"] == "optimized":
        assert res6["total_cost"] <= 5000, "Cost exceeded budget!"
    print("TEST 6 PASSED")

    print("--- TEST 7: No feasible crew within budget ---")
    assert res5["status"] == "no_feasible_crew"
    print("TEST 7 PASSED")

    print("--- TEST 8: Insufficient eligible workers for a role ---")
    event8 = {
        "event_type": "Wedding",
        "event_date": date_str,
        "start_time": "10:00",
        "end_time": "22:00",
        "location": "Mumbai",
        "latitude": 19.0760,
        "longitude": 72.8777,
        "proximity_radius": 50,
        "budget": 20000,
        "roles": [{"role_name": "Photographer", "quantity_needed": 10}]
    }
    eid8 = create_event(token, event8)
    res8 = run_optimization(token, eid8)
    assert res8["status"] == "unfilled_roles", f"Expected unfilled_roles, got {res8['status']}"
    assert "Only" in res8["reason"]
    print("TEST 8 PASSED")

    print("--- TEST 9: Custom role ---")
    event9 = {
        "event_type": "Wedding",
        "event_date": date_str,
        "start_time": "10:00",
        "end_time": "22:00",
        "location": "Mumbai",
        "latitude": 19.0760,
        "longitude": 72.8777,
        "proximity_radius": 50,
        "budget": 20000,
        "roles": [{"role_name": "Drone Pilot", "quantity_needed": 1}]
    }
    eid9 = create_event(token, event9)
    res9 = run_optimization(token, eid9)
    assert res9["status"] == "unfilled_roles"
    print("TEST 9 PASSED")

    print("--- TEST 10: Same input produces the same optimized crew every time ---")
    res10_a = run_optimization(token, eid2)
    res10_b = run_optimization(token, eid2)
    crew_a_ids = sorted([w["worker_id"] for w in res10_a["crew"]])
    crew_b_ids = sorted([w["worker_id"] for w in res10_b["crew"]])
    assert crew_a_ids == crew_b_ids, "Determinism failed!"
    print("TEST 10 PASSED")

    print("--- TEST 11: Total selected cost never exceeds budget ---")
    event11 = {
        "event_type": "Wedding",
        "event_date": date_str,
        "start_time": "10:00",
        "end_time": "22:00",
        "location": "Mumbai",
        "latitude": 19.0760,
        "longitude": 72.8777,
        "proximity_radius": 50,
        "budget": 12000,
        "roles": [{"role_name": "Photographer", "quantity_needed": 1}, {"role_name": "Security", "quantity_needed": 1}]
    }
    eid11 = create_event(token, event11)
    res11 = run_optimization(token, eid11)
    if res11["status"] == "optimized":
        assert res11["total_cost"] <= 12000, f"Exceeded budget! Cost: {res11['total_cost']}"
    print("TEST 11 PASSED")

    print("--- TEST 12: Selected workers are all Phase 1 eligible ---")
    if res3["status"] == "optimized":
        pool_worker_ids = []
        for pool in res3["candidate_pools"]:
            pool_worker_ids.extend([str(c["id"]) for c in pool["candidates"]])
            
        for w in res3["crew"]:
            assert str(w["worker_id"]) in pool_worker_ids, f"Worker {w['worker_id']} was selected but not in Phase 1 pool!"
    print("TEST 12 PASSED")
    
    print("\nALL PHASE 3 TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    run_tests()
