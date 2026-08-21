import requests

BASE_URL = "http://localhost:8000/api"

def run_tests():
    print("Running Event Creation Tests...")
    
    # 1. Register a test organizer
    try:
        requests.post(f"{BASE_URL}/auth/register", json={
            "email": "testorg@example.com",
            "password": "password123",
            "user_type": "organizer"
        })
    except:
        pass # Might already exist
        
    login_resp = requests.post(f"{BASE_URL}/auth/login", json={
        "email": "testorg@example.com",
        "password": "password123"
    })
    
    if not login_resp.ok:
        print("Failed to login test org:", login_resp.json())
        return
        
    token = login_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    # Base valid payload
    def get_valid_payload():
        return {
            "event_type": "wedding",
            "event_date": "2026-08-24",
            "start_time": "18:00",
            "end_time": "22:00",
            "location": "Mumbai",
            "latitude": 19.0760,
            "longitude": 72.8777,
            "proximity_radius": 15,
            "budget": 25000,
            "roles": [
                {"role_name": "Photographer", "quantity_needed": 2},
                {"role_name": "Security", "quantity_needed": 3},
                {"role_name": "Stage Manager", "quantity_needed": 1} # Custom
            ]
        }
        
    # --- TEST 1: Valid multiple roles ---
    print("\n[TEST 1] Valid Multiple Roles")
    resp = requests.post(f"{BASE_URL}/events", json=get_valid_payload(), headers=headers)
    assert resp.status_code == 200, f"Expected 200, got {resp.status_code}: {resp.text}"
    event_id = resp.json()["event_id"]
    print("âœ… Passed - Created Event ID:", event_id)
    
    # --- TEST 2: Validation Failure - Duplicates ---
    print("\n[TEST 2] Validation Failure - Duplicates")
    payload = get_valid_payload()
    payload["roles"].append({"role_name": "Photographer", "quantity_needed": 1})
    resp = requests.post(f"{BASE_URL}/events", json=payload, headers=headers)
    assert resp.status_code == 422, f"Expected 422, got {resp.status_code}"
    print("âœ… Passed - Detected duplicate role")
    
    # --- TEST 3: Validation Failure - Quantity 0 ---
    print("\n[TEST 3] Validation Failure - Quantity 0")
    payload = get_valid_payload()
    payload["roles"][0]["quantity_needed"] = 0
    resp = requests.post(f"{BASE_URL}/events", json=payload, headers=headers)
    assert resp.status_code == 422, f"Expected 422, got {resp.status_code}"
    print("âœ… Passed - Blocked quantity 0")

    # --- TEST 4: Validation Failure - Quantity 51 ---
    print("\n[TEST 4] Validation Failure - Quantity 51")
    payload = get_valid_payload()
    payload["roles"][0]["quantity_needed"] = 51
    resp = requests.post(f"{BASE_URL}/events", json=payload, headers=headers)
    assert resp.status_code == 422, f"Expected 422, got {resp.status_code}"
    print("âœ… Passed - Blocked quantity > 50")
    
    # --- TEST 5: Validation Failure - No Roles ---
    print("\n[TEST 5] Validation Failure - No Roles")
    payload = get_valid_payload()
    payload["roles"] = []
    resp = requests.post(f"{BASE_URL}/events", json=payload, headers=headers)
    assert resp.status_code == 422, f"Expected 422, got {resp.status_code}"
    print("âœ… Passed - Blocked empty roles list")
    
    # --- TEST 6: Validation Failure - Budget 0 ---
    print("\n[TEST 6] Validation Failure - Budget 0")
    payload = get_valid_payload()
    payload["budget"] = 0
    resp = requests.post(f"{BASE_URL}/events", json=payload, headers=headers)
    assert resp.status_code == 422, f"Expected 422, got {resp.status_code}"
    print("âœ… Passed - Blocked budget 0")
    
    # --- TEST 7: Auth Failure - Unauthenticated ---
    print("\n[TEST 7] Auth Failure - Unauthenticated")
    resp = requests.post(f"{BASE_URL}/events", json=get_valid_payload())
    assert resp.status_code == 401, f"Expected 401, got {resp.status_code}"
    print("âœ… Passed - Blocked unauthenticated request")
    
    # --- TEST 8: Register a worker (Wrong Organizer test prep) ---
    print("\n[TEST 8] Auth Failure - Wrong Organizer Type (Worker)")
    try:
        requests.post(f"{BASE_URL}/auth/register", json={
            "email": "testworker@example.com",
            "password": "password123",
            "user_type": "worker"
        })
    except:
        pass
    login_resp2 = requests.post(f"{BASE_URL}/auth/login", json={
        "email": "testworker@example.com",
        "password": "password123"
    })
    worker_token = login_resp2.json()["access_token"]
    
    resp = requests.post(f"{BASE_URL}/events", json=get_valid_payload(), headers={"Authorization": f"Bearer {worker_token}"})
    assert resp.status_code == 403, f"Expected 403, got {resp.status_code}"
    print("âœ… Passed - Blocked worker from creating event")
    
    # --- TEST 9: GET /api/events/{id} ---
    print("\n[TEST 9] GET Event details")
    resp = requests.get(f"{BASE_URL}/events/{event_id}", headers=headers)
    assert resp.status_code == 200, f"Expected 200, got {resp.status_code}"
    data = resp.json()
    assert data["total_required_workers"] == 6, f"Expected 6 workers, got {data['total_required_workers']}"
    assert len(data["roles"]) == 3, f"Expected 3 roles, got {len(data['roles'])}"
    print("âœ… Passed - Retrieved event successfully")
    
    # --- TEST 10: GET /api/events ---
    print("\n[TEST 10] GET all events for organizer")
    resp = requests.get(f"{BASE_URL}/events", headers=headers)
    assert resp.status_code == 200, f"Expected 200, got {resp.status_code}"
    assert len(resp.json()) >= 1, "Expected at least 1 event"
    print("âœ… Passed - Retrieved all events list")
    
    # --- TEST 11: GET /api/events/{id} (Unauthorized access) ---
    print("\n[TEST 11] GET Event - Unauthorized Access")
    # Register another organizer
    try:
        requests.post(f"{BASE_URL}/auth/register", json={
            "email": "otherorg@example.com",
            "password": "password123",
            "user_type": "organizer"
        })
    except:
        pass
    login_resp3 = requests.post(f"{BASE_URL}/auth/login", json={
        "email": "otherorg@example.com",
        "password": "password123"
    })
    other_token = login_resp3.json()["access_token"]
    
    resp = requests.get(f"{BASE_URL}/events/{event_id}", headers={"Authorization": f"Bearer {other_token}"})
    assert resp.status_code == 403, f"Expected 403, got {resp.status_code}"
    print("âœ… Passed - Blocked unauthorized event access")
    
    print("\nðŸŽ‰ ALL TESTS PASSED! ðŸŽ‰")

if __name__ == "__main__":
    run_tests()
