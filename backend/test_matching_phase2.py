import requests
import datetime
from app.database import SessionLocal
from app import models

BASE_URL = "http://localhost:8000/api"

def setup_test_data():
    db = SessionLocal()
    
    # We will pick 5 specific workers.
    workers = db.query(models.Worker).limit(5).all()
    today_str = datetime.date.today().strftime("%Y-%m-%d")
    
    # Event Location: Pune (18.5204, 73.8567), Radius: 20km
    event_lat, event_lon = 18.5204, 73.8567
    
    # Reset assignments
    for w in workers:
        db.query(models.CrewAssignment).filter_by(worker_id=w.id).delete()
        avail = db.query(models.WorkerAvailability).filter_by(worker_id=w.id, date=today_str).first()
        if not avail:
            avail = models.WorkerAvailability(worker_id=w.id, date=today_str, start_time="08:00", end_time="22:00")
            db.add(avail)
        else:
            avail.start_time = "08:00"
            avail.end_time = "22:00"
            
    # W0: The Excellent Photographer
    w0 = workers[0]
    w0.skill_category = "Photographer"
    w0.latitude = event_lat
    w0.longitude = event_lon
    w0.rating = 5.0
    w0.reliability_score = 100
    w0.price_min = 4000
    w0.price_max = 6000 # avg 5000
    
    # W1: The Good Photographer (lower rating, slightly further)
    w1 = workers[1]
    w1.skill_category = "Photographer"
    w1.latitude = 18.55 # ~3-4km away
    w1.longitude = 73.85
    w1.rating = 4.0
    w1.reliability_score = 100
    w1.price_min = 4000
    w1.price_max = 6000 # avg 5000
    
    # W2: The Average Photographer (lower reliability)
    w2 = workers[2]
    w2.skill_category = "Photographer"
    w2.latitude = event_lat
    w2.longitude = event_lon
    w2.rating = 5.0
    w2.reliability_score = 80
    w2.price_min = 4000
    w2.price_max = 6000 # avg 5000
    
    # W3: The Expensive Photographer
    w3 = workers[3]
    w3.skill_category = "Photographer"
    w3.latitude = event_lat
    w3.longitude = event_lon
    w3.rating = 5.0
    w3.reliability_score = 100
    w3.price_min = 14000
    w3.price_max = 16000 # avg 15000
    
    # W4: Ineligible (Videographer)
    w4 = workers[4]
    w4.skill_category = "Videographer"
    w4.latitude = event_lat
    w4.longitude = event_lon
    w4.rating = 5.0
    w4.reliability_score = 100
    w4.price_min = 4000
    w4.price_max = 6000
    
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
        "end_time": "13:00",
        "location": "Pune Central",
        "latitude": 18.5204,
        "longitude": 73.8567,
        "proximity_radius": 20,
        "budget": 20000, # 2 Photographers = 10000/each budget
        "roles": [
            {"role_name": "Photographer", "quantity_needed": 2},
            {"role_name": "Alien Overlord", "quantity_needed": 1} # Custom role
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
    # Print just the first photographer to show before/after
    photo_role = next(r for r in results if r["role"]["roleName"] == "Photographer")
    if len(photo_role["candidates"]) > 0:
        print(json.dumps(photo_role["candidates"][0], indent=2))
        
    sound_role = next(r for r in results if r["role"]["roleName"] == "Alien Overlord")
    
    # Map candidates by ID for easy checking
    candidates_dict = {int(c["id"]): c for c in photo_role["candidates"]}
    
    print("\n--- Running Phase 2 Tests ---")
    
    # TEST 1: Higher rating improves score
    # w0 (Rating 5) vs w1 (Rating 4). w0 should have higher rating score.
    assert candidates_dict[data["w0"]]["scoreBreakdown"]["rating"] > candidates_dict[data["w1"]]["scoreBreakdown"]["rating"], "TEST 1 FAILED"
    print("TEST 1 Passed: Higher rating improved score.")
    
    # TEST 2: Higher reliability improves score
    # w0 (Rel 100) vs w2 (Rel 80).
    assert candidates_dict[data["w0"]]["scoreBreakdown"]["reliability"] > candidates_dict[data["w2"]]["scoreBreakdown"]["reliability"], "TEST 2 FAILED"
    print("TEST 2 Passed: Higher reliability improved score.")
    
    # TEST 3: Closer worker improves score
    # w0 (Dist 0) vs w1 (Dist ~3km).
    assert candidates_dict[data["w0"]]["scoreBreakdown"]["proximity"] > candidates_dict[data["w1"]]["scoreBreakdown"]["proximity"], "TEST 3 FAILED"
    print("TEST 3 Passed: Closer worker received higher proximity score.")
    
    # TEST 4: Better price fit improves score
    # w0 (Price 5k <= 10k budget -> 100) vs w3 (Price 15k > 10k budget -> 50)
    assert candidates_dict[data["w0"]]["scoreBreakdown"]["priceFit"] == 100, "TEST 4 FAILED: Expected 100 for w0"
    assert candidates_dict[data["w3"]]["scoreBreakdown"]["priceFit"] < 100, "TEST 4 FAILED: Expected < 100 for w3"
    assert candidates_dict[data["w0"]]["scoreBreakdown"]["priceFit"] > candidates_dict[data["w3"]]["scoreBreakdown"]["priceFit"], "TEST 4 FAILED"
    print("TEST 4 Passed: Better price fit received better price score.")
    
    # TEST 5: All eligible workers receive a score between 0 and 100
    for c_id, c in candidates_dict.items():
        assert 0 <= c["score"] <= 100, f"TEST 5 FAILED: Score {c['score']} out of bounds for worker {c_id}"
    print("TEST 5 Passed: All eligible workers scored between 0 and 100.")
    
    # TEST 6: Candidates are sorted descending by final score
    scores = [c["score"] for c in photo_role["candidates"]]
    assert scores == sorted(scores, reverse=True), "TEST 6 FAILED: Candidates not sorted descending"
    print("TEST 6 Passed: Candidates sorted descending by final score.")
    
    # TEST 7: Ineligible workers from Phase 1 are never scored
    assert data["w4"] not in candidates_dict, "TEST 7 FAILED: w4 (ineligible) should not be scored/returned"
    print("TEST 7 Passed: Ineligible workers from Phase 1 are never scored.")
    
    # TEST 8: Custom roles continue to work
    assert sound_role["role"]["roleName"] == "Alien Overlord", "TEST 8 FAILED: Custom role failed"
    print("TEST 8 Passed: Custom roles continue to work.")
    
    # TEST 9: No eligible candidates returns an empty list cleanly
    assert len(sound_role["candidates"]) == 0, "TEST 9 FAILED: Should be empty"
    print("TEST 9 Passed: No eligible candidates returns empty list cleanly.")
    
    # TEST 10: Deterministic scoring
    # Calling the API again should produce exactly the same results
    resp2 = requests.get(f"{BASE_URL}/crew/optimize/{event_id}", headers=headers)
    results2 = resp2.json()
    if "candidate_pools" in results2:
        results2 = results2["candidate_pools"]
    photo_role2 = next(r for r in results2 if r["role"]["roleName"] == "Photographer")
    candidates_dict2 = {int(c["id"]): c for c in photo_role2["candidates"]}
    
    for c_id in candidates_dict:
        assert candidates_dict[c_id]["score"] == candidates_dict2[c_id]["score"], "TEST 10 FAILED: Non-deterministic score"
    print("TEST 10 Passed: Same inputs produce same scores every time.")

    print("\nALL PHASE 2 SCORING TESTS PASSED")

if __name__ == "__main__":
    run_tests()
