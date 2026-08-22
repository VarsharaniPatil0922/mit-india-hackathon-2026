import requests
import json
import sys

BASE_URL = 'http://127.0.0.1:8000/api'
EVENT_ID = 107

# 0. Login
print("Testing Login...")
res = requests.post(f"{BASE_URL}/auth/login", json={'email': 'demo@crewconnect.com', 'password': 'Demo@123', 'user_type': 'organizer'})
if res.status_code != 200:
    print("FAIL Login:", res.text)
    sys.exit(1)
token = res.json()['access_token']
headers = {'Authorization': f'Bearer {token}'}
print("PASS Login")

# 1. GET /api/events
print("Testing GET /api/events...")
res = requests.get(f"{BASE_URL}/events", headers=headers)
if res.status_code != 200 or not res.json():
    print("FAIL Events:", res.text)
else:
    print("PASS Events")

# 2. GET /api/crew/optimize/<EVENT_ID>
print(f"Testing GET /api/crew/optimize/{EVENT_ID}...")
res = requests.get(f"{BASE_URL}/crew/optimize/{EVENT_ID}", headers=headers)
opt_data = res.json()
if res.status_code != 200 or opt_data.get('status') != 'optimized' or len(opt_data.get('crew', [])) != 8:
    print("FAIL Optimization:", res.text)
else:
    print("PASS Optimization")

# Prepare for confirmation
crew_assignments = []
for c in opt_data.get('crew', []):
    # Find estimated price in candidate pools
    price = 1000
    for pool in opt_data.get('candidate_pools', []):
        if pool['role']['id'] == c['role_id']:
            for cand in pool['candidates']:
                if cand['id'] == c['worker_id']:
                    price = cand['priceMin']
                    break
    
    crew_assignments.append({
        "event_id": EVENT_ID,
        "worker_id": c["worker_id"],
        "role_id": c["role_id"],
        "price_agreed": price,
        "status": "confirmed"
    })

# 4. POST /api/crew/confirm
print("Testing POST /api/crew/confirm...")
res = requests.post(f"{BASE_URL}/crew/confirm", json=crew_assignments, headers=headers)
if res.status_code != 200:
    print("FAIL Confirmation:", res.text)
else:
    print("PASS Confirmation")

# 5. GET /api/crew/summary/<EVENT_ID>
print("Testing GET /api/crew/summary...")
res = requests.get(f"{BASE_URL}/crew/summary/{EVENT_ID}", headers=headers)
if res.status_code != 200 or len(res.json().get('primary_crew', [])) != 8:
    print("FAIL Summary:", res.text)
else:
    print("PASS Summary")

# 6. POST /api/crew/replace-worker (No-Show)
print("Testing POST /api/crew/replace-worker...")
target_worker_id = crew_assignments[0]['worker_id']
target_role_id = crew_assignments[0]['role_id']
res = requests.post(f"{BASE_URL}/crew/replace-worker", json={
    "event_id": EVENT_ID,
    "worker_id": target_worker_id,
    "role_id": target_role_id
}, headers=headers)

repl_data = res.json()
if res.status_code != 200 or repl_data.get('status') != 'reoptimized':
    print("FAIL Replacement:", res.text)
else:
    print("PASS Replacement")
    # Actually CONFIRM the new worker
    new_crew = repl_data.get('new_crew', [])
    confirm_repl_payload = []
    for c in new_crew:
        confirm_repl_payload.append({
            "event_id": EVENT_ID,
            "worker_id": c["worker_id"],
            "role_id": c["role_id"],
            "price_agreed": c["estimated_price"],
            "status": "confirmed"
        })
    print("Testing POST /api/crew/confirm (for replacement)...")
    res_repl = requests.post(f"{BASE_URL}/crew/confirm", json=confirm_repl_payload, headers=headers)
    if res_repl.status_code != 200:
        print("FAIL Confirmation (Replacement):", res_repl.text)
    else:
        print("PASS Confirmation (Replacement)")

# 7. POST /api/payments/create
print("Testing POST /api/payments/create...")
res = requests.post(f"{BASE_URL}/payments/create", json={
    "event_id": EVENT_ID,
    "amount": 25000,
    "description": "Escrow for Hackathon Demo"
}, headers=headers)
if res.status_code != 200:
    print("FAIL Escrow Creation:", res.text)
else:
    print("PASS Escrow Creation")
    payment_id = res.json().get("id")

    # 8. POST /api/payments/{payment_id}/pay (Escrow Hold)
    print(f"Testing POST /api/payments/{payment_id}/pay...")
    res = requests.post(f"{BASE_URL}/payments/{payment_id}/pay", headers=headers)
    if res.status_code != 200:
        print("FAIL Escrow Hold:", res.text)
    else:
        print("PASS Escrow Hold")
        
    # 9. POST /api/payments/{payment_id}/release
    print(f"Testing POST /api/payments/{payment_id}/release...")
    res = requests.post(f"{BASE_URL}/payments/{payment_id}/release", headers=headers)
    if res.status_code != 200:
        print("FAIL Payment Release:", res.text)
    else:
        print("PASS Payment Release")

# 10. GET /api/organizer/payments (Ledger)
print("Testing GET /api/organizer/payments...")
res = requests.get(f"{BASE_URL}/organizer/payments", headers=headers)
if res.status_code != 200 or not res.json():
    print("FAIL Ledger:", res.text)
else:
    print("PASS Ledger")
